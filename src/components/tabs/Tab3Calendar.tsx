import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ContentItem, Channel, ContentStatus } from '../../types';
import { analyzeProductHistory } from '../../services/aiGenerator';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Repeat, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Sparkles, 
  FileText, 
  Send, 
  Eye, 
  Edit3, 
  Check, 
  AlertTriangle,
  User,
  ExternalLink,
  Search,
  SlidersHorizontal,
  Flame,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Copy,
  Zap,
  Flag,
  PartyPopper,
  FileDown,
  Printer,
  Link,
  FileSpreadsheet
} from 'lucide-react';
import { 
  getHolidayForDate, 
  getHolidaysForMonth, 
  VIETNAMESE_HOLIDAYS, 
  VietnameseHoliday 
} from '../../data/vietnamHolidays';
import { exportContentCalendarPdf } from '../../services/pdfReportGenerator';
import { 
  exportMonthlyCompletionReportPdf, 
  exportMonthlyCompletionReportCsv 
} from '../../utils/exportCompletionReport';

export const Tab3Calendar: React.FC = () => {
  const { 
    contents, 
    categories, 
    products, 
    users, 
    currentUser, 
    saveContentItem, 
    submitContentForApproval, 
    approveContent, 
    rejectContent, 
    publishContent,
    setActiveTab,
    setBriefPrefillItem,
    setPlanningSubTab,
    setPlanningPrefillItem,
    theme
  } = useApp();
  const isLight = theme === 'light';

  // Calendar View Mode: Month / Week / List
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'LIST'>('MONTH');

  // Density Mode: 'VISUAL' (Lively with thumbnails & hooks) vs 'COMPACT' (Clean chips)
  const [densityMode, setDensityMode] = useState<'VISUAL' | 'COMPACT'>('VISUAL');

  // Search
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Month navigation: default September 2026
  const [currentMonth, setCurrentMonth] = useState<number>(9);
  const [currentYear, setCurrentYear] = useState<number>(2026);

  // Filters
  const [filterChannel, setFilterChannel] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');

  // Selected Item for Detail Slide-in Drawer
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [activeTabDetail, setActiveTabDetail] = useState<'FACEBOOK' | 'TIKTOK'>('FACEBOOK');
  const [detailFbCaption, setDetailFbCaption] = useState<string>('');
  const [detailTiktokCaption, setDetailTiktokCaption] = useState<string>('');
  const [detailPostUrl, setDetailPostUrl] = useState<string>('');

  // Post Completion & Link Update State
  const [publishingItem, setPublishingItem] = useState<ContentItem | null>(null);
  const [inputPostUrl, setInputPostUrl] = useState<string>('');
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);
  const [rejectionComment, setRejectionComment] = useState<string>('');

  // Vietnamese Holidays Modal State
  const [showAllHolidaysModal, setShowAllHolidaysModal] = useState<boolean>(false);

  const REJECT_REASONS_LIST = [
    'Thông tin sản phẩm không chính xác',
    'Tone không đúng category',
    'Hashtag thiếu hoặc sai',
    'CTA không rõ ràng',
    'Không phù hợp chiến dịch hiện tại',
    'Khác'
  ];

  const handleOpenDetail = (item: ContentItem) => {
    setSelectedItem(item);
    setDetailFbCaption(item.facebookCaption || '');
    setDetailTiktokCaption(item.tiktokCaption || '');
    setDetailPostUrl(item.publishedUrl || '');
  };

  const handleOpenPublishModal = (item: ContentItem) => {
    setPublishingItem(item);
    setInputPostUrl(item.publishedUrl || '');
  };

  const handleConfirmPublishModal = () => {
    if (!publishingItem) return;
    const url = inputPostUrl.trim();
    publishContent(publishingItem.id, url);
    
    // Cập nhật state nếu đang xem trong drawer
    if (selectedItem && selectedItem.id === publishingItem.id) {
      setSelectedItem({
        ...selectedItem,
        status: 'Published',
        publishedUrl: url,
        publishedAt: new Date().toISOString()
      });
      setDetailPostUrl(url);
    }

    const prodName = publishingItem.productName;
    setPublishingItem(null);
    setActionToast(`🎉 Đã cập nhật link đăng và đánh dấu bài viết "${prodName}" là HOÀN THÀNH!`);
    setTimeout(() => setActionToast(null), 3500);
  };

  const handleSavePublishFromDrawer = () => {
    if (!selectedItem) return;
    const url = detailPostUrl.trim();
    publishContent(selectedItem.id, url);
    const updated: ContentItem = {
      ...selectedItem,
      status: 'Published',
      publishedUrl: url,
      publishedAt: new Date().toISOString()
    };
    setSelectedItem(updated);
    setActionToast(`🎉 Đã cập nhật link đăng và đánh dấu bài "${selectedItem.productName}" là HOÀN THÀNH!`);
    setTimeout(() => setActionToast(null), 3500);
  };

  const handleSaveDetailEdits = () => {
    if (!selectedItem) return;
    const updated: ContentItem = {
      ...selectedItem,
      facebookCaption: detailFbCaption,
      tiktokCaption: detailTiktokCaption,
      publishedUrl: detailPostUrl.trim()
    };
    saveContentItem(updated);
    setSelectedItem(updated);
    alert('Đã lưu chỉnh sửa nội dung bài viết!');
  };

  const handleConfirmReject = () => {
    if (!selectedItem) return;
    const success = rejectContent(selectedItem.id, rejectionReasons, rejectionComment);
    if (success) {
      setShowRejectModal(false);
      setRejectionReasons([]);
      setRejectionComment('');
      const updated = contents.find(c => c.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  };

  const handleViewDesignBrief = () => {
    if (!selectedItem) return;
    setBriefPrefillItem(selectedItem);
    setActiveTab(4); // navigate to Design Brief (Tab 4)
  };

  // Nút nhanh tạo bài cho ngày lễ (Mục 6: kết nối vào luồng tạo bài)
  const handleCreateHolidayPost = (day: number, holiday: VietnameseHoliday, overrideMonth?: number) => {
    const targetMonth = overrideMonth || currentMonth;
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(targetMonth).padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
    const brandingProduct = products.find(p => p.productLine === 'Branding Sản Phẩm') || products[0];
    const targetCategory = categories.find(c => c.id === 'cat-branding') || categories.find(c => c.id === 'cat-interaction') || categories[0];
    const activeCreators = users.filter(u => u.status === 'Active' && u.role === 'CREATOR');
    const assignee = activeCreators[0] || users[0];

    const newHolidayPost: ContentItem = {
      id: `holiday-${holiday.id}-${Date.now()}`,
      title: `🇻🇳 [${holiday.name}] ${holiday.suggestedAngle}`,
      creativeHeadline: `BULBTEK VIỆT NAM — Tri Ân & Chúc Mừng ${holiday.name}`,
      date: dateStr,
      channel: 'Facebook',
      productId: brandingProduct.id,
      productName: brandingProduct.name,
      productLine: brandingProduct.productLine,
      categoryId: targetCategory.id,
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      status: 'Draft',
      highlightSpecs: [
        `Chiến dịch ngày lễ: ${holiday.name}`,
        `Góc truyền thông: ${holiday.suggestedAngle}`,
        'Sứ mệnh An Toàn Hành Trình — Trợ thủ đắc lực cho bác tài Việt'
      ],
      angleUsed: holiday.suggestedAngle,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name
    };

    saveContentItem(newHolidayPost);
    setPlanningPrefillItem(newHolidayPost);
    if (showAllHolidaysModal) setShowAllHolidaysModal(false);
    setActiveTab(2); // Chuyển sang Tab 2: Lập Kế Hoạch & Tạo Content
    setPlanningSubTab('SCHEDULE'); // Mở Bước 3: Lịch Phân Bổ
  };

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0: Sun, 1: Mon...
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Month contents
  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const monthAllContents = contents.filter(c => c.date.startsWith(monthPrefix));
  const monthHolidays = getHolidaysForMonth(currentYear, currentMonth);

  // Filtered contents
  const filteredContents = monthAllContents.filter(item => {
    const matchesChannel = filterChannel === 'ALL' || item.channel === filterChannel;
    const matchesCat = filterCategory === 'ALL' || item.categoryId === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesAssignee = filterAssignee === 'ALL' || item.assigneeId === filterAssignee;
    const matchesSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.angleUsed && item.angleUsed.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesChannel && matchesCat && matchesStatus && matchesAssignee && matchesSearch;
  });

  // KPI calculations for monthly progress
  const totalCount = monthAllContents.length;
  const fbCount = monthAllContents.filter(c => c.channel === 'Facebook').length;
  const tiktokCount = monthAllContents.filter(c => c.channel === 'TikTok').length;
  const draftCount = monthAllContents.filter(c => c.status === 'Draft').length;
  const pendingCount = monthAllContents.filter(c => c.status === 'Pending').length;
  const approvedCount = monthAllContents.filter(c => c.status === 'Approved').length;
  const publishedCount = monthAllContents.filter(c => c.status === 'Published').length;
  const rejectedCount = monthAllContents.filter(c => c.status === 'Rejected').length;

  // KPI calculations for monthly progress (Mục 4: Mẫu số luôn bằng tổng số bài thực tế đã lên lịch)
  const scheduledCount = monthAllContents.length;
  const readyCount = approvedCount + publishedCount;
  const targetMonthlyGoal = scheduledCount > 0 ? scheduledCount : 16;
  const completionPercentage = scheduledCount > 0 
    ? Math.min(100, Math.round((readyCount / scheduledCount) * 100))
    : 0;

  const handleExportCalendarPdf = () => {
    exportContentCalendarPdf({
      month: currentMonth,
      year: currentYear,
      contents,
      holidays: VIETNAMESE_HOLIDAYS,
      targetMonthlyGoal
    });
  };

  // Xuất Báo Cáo Nghiệm Thu Hoàn Thành Nội Dung Cuối Tháng (PDF A4 Landscape)
  const handleExportCompletionReportPdf = () => {
    if (monthAllContents.length === 0) {
      alert(`Chưa có bài viết nào trong tháng ${currentMonth}/${currentYear} để lập báo cáo hoàn thành!`);
      return;
    }
    const catMap: Record<string, string> = {};
    categories.forEach(c => { catMap[c.id] = c.name; });
    exportMonthlyCompletionReportPdf(currentMonth, currentYear, monthAllContents, catMap);
  };

  // Xuất Báo Cáo Nghiệm Thu Hoàn Thành Nội Dung Cuối Tháng (.CSV / Excel)
  const handleExportCompletionReportCsv = () => {
    if (monthAllContents.length === 0) {
      alert(`Chưa có bài viết nào trong tháng ${currentMonth}/${currentYear} để lập báo cáo hoàn thành!`);
      return;
    }
    const catMap: Record<string, string> = {};
    categories.forEach(c => { catMap[c.id] = c.name; });
    exportMonthlyCompletionReportCsv(currentMonth, currentYear, monthAllContents, catMap);
  };

  const getChannelBorder = (channel: Channel) => {
    switch (channel) {
      case 'Facebook':
        return 'border-l-[3.5px] border-l-bulbtek-red shadow-sm';
      case 'TikTok':
        return 'border-l-[3.5px] border-l-cyan-400 shadow-sm';
      case 'Cross-post':
      default:
        return 'border-l-[3.5px] border-l-amber-400 shadow-sm';
    }
  };

  const getStatusStyle = (status: ContentStatus) => {
    switch (status) {
      case 'Pending':
        return isLight 
          ? 'bg-blue-50 text-blue-800 border border-blue-200' 
          : 'bg-blue-950/40 text-blue-300 border border-blue-600/40';
      case 'Approved':
        return isLight 
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
          : 'bg-emerald-950/40 text-emerald-300 border border-emerald-600/40';
      case 'Rejected':
        return isLight 
          ? 'bg-red-50 text-red-800 border border-red-200' 
          : 'bg-red-950/50 text-red-300 border border-red-600/50';
      case 'Published':
        return isLight 
          ? 'bg-slate-100 text-slate-700 border border-slate-300' 
          : 'bg-gray-800/80 text-gray-300 border border-gray-600/60';
      case 'Draft':
      default:
        return isLight 
          ? 'bg-white text-slate-700 border border-slate-200' 
          : 'bg-[#18181D] text-gray-300 border-[#2A2A32]';
    }
  };

  const cardClass = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#18181D] border-[#2A2A32] shadow-xl';
  const filterSelectClass = isLight 
    ? 'bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-bulbtek-red focus:bg-white' 
    : 'bg-[#121215] border border-[#2F2F37] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-bulbtek-red';

  return (
    <div className="space-y-6">
      
      {/* LIVELY HEADER & KPI PROGRESS BAR */}
      <div className={`border rounded-2xl p-5 space-y-4 ${cardClass}`}>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`p-2 rounded-xl border ${
                isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-bulbtek-red/20 text-red-400 border-bulbtek-red/30 shadow-glow-red'
              }`}>
                <CalendarDays className="w-5 h-5" />
              </span>
              <h1 className={`text-xl font-black tracking-wide flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span>Lịch Content Trực Quan</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-bulbtek-red text-white font-bold tracking-normal shadow-sm">
                  {currentMonth}/{currentYear}
                </span>
              </h1>
            </div>
            <p className={`text-xs mt-1 max-w-2xl ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Không gian theo dõi trực quan, tương tác đa chiều. Bấm nhanh vào từng thẻ bài viết để xem nội dung, duyệt bài hoặc mở Design Brief.
            </p>
          </div>

          {/* Navigation & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Month Navigator */}
            <div className={`flex items-center border rounded-xl p-1 shadow-inner ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
            }`}>
              <button
                onClick={() => {
                  if (currentMonth === 1) {
                    setCurrentMonth(12);
                    setCurrentYear(y => y - 1);
                  } else {
                    setCurrentMonth(m => m - 1);
                  }
                }}
                className={`p-1.5 rounded-lg transition ${
                  isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-white' : 'text-gray-400 hover:text-white hover:bg-[#18181D]'
                }`}
                title="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className={`text-xs font-extrabold px-3 font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Tháng {currentMonth} / {currentYear}
              </span>

              <button
                onClick={() => {
                  if (currentMonth === 12) {
                    setCurrentMonth(1);
                    setCurrentYear(y => y + 1);
                  } else {
                    setCurrentMonth(m => m + 1);
                  }
                }}
                className={`p-1.5 rounded-lg transition ${
                  isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-white' : 'text-gray-400 hover:text-white hover:bg-[#18181D]'
                }`}
                title="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Density Mode: Visual vs Compact */}
            <div className={`flex border rounded-xl p-1 ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
            }`}>
              <button
                onClick={() => setDensityMode('VISUAL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-1.5 ${
                  densityMode === 'VISUAL'
                    ? 'bg-bulbtek-red text-white shadow-glow-red'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                }`}
                title="Chế độ thẻ sinh động có ảnh & hook preview"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Sinh động</span>
              </button>
              <button
                onClick={() => setDensityMode('COMPACT')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-1.5 ${
                  densityMode === 'COMPACT'
                    ? 'bg-bulbtek-red text-white shadow-glow-red'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                }`}
                title="Chế độ thẻ thu gọn tinh gọn"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Thu gọn</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className={`flex border rounded-xl p-1 ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
            }`}>
              <button
                onClick={() => setViewMode('MONTH')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  viewMode === 'MONTH' 
                    ? isLight ? 'bg-white text-bulbtek-red font-extrabold shadow-sm' : 'bg-[#18181D] text-bulbtek-red font-extrabold border border-[#2F2F37]' 
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                }`}
              >
                Lưới tháng
              </button>
              <button
                onClick={() => setViewMode('WEEK')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  viewMode === 'WEEK' 
                    ? isLight ? 'bg-white text-bulbtek-red font-extrabold shadow-sm' : 'bg-[#18181D] text-bulbtek-red font-extrabold border border-[#2F2F37]' 
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                }`}
              >
                Tuần
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  viewMode === 'LIST' 
                    ? isLight ? 'bg-white text-bulbtek-red font-extrabold shadow-sm' : 'bg-[#18181D] text-bulbtek-red font-extrabold border border-[#2F2F37]' 
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                }`}
              >
                Danh sách
              </button>
            </div>

            {/* Nộp Báo Cáo Hoàn Thành Cuối Tháng (PDF & CSV) */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleExportCompletionReportPdf}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition group cursor-pointer"
                title="Tải Báo Cáo Nghiệm Thu Hoàn Thành Nội Dung dạng PDF chuẩn in A4 Landscape để nộp báo cáo cuối tháng"
              >
                <FileDown className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Tải Báo Cáo Hoàn Thành (PDF)</span>
              </button>

              <button
                onClick={handleExportCompletionReportCsv}
                className={`px-2.5 py-2 rounded-xl border text-xs font-semibold transition ${
                  isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#121215] hover:bg-[#202026] border-[#2F2F37] text-gray-300'
                }`}
                title="Xuất file bảng tính Excel (.CSV) nộp báo cáo"
              >
                <span>.CSV</span>
              </button>

              <button
                onClick={handleExportCalendarPdf}
                className={`p-2 rounded-xl border text-xs font-medium transition ${
                  isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600' : 'bg-[#121215] hover:bg-[#202026] border-[#2F2F37] text-gray-400'
                }`}
                title="Tải bản in Lịch tổng quan A4 Dọc"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* GAMIFIED PROGRESS BAR & KPI STRIP */}
        <div className={`pt-3 border-t space-y-3 ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
          
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-bulbtek-red animate-pulse" />
                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Mục Tiêu Tháng {currentMonth}:</span>
                <span className={isLight ? 'text-slate-600' : 'text-gray-300'}>
                  Đã lên lịch <strong className={isLight ? 'text-slate-900' : 'text-white'}>{totalCount} bài</strong> ({fbCount} FB / {tiktokCount} TikTok)
                </span>
              </div>
              <div className={`text-xs font-mono font-bold ${isLight ? 'text-red-700' : 'text-red-400'}`}>
                {readyCount}/{scheduledCount} bài sẵn sàng ({completionPercentage}%)
              </div>
            </div>

            <div className={`w-full rounded-full h-2.5 overflow-hidden border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
            }`}>
              <div 
                className="bg-gradient-to-r from-bulbtek-red via-red-500 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-glow-red"
                style={{ width: `${Math.max(5, completionPercentage)}%` }}
              />
            </div>
          </div>

          {/* Quick Filter Pills with Live Counters */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => { setFilterChannel('ALL'); setFilterStatus('ALL'); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                filterChannel === 'ALL' && filterStatus === 'ALL'
                  ? 'bg-bulbtek-red text-white shadow-glow-red'
                  : isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#121215] hover:bg-[#18181D] text-gray-400'
              }`}
            >
              <span>Tất cả</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{totalCount}</span>
            </button>

            <button
              onClick={() => setFilterChannel(filterChannel === 'Facebook' ? 'ALL' : 'Facebook')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border ${
                filterChannel === 'Facebook'
                  ? isLight ? 'bg-red-50 border-red-300 text-red-800 shadow-sm' : 'bg-red-950/70 border-bulbtek-red text-red-300 shadow-sm'
                  : isLight ? 'bg-white border-slate-200 text-slate-700 hover:text-red-700' : 'bg-[#121215] border-[#2F2F37] text-gray-400 hover:text-red-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-bulbtek-red"></span>
              <span>Facebook</span>
              <span className="text-[10px] font-mono opacity-80">({fbCount})</span>
            </button>

            <button
              onClick={() => setFilterChannel(filterChannel === 'TikTok' ? 'ALL' : 'TikTok')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border ${
                filterChannel === 'TikTok'
                  ? isLight ? 'bg-cyan-50 border-cyan-300 text-cyan-800 shadow-sm' : 'bg-cyan-950/70 border-cyan-500 text-cyan-300 shadow-sm'
                  : isLight ? 'bg-white border-slate-200 text-slate-700 hover:text-cyan-700' : 'bg-[#121215] border-[#2F2F37] text-gray-400 hover:text-cyan-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>TikTok</span>
              <span className="text-[10px] font-mono opacity-80">({tiktokCount})</span>
            </button>

            <span className={isLight ? 'text-slate-300 hidden sm:inline' : 'text-gray-600 hidden sm:inline'}>|</span>

            <button
              onClick={() => setFilterStatus(filterStatus === 'Draft' ? 'ALL' : 'Draft')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                filterStatus === 'Draft'
                  ? isLight ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-gray-700 text-white border-gray-500'
                  : isLight ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-gray-400 hover:text-white'
              }`}
            >
              Draft ({draftCount})
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'Pending' ? 'ALL' : 'Pending')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                filterStatus === 'Pending'
                  ? isLight ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm' : 'bg-blue-900 text-blue-200 border-blue-500 shadow-sm'
                  : isLight ? 'bg-white border-slate-200 text-slate-600 hover:text-blue-700' : 'bg-[#121215] border-[#2F2F37] text-gray-400 hover:text-blue-300'
              }`}
            >
              ⏳ Chờ duyệt ({pendingCount})
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'Approved' ? 'ALL' : 'Approved')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                filterStatus === 'Approved'
                  ? isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm' : 'bg-emerald-900 text-emerald-200 border-emerald-500 shadow-sm'
                  : isLight ? 'bg-white border-slate-200 text-slate-600 hover:text-emerald-700' : 'bg-[#121215] border-[#2F2F37] text-gray-400 hover:text-emerald-300'
              }`}
            >
              ✅ Đã duyệt ({approvedCount})
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'Rejected' ? 'ALL' : 'Rejected')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                filterStatus === 'Rejected'
                  ? isLight ? 'bg-red-100 text-red-800 border-red-300' : 'bg-red-950 text-red-200 border-red-600'
                  : isLight ? 'bg-white border-slate-200 text-slate-600 hover:text-red-700' : 'bg-[#121215] border-[#2F2F37] text-gray-400 hover:text-red-400'
              }`}
            >
              ❌ Cần sửa ({rejectedCount})
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'Published' ? 'ALL' : 'Published')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                filterStatus === 'Published'
                  ? isLight ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-gray-800 text-gray-200 border-gray-500'
                  : isLight ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-gray-400 hover:text-gray-200'
              }`}
            >
              🚀 Đã đăng ({publishedCount})
            </button>
          </div>

        </div>

      </div>

      {/* VIETNAMESE HOLIDAYS HIGHLIGHT BANNER */}
      {monthHolidays.length > 0 && (
        <div className={`border rounded-2xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isLight 
            ? 'bg-gradient-to-r from-red-50 to-amber-50/50 border-red-200 text-slate-800' 
            : 'bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent border-red-500/30 text-gray-200'
        }`}>
          <div className="flex items-start sm:items-center space-x-3">
            <span className={`p-2 rounded-xl text-lg border shrink-0 ${
              isLight ? 'bg-red-100 border-red-200 text-red-700' : 'bg-red-500/20 text-red-500 border-red-500/40'
            }`}>
              🇻🇳
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-red-700' : 'text-red-400'}`}>
                  Dịp Lễ & Tết Việt Nam Trong Tháng {currentMonth}:
                </span>
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                  isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/20 text-red-300'
                }`}>
                  {monthHolidays.length} ngày đặc biệt
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mt-2">
                {monthHolidays.map(({ day, holiday }) => (
                  <div
                    key={holiday.id}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center space-x-2.5 shadow-sm ${
                      isLight 
                        ? 'bg-white border-red-200 text-slate-800' 
                        : 'bg-[#121215] border-red-500/40 text-gray-200'
                    }`}
                  >
                    <span className="text-sm">{holiday.icon}</span>
                    <span className={`font-mono ${isLight ? 'text-red-700 font-bold' : 'text-red-400'}`}>Ngày {day}:</span>
                    <span className="font-semibold">{holiday.name}</span>

                    <button
                      type="button"
                      onClick={() => handleCreateHolidayPost(day, holiday)}
                      className="ml-1.5 px-2.5 py-1 rounded-lg bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-[11px] font-bold shadow-sm transition flex items-center space-x-1"
                      title={`Tạo nhanh bài viết bám ngày lễ ${holiday.name} với gợi ý nội dung có sẵn`}
                    >
                      <span>+ Tạo bài cho {holiday.name}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAllHolidaysModal(true)}
            className={`flex items-center space-x-1 text-xs font-bold border px-3 py-1.5 rounded-xl transition shrink-0 ${
              isLight 
                ? 'bg-white border-red-200 text-red-700 hover:bg-red-50 shadow-sm' 
                : 'bg-[#121215] hover:bg-[#18181D] border-red-500/30 text-red-400'
            }`}
          >
            <span>Lịch 16 ngày Lễ / Tết VN</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* QUICK SEARCH & ADVANCED FILTER BAR */}
      <div className={`border rounded-xl p-3.5 flex flex-wrap items-center gap-3 ${cardClass}`}>
        
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, tiêu đề hoặc angle..."
            className={`w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs transition focus:outline-none focus:border-bulbtek-red ${
              isLight 
                ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white' 
                : 'bg-[#121215] border-[#2F2F37] text-white placeholder-gray-500'
            }`}
          />
        </div>

        {/* Filter Category */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={filterSelectClass}
        >
          <option value="ALL">Tất cả Category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Filter Assignee */}
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className={filterSelectClass}
        >
          <option value="ALL">Người phụ trách (Tất cả)</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
          ))}
        </select>

        <span className={`text-xs font-mono ml-auto ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
          Hiển thị: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{filteredContents.length}</strong> bài
        </span>
      </div>

      {/* MONTH VIEW (LƯỚI THÁNG TRỰC QUAN SINH ĐỘNG) */}
      {viewMode === 'MONTH' && (
        <div className={`border rounded-2xl overflow-hidden shadow-2xl ${cardClass}`}>
          
          {/* Weekday headers with Friday/Saturday highlights for Hero Products */}
          <div className={`grid grid-cols-7 border-b text-center py-2.5 text-xs font-black uppercase tracking-wider ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#121215] border-[#2F2F37] text-gray-400'
          }`}>
            <div>Thứ Hai</div>
            <div>Thứ Ba</div>
            <div>Thứ Tư</div>
            <div>Thứ Năm</div>
            <div className={`${isLight ? 'text-amber-700' : 'text-amber-400'} flex items-center justify-center space-x-1`}>
              <span>Thứ Sáu</span>
              <span className={`text-[9px] px-1 rounded font-normal ${isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-950 text-amber-300'}`}>Hero</span>
            </div>
            <div className={`${isLight ? 'text-red-700' : 'text-red-400'} flex items-center justify-center space-x-1`}>
              <span>Thứ Bảy</span>
              <span className={`text-[9px] px-1 rounded font-normal ${isLight ? 'bg-red-100 text-red-800' : 'bg-red-950 text-red-300'}`}>Hero</span>
            </div>
            <div className={isLight ? 'text-red-700' : 'text-red-400'}>Chủ Nhật</div>
          </div>

          {/* Grid of days */}
          <div className={`grid grid-cols-7 auto-rows-fr divide-x divide-y ${
            isLight ? 'divide-slate-200' : 'divide-[#2A2A32]/60'
          }`}>
            
            {/* Empty cells before month start */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className={`min-h-[140px] p-2 ${isLight ? 'bg-slate-50/50' : 'bg-[#121215]/30 opacity-40'}`} />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayItems = filteredContents.filter(c => c.date === dateStr);
              const isToday = dateStr === '2026-09-07'; // Virtual Today
              const holiday = getHolidayForDate(dateStr);

              return (
                <div
                  key={dateStr}
                  className={`min-h-[155px] p-2 flex flex-col transition group ${
                    holiday
                      ? isLight ? 'bg-red-50/40 ring-1 ring-red-200' : 'bg-red-500/5 ring-1 ring-red-500/30'
                      : isToday 
                      ? isLight ? 'bg-red-50/70 ring-1 ring-bulbtek-red/60 shadow-sm' : 'bg-bulbtek-red/10 ring-1 ring-bulbtek-red/60 shadow-glow-red' 
                      : isLight ? 'hover:bg-slate-50' : 'hover:bg-[#121215]/40'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-xs font-mono font-extrabold px-1.5 py-0.5 rounded ${
                        isToday 
                          ? 'bg-bulbtek-red text-white shadow-glow-red' 
                          : isLight ? 'text-slate-700' : 'text-gray-400'
                      }`}>
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-red-600 animate-pulse">
                          Hôm nay
                        </span>
                      )}
                    </div>

                    {dayItems.length > 0 && (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isLight ? 'text-slate-600 bg-slate-100' : 'text-gray-500 bg-[#121215]'
                      }`}>
                        {dayItems.length} bài
                      </span>
                    )}
                  </div>

                  {/* Vietnamese Holiday Badge if date is a holiday */}
                  {holiday && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`🇻🇳 ${holiday.name} (Ngày ${dayNum}/${currentMonth})\n\n💡 Gợi ý góc truyền thông Bulbtek:\n"${holiday.suggestedAngle}"`);
                      }}
                      className={`mb-1.5 px-2 py-1 rounded-lg border flex items-center space-x-1.5 cursor-pointer shadow-sm transition ${
                        isLight 
                          ? 'bg-red-100/80 border-red-200 text-red-900 hover:border-red-400' 
                          : 'bg-gradient-to-r from-red-500/20 via-amber-500/15 to-red-500/10 border-red-500/40 hover:border-red-500'
                      }`}
                      title={`${holiday.name} — Gợi ý chiến dịch: "${holiday.suggestedAngle}" (Click xem chi tiết)`}
                    >
                      <span className="text-xs shrink-0">{holiday.icon}</span>
                      <span className={`text-[10px] font-black truncate tracking-tight ${isLight ? 'text-red-800' : 'text-red-400'}`}>
                        {holiday.shortLabel}
                      </span>
                    </div>
                  )}

                  {/* Day Content Cards Container */}
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[175px] pr-0.5 scrollbar-thin">
                    {dayItems.map(item => {
                      const cat = categories.find(c => c.id === item.categoryId);
                      const prod = products.find(p => p.id === item.productId);

                      // VISUAL MODE: Rich Card with Thumbnail & Hook
                      if (densityMode === 'VISUAL') {
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleOpenDetail(item)}
                            className={`p-2.5 rounded-xl cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md ${
                              isLight ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' : 'hover:shadow-xl'
                            } ${getChannelBorder(item.channel)} ${getStatusStyle(item.status)}`}
                          >
                            {/* Card Top: Category badge + Channel tag */}
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm"
                                style={{ 
                                  backgroundColor: `${cat?.color || '#AF2024'}20`, 
                                  color: cat?.color || '#AF2024',
                                  border: `1px solid ${cat?.color || '#AF2024'}40`
                                }}
                              >
                                {cat?.name}
                              </span>

                              <div className="flex items-center space-x-1">
                                {item.isRecurring && (
                                  <span title="Bài lặp định kỳ (Recurring)">
                                    <Repeat className="w-3 h-3 text-bulbtek-red" />
                                  </span>
                                )}
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  item.channel === 'Facebook' 
                                    ? isLight ? 'bg-red-100 text-red-800' : 'bg-red-900/60 text-red-300' 
                                    : isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-950/60 text-cyan-300'
                                }`}>
                                  {item.channel === 'Facebook' ? 'FB' : 'TT'}
                                </span>
                              </div>
                            </div>

                            {/* Card Middle: Product Name + Mini Thumbnail */}
                            <div className="flex items-center space-x-2 mt-1.5">
                              {prod?.imageUrl && (
                                <img
                                  src={prod.imageUrl}
                                  alt={item.productName}
                                  className={`w-7 h-7 rounded-lg object-cover border shrink-0 shadow-sm ${
                                    isLight ? 'border-slate-200' : 'border-white/10'
                                  }`}
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className={`font-extrabold text-[11px] truncate leading-tight ${
                                  isLight ? 'text-slate-900' : 'text-white'
                                }`}>
                                  {item.productName}
                                </div>
                                {prod?.status === 'Hero Product' && (
                                  <span className={`text-[9px] font-bold block ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                                    🔥 Hero Product
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Bottom: Assignee & Status */}
                            <div className={`flex items-center justify-between text-[10px] mt-2 pt-1.5 border-t ${
                              isLight ? 'border-slate-100 text-slate-500' : 'border-white/10 text-gray-400'
                            }`}>
                              <div className="flex items-center space-x-1 truncate max-w-[80px]">
                                <div className="w-3.5 h-3.5 rounded-full bg-bulbtek-red/20 text-bulbtek-red text-[8px] flex items-center justify-center font-bold">
                                  {item.assigneeName.slice(0, 1)}
                                </div>
                                <span className="truncate">{item.assigneeName}</span>
                              </div>

                              <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                item.status === 'Approved' ? isLight ? 'text-emerald-700 bg-emerald-100' : 'text-emerald-400 bg-emerald-950/50' :
                                item.status === 'Pending' ? isLight ? 'text-blue-700 bg-blue-100' : 'text-blue-400 bg-blue-950/50' :
                                item.status === 'Rejected' ? isLight ? 'text-red-700 bg-red-100' : 'text-red-400 bg-red-950/50' :
                                item.status === 'Published' ? isLight ? 'text-emerald-800 bg-emerald-100 font-extrabold' : 'text-emerald-300 bg-emerald-900/60 font-extrabold' :
                                isLight ? 'text-slate-600' : 'text-gray-400'
                              }`}>
                                {item.status === 'Published' ? '✓ Đã Đăng' : item.status}
                              </span>
                            </div>

                            {/* Nút Hoàn Thành / Trạng thái Xuất bản phía ngoài */}
                            <div className="mt-2 pt-1.5 border-t border-inherit">
                              {item.status === 'Published' ? (
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPublishModal(item);
                                  }}
                                  className={`flex items-center justify-between text-[10px] px-2 py-1 rounded-lg border transition ${
                                    isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:border-emerald-500' : 'bg-emerald-950/60 border-emerald-700 text-emerald-200 hover:border-emerald-400'
                                  }`}
                                  title="Đã xuất bản. Nhấp để xem hoặc sửa link"
                                >
                                  <div className="flex items-center space-x-1 truncate">
                                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                    <span className="font-extrabold">Đã Hoàn Thành</span>
                                  </div>
                                  {item.publishedUrl ? (
                                    <a
                                      href={item.publishedUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5 ml-1 font-bold shrink-0"
                                      title={item.publishedUrl}
                                    >
                                      <span>Link</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  ) : (
                                    <span className="text-[9px] text-emerald-600 underline font-bold">+ Link</span>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPublishModal(item);
                                  }}
                                  className="w-full flex items-center justify-center space-x-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs transition"
                                  title="Cập nhật link đăng và chuyển trạng thái HOÀN THÀNH"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Hoàn Thành</span>
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      }

                      // COMPACT MODE: Streamlined Chip
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenDetail(item)}
                          className={`p-1.5 rounded-lg cursor-pointer text-[11px] transition hover:scale-[1.02] flex items-center justify-between gap-1.5 ${
                            isLight ? 'bg-white hover:bg-slate-100 shadow-sm border-slate-200' : ''
                          } ${getChannelBorder(item.channel)} ${getStatusStyle(item.status)}`}
                        >
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <span 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: cat?.color || '#AF2024' }} 
                            />
                            <span className={`font-bold truncate text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {item.productName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 shrink-0">
                            {item.status === 'Published' ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPublishModal(item);
                                }}
                                className="text-emerald-500 hover:text-emerald-600 transition"
                                title="Đã hoàn thành. Click để xem/sửa link"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPublishModal(item);
                                }}
                                className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold shadow-xs transition"
                                title="Cập nhật link đăng & Hoàn thành"
                              >
                                Xong
                              </button>
                            )}
                            <span className="font-mono text-[9px] opacity-75">
                              {item.channel === 'Facebook' ? 'FB' : 'TT'}
                            </span>
                          </div>
                        </div>
                      );

                    })}
                  </div>

                </div>
              );
            })}

          </div>

        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'WEEK' && (
        <div className={`border rounded-2xl p-5 space-y-4 ${cardClass}`}>
          <div className="flex items-center justify-between text-sm font-bold">
            <span className={isLight ? 'text-slate-900' : 'text-white'}>Chế Độ Xem Theo Tuần:</span>
            <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Kéo giãn từng ngày để làm việc tập trung theo ca</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map((dayName, idx) => {
              const targetDay = idx + 7;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
              const dayItems = filteredContents.filter(c => c.date === dateStr);

              return (
                <div key={dayName} className={`border rounded-xl p-3 space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
                }`}>
                  <div className={`flex items-center justify-between text-xs font-bold pb-2 border-b ${
                    isLight ? 'border-slate-200' : 'border-[#2A2A32]'
                  }`}>
                    <span className={isLight ? 'text-slate-700' : 'text-gray-300'}>{dayName}</span>
                    <span className="text-bulbtek-red font-mono">{targetDay}/{currentMonth}</span>
                  </div>

                  <div className="space-y-2 min-h-[220px]">
                    {dayItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleOpenDetail(item)}
                        className={`p-2.5 rounded-xl cursor-pointer transition transform hover:scale-[1.02] ${
                          isLight ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' : ''
                        } ${getChannelBorder(item.channel)} ${getStatusStyle(item.status)}`}
                      >
                        <div className={`text-[10px] flex justify-between mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                          <span className={`font-bold ${isLight ? 'text-red-700' : 'text-red-400'}`}>{item.channel}</span>
                          <span className={item.status === 'Published' ? 'text-emerald-600 font-extrabold' : ''}>
                            {item.status === 'Published' ? '✓ Đã Đăng' : item.status}
                          </span>
                        </div>
                        <div className={`font-bold text-xs leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.productName}</div>
                        <div className={`text-[10px] mt-1 flex items-center justify-between ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                          <span>{item.assigneeName}</span>
                          {item.status === 'Published' ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPublishModal(item);
                              }}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold"
                              title="Bấm để sửa link"
                            >
                              ✓ Xong
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPublishModal(item);
                              }}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                              title="Cập nhật link đăng"
                            >
                              Hoàn thành
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {dayItems.length === 0 && (
                      <div className={`text-[11px] text-center pt-12 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Không có bài</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'LIST' && (
        <div className={`border rounded-2xl overflow-hidden shadow-xl ${cardClass}`}>
          <table className={`w-full text-left text-xs ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
            <thead className={`uppercase tracking-wider text-[11px] border-b ${
              isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-[#121215] text-gray-400 border-[#2F2F37]'
            }`}>
              <tr>
                <th className="py-3 px-4">Ngày đăng</th>
                <th className="py-3 px-4">Kênh</th>
                <th className="py-3 px-4">Sản phẩm / Tiêu đề</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Phụ trách</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#2A2A32]/60'}`}>
              {filteredContents.map(item => {
                const cat = categories.find(c => c.id === item.categoryId);
                return (
                  <tr key={item.id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#121215]/50'}`}>
                    <td className={`py-3 px-4 font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.channel === 'Facebook' 
                          ? isLight ? 'bg-red-100 text-red-800 border-red-200' : 'bg-red-950 text-red-400 border-red-800' 
                          : isLight ? 'bg-cyan-100 text-cyan-800 border-cyan-200' : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      }`}>
                        {item.channel}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {item.productName}
                      <span className={`block text-[11px] font-normal truncate max-w-sm ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        {item.title}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[11px]" style={{ color: cat?.color || '#AF2024' }}>
                        {cat?.name}
                      </span>
                    </td>
                    <td className={`py-3 px-4 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{item.assigneeName}</td>
                    <td className="py-3 px-4">
                      {item.status === 'Published' ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 w-fit">
                            ✓ HOÀN THÀNH
                          </span>
                          {item.publishedUrl && (
                            <a 
                              href={item.publishedUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5 truncate max-w-[120px]"
                              title={item.publishedUrl}
                            >
                              <span>Xem link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusStyle(item.status)}`}>
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {item.status === 'Published' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPublishModal(item)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200 text-xs font-bold transition flex items-center space-x-1"
                            title="Bấm để sửa link bài viết"
                          >
                            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                            <span>Sửa Link</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenPublishModal(item)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1 shadow-xs"
                            title="Cập nhật link đăng và chuyển trạng thái Hoàn Thành"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Hoàn Thành</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenDetail(item)}
                          className={`px-3 py-1 border rounded-lg text-xs font-medium transition ${
                            isLight 
                              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                              : 'bg-[#121215] hover:bg-bulbtek-dark-surface border-bulbtek-dark-border text-white'
                          }`}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SLIDE-IN DETAIL DRAWER */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className={`border-l w-full max-w-2xl h-full flex flex-col shadow-2xl animate-slideInRight ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#18181D] border-[#2A2A32] text-white'
          }`}>
            
            {/* Drawer Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2A2A32] bg-[#121215]/80'
            }`}>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusStyle(selectedItem.status)}`}>
                    {selectedItem.status}
                  </span>
                  <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{selectedItem.date}</span>
                  <span className={isLight ? 'text-slate-400' : 'text-gray-400'}>•</span>
                  <span className={`text-xs font-semibold ${isLight ? 'text-red-700' : 'text-red-400'}`}>{selectedItem.channel}</span>
                </div>
                <h2 className={`text-base font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedItem.title || selectedItem.productName}
                </h2>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className={`p-1.5 rounded-lg transition text-lg ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                ✕
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Product Info & Highlight Specs */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121215] border-[#2F2F37] text-gray-200'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={isLight ? 'text-slate-500' : 'text-gray-400'}>Sản phẩm:</span>
                  <strong className={isLight ? 'text-slate-900' : 'text-white'}>{selectedItem.productName} ({selectedItem.productLine})</strong>
                </div>

                {selectedItem.highlightSpecs && selectedItem.highlightSpecs.length > 0 && (
                  <div className={`pt-2 border-t ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
                    <span className={`text-xs block mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Thông số đã highlight vào bài:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.highlightSpecs.map((spec, i) => (
                        <span key={i} className={`text-[11px] px-2 py-0.5 border rounded ${
                          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#18181D] border-[#2A2A32] text-gray-200'
                        }`}>
                          ✓ {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI History Note */}
              {(() => {
                const history = analyzeProductHistory(selectedItem.productId, contents);
                return (
                  <div className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#121215] border-[#2F2F37] text-gray-300'
                  }`}>
                    <Sparkles className="w-4 h-4 text-bulbtek-red shrink-0 mt-0.5" />
                    <div>
                      <strong>AI note:</strong> Sản phẩm này đã xuất hiện trong <strong>{history.count} bài</strong> tháng này.
                      {selectedItem.angleUsed && (
                        <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Angle gần nhất: "{selectedItem.angleUsed}"</div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Rejection comment banner if rejected */}
              {selectedItem.status === 'Rejected' && selectedItem.rejectionComment && (
                <div className={`p-4 rounded-xl border space-y-1 ${
                  isLight ? 'bg-red-50 border-red-200 text-red-900' : 'bg-red-950/60 border-red-700 text-red-200'
                }`}>
                  <div className={`flex items-center space-x-2 font-bold text-xs ${isLight ? 'text-red-700' : 'text-red-400'}`}>
                    <XCircle className="w-4 h-4" />
                    <span>Lý do từ chối từ Approver ({selectedItem.rejectedBy || 'Tuấn Anh'}):</span>
                  </div>
                  {selectedItem.rejectionReasons && (
                    <div className={`text-xs font-semibold ${isLight ? 'text-red-800' : 'text-red-300'}`}>
                      • {selectedItem.rejectionReasons.join(', ')}
                    </div>
                  )}
                  <p className={`text-xs italic p-2 rounded mt-1 border ${
                    isLight ? 'bg-white border-red-200 text-red-900' : 'bg-black/30 border-red-800/40 text-red-200'
                  }`}>
                    "{selectedItem.rejectionComment}"
                  </p>
                </div>
              )}

              {/* CONTENT TABS: FB / TIKTOK */}
              <div className="space-y-3">
                <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTabDetail('FACEBOOK')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        activeTabDetail === 'FACEBOOK' 
                          ? 'bg-bulbtek-red text-white' 
                          : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Tab Facebook
                    </button>
                    <button
                      onClick={() => setActiveTabDetail('TIKTOK')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        activeTabDetail === 'TIKTOK' 
                          ? isLight ? 'bg-slate-700 text-white' : 'bg-gray-800 text-white' 
                          : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Tab TikTok
                    </button>
                  </div>

                  <button
                    onClick={handleSaveDetailEdits}
                    className={`flex items-center space-x-1.5 text-xs px-3 py-1 rounded-lg border transition ${
                      isLight 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' 
                        : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 border-emerald-700/50'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Lưu sửa đổi caption</span>
                  </button>
                </div>

                {activeTabDetail === 'FACEBOOK' ? (
                  <textarea
                    rows={10}
                    value={detailFbCaption}
                    onChange={(e) => setDetailFbCaption(e.target.value)}
                    placeholder="Chưa có nội dung Facebook. Hãy tạo bằng AI ở phần Content Planning."
                    className={`w-full border rounded-xl p-3.5 text-xs font-sans leading-relaxed focus:outline-none focus:border-bulbtek-red ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white placeholder-slate-400' 
                        : 'bg-[#121215] border-[#2F2F37] text-gray-100'
                    }`}
                  />
                ) : (
                  <textarea
                    rows={8}
                    value={detailTiktokCaption}
                    onChange={(e) => setDetailTiktokCaption(e.target.value)}
                    placeholder="Chưa có nội dung TikTok. Hãy tạo bằng AI ở phần Content Planning."
                    className={`w-full border rounded-xl p-3.5 text-xs font-sans leading-relaxed focus:outline-none focus:border-bulbtek-red ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white placeholder-slate-400' 
                        : 'bg-[#121215] border-[#2F2F37] text-gray-100'
                    }`}
                  />
                )}
              </div>

              {/* CẬP NHẬT LINK ĐĂNG & TRẠNG THÁI HOÀN THÀNH */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                selectedItem.status === 'Published'
                  ? isLight ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs' : 'bg-emerald-950/30 border-emerald-700/60 text-emerald-200'
                  : isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121215] border-[#2F2F37] text-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className={`w-4 h-4 ${selectedItem.status === 'Published' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {selectedItem.status === 'Published' ? 'Trạng Thái: ĐÃ HOÀN THÀNH (ĐÃ XUẤT BẢN)' : 'Cập Nhật Link Đăng & Hoàn Thành Bài Viết'}
                    </span>
                  </div>
                  {selectedItem.status === 'Published' && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold shadow-xs">
                      ✓ Đã Xuất Bản
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className={`block font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                    Đường dẫn bài viết thực tế đã đăng (Facebook / TikTok URL):
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={detailPostUrl}
                      onChange={(e) => setDetailPostUrl(e.target.value)}
                      placeholder="https://facebook.com/... hoặc https://tiktok.com/@bulbtek/..."
                      className={`flex-1 p-2 rounded-xl border text-xs font-mono transition focus:outline-none focus:border-emerald-500 ${
                        isLight ? 'bg-white border-slate-300 text-slate-900 focus:bg-white' : 'bg-[#18181D] border-[#2F2F37] text-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleSavePublishFromDrawer}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1 shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{selectedItem.status === 'Published' ? 'Lưu Link Mới' : 'Hoàn Thành'}</span>
                    </button>
                  </div>
                </div>

                {selectedItem.publishedUrl && (
                  <div className="pt-2 border-t border-inherit flex items-center justify-between text-xs">
                    <a
                      href={selectedItem.publishedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center space-x-1 font-semibold truncate max-w-[380px]"
                      title={selectedItem.publishedUrl}
                    >
                      <span>Mở link bài viết:</span>
                      <span className="truncate">{selectedItem.publishedUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                      {selectedItem.publishedAt ? new Date(selectedItem.publishedAt).toLocaleString('vi-VN') : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* DESIGN BRIEF QUICK LINK */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
              }`}>
                <div>
                  <h4 className={`text-xs font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <FileText className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                    <span>Design Brief & AI Image Prompts</span>
                  </h4>
                  <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    Tạo brief thiết kế cho designer nội bộ và prompts Imagen/Midjourney.
                  </p>
                </div>

                <button
                  onClick={handleViewDesignBrief}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
                >
                  <span>Xem Design Brief</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* AUDIT & APPROVAL SECTION */}
              <div className={`pt-4 border-t space-y-2 text-xs ${isLight ? 'border-slate-200 text-slate-500' : 'border-[#2A2A32] text-gray-400'}`}>
                <div className="flex justify-between">
                  <span>Người tạo: <strong className={isLight ? 'text-slate-800' : 'text-gray-200'}>{selectedItem.createdBy || selectedItem.assigneeName}</strong></span>
                  <span>Tạo lúc: {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString('vi-VN') : 'Mới tạo'}</span>
                </div>
                {selectedItem.approvedAt && (
                  <div className={`flex justify-between font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    <span>Đã duyệt bởi: <strong>{selectedItem.approvedBy}</strong></span>
                    <span>Lúc: {new Date(selectedItem.approvedAt).toLocaleString('vi-VN')}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Drawer Footer Actions based on User Role */}
            <div className={`p-5 border-t flex items-center justify-between ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2A2A32] bg-[#121215]/80'
            }`}>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Vai trò của bạn: <strong className={isLight ? 'text-slate-800' : 'text-white'}>{currentUser.role}</strong>
              </span>

              <div className="flex items-center space-x-3">
                
                {/* Creator Actions */}
                {(currentUser.role === 'CREATOR' || currentUser.role === 'ADMIN') && (
                  <>
                    {(selectedItem.status === 'Draft' || selectedItem.status === 'Rejected') && (
                      <button
                        onClick={() => {
                          submitContentForApproval(selectedItem.id);
                          setSelectedItem(null);
                          alert('🚀 Đã submit bài viết lên Approver thành công! Email thông báo đã được gửi.');
                        }}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{selectedItem.status === 'Rejected' ? 'Edit & Submit Lại' : 'Submit Duyệt'}</span>
                      </button>
                    )}

                    {selectedItem.status === 'Approved' && (
                      <button
                        onClick={() => {
                          publishContent(selectedItem.id);
                          setSelectedItem(null);
                          alert('✅ Đã đánh dấu bài viết: ĐÃ ĐĂNG!');
                        }}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Đánh dấu đã đăng</span>
                      </button>
                    )}
                  </>
                )}

                {/* Approver Actions */}
                {(currentUser.role === 'APPROVER' || currentUser.role === 'ADMIN') && selectedItem.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                        isLight 
                          ? 'bg-red-50 hover:bg-red-100 border-red-300 text-red-800' 
                          : 'bg-red-950 hover:bg-red-900 border-red-700 text-red-300'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>❌ Từ chối</span>
                    </button>

                    <button
                      onClick={() => {
                        approveContent(selectedItem.id);
                        setSelectedItem(null);
                        alert('✅ Đã phê duyệt bài viết! Email chúc mừng đã gửi đến tác giả.');
                      }}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-lg"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>✅ Duyệt bài</span>
                    </button>
                  </>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* REJECTION POPUP MODAL */}
      {showRejectModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-fadeIn ${
            isLight ? 'bg-white border-red-300 text-slate-900' : 'bg-[#18181D] border-red-600/70 text-white'
          }`}>
            <div className={`flex items-center space-x-2 ${isLight ? 'text-red-700' : 'text-red-400'}`}>
              <XCircle className="w-5 h-5" />
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Từ Chối Phê Duyệt Bài Viết: "{selectedItem.title || selectedItem.productName}"
              </h3>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Quy tắc hệ thống Bulbtek: Bắt buộc chọn ít nhất 1 lý do và nhập ý kiến nhận xét chi tiết tối thiểu 20 ký tự.
            </p>

            {/* Fast checkboxes */}
            <div className="space-y-2 pt-1">
              <label className={`block text-xs font-bold ${isLight ? 'text-slate-800' : 'text-gray-300'}`}>
                1. Chọn lý do từ chối nhanh (chọn $\ge 1$):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REJECT_REASONS_LIST.map(reason => {
                  const isChecked = rejectionReasons.includes(reason);
                  return (
                    <label
                      key={reason}
                      className={`p-2 rounded-lg border text-xs flex items-center space-x-2 cursor-pointer transition ${
                        isChecked 
                          ? isLight ? 'bg-red-50 border-red-300 text-red-900 font-medium' : 'bg-red-950/40 border-red-600 text-white' 
                          : isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#121215] border-[#2F2F37] text-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setRejectionReasons(prev => 
                            prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
                          );
                        }}
                        className="rounded accent-red-600"
                      />
                      <span>{reason}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Mandatory Comment Area */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className={isLight ? 'text-slate-800' : 'text-gray-300'}>2. Ý kiến phản hồi cụ thể cho Creator <span className="text-red-500">*</span></span>
                <span className={rejectionComment.trim().length >= 20 ? isLight ? 'text-emerald-700' : 'text-emerald-400' : isLight ? 'text-amber-700' : 'text-amber-400'}>
                  {rejectionComment.trim().length}/20 ký tự tối thiểu
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="VD: Cần bổ sung hashtag #đènôtô cho TikTok và kiểm tra lại công suất thực tế của bi gầm RAY 2.0..."
                className={`w-full border rounded-xl p-3 text-xs focus:outline-none focus:border-red-500 ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white' 
                    : 'bg-[#121215] border-[#2F2F37] text-white'
                }`}
              />
            </div>

            <div className={`flex justify-end space-x-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className={`px-4 py-2 rounded-xl text-xs transition ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white'}`}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectionReasons.length === 0 || rejectionComment.trim().length < 20}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition"
              >
                Xác nhận từ chối & Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DANH SÁCH 16 NGÀY LỄ / TẾT VIỆT NAM & GỢI Ý CHIẾN DỊCH BULBTEK */}
      {showAllHolidaysModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-fadeIn overflow-hidden ${
            isLight ? 'bg-white border-red-300 text-slate-900' : 'bg-[#18181D] border-red-500/50 text-white'
          }`}>
            
            {/* Modal Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2A2A32] bg-[#121215]/80'
            }`}>
              <div className="flex items-center space-x-2.5">
                <span className={`p-2 rounded-xl border text-xl ${
                  isLight ? 'bg-red-100 border-red-200 text-red-700' : 'bg-red-500/20 text-red-500 border-red-500/40'
                }`}>
                  🇻🇳
                </span>
                <div>
                  <h3 className={`text-base font-black flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <span>Lịch Các Ngày Lễ / Tết Việt Nam & Gợi Ý Chiến Dịch Bulbtek</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    Cẩm nang mùa vụ dành riêng cho Marketing Executive lên kế hoạch bài đăng Facebook & TikTok trước các dịp lễ lớn.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAllHolidaysModal(false)}
                className={`p-1.5 rounded-lg transition text-lg ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: List of Holidays */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {VIETNAMESE_HOLIDAYS.map(hol => (
                  <div
                    key={hol.id}
                    className={`p-3.5 rounded-xl border transition space-y-2 ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 hover:border-red-400 text-slate-800' 
                        : 'bg-[#121215] border-[#2F2F37] hover:border-red-500/50 text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{hol.icon}</span>
                        <span className={`font-extrabold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{hol.name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        hol.type === 'National' 
                          ? isLight ? 'bg-red-100 text-red-800 border-red-200' : 'bg-red-950/70 text-red-300 border-red-800' 
                          : hol.type === 'Traditional' 
                          ? isLight ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-950/70 text-amber-300 border-amber-800' 
                          : isLight ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-blue-950/70 text-blue-300 border-blue-800'
                      }`}>
                        {hol.type === 'National' ? 'Quốc Lễ' : hol.type === 'Traditional' ? 'Lễ Dân Gian' : 'Kỷ Niệm'}
                      </span>
                    </div>

                    <div className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                      Thời gian: {hol.day ? `Ngày ${hol.day} tháng ${hol.month}` : `Tháng ${hol.month} (Theo lịch Âm)`}
                    </div>

                    <div className={`p-2 rounded-lg border text-[11px] leading-relaxed ${
                      isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#18181D] border-[#2A2A32] text-gray-300'
                    }`}>
                      <strong className={`block mb-0.5 ${isLight ? 'text-red-700' : 'text-red-400'}`}>💡 Gợi ý chiến dịch Bulbtek:</strong>
                      "{hol.suggestedAngle}"
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleCreateHolidayPost(hol.day || 15, hol, hol.month)}
                        className="px-3 py-1 rounded-lg bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-[11px] font-bold shadow-sm transition flex items-center space-x-1"
                      >
                        <span>+ Tạo bài cho {hol.name}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-between ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2A2A32] bg-[#121215]/80'
            }`}>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Tất cả các ngày lễ trên đã được gắn cờ tự động vào ô lịch tương ứng.
              </span>
              <button
                type="button"
                onClick={() => setShowAllHolidaysModal(false)}
                className="px-5 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* POPUP MODAL: CẬP NHẬT LINK ĐĂNG & HOÀN THÀNH BÀI VIẾT */}
      {publishingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-fadeIn ${
            isLight ? 'bg-white border-emerald-300 text-slate-900' : 'bg-[#18181D] border-emerald-600/70 text-white'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Cập Nhật Link Đăng & Hoàn Thành
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    Nghiệm thu bài viết đã xuất bản lên mạng xã hội
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPublishingItem(null)}
                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                ✕
              </button>
            </div>

            {/* Thông tin bài viết tóm tắt */}
            <div className={`p-3 rounded-xl border text-xs space-y-1 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white">{publishingItem.productName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  publishingItem.channel === 'Facebook' ? 'bg-red-100 text-red-700' : 'bg-cyan-100 text-cyan-700'
                }`}>
                  {publishingItem.channel}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-1">
                {publishingItem.title}
              </div>
              <div className="text-[10px] text-slate-400 pt-0.5">
                Ngày lên lịch: <strong>{publishingItem.date}</strong> | Phụ trách: <strong>{publishingItem.assigneeName}</strong>
              </div>
            </div>

            {/* Input link đăng bài viết */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                Đường dẫn bài viết thực tế (Facebook / TikTok post URL) <span className="text-red-500">*</span>:
              </label>
              <div className="relative">
                <Link className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                <input
                  type="url"
                  autoFocus
                  value={inputPostUrl}
                  onChange={(e) => setInputPostUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmPublishModal();
                  }}
                  placeholder="https://www.facebook.com/bulbtekvietnam/posts/... hoặc https://vt.tiktok.com/..."
                  className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs font-mono transition focus:outline-none focus:border-emerald-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                  }`}
                />
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Sau khi xác nhận, bài viết sẽ chuyển sang trạng thái <strong>HOÀN THÀNH</strong> và được tính vào Báo Cáo Nghiệm Thu cuối tháng.
              </p>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-inherit">
              <button
                type="button"
                onClick={() => setPublishingItem(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                  isLight ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' : 'bg-[#121215] hover:bg-gray-800 border-[#2F2F37] text-gray-300'
                }`}
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmPublishModal}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>✓ Xác Nhận Hoàn Thành</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST THÔNG BÁO HOÀN THÀNH NHANH */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 text-xs font-bold animate-fadeIn border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0 animate-bounce" />
          <span>{actionToast}</span>
        </div>
      )}

    </div>
  );
};
