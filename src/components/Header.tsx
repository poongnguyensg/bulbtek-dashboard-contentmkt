import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Database, 
  CalendarRange, 
  CalendarDays, 
  Sparkles, 
  Users, 
  Settings as SettingsIcon,
  ShieldCheck,
  CheckCircle2,
  PenTool,
  Bell,
  Sun,
  Moon,
  Menu,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Award
} from 'lucide-react';

interface HeaderProps {
  onOpenMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { activeTab, setActiveTab, currentUser, setCurrentUser, users, contents, theme, toggleTheme } = useApp();

  // Count pending approval posts
  const pendingCount = contents.filter(c => c.status === 'Pending').length;

  const tabs = [
    { id: 1, label: 'Cấu hình sản phẩm', category: 'Dữ Liệu & Thương Hiệu', icon: Database },
    { id: 2, label: 'Thương Hiệu Bulbtek', category: 'Dữ Liệu & Thương Hiệu', icon: ShieldCheck },
    { id: 3, label: 'Content Product Planning', category: 'Lập Kế Hoạch & Nội Dung', icon: CalendarRange },
    { id: 8, label: 'Content Branding Planning', category: 'Lập Kế Hoạch & Nội Dung', icon: Award },
    { id: 4, label: 'Content Calendar', category: 'Lập Kế Hoạch & Nội Dung', icon: CalendarDays },
    { id: 5, label: 'Design Brief & AI Prompts', category: 'Lập Kế Hoạch & Nội Dung', icon: Sparkles },
    { id: 6, label: 'Quản Lý & Phê Duyệt', category: 'Vận Hành & Hệ Thống', icon: Users, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 7, label: 'Cài Đặt Hệ Thống', category: 'Vận Hành & Hệ Thống', icon: SettingsIcon }
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];
  const CurrentIcon = currentTab.icon;

  const getRoleBadge = (role: string) => {
    const isLight = theme === 'light';
    switch (role) {
      case 'ADMIN':
        return {
          bg: isLight 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-red-950/80 text-red-400 border border-red-800/60',
          icon: ShieldCheck,
          label: 'ADMIN (COO)'
        };
      case 'APPROVER':
        return {
          bg: isLight 
            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
            : 'bg-amber-950/80 text-amber-400 border border-amber-800/60',
          icon: CheckCircle2,
          label: 'APPROVER (Lead)'
        };
      case 'CREATOR':
      default:
        return {
          bg: isLight 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60',
          icon: PenTool,
          label: 'CREATOR (Exec)'
        };
    }
  };

  const currentRoleInfo = getRoleBadge(currentUser.role);
  const RoleIcon = currentRoleInfo.icon;
  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-30 ${
      isLight 
        ? 'bg-white/95 border-slate-200 shadow-sm' 
        : 'bg-[#121216]/95 border-[#2A2A32] shadow-xl'
    } backdrop-blur border-b transition-colors duration-200`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile Toggle / Desktop Collapse & Active Breadcrumb */}
          <div className="flex items-center space-x-3">
            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={onOpenMobile}
              className={`p-2 rounded-xl border lg:hidden transition ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-[#18181D] hover:bg-[#24242B] border-[#2A2A32] text-gray-300 hover:text-white'
              }`}
              title="Mở thanh điều hướng"
            >
              <Menu className="w-5 h-5 text-bulbtek-red" />
            </button>

            {/* Desktop Quick Collapse/Expand Toggle */}
            <button
              onClick={onToggleCollapse}
              className={`hidden lg:flex p-2 rounded-xl border transition ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600 hover:text-slate-900'
                  : 'bg-[#18181D] hover:bg-[#24242B] border-[#2A2A32] text-gray-400 hover:text-white'
              }`}
              title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-bulbtek-red" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Active Tab Breadcrumb & Title */}
            <div className="flex items-center space-x-2">
              <span className={`hidden md:inline-flex text-xs font-semibold uppercase tracking-wider ${
                isLight ? 'text-slate-400' : 'text-gray-400'
              }`}>
                {currentTab.category}
              </span>
              <ChevronRight className="hidden md:inline-block w-3.5 h-3.5 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-bulbtek-red/10 border border-bulbtek-red/20 text-bulbtek-red">
                  <CurrentIcon className="w-4 h-4" />
                </div>
                <h1 className={`text-sm sm:text-base font-extrabold tracking-tight truncate ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {currentTab.label}
                </h1>
                {currentTab.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-amber-500 text-black">
                    {currentTab.badge} bài chờ duyệt
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Role Switcher & User Profile */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Quick role selector for pairing / demo testing */}
            <div className={`hidden md:flex items-center ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#18181D] border-[#2A2A32]'} border rounded-xl p-1 shadow-inner`}>
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'} font-medium px-2`}>
                Đang xem dạng:
              </span>
              <div className="flex space-x-1">
                {users.map(u => {
                  const isSelected = u.id === currentUser.id;
                  const roleStyle = getRoleBadge(u.role);
                  return (
                    <button
                      key={u.id}
                      onClick={() => setCurrentUser(u)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
                        isSelected 
                          ? `${roleStyle.bg} shadow-md font-bold` 
                          : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                      title={`Chuyển sang ${u.name} (${u.roleTitle})`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>{u.name}</span>
                      <span className="text-[10px] opacity-75">({u.role})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification indicator */}
            {pendingCount > 0 && (
              <button 
                onClick={() => setActiveTab(6)} 
                className={`relative p-2 rounded-xl border transition ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    : 'bg-[#18181D] hover:bg-[#24242B] border-[#2A2A32] text-gray-300 hover:text-white'
                }`}
                title={`${pendingCount} bài đang chờ duyệt`}
              >
                <Bell className="w-4 h-4 text-amber-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-bulbtek-red text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {pendingCount}
                </span>
              </button>
            )}

            {/* Theme Switcher Toggle */}
            <button
              onClick={toggleTheme}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-[#18181D] hover:bg-[#24242B] border-[#2A2A32] text-gray-200'
              }`}
              title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-gray-200">Sáng</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-bulbtek-red" />
                  <span className="hidden sm:inline text-slate-800">Tối</span>
                </>
              )}
            </button>

            {/* Current user badge */}
            <div className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl ${currentRoleInfo.bg}`}>
              <RoleIcon className="w-4 h-4" />
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">{currentUser.name}</div>
                <div className="text-[10px] opacity-80 leading-tight">{currentRoleInfo.label}</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
