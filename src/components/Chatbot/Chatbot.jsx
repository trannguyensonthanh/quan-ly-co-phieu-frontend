// src/components/Chatbot/Chatbot.js
import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import './Chatbot.css'; // Đảm bảo file CSS này đã được style đầy đủ

// src/hooks/useChatbot.js
import { useCallback } from 'react';

// src/services/ai.service.js

const AI_API_BASE_URL = 'http://localhost:2111'; // Thay bằng URL API thật của bạn
const MASTER_API_KEY = '7QRDYKXiEm1BIKie2uIYnaz0nyxM1VKR';
// const COURSE_AI_API_KEY = 'AesHdAArx39flWyTKc74c5rP5SsF8Bz7'; // Hiện tại không dùng trong bản tối giản

/**
 * Gửi truy vấn đến AI Master Chatbot.
 * @param {object} payload - The query payload.
 * @param {string} payload.query - The user's query.
 * @param {Array<{question: string, answer: string}>} [payload.chat_history] - Optional chat history.
 * @returns {Promise<object>} - Promise resolving to { answer: string, sources: Array<{file_name: string, content: string}> }
 */
export const queryMasterAI = async (payload) => {
  console.log('Sending query to AI (JS):', payload);
  const apiPayload = {
    query: payload.query,
    chat_history: payload.chat_history || [], // API của bạn có vẻ nhận mảng rỗng nếu không có
    top_k: 20, // Tham số cố định như trong service gốc
    cloud_call: true, // Tham số cố định
    voice: false, // Tham số cố định
  };
  console.log('Payload for AI API (JS):', apiPayload);

  const response = await fetch(
    `${AI_API_BASE_URL}/api/typesense/query_ver_thai`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MASTER_API_KEY,
      },
      body: JSON.stringify(apiPayload),
    }
  );

  if (!response.ok) {
    let errorMessage = 'AI Assistant failed to respond.';
    try {
      const errData = await response.json();
      errorMessage = errData.message || errData.detail || errorMessage; // Lấy lỗi chi tiết hơn nếu có
    } catch (e) {
      // Nếu response không phải JSON, đọc text
      const textError = await response.text();
      errorMessage = textError || errorMessage;
      console.error('AI API non-JSON error response:', textError);
    }
    throw new Error(errorMessage);
  }

  const responseData = await response.json();
  // Đảm bảo trả về đúng cấu trúc mong đợi
  return {
    answer:
      responseData.answer || 'Xin lỗi, tôi không thể tìm thấy câu trả lời.',
    sources: responseData.sources || [],
    // voice: responseData.voice // Nếu có và cần dùng
  };
};

/**
 * Lấy các câu hỏi gợi ý dựa trên câu trả lời trước đó. (Tùy chọn, không dùng trong bản tối giản này)
 * @param {object} payload
 * @param {string} payload.previous_response
 * @returns {Promise<object>} - Promise resolving to { suggested_questions: string[] }
 */
