import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import Chatbot from '@/components/Chatbot/Chatbot';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={cn(
          'transition-all duration-300 min-h-[calc(100vh-4rem)]',
          sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20'
        )}
      >
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <Chatbot />
    </div>
  );
};

export default MainLayout;
