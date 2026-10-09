import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Category, ContentItem, Channel } from '../../types';
import { 
  analyzeProductHistory, 
  validateProductForContent, 
  generateBulbtekContent,
  parseAiErrorAndFormat,
  isModelDeprecated
} from '../../services/aiGenerator';
import { getHolidaysForMonth } from '../../data/vietnamHolidays';
import { checkBrandCompliance, DEFAULT_COMPLIANCE_RULES } from '../../data/complianceKeywords';
import { exportProductPlanCsv } from '../../utils/exportPlanCsv';
import { exportProductPlanPdf } from '../../utils/exportPlanPdf';
import { 
  CalendarRange, 
  Sparkles, 
  Plus, 
  RotateCw, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  Copy, 
  Check, 
  Edit3, 
  FileText, 
  Save, 
  Repeat, 
  Trash2, 
  Info, 
  HelpCircle, 
  Zap, 
  ShieldAlert, 
  MessageSquare, 
  Briefcase,
  Car,
  Shield,
  Bot,
  CheckCircle2,
  SlidersHorizontal,
  LayoutGrid,
  ListFilter,
  Search,
  Wand2,
  Layers,
  Flame,
  CalendarDays,
  ChevronRight,
  ArrowRight,
  Clock,
  Send,
  Eye,
  Brain,
  RefreshCw,
  Download
} from 'lucide-react';

