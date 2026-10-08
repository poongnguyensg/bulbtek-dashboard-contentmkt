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
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Flame,
  Award,
  Clock,
  Headphones
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: number;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { activeTab, setActiveTab, contents, theme, currentUser } = useApp();
  const isLight = theme === 'light';

  // Live real-time clock (Giờ - Ngày - Tháng - Năm)
  const [currentTime, setCurrentTime] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedRealTime = React.useMemo(() => {
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');
    const day = String(currentTime.getDate()).padStart(2, '0');
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const year = currentTime.getFullYear();
    return `${hours}:${minutes}:${seconds} — ${day}/${month}/${year}`;
  }, [currentTime]);

  // Count pending approval posts
  const pendingCount = contents.filter((c) => c.status === 'Pending').length;

  const navGroups: NavGroup[] = [
    {
      groupName: 'DỮ LIỆU & THƯƠNG HIỆU',
      items: [
        {
          id: 1,
          label: 'Cấu hình sản phẩm',
          shortLabel: 'Cấu Hình SP',
          description: 'Cấu hình sản phẩm & kho thông số',
          icon: Database,
        },
        {
          id: 2,
          label: 'Thương Hiệu Bulbtek',
          shortLabel: 'Thương Hiệu',
          description: 'Quy chuẩn, Robot BU & Sứ mệnh',
          icon: ShieldCheck,
        },
      ],
    },
    {
      groupName: 'LẬP KẾ HOẠCH & CONTENT',
      items: [
        {
          id: 3,
          label: 'Content Product Planning',
          shortLabel: 'Product Planning',
          description: 'Kế hoạch sản phẩm phần cứng & Phân bổ',
          icon: CalendarRange,
        },
        {
          id: 8,
          label: 'Content Branding Planning',
          shortLabel: 'Branding Planning',
          description: 'Kế hoạch Thương hiệu Bulbtek & Robot BU',
          icon: Award,
        },
        {
          id: 4,
          label: 'Content Calendar',
          shortLabel: 'Lịch Đăng',
          description: 'Lịch tháng, Timeline & Xuất PDF',
          icon: CalendarDays,
        },
        {
          id: 5,
          label: 'Design Brief & AI',
          shortLabel: 'Design & AI',
          description: 'Midjourney Prompts & Kịch bản ảnh',
          icon: Sparkles,
        },
      ],
    },
    {
      groupName: 'VẬN HÀNH & HỆ THỐNG',
      items: [
        {
          id: 6,
          label: 'Quản Lý & Phê Duyệt',
          shortLabel: 'Phê Duyệt',
          description: 'Quy trình duyệt bài & Thư mời',
          icon: Users,
          badge: pendingCount > 0 ? pendingCount : undefined,
        },
        {
          id: 7,
          label: 'Cài Đặt Hệ Thống',
          shortLabel: 'Cài Đặt',
          description: 'Xuất CSV, Đồng bộ & Sao lưu',
          icon: SettingsIcon,
        },
      ],
    },
  ];

  const handleSelectTab = (tabId: number) => {
    setActiveTab(tabId);
    if (mobileOpen) {
      onCloseMobile();
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin (COO)', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
      case 'APPROVER':
        return { label: 'Approver (Lead)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'CREATOR':
      default:
        return { label: 'Creator (Exec)', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    }
  };

  const roleStyle = getRoleBadge(currentUser.role);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out lg:static ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isLight
            ? 'bg-white border-r border-slate-200 text-slate-900 shadow-lg lg:shadow-none'
            : 'bg-[#121216] border-r border-[#2A2A32] text-slate-100 shadow-2xl lg:shadow-none'
        }`}
      >
        {/* Top Accent Red Line */}
        <div className="h-1 bg-gradient-to-r from-bulbtek-red via-red-500 to-bulbtek-red shrink-0 shadow-glow-red" />

        {/* Sidebar Header: Brand Logo & Title */}
        <div
          className={`h-16 flex items-center shrink-0 border-b transition-colors duration-200 px-4 ${
            isLight ? 'border-slate-200' : 'border-[#2A2A32]'
          } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
        >
          {/* Logo & Brand Info */}
          <div
            onClick={() => handleSelectTab(1)}
            className="flex items-center space-x-3 cursor-pointer group min-w-0"
            title="Bulbtek Việt Nam Dashboard"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bulbtek-red to-red-900 flex items-center justify-center shadow-glow-red border border-red-500/30 shrink-0 group-hover:scale-105 transition-transform duration-200">
              <span className="font-black text-white text-lg tracking-wider">B</span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 overflow-hidden">
                <div className="flex items-center space-x-1.5">
                  <span className={`font-black text-base tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    BULBTEK
                  </span>
                  <span className="text-bulbtek-red font-black text-base">VN</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-bulbtek-red/15 text-bulbtek-red border border-bulbtek-red/25">
                    Studio AI
                  </span>
                  <span className={`text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    v1.2
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Close button for Mobile / Collapse toggle for Desktop */}
          <div className="flex items-center space-x-1">
            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className={`p-1.5 rounded-lg lg:hidden transition ${
                isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-gray-800 text-gray-400'
              }`}
              title="Đóng thanh điều hướng"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle button */}
            {!mobileOpen && (
              <button
                onClick={onToggleCollapse}
                className={`hidden lg:flex p-1.5 rounded-lg transition ${
                  isLight
                    ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                    : 'hover:bg-[#1C1C22] text-gray-400 hover:text-white'
                }`}
                title={isCollapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-700/50">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {/* Group Title (hidden when collapsed) */}
              {!isCollapsed ? (
                <div className="px-3 pb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isLight ? 'text-slate-400' : 'text-gray-400'
                    }`}
                  >
                    {group.groupName}
                  </span>
                </div>
              ) : (
                <div className="w-full flex justify-center py-1">
                  <div className={`w-6 h-0.5 rounded-full ${isLight ? 'bg-slate-200' : 'bg-gray-800'}`} />
                </div>
              )}

              {/* Group Items */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      title={isCollapsed ? `${item.label} - ${item.description}` : undefined}
                      className={`w-full flex items-center rounded-xl transition-all duration-200 relative group text-left ${
                        isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5 space-x-3'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-bulbtek-red to-red-700 text-white shadow-glow-red font-semibold'
                          : isLight
                          ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/90 font-medium'
                          : 'text-gray-300 hover:text-white hover:bg-[#1A1A22] font-medium'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && !isCollapsed && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full" />
                      )}

                      {/* Icon */}
                      <div className="relative shrink-0">
                        <Icon
                          className={`w-5 h-5 transition-transform duration-200 ${
                            isActive
                              ? 'text-white scale-110'
                              : isLight
                              ? 'text-slate-500 group-hover:text-bulbtek-red group-hover:scale-105'
                              : 'text-gray-400 group-hover:text-red-400 group-hover:scale-105'
                          }`}
                        />
                        {/* Dot indicator for collapsed state with badge */}
                        {isCollapsed && item.badge !== undefined && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-[#121216]" />
                        )}
                      </div>

                      {/* Label & Description (expanded mode) */}
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm truncate leading-snug">{item.label}</span>
                            {item.badge !== undefined && (
                              <span
                                className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full shrink-0 ${
                                  isActive ? 'bg-white text-bulbtek-red shadow-sm' : 'bg-amber-500 text-black font-extrabold'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[11px] truncate leading-tight mt-0.5 ${
                              isActive
                                ? 'text-red-100/80 font-normal'
                                : isLight
                                ? 'text-slate-500 font-normal'
                                : 'text-gray-400 font-normal'
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Area of Sidebar: User Profile & Slogan */}
        <div
          className={`shrink-0 border-t p-3 transition-colors duration-200 ${
            isLight ? 'border-slate-200 bg-slate-50/70' : 'border-[#2A2A32] bg-[#0E0E12]'
          }`}
        >
          {!isCollapsed ? (
            <div className="space-y-2">
              {/* User Card */}
              <div
                className={`p-2.5 rounded-xl border flex items-center space-x-3 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#18181D] border-[#2A2A32]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bulbtek-red to-red-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {currentUser.name}
                  </div>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${roleStyle.color}`}>
                      {roleStyle.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Support & Real-time Clock */}
              <div
                className={`p-2 rounded-xl border text-center transition-colors ${
                  isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#18181D] border-[#2A2A32]'
                }`}
              >
                <div className="flex items-center justify-center space-x-1.5 text-[11px] font-semibold text-bulbtek-red">
                  <Headphones className="w-3.5 h-3.5 text-bulbtek-red shrink-0" />
                  <span>Hỗ trợ kỹ thuật: <strong className={isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}>PoongNguyen</strong></span>
                </div>
                <div className="flex items-center justify-center space-x-1.5 text-[10.5px] mt-1 font-mono">
                  <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className={isLight ? 'text-slate-600 font-medium' : 'text-gray-300 font-medium'}>
                    {formattedRealTime}
                  </span>
                </div>
              </div>

              {/* Slogan */}
              <div className="px-1 text-center pt-0.5">
                <p className={`text-[10px] font-semibold tracking-wide ${isLight ? 'text-slate-400' : 'text-gray-400'}`}>
                  BULBTEK VIỆT NAM
                </p>
                <p className="text-[10px] text-bulbtek-red font-medium">
                  An Toàn Hành Trình
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-1 space-y-2">
              <div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-bulbtek-red to-red-900 text-white font-bold text-xs flex items-center justify-center shadow-sm"
                title={`${currentUser.name} (${roleStyle.label})`}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-500 hover:text-bulbtek-red cursor-pointer transition"
                title={`Hỗ trợ kỹ thuật: PoongNguyen | ${formattedRealTime}`}
              >
                <Clock className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
