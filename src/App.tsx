import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Tab1Products } from './components/tabs/Tab1Products';
import { TabBrandInfo } from './components/tabs/TabBrandInfo';
import { Tab2Planning } from './components/tabs/Tab2Planning';
import { Tab3Calendar } from './components/tabs/Tab3Calendar';
import { Tab4DesignBrief } from './components/tabs/Tab4DesignBrief';
import { Tab5TeamApproval } from './components/tabs/Tab5TeamApproval';
import { SettingsTab } from './components/tabs/SettingsTab';
import { TabBrandPlanning } from './components/tabs/TabBrandPlanning';

export const App: React.FC = () => {
  const { activeTab, theme } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 1:
        return <Tab1Products />;
      case 2:
        return <TabBrandInfo />;
      case 3:
        return <Tab2Planning />;
      case 4:
        return <Tab3Calendar />;
      case 5:
        return <Tab4DesignBrief />;
      case 6:
        return <Tab5TeamApproval />;
      case 7:
        return <SettingsTab />;
      case 8:
        return <TabBrandPlanning />;
      default:
        return <Tab1Products />;
    }
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#0D0D10] text-slate-100'} flex selection:bg-bulbtek-red selection:text-white transition-colors duration-200`}>
      {/* Cột dọc Sidebar bên trái */}
      <Sidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Vùng nội dung chính bên phải */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header / Bar */}
        <Header
          onOpenMobile={() => setMobileNavOpen(true)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderActiveTab()}
        </main>

        {/* Footer */}
        <footer className={`${isLight ? 'bg-white border-slate-200 text-slate-500 shadow-sm' : 'bg-[#121216] border-[#2A2A32] text-gray-400'} border-t mt-12 py-5 text-xs transition-colors duration-200`}>
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <p className="font-medium tracking-wide">
              Content Dashboard by <span className="font-bold text-bulbtek-red">Bulbtek Việt Nam</span>
            </p>
            <p className="text-[11px] opacity-75 hidden sm:block">
              Hệ Thống Quản Trị Nội Dung & Kế Hoạch Marketing AI
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
