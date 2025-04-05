
import React, { createContext, useContext, useEffect, useState } from "react";
import { Notification } from "@/components/ui/notification-center";
import { useToast } from "@/hooks/use-toast";

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

type NotificationProviderProps = {
  children: React.ReactNode;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Also show as toast for immediate feedback
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === "error" ? "destructive" : "default",
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Add some sample notifications on initial load (for demo purposes)
  useEffect(() => {
    const demoNotifications = [
      {
        title: "Chào mừng bạn đến với Hệ thống chứng khoán",
        message: "Cảm ơn bạn đã sử dụng hệ thống giao dịch chứng khoán của chúng tôi.",
        type: "info" as const,
      },
      {
        title: "Thị trường mở cửa",
        message: "Phiên giao dịch chứng khoán hôm nay đã bắt đầu.",
        type: "success" as const,
      }
    ];
    
    // Add with delay to simulate real notifications
    const timeout = setTimeout(() => {
      demoNotifications.forEach(notification => {
        addNotification(notification);
      });
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