export const Tab2Planning: React.FC = () => {
  const { 
    products, 
    categories, 
    addCategory, 
    contents, 
    saveContentItem, 
    deleteContentItem, 
    autoGenerateMonthPlan, 
    settings,
    users,
    setActiveTab,
    setBriefPrefillItem,
    theme,
    planningSubTab,
    setPlanningSubTab,
    contentMemory,
    addContentMemory,
    clearContentMemory,
    getMemoryForProduct,
    planningPrefillItem,
    setPlanningPrefillItem
  } = useApp();

  const isLight = theme === 'light';

  // Setup panel state - Mặc định hiển thị tháng & năm thực tế khi mở ứng dụng
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [fbTarget, setFbTarget] = useState<number>(16); // Chỉ cấu hình mục tiêu Social trước là Facebook Channel
  const [tiktokTarget, setTiktokTarget] = useState<number>(0);
  
  const hardwareProducts = useMemo(() => 
    products.filter(p => !p.isHidden && p.productLine !== 'Branding Sản Phẩm' && p.productLine !== 'Linh Vật Robot BU'),
    [products]
  );

  const [selectedPushProductIds, setSelectedPushProductIds] = useState<string[]>(() => {
    return hardwareProducts
      .filter(p => p.status === 'Hero Product' || p.status === 'Sản phẩm mới')
      .slice(0, 6)
      .map(p => p.id);
  });

  // Branding Customization with multiple ideas for AI Angles
  const [enableBranding, setEnableBranding] = useState<boolean>(true);
  const [brandingIdeas, setBrandingIdeas] = useState<string[]>([
    '3 Giá trị cốt lõi: BỀN BỈ – BỀN VỮNG – BẢO VỆ, triết lý "An Toàn Hành Trình" và mạng lưới 300+ đại lý toàn quốc',
    'Chính sách bảo hành 1 đổi 1 trong 2 năm, quy chuẩn cắm jack zin an toàn tuyệt đối cho hệ thống điện xe hơi',
    'Văn hóa tăng sáng văn minh: Đường cắt cos chuẩn châu Âu, tuyệt đối không gây chói mắt bạn đường'
  ]);

  const handleAddBrandingIdea = (ideaText = '') => {
    setBrandingIdeas(prev => [...prev, ideaText]);
  };

  const handleUpdateBrandingIdea = (index: number, text: string) => {
    setBrandingIdeas(prev => {
      const copy = [...prev];
      copy[index] = text;
      return copy;
    });
  };

  const handleRemoveBrandingIdea = (index: number) => {
    setBrandingIdeas(prev => {
      if (prev.length <= 1) return [''];
      return prev.filter((_, i) => i !== index);
    });
  };

  // View Mode: 'WEEK_CARDS' (Visual by week) vs 'SMART_TABLE' (Tabular)
  const [planningViewMode, setPlanningViewMode] = useState<'WEEK_CARDS' | 'SMART_TABLE'>('WEEK_CARDS');

  // Search & Filters in Step 3 (Loại bỏ hoàn toàn ROBOT_BU khỏi Content Product Planning)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'Facebook' | 'TikTok'>('ALL');
  const [aiStatusFilter, setAiStatusFilter] = useState<'ALL' | 'AI_DONE' | 'AI_PENDING'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'HARDWARE' | 'BRANDING'>('ALL');

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatTone, setNewCatTone] = useState<string>('');
  const [newCatColor, setNewCatColor] = useState<string>('#AF2024');
  const [newCatAngle, setNewCatAngle] = useState<string>('');

  // Selected Categories to allocate in Step 2 (Mặc định chọn tất cả)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() => {
    return categories.map(c => c.id);
  });

  const toggleSelectCategory = (catId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategoryIds(categories.map(c => c.id));
  };

  const handleDeselectAllCategories = () => {
    setSelectedCategoryIds([]);
  };

  // Recurring setup modal state
  const [showRecurringModal, setShowRecurringModal] = useState<boolean>(false);
  const [recurPattern, setRecurPattern] = useState<'Hàng tuần' | 'Hàng tháng'>('Hàng tuần');
  const [recurDayOfWeek, setRecurDayOfWeek] = useState<number>(1); // Monday
  const [recurDayOfMonth, setRecurDayOfMonth] = useState<number>(1);
  const [recurCatId, setRecurCatId] = useState<string>(categories[0]?.id || '');
  const [recurProdId, setRecurProdId] = useState<string>(() => products.find(p => !p.isHidden)?.id || products[0]?.id || '');
  const [recurChannel, setRecurChannel] = useState<Channel>('Facebook');

  // Step Tabs: 'GOALS' = Bước 1 Content Product Planning, 'CATEGORIES' = Bước 2 Danh Mục, 'SCHEDULE' = Bước 3 Lịch Phân Bổ
  const currentStepTab = planningSubTab;
  const setCurrentStepTab = setPlanningSubTab;

  // AI Generation Drawer / Modal State
  const [generatingItem, setGeneratingItem] = useState<ContentItem | null>(null);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<string>(''); // Nhập thông tin thêm phối hợp vào content
  const [activeOutputTab, setActiveOutputTab] = useState<'FACEBOOK' | 'TIKTOK'>('FACEBOOK');
  const [editedFbCaption, setEditedFbCaption] = useState<string>('');
  const [editedTiktokCaption, setEditedTiktokCaption] = useState<string>('');
  const [copiedFb, setCopiedFb] = useState<boolean>(false);
  const [copiedTiktok, setCopiedTiktok] = useState<boolean>(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [generationToast, setGenerationToast] = useState<{
    text: string;
    angle: string;
    index: number;
  } | null>(null);

  // Current month contents - Content Product Planning chỉ quản lý sản phẩm phần cứng Bulbtek, KHÔNG chứa Linh Vật Robot BU
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const currentMonthContents = useMemo(() => {
    return contents
      .filter(c => c.date.startsWith(monthPrefix) && c.productLine !== 'Linh Vật Robot BU')
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [contents, monthPrefix]);

  // Filtered month contents for display
  const filteredContents = useMemo(() => {
    return currentMonthContents.filter(item => {
      const matchesSearch = !searchQuery.trim() || 
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.angleUsed && item.angleUsed.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesChannel = channelFilter === 'ALL' || item.channel === channelFilter;

      const hasAi = Boolean(item.facebookCaption || item.tiktokCaption);
      const matchesAi = aiStatusFilter === 'ALL' || 
        (aiStatusFilter === 'AI_DONE' && hasAi) ||
        (aiStatusFilter === 'AI_PENDING' && !hasAi);

      const matchesType = typeFilter === 'ALL' ||
        (typeFilter === 'BRANDING' && item.productLine === 'Branding Sản Phẩm') ||
        (typeFilter === 'HARDWARE' && item.productLine !== 'Branding Sản Phẩm');

      return matchesSearch && matchesChannel && matchesAi && matchesType;
    });
  }, [currentMonthContents, searchQuery, channelFilter, aiStatusFilter, typeFilter]);

  // Statistics
  const totalCount = currentMonthContents.length;
  const fbCount = currentMonthContents.filter(c => c.channel === 'Facebook').length;
  const tiktokCount = currentMonthContents.filter(c => c.channel === 'TikTok').length;
  const generatedCount = currentMonthContents.filter(c => Boolean(c.facebookCaption || c.tiktokCaption)).length;
  const ungeneratedCount = totalCount - generatedCount;
  const completionPercentage = totalCount > 0 ? Math.round((generatedCount / totalCount) * 100) : 0;

  // Handlers
  const handleSelectHotHardware = () => {
    const heroHardware = hardwareProducts
      .filter(p => p.status === 'Hero Product' || p.status === 'Sản phẩm mới')
      .slice(0, 6)
      .map(p => p.id);
    setSelectedPushProductIds(heroHardware);
  };

  const handleSelectAllHardware = () => {
    setSelectedPushProductIds(hardwareProducts.map(p => p.id));
  };

  const handleDeselectAllHardware = () => {
    setSelectedPushProductIds([]);
  };

  const togglePushProduct = (id: string) => {
    setSelectedPushProductIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Handle plan auto-generation (KHÔNG CHỨA LINH VẬT ROBOT BU)
  const handleCreateMonthPlan = () => {
    if (selectedPushProductIds.length === 0 && !enableBranding) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm phần cứng Bulbtek để phân bổ kế hoạch!');
      return;
    }
    if (selectedCategoryIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 danh mục nội dung ở Bước 2 để phân bổ kế hoạch!');
      return;
    }
    const confirmed = window.confirm(
      `Hệ thống sẽ tự động tạo kế hoạch tháng ${selectedMonth}/${selectedYear} với ${fbTarget} bài viết đăng tải Facebook Channel theo các sản phẩm phần cứng và ${selectedCategoryIds.length} danh mục đã chọn (không bao gồm Linh Vật Robot BU).\nCác bài viết Định kỳ (Recurring) và Kế hoạch Thương hiệu (Content Branding Planning) sẽ được bảo toàn nguyên vẹn. Bạn có muốn tiếp tục?`
    );
    if (!confirmed) return;

    autoGenerateMonthPlan(
      selectedMonth, 
      selectedYear, 
      selectedPushProductIds, 
      fbTarget, 
      0, // Chỉ Facebook Channel trước
      { 
        enabled: enableBranding, 
        promptInfo: brandingIdeas.filter(Boolean).join(' | '),
        ideas: brandingIdeas.filter(i => i.trim().length > 0)
      },
      { 
        enabled: false, // TUYỆT ĐỐI KHÔNG CHỨA LINH VẬT ROBOT BU TRONG CONTENT PRODUCT PLANNING
        promptInfo: '',
        ideas: []
      },
      selectedCategoryIds
    );
    setCurrentStepTab('SCHEDULE');
  };

  // Batch AI Generator for all pending posts with Anti-Duplication Memory
  const handleBatchGenerateAi = () => {
    const ungenerated = currentMonthContents.filter(c => !c.facebookCaption && !c.tiktokCaption);
    if (ungenerated.length === 0) {
      alert('Tất cả các bài trong tháng đã có nội dung AI hoàn chỉnh!');
      return;
    }
    const confirmed = window.confirm(
      `Bạn có muốn AI tự động viết caption cho toàn bộ ${ungenerated.length} bài còn lại trong tháng ${selectedMonth}/${selectedYear}?\nHệ thống sẽ tự động kích hoạt Bộ Nhớ Content AI để đảm bảo mỗi bài viết mang một góc tiếp cận riêng biệt, không trùng lặp.`
    );
    if (!confirmed) return;

    let runningMemories = [...contentMemory];

    try {
      ungenerated.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const cat = categories.find(c => c.id === item.categoryId) || categories[0];
        if (prod) {
          const specs = Object.values(prod.specs || {}).filter(Boolean).slice(0, 3) as string[];
          const prodMemories = runningMemories.filter(m => m.productId === prod.id);
          const activeModelConfig = settings.models.find(m => m.id === settings.activeModel);
          const output = generateBulbtekContent(
            prod, 
            cat, 
            specs, 
            activeModelConfig?.modelCode || activeModelConfig?.name || settings.activeModel, 
            prodMemories
          );
          
          const newMem = addContentMemory({
            productId: prod.id,
            productName: prod.name,
            categoryId: cat.id,
            categoryName: cat.name,
            channel: item.channel,
            date: item.date,
            angleUsed: output.angleUsed,
            hookFb: output.hookFb,
            hookTiktok: output.hookTiktok,
            variationIndex: output.variationIndex,
            facebookCaption: output.facebookCaption,
            tiktokCaption: output.tiktokCaption
          });
          runningMemories.push(newMem);

          saveContentItem({
            ...item,
            creativeHeadline: output.creativeHeadline || item.creativeHeadline,
            facebookCaption: output.facebookCaption,
            tiktokCaption: output.tiktokCaption,
            highlightSpecs: specs,
            angleUsed: output.angleUsed,
            aiModelUsed: activeModelConfig?.name || 'Claude 3.7 Sonnet'
          });
        }
      });
      alert(`🎉 Đã sản sinh thành công nội dung cho ${ungenerated.length} bài đăng!\nToàn bộ đã được ghi nhận vào Bộ Nhớ AI (Content Memory) đảm bảo không trùng lặp góc viết.`);
    } catch (error: any) {
      const activeModelConfig = settings.models.find(m => m.id === settings.activeModel);
      const friendlyMsg = parseAiErrorAndFormat(error, activeModelConfig?.modelCode || activeModelConfig?.name || settings.activeModel);
      alert(friendlyMsg);
    }
  };

  // Export kế hoạch phân bổ tháng gửi nhân sự triển khai dạng CSV
  const handleExportProductPlan = () => {
    if (currentMonthContents.length === 0) {
      alert(`Chưa có bài viết nào được lên lịch trong tháng ${selectedMonth}/${selectedYear} để tải về!`);
      return;
    }
    const catMap: Record<string, string> = {};
    categories.forEach(c => { catMap[c.id] = c.name; });
    exportProductPlanCsv(selectedMonth, selectedYear, currentMonthContents, catMap);
  };

  // Export kế hoạch phân bổ tháng dạng PDF chuẩn A4 Landscape dễ theo dõi
  const handleExportProductPlanPdf = () => {
    if (currentMonthContents.length === 0) {
      alert(`Chưa có bài viết nào được lên lịch trong tháng ${selectedMonth}/${selectedYear} để xuất PDF!`);
      return;
    }
    const catMap: Record<string, string> = {};
    categories.forEach(c => { catMap[c.id] = c.name; });
    exportProductPlanPdf(selectedMonth, selectedYear, currentMonthContents, catMap);
  };

  // Add Category Handler
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatTone.trim()) {
      alert('Vui lòng điền đủ Tên và Tone giọng điệu category!');
      return;
    }
    addCategory({
      name: newCatName.trim().toUpperCase(),
      tone: newCatTone.trim(),
      color: newCatColor,
      exampleAngle: newCatAngle.trim() || undefined
    });
    setNewCatName('');
    setNewCatTone('');
    setNewCatAngle('');
    setShowCategoryModal(false);
  };

  // Save Recurring Handler
  const handleCreateRecurringSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === recurProdId) || products[0];
    const cat = categories.find(c => c.id === recurCatId) || categories[0];

    const dates: string[] = [];
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    if (recurPattern === 'Hàng tuần') {
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(selectedYear, selectedMonth - 1, day);
        if (d.getDay() === recurDayOfWeek) {
          dates.push(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        }
      }
    } else {
      const day = Math.min(recurDayOfMonth, daysInMonth);
      dates.push(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }

    dates.forEach(dateStr => {
      const newItem: ContentItem = {
        id: `recur-${Date.now()}-${dateStr}`,
        date: dateStr,
        channel: recurChannel,
        productId: prod.id,
        productName: prod.name,
        productLine: prod.productLine,
        categoryId: cat.id,
        title: `[Lặp định kỳ] ${prod.name}`,
        highlightSpecs: Object.values(prod.specs || {}).filter(Boolean).slice(0, 2) as string[],
        status: 'Draft',
        assigneeId: users[0]?.id || 'u-1',
        assigneeName: users[0]?.name || 'Creator',
        isRecurring: true,
        recurringDetail: recurPattern === 'Hàng tuần' ? `Thứ ${recurDayOfWeek === 0 ? 'CN' : recurDayOfWeek + 1} hàng tuần` : `Ngày ${recurDayOfMonth} hàng tháng`,
        createdAt: new Date().toISOString(),
        createdBy: users[0]?.id || 'u-1'
      };
      saveContentItem(newItem);
    });

    setShowRecurringModal(false);
    alert(`Đã thiết lập thành công lịch lặp cho ${dates.length} bài trong tháng ${selectedMonth}/${selectedYear}!`);
  };

  // Open AI Generator Modal for an item
  const handleOpenAiGenerator = (item: ContentItem) => {
    const prod = products.find(p => p.id === item.productId);
    const validation = validateProductForContent(prod);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setGeneratingItem(item);
    const availableSpecs = prod ? (Object.values(prod.specs || {}).filter(Boolean) as string[]) : [];
    setSelectedSpecs(item.highlightSpecs.length > 0 ? item.highlightSpecs : availableSpecs.slice(0, 3));
    setEditedFbCaption(item.facebookCaption || '');
    setEditedTiktokCaption(item.tiktokCaption || '');
    setAdditionalInfo('');
  };

  // Tự động mở AI Generator khi bấm Tạo bài từ Banner ngày lễ (Mục 6)
  useEffect(() => {
    if (planningPrefillItem) {
      handleOpenAiGenerator(planningPrefillItem);
      setPlanningPrefillItem(null);
    }
  }, [planningPrefillItem]);

  // Run AI Generation (or Regeneration with Anti-Duplication Memory)
  const handleRunAiGeneration = () => {
    if (!generatingItem) return;
    const prod = products.find(p => p.id === generatingItem.productId);
    const cat = categories.find(c => c.id === generatingItem.categoryId) || categories[0];

    if (!prod) return;
    setIsGeneratingAi(true);

    setTimeout(() => {
      try {
        const productMemories = getMemoryForProduct(generatingItem.productId);
        const activeModelConfig = settings.models.find(m => m.id === settings.activeModel);
        const output = generateBulbtekContent(
          prod, 
          cat, 
          selectedSpecs, 
          activeModelConfig?.modelCode || activeModelConfig?.name || settings.activeModel, 
          productMemories,
          undefined,
          additionalInfo
        );

        // Save into memory store
        addContentMemory({
          productId: prod.id,
          productName: prod.name,
          categoryId: cat.id,
          categoryName: cat.name,
          channel: generatingItem.channel,
          date: generatingItem.date,
          angleUsed: output.angleUsed,
          hookFb: output.hookFb,
          hookTiktok: output.hookTiktok,
          variationIndex: output.variationIndex,
          facebookCaption: output.facebookCaption,
          tiktokCaption: output.tiktokCaption
        });

        setEditedFbCaption(output.facebookCaption);
        setEditedTiktokCaption(output.tiktokCaption);
        
        const updated: ContentItem = {
          ...generatingItem,
          creativeHeadline: output.creativeHeadline || generatingItem.creativeHeadline,
          facebookCaption: output.facebookCaption,
          tiktokCaption: output.tiktokCaption,
          highlightSpecs: selectedSpecs,
          angleUsed: output.angleUsed,
          aiModelUsed: activeModelConfig?.name || 'Claude 3.7 Sonnet'
        };
        setGeneratingItem(updated);
        saveContentItem(updated);

        setGenerationToast({
          text: `Đã sinh thành công Biến thể #${output.variationIndex}`,
          angle: output.angleUsed,
          index: output.variationIndex
        });
        setTimeout(() => setGenerationToast(null), 6000);
      } catch (error: any) {
        const activeModelConfig = settings.models.find(m => m.id === settings.activeModel);
        const friendlyMsg = parseAiErrorAndFormat(error, activeModelConfig?.modelCode || activeModelConfig?.name || settings.activeModel);
        alert(friendlyMsg);
      } finally {
        setIsGeneratingAi(false);
      }
    }, 450);
  };

  // Save generated content to Calendar
  const handleSaveToCalendar = () => {
    if (!generatingItem) return;
    const updated: ContentItem = {
      ...generatingItem,
      facebookCaption: editedFbCaption,
      tiktokCaption: editedTiktokCaption,
      highlightSpecs: selectedSpecs,
      status: generatingItem.status === 'Draft' ? 'Draft' : generatingItem.status
    };
    saveContentItem(updated);
    setGeneratingItem(null);
    alert('💾 Đã lưu thành công bài viết vào Lịch Content Calendar!');
  };

  // Transition to Design Brief
  const handleCreateDesignBriefFromAi = () => {
    if (!generatingItem) return;
    const updated: ContentItem = {
      ...generatingItem,
      facebookCaption: editedFbCaption,
      tiktokCaption: editedTiktokCaption,
      highlightSpecs: selectedSpecs
    };
    saveContentItem(updated);
    setBriefPrefillItem(updated);
    setGeneratingItem(null);
    setActiveTab(5);
  };

  const getCategoryIcon = (name: string) => {
    if (name.includes('BRAND')) return ShieldAlert;
    if (name.includes('PROD')) return Zap;
    if (name.includes('TƯƠNG TÁC') || name.includes('INTERACT')) return MessageSquare;
    if (name.includes('QUIZ')) return HelpCircle;
    if (name.includes('DEALER')) return Briefcase;
    return FileText;
  };

  // Week grouping helper
  const getWeekNumber = (dateStr: string) => {
    const day = parseInt(dateStr.split('-')[2], 10);
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    if (day <= 21) return 3;
    return 4;
  };

  const getDayOfWeekName = (dateStr: string) => {
    const d = new Date(dateStr);
    const map = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return map[d.getDay()] || '';
  };

  // Group filtered contents by week
  const week1Items = filteredContents.filter(c => getWeekNumber(c.date) === 1);
  const week2Items = filteredContents.filter(c => getWeekNumber(c.date) === 2);
  const week3Items = filteredContents.filter(c => getWeekNumber(c.date) === 3);
  const week4Items = filteredContents.filter(c => getWeekNumber(c.date) === 4);

  const weeksData = [
    { weekNum: 1, label: 'Tuần 1 (Ngày 01 - 07)', items: week1Items },
    { weekNum: 2, label: 'Tuần 2 (Ngày 08 - 14)', items: week2Items },
    { weekNum: 3, label: 'Tuần 3 (Ngày 15 - 21)', items: week3Items },
    { weekNum: 4, label: 'Tuần 4 (Ngày 22 - 30)', items: week4Items },
  ];

  return (
    <div className="space-y-6">
      
      {/* 🌟 1. PROCESS STEPPER SUB-TABS */}
      <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#18181D] border-[#2A2A32] shadow-xl'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-bulbtek-red flex items-center justify-center text-white shadow-glow-red shrink-0">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`text-base sm:text-lg font-black tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Content Product Planning
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-bulbtek-red/15 text-bulbtek-red border border-bulbtek-red/30">
                  Tháng {selectedMonth}/{selectedYear}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Quy trình lập kế hoạch sản phẩm phần cứng Bulbtek (Bi-LED, Bi-Laser, Bi-Gầm, Bóng LED) & AI Content Studio
              </p>
            </div>
          </div>

          {/* Interactive Step Sub-Tabs */}
          <div className={`flex items-center p-1 rounded-xl border overflow-x-auto gap-1 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#121215] border-[#2A2A32]'}`}>
            {/* Tab 1: Content Product Planning */}
            <button
              type="button"
              onClick={() => setCurrentStepTab('GOALS')}
              className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                currentStepTab === 'GOALS'
                  ? 'bg-bulbtek-red text-white shadow-glow-red'
                  : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                currentStepTab === 'GOALS' ? 'bg-white/20 text-white' : 'bg-slate-300 dark:bg-gray-700 text-slate-700 dark:text-gray-300'
              }`}>1</span>
              <span>Bước 1: Content Product Planning</span>
            </button>

            {/* Tab 2: Bước 2: Danh Mục */}
            <button
              type="button"
              onClick={() => setCurrentStepTab('CATEGORIES')}
              className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                currentStepTab === 'CATEGORIES'
                  ? 'bg-bulbtek-red text-white shadow-glow-red'
                  : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                currentStepTab === 'CATEGORIES' ? 'bg-white/20 text-white' : 'bg-slate-300 dark:bg-gray-700 text-slate-700 dark:text-gray-300'
              }`}>2</span>
              <span>Bước 2: Danh Mục ({categories.length})</span>
            </button>

            {/* Tab 3: Bước 3: Lịch Phân Bổ */}
            <button
              type="button"
              onClick={() => setCurrentStepTab('SCHEDULE')}
              className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap relative ${
                currentStepTab === 'SCHEDULE'
                  ? 'bg-bulbtek-red text-white shadow-glow-red'
                  : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                currentStepTab === 'SCHEDULE' ? 'bg-white/20 text-white' : 'bg-slate-300 dark:bg-gray-700 text-slate-700 dark:text-gray-300'
              }`}>3</span>
              <span>Bước 3: Lịch Phân Bổ ({totalCount} bài)</span>
              {ungeneratedCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-0.5" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* 🌟 2. BƯỚC 1: CẤU HÌNH MỤC TIÊU THÁNG (HIGHLY VISUAL & FRIENDLY) */}
      {currentStepTab === 'GOALS' && (
      <div className={`p-5 rounded-2xl border space-y-5 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#18181D] border-[#2A2A32] shadow-xl'}`}>
        
        {/* Step Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-inherit">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-bulbtek-red text-white flex items-center justify-center font-bold text-xs shadow-sm">1</span>
            <h2 className={`text-sm font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Bước 1: Content Product Planning (Mục Tiêu & SKU Sản Phẩm)
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Tháng / Năm:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'}`}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'}`}
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>

        {/* Target Counter Cards Grid - Chỉ cấu hình Social trước là Facebook Channel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Facebook Target Card (Kênh Social Chủ Lực Triển Khai Trước) */}
          <div className={`p-4 rounded-xl border relative overflow-hidden flex flex-col justify-between ${isLight ? 'bg-red-50/70 border-red-200 shadow-xs' : 'bg-red-950/20 border-red-900/50'}`}>
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-bulbtek-red text-white flex items-center justify-center font-black text-sm shadow-sm">
                    FB
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-red-600">Facebook Channel</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-red-600 text-white uppercase tracking-wider">
                        Chủ Lực
                      </span>
                    </div>
                    <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'} mt-0.5`}>
                      4 bài/tuần • T2, T4, T6, T7 (19:30)
                    </div>
                  </div>
                </div>
                <span className="text-2xl font-black text-bulbtek-red">{fbTarget}</span>
              </div>

              {/* Mức bài nhanh */}
              <div className="flex items-center space-x-1 mt-3">
                <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'} mr-0.5`}>Mốc nhanh:</span>
                {[12, 16, 20, 24].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFbTarget(num)}
                    className={`text-[10px] px-2 py-0.5 rounded font-bold border transition ${
                      fbTarget === num
                        ? 'bg-bulbtek-red text-white border-bulbtek-red shadow-xs'
                        : isLight 
                          ? 'bg-white text-slate-700 border-slate-300 hover:bg-red-50 hover:border-red-300' 
                          : 'bg-[#18181D] text-gray-300 border-gray-700 hover:bg-[#25252c]'
                    }`}
                  >
                    {num} bài{num === 16 ? ' (Chuẩn)' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-red-200/60 dark:border-red-800/40">
              <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Tùy chỉnh số lượng:</span>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setFbTarget(prev => Math.max(1, prev - 1))}
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border ${isLight ? 'bg-white border-red-300 text-red-700 hover:bg-red-100' : 'bg-red-950/80 border-red-800 text-red-300 hover:bg-red-900'}`}
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={fbTarget}
                  onChange={(e) => setFbTarget(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
                  className={`w-10 text-center font-bold font-mono text-xs rounded border py-0.5 ${isLight ? 'bg-white border-red-300 text-red-600' : 'bg-[#121215] border-red-800 text-red-400'}`}
                />
                <button
                  type="button"
                  onClick={() => setFbTarget(prev => Math.min(60, prev + 1))}
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border ${isLight ? 'bg-white border-red-300 text-red-700 hover:bg-red-100' : 'bg-red-950/80 border-red-800 text-red-300 hover:bg-red-900'}`}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Lộ Trình Kênh Social (Facebook First) */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2A2A32]'}`}>
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`p-1.5 rounded-lg border ${isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-950/40 text-blue-400 border-blue-900'}`}>
                    <Layers className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Định Hướng Đăng Tải Social</h3>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Quy hoạch lộ trình đa kênh</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-950/60 text-blue-300 border-blue-800'}`}>
                  Facebook First
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-[11px] leading-relaxed">
                <div className={`flex items-start space-x-2 p-2 rounded-lg border ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#18181D] border-gray-800 text-gray-300'}`}>
                  <span className="text-emerald-500 font-bold">●</span>
                  <span><strong>Facebook Channel:</strong> Tập trung toàn bộ {fbTarget} bài viết trong tháng, tích hợp AI Studio sản sinh copy & brief hình ảnh nhận diện thương hiệu.</span>
                </div>
                <div className={`flex items-start space-x-2 p-1.5 rounded-lg ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                  <span className="text-gray-400">○</span>
                  <span><strong>TikTok & Video Ngắn:</strong> Sẽ kích hoạt triển khai ở giai đoạn tiếp theo sau khi chuẩn hóa quy chuẩn nội dung Facebook.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Action CTA Card */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${isLight ? 'bg-gradient-to-br from-slate-50 to-red-50/40 border-slate-200 shadow-xs' : 'bg-gradient-to-br from-[#121215] to-red-950/15 border-[#2F2F37]'}`}>
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>Mục tiêu tháng {selectedMonth}/{selectedYear}:</span>
                <span className="text-xl font-black text-bulbtek-red">{fbTarget} bài Facebook</span>
              </div>
              <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'} mt-1.5 leading-relaxed`}>
                Hệ thống sẽ rải đều {fbTarget} bài trên Facebook Channel theo thứ trong tuần, tập trung 100% vào các sản phẩm phần cứng Bulbtek và danh mục kỹ thuật/bán hàng đã chọn.
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-inherit">
              <button
                type="button"
                onClick={handleCreateMonthPlan}
                className="flex-1 h-9 px-3 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Phân bổ tự động ({fbTarget} bài Facebook)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRecurringModal(true)}
                className={`h-9 px-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-center ${isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-[#121215] border-[#2F2F37] text-gray-300 hover:bg-[#202026]'}`}
                title="Cài đặt lịch lặp định kỳ (Recurring)"
              >
                <Repeat className="w-3.5 h-3.5 text-bulbtek-red" />
              </button>
            </div>
          </div>

        </div>

        {/* 🚗 HARDWARE PRODUCTS GRID (TRỰC QUAN VỚI ẢNH THUMBNAIL) */}
        <div className="space-y-3 pt-2 border-t border-inherit">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4 text-bulbtek-red" />
              <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Chọn sản phẩm phần cứng push trong tháng ({selectedPushProductIds.length}/{hardwareProducts.length} đã chọn):
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 text-xs">
              <button
                type="button"
                onClick={handleSelectHotHardware}
                className="px-2.5 py-1 rounded-lg bg-bulbtek-red/15 hover:bg-bulbtek-red/25 border border-bulbtek-red/30 text-bulbtek-red font-semibold text-[11px] transition flex items-center space-x-1"
                title="Tự động chọn 6 sản phẩm Hero & Mới"
              >
                <Flame className="w-3 h-3 text-bulbtek-red" />
                <span>Chọn 6 Hero/Hot</span>
              </button>

              <button
                type="button"
                onClick={handleSelectAllHardware}
                className={`px-2 py-1 rounded-lg border text-[11px] transition ${isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-[#121215] hover:bg-[#202026] border-[#2F2F37] text-gray-300'}`}
              >
                Chọn tất cả
              </button>

              <button
                type="button"
                onClick={handleDeselectAllHardware}
                className={`px-2 py-1 rounded-lg border text-[11px] transition ${isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-[#121215] hover:bg-[#202026] border-[#2F2F37] text-gray-300'}`}
              >
                Bỏ chọn
              </button>
            </div>
          </div>

          {/* Interactive Hardware Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {hardwareProducts.map(prod => {
              const isChecked = selectedPushProductIds.includes(prod.id);
              const isHero = prod.status === 'Hero Product';

              return (
                <div
                  key={prod.id}
                  onClick={() => togglePushProduct(prod.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center space-x-2.5 ${
                    isChecked
                      ? isLight
                        ? 'bg-red-50/90 border-bulbtek-red shadow-sm ring-1 ring-bulbtek-red/40'
                        : 'bg-bulbtek-red/20 border-bulbtek-red text-white shadow-glow-red ring-1 ring-bulbtek-red/50'
                      : isLight
                        ? 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
                        : 'bg-[#121215] hover:bg-[#1E1E24] border-[#2F2F37] text-gray-400'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-gray-700">
                    <img 
                      src={prod.imageUrl || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=200&auto=format&fit=crop&q=80'} 
                      alt={prod.name} 
                      className="w-full h-full object-cover"
                    />
                    {isChecked && (
                      <div className="absolute inset-0 bg-bulbtek-red/40 flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5 font-black" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs font-bold truncate ${isChecked ? (isLight ? 'text-red-950' : 'text-white') : (isLight ? 'text-slate-900' : 'text-gray-300')}`}>
                        {prod.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-gray-800 text-gray-400'}`}>
                        {prod.productLine}
                      </span>
                      {isHero && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                          🔥 Hero
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 📊 RATIO SUMMARY & GOLDEN BALANCE BAR */}
        <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#121215] border-[#2F2F37] text-gray-300'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
            <span className="font-bold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-bulbtek-red" />
              <span>Cân đối tỷ lệ nội dung sản phẩm tháng {selectedMonth}:</span>
            </span>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="text-red-600 font-bold">● Sản phẩm phần cứng: {selectedPushProductIds.length} SKU (100%)</span>
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-2 w-full bg-slate-200 dark:bg-gray-800 rounded-full overflow-hidden flex">
            <div style={{ width: '100%' }} className="bg-bulbtek-red h-full transition-all" title="100% Sản phẩm phần cứng Bulbtek" />
          </div>
          <div className={`text-[11px] mt-1.5 flex items-center justify-between ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            <span>Quy chuẩn Content Product Planning: <strong>100% Tập Trung Sáng Tạo Nội Dung Cho Sản Phẩm</strong> (Bi-LED, Bi-Laser, Bi-Gầm, Bóng LED, Trợ Sáng).</span>
            <span className="text-emerald-600 font-semibold">✓ Chuẩn sản phẩm</span>
          </div>
        </div>

        {/* Step 1 Footer Navigation */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
        }`}>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentStepTab('CATEGORIES')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#18181D] hover:bg-[#202026] border-[#2A2A32] text-gray-300'
              }`}
            >
              Xem Bước 2: Danh Mục Nội Dung →
            </button>
          </div>

          <button
            type="button"
            onClick={handleCreateMonthPlan}
            className="px-5 py-2.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red flex items-center space-x-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tự Động Phân Bổ Kế Hoạch & Sang Bước 3 ➔</span>
          </button>
        </div>

      </div>
      )}

      {/* 🌟 3. BƯỚC 2: DANH MỤC NỘI DUNG (CATEGORIES & RATIOS) */}
      {currentStepTab === 'CATEGORIES' && (
      <div className={`p-5 rounded-2xl border space-y-4 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#18181D] border-[#2A2A32] shadow-xl'}`}>
        
        {/* Step 2 Header & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-inherit">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">2</span>
            <div>
              <h2 className={`text-sm font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Bước 2: Danh Mục Nội Dung & Góc Tiếp Cận (Categories)
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Click trực tiếp vào thẻ để <strong>chọn hoặc bỏ chọn</strong> các danh mục bạn muốn phân bổ nội dung trong tháng {selectedMonth}/{selectedYear}.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Select Buttons */}
            <button
              type="button"
              onClick={handleSelectAllCategories}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1 ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' 
                  : 'bg-[#121215] hover:bg-[#202026] border-[#2F2F37] text-gray-300'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chọn tất cả ({categories.length})</span>
            </button>

            <button
              type="button"
              onClick={handleDeselectAllCategories}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1 ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' 
                  : 'bg-[#121215] hover:bg-[#202026] border-[#2F2F37] text-gray-300'
              }`}
            >
              <Square className="w-3.5 h-3.5 text-slate-400" />
              <span>Bỏ chọn hết</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-bulbtek-red hover:bg-bulbtek-red-hover text-white shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm category mới</span>
            </button>
          </div>
        </div>

        {/* Selected Summary Alert */}
        <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
          selectedCategoryIds.length > 0 
            ? isLight ? 'bg-blue-50/70 border-blue-200 text-blue-900' : 'bg-blue-950/20 border-blue-900/40 text-blue-300'
            : isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="font-bold flex items-center space-x-1.5">
              <span>🎯 Danh mục phân bổ kế hoạch:</span>
              <strong className="text-sm font-black underline">{selectedCategoryIds.length} / {categories.length}</strong>
              <span>danh mục được kích hoạt.</span>
            </span>
            {selectedCategoryIds.length === 0 && (
              <span className="text-red-500 font-bold animate-pulse">⚠️ Hãy chọn ít nhất 1 danh mục để phân bổ!</span>
            )}
          </div>
          <div className="text-[11px] opacity-80">
            Hệ thống sẽ chỉ tự động phân bổ bài viết vào các danh mục có dấu tick xanh.
          </div>
        </div>

        {/* Category Cards Interactive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {categories.map(cat => {
            const Icon = getCategoryIcon(cat.name);
            const isSelected = selectedCategoryIds.includes(cat.id);

            return (
              <div
                key={cat.id}
                onClick={() => toggleSelectCategory(cat.id)}
                role="button"
                tabIndex={0}
                className={`p-3.5 rounded-xl border space-y-2.5 relative overflow-hidden transition-all cursor-pointer select-none text-left ${
                  isSelected
                    ? isLight 
                      ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20 transform -translate-y-0.5' 
                      : 'bg-[#18181D] border-blue-400 shadow-md ring-2 ring-blue-400/20 transform -translate-y-0.5'
                    : isLight 
                      ? 'bg-slate-50/80 border-dashed border-slate-300 opacity-60 hover:opacity-90' 
                      : 'bg-[#121215] border-dashed border-[#2F2F37] opacity-50 hover:opacity-85'
                }`}
                style={{ borderTop: `4px solid ${isSelected ? cat.color : '#64748B'}` }}
              >
                {/* Header with Name, Icon & Selection Badge */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" style={{ color: isSelected ? cat.color : '#94A3B8' }} />
                    <span 
                      className="font-black text-xs tracking-wider truncate" 
                      style={{ color: isSelected ? cat.color : undefined }}
                    >
                      {cat.name}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 shrink-0 ${
                    isSelected 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : isLight ? 'bg-slate-200 text-slate-600' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {isSelected ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Đã chọn</span>
                      </>
                    ) : (
                      <span>Bỏ qua</span>
                    )}
                  </span>
                </div>

                {/* Tone */}
                <div className={`text-xs font-semibold ${isSelected ? (isLight ? 'text-slate-800' : 'text-gray-200') : 'text-slate-400 dark:text-gray-500'}`}>
                  {cat.tone}
                </div>

                {/* Example Angle */}
                {cat.exampleAngle && (
                  <p className={`text-[11px] italic line-clamp-2 pt-1.5 border-t ${
                    isLight ? 'text-slate-500 border-slate-100' : 'text-gray-400 border-gray-800/80'
                  }`}>
                    "{cat.exampleAngle}"
                  </p>
                )}

                {/* Footer status */}
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono opacity-70">
                  <span>Trạng thái:</span>
                  <strong className={isSelected ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                    {isSelected ? '✓ Sẽ phân bổ' : '○ Bỏ qua'}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 2 Footer Navigation */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
        }`}>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentStepTab('GOALS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#18181D] hover:bg-[#202026] border-[#2A2A32] text-gray-300'
              }`}
            >
              ← Bước 1: Content Product Planning
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCreateMonthPlan}
              disabled={selectedCategoryIds.length === 0}
              className="px-5 py-2.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red flex items-center space-x-2 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tự Động Phân Bổ Theo {selectedCategoryIds.length} Danh Mục Đã Chọn ➔</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStepTab('SCHEDULE')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#18181D] hover:bg-[#202026] border-[#2A2A32] text-gray-300'
              }`}
            >
              <span>Xem Lịch Bước 3 ({totalCount} bài) →</span>
            </button>
          </div>
        </div>

      </div>
      )}

      {/* 🌟 4. BƯỚC 3: LỊCH PHÂN BỔ BÀI ĐĂNG THÁNG (HIGHLY INTUITIVE & VISUAL) */}
      {currentStepTab === 'SCHEDULE' && (
      <div className={`p-5 rounded-2xl border space-y-5 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#18181D] border-[#2A2A32] shadow-xl'}`}>
        
        {/* Step Header with Stats & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-inherit">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">3</span>
              <h2 className={`text-sm font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Bước 3: Lịch Phân Bổ Nội Dung Tháng {selectedMonth}/{selectedYear}
              </h2>
              {/* Quick Month & Year Switcher */}
              <div className="flex items-center space-x-1.5 ml-1">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className={`rounded-lg px-2 py-0.5 text-xs font-bold border ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'}`}
                  title="Chọn tháng để xem lịch phân bổ"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>Tháng {m}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className={`rounded-lg px-2 py-0.5 text-xs font-bold border ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'}`}
                >
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>
            <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Tổng số <strong className={isLight ? 'text-slate-900' : 'text-white'}>{totalCount} bài</strong> ({fbCount} Facebook / {tiktokCount} TikTok). Đã hoàn thiện caption: <strong className="text-emerald-600">{generatedCount}/{totalCount} bài ({completionPercentage}%)</strong>.
            </div>
          </div>

          {/* View Mode Switcher & Batch Action */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* View Mode Toggle */}
            <div className={`flex items-center p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
              <button
                type="button"
                onClick={() => setPlanningViewMode('WEEK_CARDS')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  planningViewMode === 'WEEK_CARDS'
                    ? 'bg-bulbtek-red text-white shadow-sm'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Thẻ theo tuần</span>
              </button>
              <button
                type="button"
                onClick={() => setPlanningViewMode('SMART_TABLE')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  planningViewMode === 'SMART_TABLE'
                    ? 'bg-bulbtek-red text-white shadow-sm'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Bảng dữ liệu</span>
              </button>
            </div>

            {/* Batch AI Button */}
            <button
              type="button"
              onClick={handleBatchGenerateAi}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
              title="Tự động sản sinh caption AI cho tất cả các bài còn lại"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Tạo AI toàn bộ ({ungeneratedCount} bài)</span>
            </button>

            {/* Download Plan PDF Button (Chính) */}
            <button
              type="button"
              onClick={handleExportProductPlanPdf}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-sm transition"
              title="Tải kế hoạch phân bổ dạng tài liệu PDF A4 ngang để theo dõi trực quan và gửi nhân sự triển khai"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tải Kế Hoạch (PDF)</span>
            </button>

            {/* Download Plan CSV Button (Phụ) */}
            <button
              type="button"
              onClick={handleExportProductPlan}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#121215] hover:bg-[#202026] border-[#2F2F37] text-gray-300'
              }`}
              title="Tải file dữ liệu bảng tính (.CSV / Excel)"
            >
              <Download className="w-3 h-3 text-blue-500" />
              <span>.CSV</span>
            </button>

            {/* Switch to Calendar */}
            <button
              type="button"
              onClick={() => setActiveTab(4)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#121215] hover:bg-[#202026] border-[#2F2F37] text-gray-300'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-bulbtek-red" />
              <span>Xem Calendar</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm, angle..."
                className={`w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-bulbtek-red ${
                  isLight ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-[#18181D] border-[#2F2F37] text-white placeholder:text-gray-500'
                }`}
              />
            </div>

            {/* Channel Filters */}
            <div className="flex items-center space-x-1 text-xs">
              <button
                type="button"
                onClick={() => setChannelFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${channelFilter === 'ALL' ? 'bg-bulbtek-red text-white' : isLight ? 'bg-white text-slate-700 border border-slate-200' : 'bg-[#18181D] text-gray-400'}`}
              >
                Tất cả kênh
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter('Facebook')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${channelFilter === 'Facebook' ? 'bg-red-600 text-white' : isLight ? 'bg-white text-red-600 border border-red-200' : 'bg-[#18181D] text-red-400'}`}
              >
                FB ({fbCount})
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter('TikTok')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${channelFilter === 'TikTok' ? 'bg-cyan-600 text-white' : isLight ? 'bg-white text-cyan-600 border border-cyan-200' : 'bg-[#18181D] text-cyan-400'}`}
              >
                TikTok ({tiktokCount})
              </button>
            </div>
          </div>

          {/* AI Status & Type Filter */}
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={aiStatusFilter}
              onChange={(e) => setAiStatusFilter(e.target.value as any)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:outline-none ${isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#18181D] border-[#2F2F37] text-gray-300'}`}
            >
              <option value="ALL">Mọi trạng thái AI</option>
              <option value="AI_DONE">✓ Đã có Caption AI ({generatedCount})</option>
              <option value="AI_PENDING">⏳ Chưa có Caption AI ({ungeneratedCount})</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:outline-none ${isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#18181D] border-[#2F2F37] text-gray-300'}`}
            >
              <option value="ALL">Mọi tuyến bài</option>
              <option value="HARDWARE">🚗 Sản phẩm phần cứng</option>
              <option value="BRANDING">🛡️ Tuyến bài Branding</option>
            </select>
          </div>

        </div>

        {/* 🌟 4A. CHẾ ĐỘ 1: THẺ TRỰC QUAN THEO TUẦN (WEEK CARDS VIEW - MẶC ĐỊNH) */}
        {planningViewMode === 'WEEK_CARDS' && (
          <div className="space-y-6">
            {weeksData.map(week => {
              if (week.items.length === 0) return null;

              return (
                <div key={week.weekNum} className="space-y-3">
                  
                  {/* Week Divider Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-bulbtek-red"></span>
                      <h3 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {week.label}
                      </h3>
                      <span className={`text-[11px] font-mono px-2 py-0.2 rounded-full ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-gray-800 text-gray-400'}`}>
                        {week.items.length} bài
                      </span>
                    </div>
                  </div>

                  {/* Cards Grid for this Week */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {week.items.map(item => {
                      const prod = products.find(p => p.id === item.productId);
                      const cat = categories.find(c => c.id === item.categoryId);
                      const hasGenerated = Boolean(item.facebookCaption || item.tiktokCaption);
                      const isHero = prod?.status === 'Hero Product';

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                            isLight 
                              ? 'bg-white border-slate-200' 
                              : 'bg-[#121215] border-[#2A2A32]'
                          }`}
                          style={{ borderLeft: `4px solid ${item.channel === 'Facebook' ? '#AF2024' : '#0891B2'}` }}
                        >
                          {/* Card Top: Date, Channel & Recurring */}
                          <div>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-1.5 font-mono">
                                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.date}</span>
                                <span className={isLight ? 'text-slate-400' : 'text-gray-500'}>•</span>
                                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{getDayOfWeekName(item.date)}</span>
                              </div>

                              <div className="flex items-center space-x-1">
                                {item.isRecurring && (
                                  <span title={`Bài lặp định kỳ: ${item.recurringDetail}`} className="text-bulbtek-red">
                                    <Repeat className="w-3.5 h-3.5" />
                                  </span>
                                )}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.channel === 'Facebook'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                                    : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300'
                                }`}>
                                  {item.channel}
                                </span>
                              </div>
                            </div>

                            {/* Product Info & Thumbnail */}
                            <div className="flex items-start space-x-3 mt-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-gray-700">
                                <img
                                  src={prod?.imageUrl || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=200&auto=format&fit=crop&q=80'}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-1.5">
                                  <h4 className={`text-xs font-black truncate leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    {item.productName}
                                  </h4>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  <span
                                    className="text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm"
                                    style={{ 
                                      backgroundColor: `${cat?.color || '#AF2024'}15`, 
                                      color: cat?.color || '#AF2024',
                                      border: `1px solid ${cat?.color || '#AF2024'}40`
                                    }}
                                  >
                                    {cat?.name}
                                  </span>
                                  {isHero && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                                      🔥 Hero
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Caption Preview / Placeholder (Mục 3: không để placeholder tĩnh trùng lặp) */}
                            {hasGenerated ? (
                              <div className={`mt-2.5 p-2 rounded-lg text-xs line-clamp-2 border ${
                                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#18181D] border-[#2F2F37] text-gray-200'
                              }`}>
                                <span className="font-semibold text-bulbtek-red text-[10px] uppercase not-italic mr-1">Caption:</span>
                                <span className="italic">"{item.facebookCaption || item.tiktokCaption}"</span>
                              </div>
                            ) : item.angleUsed ? (
                              <div className={`mt-2.5 p-2 rounded-lg text-xs line-clamp-2 border ${
                                isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#18181D] border-[#2F2F37] text-gray-300'
                              }`}>
                                <span className="font-semibold text-blue-600 dark:text-blue-400 text-[10px] uppercase not-italic mr-1">Angle:</span>
                                <span className="italic">"{item.angleUsed}"</span>
                              </div>
                            ) : (
                              <div className={`mt-2.5 p-2.5 rounded-lg text-xs border border-dashed flex items-center space-x-1.5 ${
                                isLight ? 'bg-amber-50/60 border-amber-200 text-amber-800' : 'bg-[#141418] border-amber-500/30 text-amber-300/80'
                              }`}>
                                <span className="text-amber-500 text-sm leading-none shrink-0">✍️</span>
                                <span className="font-medium text-[11px] leading-tight">
                                  Chưa có caption — bấm <strong>Tạo AI Content</strong> để sinh nội dung riêng cho sản phẩm này
                                </span>
                              </div>
                            )}

                            {/* Compliance Warning Badge if caption violates brand principles */}
                            {(() => {
                              if (!hasGenerated) return null;
                              const captionToCheck = `${item.facebookCaption || ''} ${item.tiktokCaption || ''}`;
                              const compResult = checkBrandCompliance(
                                captionToCheck,
                                settings.complianceRules || DEFAULT_COMPLIANCE_RULES
                              );
                              if (!compResult.isViolated) return null;
                              return (
                                <div 
                                  className={`mt-2 p-2 rounded-lg text-[11px] border flex items-start space-x-1.5 ${
                                    isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/40 border-amber-800 text-amber-200'
                                  }`}
                                  title={compResult.violations.map(v => `• ${v.keyword} (${v.principle}): ${v.suggestion}`).join('\n')}
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center justify-between">
                                      <span>⚠️ Cảnh báo tuân thủ ({compResult.violations.length} lỗi):</span>
                                    </div>
                                    <p className="truncate opacity-90 mt-0.5">
                                      {compResult.violations.map(v => v.keyword).join(', ')}
                                    </p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Card Footer: Assignee & Action */}
                          <div className={`pt-2.5 border-t flex items-center justify-between text-xs ${isLight ? 'border-slate-100 text-slate-500' : 'border-gray-800 text-gray-400'}`}>
                            <div className="flex items-center space-x-1.5 truncate max-w-[120px]">
                              <div className="w-5 h-5 rounded-full bg-bulbtek-red text-white flex items-center justify-center font-bold text-[10px]">
                                {item.assigneeName ? item.assigneeName.slice(0, 1) : 'C'}
                              </div>
                              <span className="truncate text-[11px]">{item.assigneeName}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenAiGenerator(item)}
                              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                hasGenerated
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                                  : 'bg-bulbtek-red text-white hover:bg-bulbtek-red-hover shadow-glow-red'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{hasGenerated ? '✓ Sửa AI (Đã có bài)' : '✨ Tạo AI Content'}</span>
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}

            {filteredContents.length === 0 && (
              <div className={`p-10 text-center rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#121215] border-[#2F2F37] text-gray-400'}`}>
                <CalendarRange className="w-10 h-10 mx-auto opacity-50 mb-3 text-bulbtek-red" />
                {totalCount === 0 ? (
                  <>
                    <p className="text-sm font-bold text-slate-800 dark:text-gray-200">
                      Chưa có bài viết nào được lên lịch trong Tháng {selectedMonth}/{selectedYear}
                    </p>
                    <p className="text-xs opacity-75 mt-1 max-w-md mx-auto">
                      Bạn có thể bấm tự động tạo kế hoạch phân bổ cho Tháng {selectedMonth} hoặc chuyển sang xem các tháng khác.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStepTab('GOALS')}
                        className="px-4 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold transition shadow-sm"
                      >
                        + Tạo Kế Hoạch Phân Bổ Tháng {selectedMonth}
                      </button>
                      {selectedMonth !== 9 && (
                        <button
                          type="button"
                          onClick={() => { setSelectedMonth(9); setSelectedYear(2026); }}
                          className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
                            isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#18181D] hover:bg-[#202026] border-[#2A2A32] text-gray-300'
                          }`}
                        >
                          Xem lịch mẫu Tháng 9/2026 (16 bài)
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold">Không tìm thấy bài viết nào phù hợp với bộ lọc.</p>
                    <p className="text-xs opacity-75 mt-1">Hãy thử xóa từ khóa tìm kiếm hoặc chọn "Tất cả kênh".</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* 🌟 4B. CHẾ ĐỘ 2: BẢNG DỮ LIỆU TINH GỌN (SMART TABLE VIEW) */}
        {planningViewMode === 'SMART_TABLE' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase tracking-wider text-[11px] border-y ${isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-[#121215] text-gray-400 border-[#2F2F37]'}`}>
                <tr>
                  <th className="py-3 px-3">Ngày</th>
                  <th className="py-3 px-3">Kênh</th>
                  <th className="py-3 px-3">Sản phẩm</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Phụ trách</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3 text-right">AI Generator</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#2A2A32]'}`}>
                {filteredContents.map((item) => {
                  const cat = categories.find(c => c.id === item.categoryId);
                  const prod = products.find(p => p.id === item.productId);
                  const hasGenerated = Boolean(item.facebookCaption || item.tiktokCaption);

                  return (
                    <tr key={item.id} className={`transition ${isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-[#18181D] text-gray-300'}`}>
                      
                      {/* Ngày đăng */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 font-mono font-medium">
                          <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.date}</span>
                          {item.isRecurring && (
                            <span title={`Bài lặp định kỳ: ${item.recurringDetail}`} className="text-bulbtek-red">
                              <Repeat className="w-3.5 h-3.5 inline" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kênh */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.channel === 'Facebook'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                            : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300'
                        }`}>
                          {item.channel}
                        </span>
                      </td>

                      {/* Sản phẩm */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2 max-w-[220px]">
                          {prod?.imageUrl && (
                            <img src={prod.imageUrl} alt="" className="w-7 h-7 rounded-md object-cover border shrink-0" />
                          )}
                          <select
                            value={item.productId}
                            onChange={(e) => {
                              const p = products.find(pr => pr.id === e.target.value);
                              if (p) {
                                saveContentItem({
                                  ...item,
                                  productId: p.id,
                                  productName: p.name,
                                  productLine: p.productLine
                                });
                              }
                            }}
                            className={`rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-bulbtek-red truncate border ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                            }`}
                          >
                            {products.filter(p => !p.isHidden).map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} {p.status === 'Hero Product' ? '🔥' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <select
                          value={item.categoryId}
                          onChange={(e) => {
                            saveContentItem({
                              ...item,
                              categoryId: e.target.value
                            });
                          }}
                          className={`rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-bulbtek-red max-w-[150px] border ${
                            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                          }`}
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Phụ trách */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          value={item.assigneeId}
                          onChange={(e) => {
                            const user = users.find(u => u.id === e.target.value);
                            if (user) {
                              saveContentItem({
                                ...item,
                                assigneeId: user.id,
                                assigneeName: user.name
                              });
                            }
                          }}
                          className={`rounded-lg px-2 py-1 text-xs border focus:outline-none ${
                            isLight ? 'bg-white border-slate-300 text-slate-700' : 'bg-[#121215] border-[#2F2F37] text-gray-300'
                          }`}
                        >
                          {users.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.role})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            item.status === 'Pending' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                            item.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                            'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {item.status}
                          </span>
                          {(() => {
                            if (!hasGenerated) return null;
                            const comp = checkBrandCompliance(
                              `${item.facebookCaption || ''} ${item.tiktokCaption || ''}`,
                              settings.complianceRules || DEFAULT_COMPLIANCE_RULES
                            );
                            if (!comp.isViolated) return null;
                            return (
                              <span 
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 inline-flex items-center space-x-0.5"
                                title={comp.violations.map(v => `• ${v.keyword} (${v.principle}): ${v.suggestion}`).join('\n')}
                              >
                                <span>⚠️ {comp.violations.length} lỗi chuẩn</span>
                              </span>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenAiGenerator(item)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              hasGenerated
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-bulbtek-red text-white hover:bg-bulbtek-red-hover shadow-glow-red'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{hasGenerated ? 'Sửa AI' : 'Tạo AI'}</span>
                          </button>

                          <button
                            onClick={() => deleteContentItem(item.id)}
                            className={`p-1.5 rounded-lg transition ${isLight ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-950/30'}`}
                            title="Xóa bài"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Step 3 Footer Navigation */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
        }`}>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentStepTab('GOALS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#18181D] hover:bg-[#202026] border-[#2A2A32] text-gray-300'
              }`}
            >
              ← Bước 1: Mục Tiêu
            </button>
            <button
              type="button"
              onClick={() => setCurrentStepTab('BRAND_CREATIVE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                isLight 
                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800' 
                  : 'bg-amber-950/40 hover:bg-amber-900/60 border-amber-800/60 text-amber-300'
              }`}
            >
              ← Sáng Tạo Thương Hiệu & BU
            </button>
            <button
              type="button"
              onClick={() => setCurrentStepTab('CATEGORIES')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#18181D] hover:bg-[#202026] border-[#2A2A32] text-gray-300'
              }`}
            >
              ← Bước 2: Danh Mục
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {ungeneratedCount > 0 && (
              <button
                type="button"
                onClick={handleBatchGenerateAi}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Tạo AI toàn bộ ({ungeneratedCount} bài còn lại)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab(4)}
              className="px-5 py-2.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red flex items-center space-x-2 transition"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Chuyển Sang Tab Lịch Đăng (Calendar) ➔</span>
            </button>
          </div>
        </div>

      </div>
      )}

      {/* 🌟 5. MODAL: AI CONTENT GENERATOR PANEL (STEP 4) */}
      {generatingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#18181D] border-[#2A2A32] text-white'
          }`}>
            
            {/* Modal Header */}
            <div className={`p-5 border-b flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-bulbtek-red text-white">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-black">
                    AI Content Studio — {generatingItem.productName}
                  </h3>
                  {generatingItem.productLine === 'Branding Sản Phẩm' && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                      🛡️ Tuyến bài Branding
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  Ngày đăng: <strong>{generatingItem.date}</strong> | Kênh: <strong className="text-bulbtek-red">{generatingItem.channel}</strong> | Model: <strong>{settings.models.find(m => m.id === settings.activeModel)?.name || 'Claude 3.5 Sonnet'}</strong>
                </p>
              </div>

              <button
                onClick={() => setGeneratingItem(null)}
                className={`p-1.5 rounded-lg transition ${isLight ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-200' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">

              {/* Live Toast Alert for Fresh Non-Duplicating Generation */}
              {generationToast && (
                <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 flex items-start space-x-3 animate-fadeIn shadow-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0 animate-pulse" />
                  <div className="flex-1 text-xs">
                    <div className="font-bold flex items-center space-x-1.5">
                      <span>{generationToast.text}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px]">Phiên bản mới</span>
                    </div>
                    <p className="mt-0.5 opacity-90">
                      Góc tiếp cận: <strong>"{generationToast.angle}"</strong> — Đã lưu vào bộ nhớ AI để đảm bảo bài viết hoàn toàn không trùng lặp!
                    </p>
                  </div>
                </div>
              )}

              {/* AI CONTENT MEMORY & ANTI-DUPLICATION HUB */}
              {(() => {
                const prodMemories = getMemoryForProduct(generatingItem.productId);
                const history = analyzeProductHistory(generatingItem.productId, contents, settings.repeatWarningThreshold, prodMemories);
                return (
                  <div className={`p-4 rounded-xl border text-xs space-y-3 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121215] border-[#2F2F37] text-gray-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="p-1.5 rounded-lg bg-bulbtek-red/10 text-bulbtek-red border border-bulbtek-red/20">
                          <Brain className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="font-extrabold text-xs uppercase tracking-wider flex items-center space-x-2">
                            <span>Bộ Nhớ Content AI (Anti-Duplication Engine)</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-bulbtek-red text-white font-bold">
                              {prodMemories.length} biến thể đã lưu
                            </span>
                          </div>
                          <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                            Mỗi lần bấm tạo hoặc viết lại, AI tự động tra cứu bộ nhớ và loại trừ các góc viết đã dùng để sinh bài viết hoàn toàn mới.
                          </p>
                        </div>
                      </div>

                      {prodMemories.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Xóa toàn bộ ${prodMemories.length} biến thể trong bộ nhớ của sản phẩm "${generatingItem.productName}" để bắt đầu chu kỳ sáng tạo mới?`)) {
                              clearContentMemory(generatingItem.productId);
                            }
                          }}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition shrink-0 ${
                            isLight ? 'bg-white border-slate-300 text-slate-600 hover:text-red-600 hover:border-red-300' : 'bg-[#18181D] border-[#2F2F37] text-gray-400 hover:text-red-400 hover:border-red-500/40'
                          }`}
                          title="Xóa bộ nhớ sản phẩm này để tạo lại từ đầu"
                        >
                          <Trash2 className="w-3 h-3 inline mr-1" />
                          Xóa bộ nhớ SP
                        </button>
                      )}
                    </div>

                    {/* List of previously used angles in memory */}
                    {prodMemories.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-inherit">
                        <div className={`text-[11px] font-bold flex items-center justify-between ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                          <span>Các góc viết đã lưu trong bộ nhớ (đang được bảo vệ không trùng lặp):</span>
                          <span className="font-mono text-[10px]">{prodMemories.length} góc</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {prodMemories.map((m, idx) => (
                            <span
                              key={m.id}
                              className={`px-2 py-0.5 rounded-md text-[10px] flex items-center space-x-1 border ${
                                isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#18181D] border-[#2F2F37] text-gray-300'
                              }`}
                              title={`Hook: ${m.hookFb}`}
                            >
                              <span className="text-bulbtek-red font-bold">#{m.variationIndex || (idx + 1)}</span>
                              <span className="truncate max-w-[220px]">{m.angleUsed}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Fresh Angles */}
                    {history.suggestedAngles && history.suggestedAngles.length > 0 && (
                      <div className={`text-[11px] pt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        <span className="font-semibold text-emerald-600">Góc viết đề xuất tiếp theo: </span>
                        <span>{history.suggestedAngles.join(' • ')}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Step 4a: Specs Highlight Selector */}
              <div className={`p-4 rounded-xl border space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-bulbtek-red">
                    <CheckSquare className="w-4 h-4" />
                    <span>Chọn Thông Số Kỹ Thuật / Điểm Nhấn Highlight:</span>
                  </div>
                </div>

                {/* Specs Checkboxes */}
                {(() => {
                  const prod = products.find(p => p.id === generatingItem.productId);
                  if (!prod) return null;
                  let specsMap = Object.entries(prod.specs || {}).filter(([_, val]) => Boolean(val && val.trim()));

                  if (specsMap.length === 0) {
                    if (prod.coreBenefit) {
                      specsMap = [['Điểm cốt lõi', prod.coreBenefit]];
                    }
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {specsMap.map(([key, val]) => {
                        const isChecked = selectedSpecs.includes(val);
                        return (
                          <div
                            key={key}
                            onClick={() => {
                              setSelectedSpecs(prev => 
                                prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
                              );
                            }}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start space-x-2 transition ${
                              isChecked
                                ? isLight
                                  ? 'bg-red-50 border-bulbtek-red text-red-950 font-semibold'
                                  : 'bg-bulbtek-red/20 border-bulbtek-red text-white font-semibold'
                                : isLight
                                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                  : 'bg-[#18181D] border-[#2F2F37] text-gray-400 hover:text-gray-200'
                            }`}
                          >
                            <span className="mt-0.5">
                              {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-bulbtek-red" /> : <Square className="w-3.5 h-3.5 opacity-50" />}
                            </span>
                            <div className="flex-1">
                              <span className="opacity-75">{key}: </span>
                              <span>{val}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* 📝 MỤC NHẬP THÔNG TIN THÊM ĐỂ PHỐI HỢP CÙNG CONTENT */}
                <div className={`pt-3 border-t space-y-2.5 ${isLight ? 'border-slate-200' : 'border-[#2F2F37]'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Nhập thông tin thêm (Ưu đãi / Bối cảnh / Yêu cầu sáng tạo):</span>
                    </div>
                    <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                      AI sẽ phối hợp thông tin này vào Hook, Thân bài & CTA
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Nhập thông tin bổ sung để AI phối hợp vào bài viết (VD: Tuần này tặng pát CNC trị giá 500k; Nhấn mạnh cho xe Ford Ranger/Everest; Nhắc bác tài chương trình thu cũ đổi mới; Đăng kiểm chuẩn chỉ...)..."
                    className={`w-full rounded-xl p-2.5 text-xs leading-relaxed focus:outline-none focus:border-bulbtek-red border ${
                      isLight 
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white' 
                        : 'bg-[#18181D] border-[#2F2F37] text-white placeholder:text-gray-500 focus:bg-[#121215]'
                    }`}
                  />

                  {/* Gợi ý nhanh thông tin thêm */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Gợi ý nhanh (bấm để thêm):</span>
                    {[
                      'Tặng pát nhôm CNC chuyên dụng trị giá 500k khi nâng cấp trong tuần này.',
                      'Lắp đặt cắm giắc zin 100% không cắt trích dây điện, giữ trọn bảo hành hãng.',
                      'Đặc biệt tối ưu tầm nhìn cho các dòng xe gầm cao SUV/Bán tải (Everest, Ranger, Fortuner).',
                      'Bảo hành điện tử 3 năm 1 đổi 1 tận nơi trên 300+ đại lý Bulbtek toàn quốc.',
                      'Hỗ trợ cân chỉnh luồng sáng chuẩn vạch kiểm định đăng kiểm miễn phí.'
                    ].map((tip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAdditionalInfo(prev => prev ? `${prev}\n• ${tip}` : `• ${tip}`);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                          isLight
                            ? 'bg-white hover:bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-amber-950/40 hover:bg-amber-900/60 border-amber-800/60 text-amber-200'
                        }`}
                      >
                        + {tip.slice(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleRunAiGeneration}
                    disabled={isGeneratingAi}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isGeneratingAi 
                        ? 'AI đang viết content mới...' 
                        : (editedFbCaption || editedTiktokCaption)
                          ? '🔄 Viết lại biến thể mới (Không trùng lặp)'
                          : '✨ Tiến hành sinh Caption FB & TikTok'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Step 4b: Dual Output Facebook & TikTok */}
              {(editedFbCaption || editedTiktokCaption) && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b pb-2 border-inherit">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setActiveOutputTab('FACEBOOK')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                          activeOutputTab === 'FACEBOOK'
                            ? 'bg-bulbtek-red text-white shadow-sm'
                            : isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#121215] text-gray-400'
                        }`}
                      >
                        <span>🔴 Facebook (150-300 từ)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveOutputTab('TIKTOK')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                          activeOutputTab === 'TIKTOK'
                            ? 'bg-cyan-600 text-white shadow-sm'
                            : isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#121215] text-gray-400'
                        }`}
                      >
                        <span>🌐 TikTok (50-100 từ)</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (activeOutputTab === 'FACEBOOK') {
                            navigator.clipboard.writeText(editedFbCaption);
                            setCopiedFb(true);
                            setTimeout(() => setCopiedFb(false), 2000);
                          } else {
                            navigator.clipboard.writeText(editedTiktokCaption);
                            setCopiedTiktok(true);
                            setTimeout(() => setCopiedTiktok(false), 2000);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition ${
                          isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-[#121215] border-[#2F2F37] text-gray-300 hover:bg-[#202026]'
                        }`}
                      >
                        {activeOutputTab === 'FACEBOOK' ? (
                          copiedFb ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />
                        ) : (
                          copiedTiktok ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedFb || copiedTiktok ? 'Đã copy' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRunAiGeneration}
                        disabled={isGeneratingAi}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition ${
                          isLight ? 'bg-red-50 border-red-200 text-bulbtek-red hover:bg-red-100 shadow-sm' : 'bg-red-950/40 border-red-800 text-red-300 hover:bg-red-900/60 shadow-sm'
                        }`}
                        title="Tự động loại trừ các góc viết đã có trong bộ nhớ để viết lại một bài mới hoàn toàn"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                        <span>{isGeneratingAi ? 'Đang viết lại...' : 'Tạo lại (Viết mới không trùng lặp)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Caption Editor */}
                  {activeOutputTab === 'FACEBOOK' ? (
                    <div className="space-y-2">
                      <div className={`flex items-center justify-between text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        <span>Độ dài: {editedFbCaption.split(/\s+/).filter(Boolean).length} từ (Chuẩn: 150-300 từ)</span>
                        <span className="text-emerald-600 font-semibold">✓ Đầy đủ hashtag & CTA</span>
                      </div>
                      <textarea
                        rows={10}
                        value={editedFbCaption}
                        onChange={(e) => setEditedFbCaption(e.target.value)}
                        className={`w-full rounded-xl p-4 text-xs font-sans leading-relaxed focus:outline-none focus:border-bulbtek-red border ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-gray-100'
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className={`flex items-center justify-between text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        <span>Độ dài: {editedTiktokCaption.split(/\s+/).filter(Boolean).length} từ (Chuẩn: 50-100 từ)</span>
                        <span className="text-cyan-600 font-semibold">✓ Hook giật 3s đầu</span>
                      </div>
                      <textarea
                        rows={8}
                        value={editedTiktokCaption}
                        onChange={(e) => setEditedTiktokCaption(e.target.value)}
                        className={`w-full rounded-xl p-4 text-xs font-sans leading-relaxed focus:outline-none focus:border-bulbtek-red border ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-gray-100'
                        }`}
                      />
                    </div>
                  )}

                  {/* 🛡️ Kiểm tra tuân thủ 3 nguyên tắc thương hiệu tự động (Compliance Check) */}
                  {(() => {
                    const currentCaption = activeOutputTab === 'FACEBOOK' ? editedFbCaption : editedTiktokCaption;
                    const compResult = checkBrandCompliance(
                      currentCaption,
                      settings.complianceRules || DEFAULT_COMPLIANCE_RULES
                    );

                    if (compResult.isViolated) {
                      return (
                        <div className={`p-3 rounded-xl border space-y-2 ${
                          isLight ? 'bg-amber-50/90 border-amber-300 text-amber-900' : 'bg-amber-950/40 border-amber-700 text-amber-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                              <span>Cảnh báo tuân thủ 3 nguyên tắc thương hiệu ({compResult.violations.length} điểm cần lưu ý):</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 font-semibold">
                              Không chặn gửi — Khuyến nghị điều chỉnh
                            </span>
                          </div>

                          <div className="space-y-1.5 pl-6 text-xs">
                            {compResult.violations.map((v, i) => (
                              <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 text-[11px]">
                                <span className="font-bold text-bulbtek-red shrink-0">
                                  • "{v.keyword}" [{v.principle}]:
                                </span>
                                <span className="opacity-90">{v.suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className={`p-2.5 rounded-xl border flex items-center space-x-2 text-xs ${
                        isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                      }`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>✓ Đạt chuẩn tuân thủ thương hiệu Bulbtek (Không Chém Gió Ảo • Không Cắt Dây Điện • Không Gây Chói Lóa).</span>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className={`p-5 border-t flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
              <button
                type="button"
                onClick={() => setGeneratingItem(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'}`}
              >
                Đóng
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleCreateDesignBriefFromAi}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition ${
                    isLight ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100' : 'bg-[#18181D] border-[#2F2F37] text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tạo Design Brief</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveToCalendar}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
                >
                  <Save className="w-4 h-4" />
                  <span>💾 Lưu vào Lịch Calendar</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 6. MODAL: THÊM CATEGORY MỚI */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddCategorySubmit} className={`border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#18181D] border-[#2A2A32] text-white'
          }`}>
            <h3 className="text-base font-black flex items-center space-x-2">
              <Plus className="w-4 h-4 text-bulbtek-red" />
              <span>Thêm Danh Mục (Category) Mới</span>
            </h3>

            <div>
              <label className="block text-xs font-bold mb-1">
                Tên Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="VD: REVIEW THỰC TẾ, CÔNG NGHỆ XE..."
                className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-bulbtek-red ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                Mô tả Tone / Giọng điệu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newCatTone}
                onChange={(e) => setNewCatTone(e.target.value)}
                placeholder="VD: Sắc bén, khách quan, bám sát trải nghiệm ban đêm..."
                className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-bulbtek-red ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Màu nhận diện</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-slate-300 dark:border-gray-700"
                />
                <span className="text-xs font-mono font-bold">{newCatColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Angle ví dụ gợi ý</label>
              <textarea
                rows={2}
                value={newCatAngle}
                onChange={(e) => setNewCatAngle(e.target.value)}
                placeholder="VD: So sánh đèn halogen zin và bi led khi leo đèo sương mù..."
                className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-bulbtek-red ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                }`}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-inherit">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'}`}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red"
              >
                Lưu category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🌟 7. MODAL: CÀI ĐẶT LỊCH LẶP (RECURRING SETUP) */}
      {showRecurringModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateRecurringSubmit} className={`border rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-fadeIn ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#18181D] border-[#2A2A32] text-white'
          }`}>
            <div className="flex items-center space-x-2">
              <Repeat className="w-5 h-5 text-bulbtek-red" />
              <h3 className="text-base font-black">
                Cài Đặt Lịch Lặp Định Kỳ (Recurring Content)
              </h3>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Bài recurring sẽ tự động chèn vào Calendar hàng tháng và được bảo vệ không bị phân bổ tự động ghi đè.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">Pattern lặp</label>
                <select
                  value={recurPattern}
                  onChange={(e) => setRecurPattern(e.target.value as any)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-bulbtek-red ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                  }`}
                >
                  <option value="Hàng tuần">Hàng tuần</option>
                  <option value="Hàng tháng">Hàng tháng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {recurPattern === 'Hàng tuần' ? 'Chọn thứ mấy' : 'Chọn ngày trong tháng'}
                </label>
                {recurPattern === 'Hàng tuần' ? (
                  <select
                    value={recurDayOfWeek}
                    onChange={(e) => setRecurDayOfWeek(Number(e.target.value))}
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-bulbtek-red ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                    }`}
                  >
                    <option value={1}>Thứ Hai</option>
                    <option value={2}>Thứ Ba</option>
                    <option value={3}>Thứ Tư</option>
                    <option value={4}>Thứ Năm</option>
                    <option value={5}>Thứ Sáu</option>
                    <option value={6}>Thứ Bảy</option>
                    <option value={0}>Chủ Nhật</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={recurDayOfMonth}
                    onChange={(e) => setRecurDayOfMonth(Number(e.target.value))}
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-bulbtek-red ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                    }`}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">Kênh đăng</label>
                <select
                  value={recurChannel}
                  onChange={(e) => setRecurChannel(e.target.value as Channel)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-bulbtek-red ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                  }`}
                >
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Cross-post">Cross-post (Cả hai)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Category cố định</label>
                <select
                  value={recurCatId}
                  onChange={(e) => setRecurCatId(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-bulbtek-red ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                  }`}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Sản phẩm gán cố định</label>
              <select
                value={recurProdId}
                onChange={(e) => setRecurProdId(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-bulbtek-red ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                }`}
              >
                {products.filter(p => !p.isHidden).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.productLine})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-inherit">
              <button
                type="button"
                onClick={() => setShowRecurringModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'}`}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red"
              >
                Áp dụng lịch lặp
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Tab2Planning;