export const fetchSuggestedQuestions = async (payload) => {
  console.log('Fetching suggested questions (JS):', payload);
  try {
    const response = await fetch(
      `${AI_API_BASE_URL}/api/typesense/suggest_questions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.error(
        'Failed to fetch suggested questions. Status:',
        response.status
      );
      return { suggested_questions: [] };
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching suggested questions:', error);
    return { suggested_questions: [] };
  }
};

// Hàm queryCourseAI có thể giữ lại nếu bạn dự định dùng sau,
// hoặc lược bỏ nếu chỉ tập trung vào queryMasterAI.

/**
 * @typedef {object} ChatMessage
 * @property {string} text - Nội dung tin nhắn
 * @property {boolean} isUser - True nếu là của người dùng, false nếu của AI
 * @property {Array<{file_name: string, content: string}>} [sources] - Nguồn tham khảo từ AI
 * @property {string} [relatedQuestion] - Câu hỏi của user mà tin nhắn AI này trả lời
 * @property {boolean} [error] - Đánh dấu nếu đây là tin nhắn lỗi
 */

/**
 * @param {object} [options]
 * @param {ChatMessage[]} [options.initialMessages]
 */
export const useChatbot = (options) => {
  const [messages, setMessages] = useState(options?.initialMessages || []);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  return {
    messages,
    addMessage,
    isLoading,
    setIsLoading,
  };
};

// Hàm chuyển đổi Markdown đơn giản sang HTML (tích hợp trực tiếp)
const simpleMarkdownToHtml = (text) => {
  if (!text) return '';

  let html = String(text); // Đảm bảo text là string

  // 1. Xử lý xuống dòng: \n -> <br /> (chạy trước để không ảnh hưởng đến logic list)
  // Nhưng cần cẩn thận với \n trong list. Tạm thời, chúng ta sẽ xử lý \n kép trước.
  // \n\n (hai lần xuống dòng) -> <p> (hoặc chỉ <br /><br /> nếu muốn đơn giản)
  // html = html.replace(/(\r\n|\r|\n){2,}/g, '<br /><br />');

  // 2. Xử lý in đậm: **text** -> <strong>text</strong>
  // Phải chạy trước list để không bị mất dấu ** trong list item
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 3. Xử lý danh sách: * item hoặc - item
  // Chuyển đổi từng dòng list item và bọc trong <ul>
  // Regex này tìm các khối các dòng bắt đầu bằng * hoặc -
  html = html.replace(/^((?:[\*\-] [^\r\n]+(\r\n|\r|\n|$))+)/gm, (match) => {
    const items = match.trim().split(/\r\n|\r|\n/);
    let listHtml = '<ul>';
    items.forEach((itemText) => {
      // Loại bỏ dấu "* " hoặc "- " ở đầu
      const cleanItemText = itemText.replace(/^[\*\-]\s*/, '').trim();
      if (cleanItemText) {
        // Không cần áp dụng lại bold ở đây vì đã làm ở bước 2
        listHtml += `<li>${cleanItemText}</li>`;
      }
    });
    listHtml += '</ul>';
    return listHtml;
  });

  // 4. Xử lý các xuống dòng đơn còn lại (sau khi list đã được xử lý)
  // Chỉ những \n không nằm trong thẻ HTML
  html = html.replace(/(?<!>)\r\n|\r|\n(?!<)/g, '<br />');

  return html;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, addMessage, isLoading, setIsLoading } = useChatbot({
    initialMessages: [
      {
        isUser: false,
        text: simpleMarkdownToHtml(
          'Chào bạn! Tôi là Trợ lý AI. Bạn có câu hỏi nào cho tôi không?'
        ),
        originalText:
          'Chào bạn! Tôi là Trợ lý AI. Bạn có câu hỏi nào cho tôi không?',
      },
    ],
  });
  // State cho câu hỏi gợi ý (tùy chọn)
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(scrollToBottom, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length <= 1) {
      // Chỉ fetch gợi ý khi mở lần đầu (hoặc chỉ có tin chào)
      handleFetchSuggestions('Chào bạn!'); // Có thể dùng tin nhắn chào mừng làm context
    }
  };

  const handleFetchSuggestions = async (contextText) => {
    if (!contextText) return;
    try {
      const suggestions = await fetchSuggestedQuestions({
        previous_response: contextText,
      });
      setSuggestedQuestions(suggestions.suggested_questions.slice(0, 3));
    } catch (err) {
      console.error('Lỗi khi lấy câu hỏi gợi ý:', err);
      setSuggestedQuestions([]);
    }
  };

  const handleSend = async (queryToSend) => {
    const userQuery = (
      typeof queryToSend === 'string' ? queryToSend : inputValue
    ).trim();
    if (userQuery === '') return;

    addMessage({ text: userQuery, isUser: true, originalText: userQuery });
    if (typeof queryToSend !== 'string') {
      // Chỉ reset input nếu gửi từ ô input
      setInputValue('');
    }
    setIsLoading(true);
    setSuggestedQuestions([]); // Xóa gợi ý cũ

    try {
      const chatHistoryForAPI = messages
        // Lấy 5 cặp hỏi đáp gần nhất, ưu tiên originalText
        .slice(-10) // Lấy 10 tin nhắn cuối (5 cặp hỏi đáp)
        .filter(
          (msg) => msg.originalText && (msg.isUser || msg.relatedQuestion)
        ) // Lọc ra user messages và AI responses có relatedQuestion
        .reduce((acc, msg, index, arr) => {
          if (
            msg.isUser &&
            arr[index + 1] &&
            !arr[index + 1].isUser &&
            arr[index + 1].relatedQuestion === msg.originalText
          ) {
            acc.push({
              question: msg.originalText,
              answer: arr[index + 1].originalText || arr[index + 1].text,
            });
          }
          return acc;
        }, [])
        .slice(-5); // Đảm bảo chỉ lấy 5 cặp cuối cùng

      const aiResponse = await queryMasterAI({
        query: userQuery,
        chat_history:
          chatHistoryForAPI.length > 0 ? chatHistoryForAPI : undefined,
      });

      addMessage({
        text: simpleMarkdownToHtml(aiResponse.answer),
        originalText: aiResponse.answer,
        isUser: false,
        sources: aiResponse.sources,
        relatedQuestion: userQuery,
      });
      handleFetchSuggestions(aiResponse.answer); // Lấy gợi ý dựa trên câu trả lời mới
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Lỗi kết nối với trợ lý AI.';
      addMessage({
        text: simpleMarkdownToHtml(
          `Xin lỗi, đã có lỗi xảy ra: ${errorMessage}`
        ),
        originalText: `Xin lỗi, đã có lỗi xảy ra: ${errorMessage}`,
        isUser: false,
        error: true,
        relatedQuestion: userQuery,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (question) => {
    // setInputValue(question); // Cập nhật input
    handleSend(question); // Gửi luôn câu hỏi gợi ý
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
          <div className="chatbot-header">
            <h3>
              <FiMessageSquare style={{ marginRight: '8px' }} />
              Trợ lý AI
            </h3>
            <button
              onClick={toggleChatbot}
              className="chatbot-close-button"
              aria-label="Đóng chatbot"
            >
              <FiX />
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-bubble ${msg.isUser ? 'user' : 'ai'} ${
                  msg.error ? 'error' : ''
                }`}
              >
                {msg.isUser ? (
                  msg.text
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                )}
                {/* Hiển thị sources đơn giản */}
                {!msg.isUser &&
                  !msg.error &&
                  msg.sources &&
                  msg.sources.length > 0 && (
                    <div className="message-sources">
                      <strong>Nguồn tham khảo:</strong>
                      <ul>
                        {msg.sources.slice(0, 2).map((source, i) => (
                          <li key={i} title={source.content}>
                            {source.file_name || 'Tài liệu'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            ))}
            {isLoading && (
              <div className="ai-typing-indicator">
                {' '}
                {/* Sử dụng class từ CSS nâng cấp */}
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Câu hỏi gợi ý (nếu có và không loading) */}
          {suggestedQuestions.length > 0 && !isLoading && (
            <div className="suggested-questions-container">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  className="suggested-question-button"
                  onClick={() => handleSuggestionClick(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="chatbot-input-area">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Đặt câu hỏi cho AI..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) handleSend();
              }}
              disabled={isLoading}
              aria-label="Nhập câu hỏi của bạn"
            />
            <button
              onClick={() => handleSend()} // Đảm bảo gọi handleSend không có tham số khi nhấn nút
              className="chatbot-send-button"
              disabled={isLoading || inputValue.trim() === ''}
              aria-label="Gửi"
            >
              <FiSend />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={toggleChatbot}
        className="chatbot-toggle-button"
        aria-label={isOpen ? 'Đóng Chatbot' : 'Mở Chatbot'}
      >
        {isOpen ? <FiX /> : <FiMessageSquare />}
      </button>
    </div>
  );
};

export default Chatbot;
