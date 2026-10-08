import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Category, ContentItem, Channel } from '../../types';
import { 
  generateBulbtekContent,
  parseAiErrorAndFormat
} from '../../services/aiGenerator';
import { checkBrandCompliance, DEFAULT_COMPLIANCE_RULES } from '../../data/complianceKeywords';
import { 
  getUniqueBrandAiSuggestions, 
  getUniqueMascotAiSuggestions, 
  BrandIdeaSuggestion, 
  isIdeaDuplicate 
} from '../../data/brandAiSuggestions';
import { exportBrandingPlanCsv } from '../../utils/exportPlanCsv';
import { exportBrandingPlanPdf } from '../../utils/exportPlanPdf';
import { 
  Award,
  Shield,
  Bot,
  Sparkles,
  CalendarDays,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Copy,
  Check,
  FileText,
  Save,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ArrowRight,
  Layers,
  Repeat,
  Eye,
  MessageSquare,
  HelpCircle,
  Briefcase,
  Zap,
  Edit3,
  CalendarRange,
  Brain,
  Wand2,
  RefreshCw,
  Download,
  CheckSquare,
  Square
} from 'lucide-react';

export const TabBrandPlanning: React.FC = () => {
  const { 
    products, 
    categories, 
    contents, 
    saveContentItem, 
    deleteContentItem, 
    settings,
    users,
    setActiveTab,
    setBriefPrefillItem,
    theme,
    contentMemory,
    addContentMemory,
    getMemoryForProduct
  } = useApp();

  const isLight = theme === 'light';

  // Sub-tabs: 'GOALS' = Mục Tiêu & Tuyến Ý Tưởng, 'CATEGORIES' = Danh Mục & Tone, 'SCHEDULE' = Lịch Phân Bổ & AI Studio
  const [activeSubTab, setActiveSubTab] = useState<'GOALS' | 'CATEGORIES' | 'SCHEDULE'>('GOALS');

  // Month & Year filter
  const [selectedMonth, setSelectedMonth] = useState<number>(9);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Targets
  const [brandingTarget, setBrandingTarget] = useState<number>(4);
  const [mascotTarget, setMascotTarget] = useState<number>(3);

  // Tỷ trọng kênh xuất bản (Facebook % / TikTok %)
  const [fbChannelRatio, setFbChannelRatio] = useState<number>(80);
  const [tiktokChannelRatio, setTiktokChannelRatio] = useState<number>(20);

  const handleFbRatioChange = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    setFbChannelRatio(clamped);
    setTiktokChannelRatio(100 - clamped);
  };

  const handleTiktokRatioChange = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    setTiktokChannelRatio(clamped);
    setFbChannelRatio(100 - clamped);
  };

  // Sub-tab 2: San phân bổ danh mục & Tone giọng
  const [selectedBrandCategories, setSelectedBrandCategories] = useState<string[]>([
    'BRANDING',
    'ROBOT_BU',
    'INTERACTION'
  ]);

  const [brandCategoryRatios, setBrandCategoryRatios] = useState<Record<string, number>>({
    BRANDING: 40,
    ROBOT_BU: 40,
    INTERACTION: 20
  });

  // Toggle chọn danh mục và tự động san phân bổ
  const toggleBrandCategory = (catKey: string) => {
    setSelectedBrandCategories(prev => {
      const isCurrentlySelected = prev.includes(catKey);
      if (isCurrentlySelected && prev.length === 1) {
        alert('Phải giữ lại ít nhất 1 tuyến danh mục để phân bổ nội dung!');
        return prev;
      }
      const updated = isCurrentlySelected 
        ? prev.filter(k => k !== catKey) 
        : [...prev, catKey];
      
      // Tự động san đều tỷ lệ % theo số danh mục còn lại
      const equalShare = Math.round(100 / updated.length);
      const newRatios: Record<string, number> = { ...brandCategoryRatios };
      updated.forEach((k, idx) => {
        if (idx === updated.length - 1) {
          const sumOther = equalShare * (updated.length - 1);
          newRatios[k] = 100 - sumOther;
        } else {
          newRatios[k] = equalShare;
        }
      });
      Object.keys(newRatios).forEach(k => {
        if (!updated.includes(k)) newRatios[k] = 0;
      });

      setBrandCategoryRatios(newRatios);
      return updated;
    });
  };

  // Nút tự động san đều tỷ lệ
  const handleRebalanceBrandCategories = () => {
    if (selectedBrandCategories.length === 0) return;
    const equalShare = Math.round(100 / selectedBrandCategories.length);
    const newRatios: Record<string, number> = { ...brandCategoryRatios };
    selectedBrandCategories.forEach((k, idx) => {
      if (idx === selectedBrandCategories.length - 1) {
        const sumOther = equalShare * (selectedBrandCategories.length - 1);
        newRatios[k] = 100 - sumOther;
      } else {
        newRatios[k] = equalShare;
      }
    });
    setBrandCategoryRatios(newRatios);
  };

  // Cập nhật tỷ lệ thủ công
  const handleUpdateCategoryRatio = (catKey: string, val: number) => {
    setBrandCategoryRatios(prev => ({
      ...prev,
      [catKey]: Math.max(0, Math.min(100, val))
    }));
  };

  // Tuyến 1: Branding Ideas
  const [brandingIdeas, setBrandingIdeas] = useState<string[]>([
    '3 Giá trị cốt lõi: BỀN BỈ – BỀN VỮNG – BẢO VỆ, triết lý "An Toàn Hành Trình" và mạng lưới 300+ đại lý toàn quốc',
    'Chính sách bảo hành 1 đổi 1 trong 2-3 năm, quy chuẩn cắm giắc zin 100% an toàn cho hệ thống điện xe hơi',
    'Văn hóa tăng sáng văn minh: Đường cắt cos phẳng mịn nét như kẻ chỉ, tuyệt đối không gây chói mắt bạn đường'
  ]);

  // Tuyến 2: Robot BU Ideas
  const [mascotIdeas, setMascotIdeas] = useState<string[]>([
    'Nhật ký cabin cùng Robot BU: Hướng dẫn bác tài chỉnh đèn phá sương khi vượt đèo đêm mưa lũ',
    'Góc Bác Tài hỏi - Robot BU đáp: Đèn xe bị hấp hơi nước xử lý thế nào cho đúng chuẩn kiểm định?',
    'Đột nhập phòng lab kiểm định quang học cùng BU: Thử thách rung chấn & sốc nhiệt 105°C trong 48 giờ'
  ]);

  // Handlers for Idea arrays
  const handleAddBrandingIdea = (text = '') => setBrandingIdeas(prev => [...prev, text]);
  const handleUpdateBrandingIdea = (idx: number, text: string) => {
    setBrandingIdeas(prev => {
      const copy = [...prev];
      copy[idx] = text;
      return copy;
    });
  };
  const handleRemoveBrandingIdea = (idx: number) => {
    setBrandingIdeas(prev => prev.length <= 1 ? [''] : prev.filter((_, i) => i !== idx));
  };

  const handleAddMascotIdea = (text = '') => setMascotIdeas(prev => [...prev, text]);
  const handleUpdateMascotIdea = (idx: number, text: string) => {
    setMascotIdeas(prev => {
      const copy = [...prev];
      copy[idx] = text;
      return copy;
    });
  };
  const handleRemoveMascotIdea = (idx: number) => {
    setMascotIdeas(prev => prev.length <= 1 ? [''] : prev.filter((_, i) => i !== idx));
  };

  // Lịch sử các ý tưởng đã từng chọn hoặc dùng (chống trùng lặp 100% khi sinh lại)
  const [usedBrandHistory, setUsedBrandHistory] = useState<string[]>(() => [
    '3 Giá trị cốt lõi: BỀN BỈ – BỀN VỮNG – BẢO VỆ, triết lý "An Toàn Hành Trình" và mạng lưới 300+ đại lý toàn quốc',
    'Chính sách bảo hành 1 đổi 1 trong 2-3 năm, quy chuẩn cắm giắc zin 100% an toàn cho hệ thống điện xe hơi',
    'Văn hóa tăng sáng văn minh: Đường cắt cos phẳng mịn nét như kẻ chỉ, tuyệt đối không gây chói mắt bạn đường'
  ]);
  const [usedMascotHistory, setUsedMascotHistory] = useState<string[]>(() => [
    'Nhật ký cabin cùng Robot BU: Hướng dẫn bác tài chỉnh đèn phá sương khi vượt đèo đêm mưa lũ',
    'Góc Bác Tài hỏi - Robot BU đáp: Đèn xe bị hấp hơi nước xử lý thế nào cho đúng chuẩn kiểm định?',
    'Đột nhập phòng lab kiểm định quang học cùng BU: Thử thách rung chấn & sốc nhiệt 105°C trong 48 giờ'
  ]);

  // AI Suggestions Lists
  const [brandAiSuggestions, setBrandAiSuggestions] = useState<BrandIdeaSuggestion[]>(() => {
    return getUniqueBrandAiSuggestions(
      [
        '3 Giá trị cốt lõi: BỀN BỈ – BỀN VỮNG – BẢO VỆ, triết lý "An Toàn Hành Trình" và mạng lưới 300+ đại lý toàn quốc',
        'Chính sách bảo hành 1 đổi 1 trong 2-3 năm, quy chuẩn cắm giắc zin 100% an toàn cho hệ thống điện xe hơi',
        'Văn hóa tăng sáng văn minh: Đường cắt cos phẳng mịn nét như kẻ chỉ, tuyệt đối không gây chói mắt bạn đường'
      ],
      [],
      3
    );
  });

  const [mascotAiSuggestions, setMascotAiSuggestions] = useState<BrandIdeaSuggestion[]>(() => {
    return getUniqueMascotAiSuggestions(
      [
        'Nhật ký cabin cùng Robot BU: Hướng dẫn bác tài chỉnh đèn phá sương khi vượt đèo đêm mưa lũ',
        'Góc Bác Tài hỏi - Robot BU đáp: Đèn xe bị hấp hơi nước xử lý thế nào cho đúng chuẩn kiểm định?',
        'Đột nhập phòng lab kiểm định quang học cùng BU: Thử thách rung chấn & sốc nhiệt 105°C trong 48 giờ'
      ],
      [],
      3
    );
  });

  const [isGeneratingBrandAi, setIsGeneratingBrandAi] = useState<boolean>(false);
  const [isGeneratingMascotAi, setIsGeneratingMascotAi] = useState<boolean>(false);
  const [copiedActionToast, setCopiedActionToast] = useState<string | null>(null);

  // Sinh gợi ý mới từ AI không trùng lặp cho Tuyến 1 (Branding)
  const handleGenerateNewBrandAi = () => {
    setIsGeneratingBrandAi(true);
    setTimeout(() => {
      const newSug = getUniqueBrandAiSuggestions(brandingIdeas, usedBrandHistory, 3);
      setBrandAiSuggestions(newSug);
      setIsGeneratingBrandAi(false);
    }, 350);
  };

  // Sinh gợi ý mới từ AI không trùng lặp cho Tuyến 2 (Robot BU)
  const handleGenerateNewMascotAi = () => {
    setIsGeneratingMascotAi(true);
    setTimeout(() => {
      const newSug = getUniqueMascotAiSuggestions(mascotIdeas, usedMascotHistory, 3);
      setMascotAiSuggestions(newSug);
      setIsGeneratingMascotAi(false);
    }, 350);
  };

  // Áp dụng ý tưởng vào ô nhập Tuyến 1
  const handleApplyBrandIdeaToInputs = (suggestion: BrandIdeaSuggestion) => {
    setBrandingIdeas(prev => {
      const emptyIndex = prev.findIndex(item => !item.trim());
      if (emptyIndex !== -1) {
        const copy = [...prev];
        copy[emptyIndex] = suggestion.content;
        return copy;
      }
      return [...prev, suggestion.content];
    });

    setUsedBrandHistory(prev => [...prev, suggestion.content, suggestion.title]);
    setCopiedActionToast(`✓ Đã thêm: "${suggestion.title}" vào ô ý tưởng Branding!`);
    setTimeout(() => setCopiedActionToast(null), 3000);
  };

  // Áp dụng ý tưởng vào ô nhập Tuyến 2 (Robot BU)
  const handleApplyMascotIdeaToInputs = (suggestion: BrandIdeaSuggestion) => {
    setMascotIdeas(prev => {
      const emptyIndex = prev.findIndex(item => !item.trim());
      if (emptyIndex !== -1) {
        const copy = [...prev];
        copy[emptyIndex] = suggestion.content;
        return copy;
      }
      return [...prev, suggestion.content];
    });

    setUsedMascotHistory(prev => [...prev, suggestion.content, suggestion.title]);
    setCopiedActionToast(`✓ Đã thêm: "${suggestion.title}" vào ô ý tưởng Robot BU!`);
    setTimeout(() => setCopiedActionToast(null), 3000);
  };

  // Copy ý tưởng vào clipboard và đánh dấu đã sử dụng (để không bị trùng sau này)
  const handleCopyIdeaText = (suggestion: BrandIdeaSuggestion, type: 'BRANDING' | 'ROBOT_BU') => {
    navigator.clipboard.writeText(suggestion.content);
    if (type === 'BRANDING') {
      setUsedBrandHistory(prev => [...prev, suggestion.content, suggestion.title]);
    } else {
      setUsedMascotHistory(prev => [...prev, suggestion.content, suggestion.title]);
    }
    setCopiedActionToast(`📋 Đã copy ý tưởng: "${suggestion.title}". Bạn có thể dán (Ctrl+V) vào bất kỳ ô nào!`);
    setTimeout(() => setCopiedActionToast(null), 3500);
  };

  // Reset lịch sử để duyệt lại toàn bộ ngân hàng ý tưởng
  const handleResetHistory = (type: 'BRANDING' | 'ROBOT_BU') => {
    if (type === 'BRANDING') {
      setUsedBrandHistory([...brandingIdeas]);
      const fresh = getUniqueBrandAiSuggestions(brandingIdeas, [], 3);
      setBrandAiSuggestions(fresh);
      setCopiedActionToast('🔄 Đã làm mới lịch sử và tạo lại gợi ý Tuyến 1!');
    } else {
      setUsedMascotHistory([...mascotIdeas]);
      const fresh = getUniqueMascotAiSuggestions(mascotIdeas, [], 3);
      setMascotAiSuggestions(fresh);
      setCopiedActionToast('🔄 Đã làm mới lịch sử và tạo lại gợi ý Tuyến 2!');
    }
  };

  // Export kế hoạch Content Branding (.CSV / Excel)
  const handleExportBrandingPlan = () => {
    if (brandContentsInMonth.length === 0) {
      alert(`Chưa có bài viết thương hiệu nào được lên lịch trong tháng ${selectedMonth}/${selectedYear} để tải về!`);
      return;
    }
    const catMap: Record<string, string> = {};
    categories.forEach(c => { catMap[c.id] = c.name; });
    exportBrandingPlanCsv(selectedMonth, selectedYear, brandContentsInMonth, catMap);
    setCopiedActionToast('🎉 Đã tải file kế hoạch Content Branding (.CSV / Excel) thành công!');
    setTimeout(() => setCopiedActionToast(null), 3000);
  };

  // Export kế hoạch Content Branding dạng tài liệu PDF A4 Landscape chuẩn đẹp
  const handleExportBrandingPlanPdf = () => {
    if (brandContentsInMonth.length === 0) {
      alert(`Chưa có bài viết thương hiệu nào được lên lịch trong tháng ${selectedMonth}/${selectedYear} để xuất PDF!`);
      return;
    }
    const catMap: Record<string, string> = {};
    categories.forEach(c => { catMap[c.id] = c.name; });
    exportBrandingPlanPdf(
      selectedMonth, 
      selectedYear, 
      brandContentsInMonth, 
      catMap, 
      { fb: fbChannelRatio, tiktok: tiktokChannelRatio }
    );
  };

  // Simulator test angle output
  const [testedAngleOutput, setTestedAngleOutput] = useState<{
    hookFb: string;
    hookTiktok: string;
    angle: string;
    source: 'BRANDING' | 'ROBOT_BU';
  } | null>(null);
  const [isTestingAngle, setIsTestingAngle] = useState<boolean>(false);

  const handleTestCreativeAngle = (type: 'BRANDING' | 'ROBOT_BU') => {
    setIsTestingAngle(true);
    setTimeout(() => {
      if (type === 'BRANDING') {
        const idea = brandingIdeas.find(i => i.trim()) || brandAiSuggestions[0]?.content || '3 Giá trị cốt lõi: Bền Bỉ – Bền Vững – Bảo Vệ';
        setTestedAngleOutput({
          angle: `[Góc Tiếp Cận Thương Hiệu] ${idea.slice(0, 50)}...`,
          hookFb: `🛡️ "Đằng sau tay lái là gia đình, đằng sau ánh sáng là lời cam kết từ Bulbtek" — ${idea}`,
          hookTiktok: `💡 3 năm bảo hành đổi mới & quy chuẩn cắm jack zin an toàn tuyệt đối cùng Bulbtek Việt Nam!`,
          source: 'BRANDING'
        });
      } else {
        const idea = mascotIdeas.find(i => i.trim()) || mascotAiSuggestions[0]?.content || 'Nhật ký cabin cùng Robot BU';
        setTestedAngleOutput({
          angle: `[Góc Tiếp Cận Linh Vật BU] ${idea.slice(0, 50)}...`,
          hookFb: `🤖 "Bác tài ơi, đèn zin tối quá qua đèo đêm nguy hiểm lắm!" — Robot BU mách nước giải pháp tăng sáng chuẩn đăng kiểm.`,
          hookTiktok: `🚗 Đột nhập phòng Lab cùng trợ thủ táp-lô Robot BU: Thử thách đèn xe ngâm nước và sốc nhiệt cực đại!`,
          source: 'ROBOT_BU'
        });
      }
      setIsTestingAngle(false);
    }, 350);
  };

  // Filter Brand & Mascot items in month
  const brandContentsInMonth = useMemo(() => {
    return contents.filter(item => {
      const parts = item.date.split('-');
      if (parts.length >= 2) {
        const m = parseInt(parts[1], 10);
        const y = parseInt(parts[0], 10);
        if (m !== selectedMonth || y !== selectedYear) return false;
      }
      // Check if it's Branding or Mascot BU
      const isBrandLine = item.productLine === 'Branding Sản Phẩm' || item.productLine === 'Linh Vật Robot BU';
      const isBrandCat = item.categoryId === 'cat-branding' || item.categoryId === 'cat-interaction';
      const isBrandName = item.productName.toLowerCase().includes('branding') || item.productName.toLowerCase().includes('robot bu');
      return isBrandLine || isBrandCat || isBrandName;
    });
  }, [contents, selectedMonth, selectedYear]);

  // View mode in Schedule
  const [viewMode, setViewMode] = useState<'WEEK_CARDS' | 'SMART_TABLE'>('WEEK_CARDS');
  const [filterChannel, setFilterChannel] = useState<'ALL' | 'Facebook' | 'TikTok'>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'BRANDING' | 'ROBOT_BU'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBrandContents = useMemo(() => {
    return brandContentsInMonth.filter(item => {
      if (filterChannel !== 'ALL' && item.channel !== filterChannel) return false;
      if (filterType === 'BRANDING' && item.productLine === 'Linh Vật Robot BU') return false;
      if (filterType === 'ROBOT_BU' && item.productLine !== 'Linh Vật Robot BU') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchName = item.productName.toLowerCase().includes(q);
        const matchCap = (item.facebookCaption || '').toLowerCase().includes(q);
        if (!matchTitle && !matchName && !matchCap) return false;
      }
      return true;
    });
  }, [brandContentsInMonth, filterChannel, filterType, searchQuery]);

  // Week grouping
  const getWeekNumber = (dateStr: string) => {
    const day = parseInt(dateStr.split('-')[2], 10);
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    if (day <= 21) return 3;
    return 4;
  };

  const week1Items = filteredBrandContents.filter(c => getWeekNumber(c.date) === 1);
  const week2Items = filteredBrandContents.filter(c => getWeekNumber(c.date) === 2);
  const week3Items = filteredBrandContents.filter(c => getWeekNumber(c.date) === 3);
  const week4Items = filteredBrandContents.filter(c => getWeekNumber(c.date) === 4);

  const weeksData = [
    { weekNum: 1, label: 'Tuần 1 (Ngày 01 - 07)', items: week1Items },
    { weekNum: 2, label: 'Tuần 2 (Ngày 08 - 14)', items: week2Items },
    { weekNum: 3, label: 'Tuần 3 (Ngày 15 - 21)', items: week3Items },
    { weekNum: 4, label: 'Tuần 4 (Ngày 22 - 30)', items: week4Items },
  ];

  // AI Generator Modal State
  const [generatingItem, setGeneratingItem] = useState<ContentItem | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [editedFbCaption, setEditedFbCaption] = useState<string>('');
  const [editedTiktokCaption, setEditedTiktokCaption] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [activeOutputTab, setActiveOutputTab] = useState<'FACEBOOK' | 'TIKTOK'>('FACEBOOK');
  const [copiedFb, setCopiedFb] = useState<boolean>(false);
  const [copiedTiktok, setCopiedTiktok] = useState<boolean>(false);

  const handleOpenAiStudio = (item: ContentItem) => {
    setGeneratingItem(item);
    setEditedFbCaption(item.facebookCaption || '');
    setEditedTiktokCaption(item.tiktokCaption || '');
    setAdditionalInfo('');
    setActiveOutputTab('FACEBOOK');
  };

  const handleRunAiGeneration = () => {
    if (!generatingItem) return;
    setIsGeneratingAi(true);

    const isMascot = generatingItem.productLine === 'Linh Vật Robot BU';
    const prod: Product = {
      id: isMascot ? 'prod-robot-bu' : 'prod-branding',
      name: isMascot ? 'Linh Vật Robot BU' : 'Bulbtek Việt Nam — Branding',
      productLine: isMascot ? 'Linh Vật Robot BU' : 'Branding Sản Phẩm',
      sku: isMascot ? 'BTK-MASCOT-BU' : 'BTK-BRAND-CORE',
      status: 'Hero Product',
      retailPrice: 'Vô giá (Tài sản thương hiệu)',
      coreBenefit: isMascot 
        ? (mascotIdeas[0] || 'Trợ thủ táp-lô thông minh, người bạn tin cậy vượt mọi cung đường đêm')
        : (brandingIdeas[0] || 'BỀN BỈ – BỀN VỮNG – BẢO VỆ, triết lý An Toàn Hành Trình'),
      suitableFor: 'Cả Hai',
      targetAudience: 'Cả hai',
      segment: 'Premium',
      stage: 'Maintain',
      specs: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const cat = categories.find(c => c.id === generatingItem.categoryId) || categories[0];
    const activeModelConfig = settings.models.find(m => m.id === settings.activeModel);

    setTimeout(() => {
      try {
        const mems = getMemoryForProduct(generatingItem.productId);
        const output = generateBulbtekContent(
          prod,
          cat,
          [],
          activeModelConfig?.modelCode || activeModelConfig?.name || settings.activeModel,
          mems,
          undefined,
          additionalInfo
        );

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
          angleUsed: output.angleUsed,
          aiModelUsed: activeModelConfig?.name || 'Claude 3.7 Sonnet'
        };
        setGeneratingItem(updated);
        saveContentItem(updated);
      } catch (err: any) {
        const friendlyMsg = parseAiErrorAndFormat(err, activeModelConfig?.modelCode || activeModelConfig?.name || settings.activeModel);
        alert(friendlyMsg);
      } finally {
        setIsGeneratingAi(false);
      }
    }, 400);
  };

  const handleSaveModal = () => {
    if (!generatingItem) return;
    const updated: ContentItem = {
      ...generatingItem,
      facebookCaption: editedFbCaption,
      tiktokCaption: editedTiktokCaption
    };
    saveContentItem(updated);
    setGeneratingItem(null);
  };

  // Add new Brand content item
  const handleCreateNewBrandPost = (type: 'BRANDING' | 'ROBOT_BU') => {
    const isMascot = type === 'ROBOT_BU';
    const dayStr = '15';
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${dayStr}`;
    const newItem: ContentItem = {
      id: `content-brand-${Date.now()}`,
      title: isMascot ? `🤖 [Robot BU] Kể chuyện cabin đèo đêm - Ngày ${dayStr}/${selectedMonth}` : `🛡️ [Branding] Cam kết 3 Giá trị cốt lõi - Ngày ${dayStr}/${selectedMonth}`,
      creativeHeadline: isMascot ? 'Robot BU Đồng Hành — Thắp Sáng Mọi Cung Đường Đêm' : 'BULBTEK VIỆT NAM — Lời Cam Kết Bền Bỉ, Bền Vững & Bảo Vệ',
      channel: 'Facebook',
      date: dateStr,
      productId: isMascot ? 'prod-robot-bu' : 'prod-branding',
      productName: isMascot ? 'Linh Vật Robot BU' : 'Bulbtek Việt Nam — Branding',
      productLine: isMascot ? 'Linh Vật Robot BU' : 'Branding Sản Phẩm',
      categoryId: isMascot ? 'cat-interaction' : 'cat-branding',
      status: 'Pending',
      assigneeId: users[0]?.id || 'user-linh',
      assigneeName: users[0]?.name || 'Linh',
      createdBy: users[0]?.name || 'Linh',
      createdAt: new Date().toISOString(),
      highlightSpecs: []
    };
    saveContentItem(newItem);
    handleOpenAiStudio(newItem);
  };

  // Stats calculation
  const totalBrandScheduled = brandContentsInMonth.length;
  const readyBrandCount = brandContentsInMonth.filter(c => c.facebookCaption || c.tiktokCaption).length;
  const approvedBrandCount = brandContentsInMonth.filter(c => c.status === 'Approved').length;
  const targetTotal = brandingTarget + mascotTarget;
  const completionPct = targetTotal > 0 ? Math.min(100, Math.round((readyBrandCount / targetTotal) * 100)) : 0;

  return (
    <div className="space-y-6">
      
      {/* 🌟 1. PROCESS HEADER & KPI DASHBOARD */}
      <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#18181D] border-[#2A2A32] shadow-xl'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className={`text-lg sm:text-xl font-black tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Content Branding Planning
                </h1>
                <span className="text-xs uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Thương Hiệu & Robot BU
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-bulbtek-red border border-red-500/20">
                  Tháng {selectedMonth}/{selectedYear}
                </span>
              </div>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Hệ thống chuyên sâu quản trị và triển khai các tuyến bài Thương Hiệu Bulbtek, Sứ Mệnh & Storytelling Linh Vật Robot BU.
              </p>
            </div>
          </div>

          {/* Quick Sub-Tab Selector */}
          <div className={`flex items-center p-1 rounded-xl border gap-1 overflow-x-auto ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#121215] border-[#2A2A32]'}`}>
            <button
              type="button"
              onClick={() => setActiveSubTab('GOALS')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'GOALS'
                  ? 'bg-amber-600 text-white shadow-md'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>1. Mục Tiêu & Tuyến Ý Tưởng</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('CATEGORIES')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'CATEGORIES'
                  ? 'bg-amber-600 text-white shadow-md'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Danh Mục & Tone Giọng</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('SCHEDULE')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'SCHEDULE'
                  ? 'bg-amber-600 text-white shadow-md'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>3. Lịch Phân Bổ & AI Studio ({brandContentsInMonth.length})</span>
            </button>
          </div>

        </div>

        {/* KPI Mini-cards bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-inherit text-xs">
          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2A2A32]'}`}>
            <span className={`block text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Mục Tiêu Tháng:</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <strong className="text-base font-black text-amber-600">{targetTotal} bài</strong>
              <span className="text-[10px] opacity-75">({brandingTarget} Brand + {mascotTarget} BU)</span>
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2A2A32]'}`}>
            <span className={`block text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Đã Lên Lịch Thực Tế:</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <strong className="text-base font-black text-bulbtek-red">{totalBrandScheduled} bài</strong>
              <span className="text-[10px] opacity-75">trong Lịch tháng {selectedMonth}</span>
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2A2A32]'}`}>
            <span className={`block text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Sẵn Sàng / Đã Có AI:</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <strong className="text-base font-black text-emerald-600">{readyBrandCount}/{totalBrandScheduled}</strong>
              <span className="text-[10px] text-emerald-600 font-bold">({completionPct}%)</span>
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2A2A32]'}`}>
            <span className={`block text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Đã Phê Duyệt:</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <strong className="text-base font-black text-blue-600">{approvedBrandCount} bài</strong>
              <span className="text-[10px] opacity-75">sẵn sàng đăng tải</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 2. SUB-TAB 1: MỤC TIÊU & SÁNG TẠO Ý TƯỞNG THƯƠNG HIỆU */}
      {activeSubTab === 'GOALS' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Cấu hình mục tiêu số bài & Kênh */}
          <div className={`p-5 rounded-2xl border space-y-4 ${isLight ? 'bg-white border-slate-200' : 'bg-[#18181D] border-[#2A2A32]'}`}>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-600">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Cấu Hình Mục Tiêu Tháng & Kênh Xuất Bản</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>Tháng / Năm:</label>
                <div className="flex space-x-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className={`w-1/2 p-2 rounded-xl border font-bold ${isLight ? 'bg-white border-slate-300' : 'bg-[#121215] border-[#2F2F37] text-white'}`}
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>Tháng {m}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className={`w-1/2 p-2 rounded-xl border font-bold ${isLight ? 'bg-white border-slate-300' : 'bg-[#121215] border-[#2F2F37] text-white'}`}
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>Mục tiêu bài Branding:</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={brandingTarget}
                  onChange={(e) => setBrandingTarget(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`w-full p-2 rounded-xl border font-bold ${isLight ? 'bg-white border-slate-300' : 'bg-[#121215] border-[#2F2F37] text-white'}`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>Mục tiêu bài Robot BU:</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={mascotTarget}
                  onChange={(e) => setMascotTarget(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`w-full p-2 rounded-xl border font-bold ${isLight ? 'bg-white border-slate-300' : 'bg-[#121215] border-[#2F2F37] text-white'}`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`block font-semibold ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                    Tỷ trọng kênh xuất bản:
                  </label>
                  <span className="text-[10px] font-mono text-amber-600 font-bold">
                    Tổng: {fbChannelRatio + tiktokChannelRatio}%
                  </span>
                </div>
                
                {/* Inputs tỷ trọng FB & TikTok */}
                <div className="flex items-center space-x-2">
                  {/* Facebook Input */}
                  <div className={`flex-1 flex items-center p-1.5 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-[#121215] border-[#2F2F37]'}`}>
                    <span className="text-[11px] font-bold text-bulbtek-red mr-1 shrink-0">🔴 FB:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={fbChannelRatio}
                      onChange={(e) => handleFbRatioChange(Number(e.target.value))}
                      className={`w-full bg-transparent text-xs font-bold focus:outline-none ${isLight ? 'text-slate-900' : 'text-white'}`}
                    />
                    <span className="text-[10px] text-gray-400 shrink-0">%</span>
                  </div>

                  {/* TikTok Input */}
                  <div className={`flex-1 flex items-center p-1.5 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-[#121215] border-[#2F2F37]'}`}>
                    <span className="text-[11px] font-bold text-cyan-500 mr-1 shrink-0">🌐 TT:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={tiktokChannelRatio}
                      onChange={(e) => handleTiktokRatioChange(Number(e.target.value))}
                      className={`w-full bg-transparent text-xs font-bold focus:outline-none ${isLight ? 'text-slate-900' : 'text-white'}`}
                    />
                    <span className="text-[10px] text-gray-400 shrink-0">%</span>
                  </div>
                </div>

                {/* Visual Ratio Progress Bar */}
                <div className="h-1.5 w-full bg-slate-200 dark:bg-gray-800 rounded-full overflow-hidden flex mt-1.5">
                  <div style={{ width: `${fbChannelRatio}%` }} className="bg-bulbtek-red h-full transition-all" title={`Facebook: ${fbChannelRatio}%`} />
                  <div style={{ width: `${tiktokChannelRatio}%` }} className="bg-cyan-500 h-full transition-all" title={`TikTok: ${tiktokChannelRatio}%`} />
                </div>
                <div className={`text-[10px] mt-1 flex justify-between ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  <span>~{Math.round((brandingTarget + mascotTarget) * fbChannelRatio / 100)} bài Facebook</span>
                  <span>~{Math.max(0, (brandingTarget + mascotTarget) - Math.round((brandingTarget + mascotTarget) * fbChannelRatio / 100))} bài TikTok</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2 TUYẾN Ý TƯỞNG SÁNG TẠO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* TUYẾN 1: BRANDING SẢN PHẨM */}
            <div className={`p-5 rounded-2xl border space-y-4 shadow-sm flex flex-col justify-between ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#18181D] border-[#2A2A32]'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded-xl bg-bulbtek-red/10 text-bulbtek-red">
                      <Shield className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Tuyến 1: Branding Sản Phẩm & Triết Lý Thương Hiệu
                      </h3>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        3 Giá trị cốt lõi (Bền Bỉ – Bền Vững – Bảo Vệ), An Toàn Hành Trình, 300+ Đại lý.
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-bulbtek-red/10 text-bulbtek-red">
                    {brandingIdeas.length} ý tưởng
                  </span>
                </div>

                {/* Danh sách Idea inputs */}
                <div className="space-y-2 pt-1">
                  {brandingIdeas.map((idea, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-[11px] font-mono font-bold text-bulbtek-red mt-2 shrink-0">#{idx + 1}</span>
                      <textarea
                        rows={2}
                        value={idea}
                        onChange={(e) => handleUpdateBrandingIdea(idx, e.target.value)}
                        placeholder={`Nhập ý tưởng Branding #${idx + 1}...`}
                        className={`flex-1 p-2.5 rounded-xl border text-xs leading-relaxed focus:outline-none focus:border-bulbtek-red ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121215] border-[#2F2F37] text-gray-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBrandingIdea(idx)}
                        className={`p-2 rounded-lg text-xs mt-1 transition ${
                          isLight ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-950/40'
                        }`}
                        title="Xóa ô ý tưởng này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddBrandingIdea('')}
                  className={`w-full py-2 rounded-xl border border-dashed text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                    isLight ? 'border-red-300 text-bulbtek-red hover:bg-red-50' : 'border-red-900/60 text-red-400 hover:bg-red-950/30'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm ô nhập Idea tạo Angle Branding</span>
                </button>

                {/* 🌟 GỢI Ý XÂY DỰNG TUYẾN BÀI TỪ AI (KHÔNG TRÙNG LẶP) */}
                <div className={`p-3.5 rounded-xl border space-y-3 ${
                  isLight ? 'bg-red-50/50 border-red-200' : 'bg-red-950/20 border-red-900/40'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-bulbtek-red text-white shadow-sm">
                        <Brain className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-bulbtek-red">
                            Gợi Ý Xây Dựng Tuyến Bài Từ AI
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-bulbtek-red/10 text-bulbtek-red border border-bulbtek-red/20">
                            0% Trùng Lặp ⚡
                          </span>
                        </div>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                          Ý tưởng sau khi chọn/dùng sẽ được tự động lọc trừ, không trùng khi tạo lại.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={handleGenerateNewBrandAi}
                        disabled={isGeneratingBrandAi}
                        className="px-2.5 py-1.5 rounded-lg bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-[11px] font-bold shadow-sm flex items-center space-x-1.5 transition disabled:opacity-50"
                        title="Tạo các gợi ý mới từ AI (cam kết không trùng ý tưởng đã chọn)"
                      >
                        <RotateCw className={`w-3 h-3 ${isGeneratingBrandAi ? 'animate-spin' : ''}`} />
                        <span>{isGeneratingBrandAi ? 'Đang phân tích...' : 'Lấy Gợi Ý Mới ⚡'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResetHistory('BRANDING')}
                        className={`p-1.5 rounded-lg border text-[11px] transition ${
                          isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-500' : 'bg-[#18181D] hover:bg-[#202026] border-[#2A2A32] text-gray-400'
                        }`}
                        title="Làm mới lịch sử để duyệt lại toàn bộ kho ý tưởng"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Danh sách 3 gợi ý từ AI */}
                  <div className="space-y-2">
                    {brandAiSuggestions.map((sug) => {
                      const isAlreadyInUse = isIdeaDuplicate(sug.content, brandingIdeas, []);
                      return (
                        <div
                          key={sug.id}
                          className={`p-2.5 rounded-xl border transition ${
                            isLight 
                              ? 'bg-white border-slate-200 hover:border-red-300' 
                              : 'bg-[#121215] border-[#2F2F37] hover:border-red-800/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-bulbtek-red/10 text-bulbtek-red font-mono">
                              {sug.tag}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 truncate">
                              💡 {sug.angleHint}
                            </span>
                          </div>

                          <p className={`text-[11px] leading-relaxed mb-2 ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                            {sug.content}
                          </p>

                          <div className="flex items-center justify-end space-x-1.5 pt-1 border-t border-dashed border-inherit">
                            <button
                              type="button"
                              onClick={() => handleCopyIdeaText(sug, 'BRANDING')}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold border flex items-center space-x-1 transition ${
                                isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#18181D] hover:bg-[#202026] border-[#2A2A32] text-gray-300'
                              }`}
                              title="Sao chép nội dung ý tưởng vào Clipboard"
                            >
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>Copy</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApplyBrandIdeaToInputs(sug)}
                              disabled={isAlreadyInUse}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition ${
                                isAlreadyInUse
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 cursor-default'
                                  : 'bg-bulbtek-red hover:bg-bulbtek-red-hover text-white shadow-sm'
                              }`}
                              title={isAlreadyInUse ? 'Ý tưởng này đã có trong danh sách' : 'Thêm vào ô ý tưởng phía trên'}
                            >
                              {isAlreadyInUse ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>✓ Đã trong danh sách</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>+ Dùng ý tưởng</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action: Test Angle Simulator */}
              <div className="pt-4 border-t border-inherit flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTestCreativeAngle('BRANDING')}
                  disabled={isTestingAngle}
                  className="px-3.5 py-1.5 rounded-lg bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isTestingAngle ? 'Đang mô phỏng...' : '⚡ Thử Angle Branding Mẫu'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateNewBrandPost('BRANDING')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Lên Lịch Bài Branding Mới</span>
                </button>
              </div>
            </div>

            {/* TUYẾN 2: LINH VẬT ROBOT BU */}
            <div className={`p-5 rounded-2xl border space-y-4 shadow-sm flex flex-col justify-between ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#18181D] border-[#2A2A32]'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Bot className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Tuyến 2: Storytelling Linh Vật Robot BU
                      </h3>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        Trợ thủ buồng lái, kịch bản cabin, Bác tài hỏi - BU đáp, Đột nhập Lab R&D.
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    {mascotIdeas.length} ý tưởng
                  </span>
                </div>

                {/* Danh sách Storyline inputs */}
                <div className="space-y-2 pt-1">
                  {mascotIdeas.map((idea, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-[11px] font-mono font-bold text-amber-600 mt-2 shrink-0">#{idx + 1}</span>
                      <textarea
                        rows={2}
                        value={idea}
                        onChange={(e) => handleUpdateMascotIdea(idx, e.target.value)}
                        placeholder={`Nhập Storyline Robot BU #${idx + 1}...`}
                        className={`flex-1 p-2.5 rounded-xl border text-xs leading-relaxed focus:outline-none focus:border-amber-500 ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121215] border-[#2F2F37] text-gray-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMascotIdea(idx)}
                        className={`p-2 rounded-lg text-xs mt-1 transition ${
                          isLight ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-950/40'
                        }`}
                        title="Xóa ô ý tưởng này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddMascotIdea('')}
                  className={`w-full py-2 rounded-xl border border-dashed text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                    isLight ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-amber-900/60 text-amber-400 hover:bg-amber-950/30'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm ô nhập Storyline Linh Vật Robot BU</span>
                </button>

                {/* 🌟 GỢI Ý XÂY DỰNG TUYẾN BÀI TỪ AI (ROBOT BU - KHÔNG TRÙNG LẶP) */}
                <div className={`p-3.5 rounded-xl border space-y-3 ${
                  isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-950/20 border-amber-900/40'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-amber-600 text-white shadow-sm">
                        <Bot className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            Gợi Ý Xây Dựng Tuyến Bài Từ AI
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            0% Trùng Lặp 🤖
                          </span>
                        </div>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                          Ý tưởng sau khi chọn/dùng sẽ được tự động lọc trừ, không trùng khi tạo lại.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={handleGenerateNewMascotAi}
                        disabled={isGeneratingMascotAi}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-sm flex items-center space-x-1.5 transition disabled:opacity-50"
                        title="Tạo các gợi ý mới từ AI (cam kết không trùng ý tưởng đã chọn)"
                      >
                        <RotateCw className={`w-3 h-3 ${isGeneratingMascotAi ? 'animate-spin' : ''}`} />
                        <span>{isGeneratingMascotAi ? 'Đang phân tích...' : 'Lấy Gợi Ý Mới ⚡'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResetHistory('ROBOT_BU')}
                        className={`p-1.5 rounded-lg border text-[11px] transition ${
                          isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-500' : 'bg-[#18181D] hover:bg-[#202026] border-[#2A2A32] text-gray-400'
                        }`}
                        title="Làm mới lịch sử để duyệt lại toàn bộ kho ý tưởng Robot BU"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Danh sách 3 gợi ý từ AI */}
                  <div className="space-y-2">
                    {mascotAiSuggestions.map((sug) => {
                      const isAlreadyInUse = isIdeaDuplicate(sug.content, mascotIdeas, []);
                      return (
                        <div
                          key={sug.id}
                          className={`p-2.5 rounded-xl border transition ${
                            isLight 
                              ? 'bg-white border-slate-200 hover:border-amber-300' 
                              : 'bg-[#121215] border-[#2F2F37] hover:border-amber-800/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono">
                              {sug.tag}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 truncate">
                              💡 {sug.angleHint}
                            </span>
                          </div>

                          <p className={`text-[11px] leading-relaxed mb-2 ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                            {sug.content}
                          </p>

                          <div className="flex items-center justify-end space-x-1.5 pt-1 border-t border-dashed border-inherit">
                            <button
                              type="button"
                              onClick={() => handleCopyIdeaText(sug, 'ROBOT_BU')}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold border flex items-center space-x-1 transition ${
                                isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#18181D] hover:bg-[#202026] border-[#2A2A32] text-gray-300'
                              }`}
                              title="Sao chép nội dung ý tưởng vào Clipboard"
                            >
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>Copy</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApplyMascotIdeaToInputs(sug)}
                              disabled={isAlreadyInUse}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition ${
                                isAlreadyInUse
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 cursor-default'
                                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                              }`}
                              title={isAlreadyInUse ? 'Ý tưởng này đã có trong danh sách' : 'Thêm vào ô ý tưởng phía trên'}
                            >
                              {isAlreadyInUse ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>✓ Đã trong danh sách</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>+ Dùng ý tưởng</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action: Test Angle Simulator */}
              <div className="pt-4 border-t border-inherit flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTestCreativeAngle('ROBOT_BU')}
                  disabled={isTestingAngle}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isTestingAngle ? 'Đang mô phỏng...' : '🤖 Thử Angle Robot BU Mẫu'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateNewBrandPost('ROBOT_BU')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Lên Lịch Bài Robot BU Mới</span>
                </button>
              </div>
            </div>

          </div>

          {/* SIMULATOR OUTPUT BOX (NẾU ĐÃ BẤM THỬ) */}
          {testedAngleOutput && (
            <div className={`p-4 rounded-2xl border space-y-3 animate-fadeIn ${
              isLight ? 'bg-amber-50/70 border-amber-300 text-amber-950' : 'bg-amber-950/30 border-amber-700 text-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Kết Quả Mô Phỏng Góc Tiếp Cận AI: {testedAngleOutput.angle}</span>
                </div>
                <button
                  onClick={() => setTestedAngleOutput(null)}
                  className="text-xs opacity-60 hover:opacity-100"
                >
                  ✕ Đóng
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-amber-200' : 'bg-[#18181D] border-amber-800/60'}`}>
                  <span className="font-bold text-bulbtek-red block mb-1">🔴 Hook Facebook (150-300 từ):</span>
                  <p className="italic leading-relaxed">{testedAngleOutput.hookFb}</p>
                </div>
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-amber-200' : 'bg-[#18181D] border-amber-800/60'}`}>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 block mb-1">🌐 Hook TikTok (50-100 từ):</span>
                  <p className="italic leading-relaxed">{testedAngleOutput.hookTiktok}</p>
                </div>
              </div>
            </div>
          )}

          {/* Chuyển sang Bước 3 */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('SCHEDULE')}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition"
            >
              <span>Xem Lịch Phân Bổ & AI Studio Thương Hiệu ➔</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* 🌟 3. SUB-TAB 2: DANH MỤC & TONE GIỌNG THƯƠNG HIỆU */}
      {activeSubTab === 'CATEGORIES' && (
        <div className="space-y-6 animate-fadeIn">
          <div className={`p-5 rounded-2xl border space-y-4 ${isLight ? 'bg-white border-slate-200' : 'bg-[#18181D] border-[#2A2A32]'}`}>
            
            {/* Header & Quick Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-inherit">
              <div>
                <h3 className="text-sm font-black flex items-center space-x-2 text-amber-600">
                  <Layers className="w-4 h-4" />
                  <span>Phân Bổ Danh Mục & Tone Giọng Điệu Cho Nội Dung Thương Hiệu</span>
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  Click chọn các tuyến bài để <strong>san đều hoặc điều chỉnh tỷ trọng % phân bổ</strong> phù hợp cho tháng {selectedMonth}/{selectedYear}.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrandCategories(['BRANDING', 'ROBOT_BU', 'INTERACTION']);
                    setBrandCategoryRatios({ BRANDING: 40, ROBOT_BU: 40, INTERACTION: 20 });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1 ${
                    isLight ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' : 'bg-[#121215] hover:bg-[#202026] border-[#2F2F37] text-gray-300'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chọn cả 3 tuyến</span>
                </button>

                <button
                  type="button"
                  onClick={handleRebalanceBrandCategories}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center space-x-1 transition"
                  title="Tự động san đều tỷ trọng 100% cho các tuyến đang chọn"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ Tự động san đều tỷ lệ</span>
                </button>
              </div>
            </div>

            {/* Ratio Summary Bar */}
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
              isLight ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="font-bold flex items-center space-x-1.5">
                  <span>🎯 Tuyến được kích hoạt:</span>
                  <strong className="text-sm font-black underline">{selectedBrandCategories.length} / 3 tuyến</strong>
                </span>
                <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Tổng tỷ trọng: {Object.values(brandCategoryRatios).reduce((a, b) => a + b, 0)}%
                </span>
              </div>
              <div className="text-[11px] opacity-80">
                Click trực tiếp vào thẻ dưới đây để bật/tắt tuyến và tự động phân bổ lại tỷ trọng.
              </div>
            </div>

            {/* Category Cards Interactive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              
              {/* CARD 1: BRANDING */}
              {(() => {
                const isSelected = selectedBrandCategories.includes('BRANDING');
                const ratio = brandCategoryRatios.BRANDING || 0;
                return (
                  <div
                    onClick={() => toggleBrandCategory('BRANDING')}
                    role="button"
                    tabIndex={0}
                    className={`p-4 rounded-xl border space-y-3 relative overflow-hidden transition-all cursor-pointer select-none text-left ${
                      isSelected
                        ? isLight 
                          ? 'bg-white border-red-500 shadow-md ring-2 ring-red-500/20 transform -translate-y-0.5' 
                          : 'bg-[#18181D] border-red-500 shadow-md ring-2 ring-red-500/20 transform -translate-y-0.5'
                        : isLight 
                          ? 'bg-slate-50 border-dashed border-slate-300 opacity-55 hover:opacity-85' 
                          : 'bg-[#121215] border-dashed border-[#2F2F37] opacity-50 hover:opacity-85'
                    }`}
                    style={{ borderTop: `4px solid ${isSelected ? '#AF2024' : '#64748B'}` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs ${isSelected ? 'text-bulbtek-red' : 'text-gray-400'}`}>
                        BRANDING (Thương Hiệu)
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 ${
                        isSelected ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                      }`}>
                        {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                        <span>{isSelected ? `${ratio}% (Đã chọn)` : 'Bỏ qua (0%)'}</span>
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed ${isSelected ? (isLight ? 'text-slate-600' : 'text-gray-300') : 'text-gray-400'}`}>
                      Truyền tải 3 giá trị BỀN BỈ – BỀN VỮNG – BẢO VỆ, mạng lưới 300+ gara đối tác, tiêu chuẩn cắm giắc zin chuẩn đăng kiểm.
                    </p>

                    <div className="text-[10px] text-bulbtek-red font-semibold">
                      Tone: Đĩnh đạc, tin cậy, an toàn, tự hào.
                    </div>

                    {/* Ratio input & slider if selected */}
                    {isSelected && (
                      <div className="pt-2 border-t border-dashed border-inherit space-y-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-500">Tỷ trọng tuyến bài:</span>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={ratio}
                              onChange={(e) => handleUpdateCategoryRatio('BRANDING', Number(e.target.value))}
                              className={`w-12 p-1 text-center rounded border font-bold text-xs ${
                                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                              }`}
                            />
                            <span className="font-bold">%</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 flex justify-between">
                          <span>Ước tính:</span>
                          <strong className="text-bulbtek-red font-bold">~{Math.round(targetTotal * ratio / 100)} bài tháng</strong>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* CARD 2: ROBOT BU */}
              {(() => {
                const isSelected = selectedBrandCategories.includes('ROBOT_BU');
                const ratio = brandCategoryRatios.ROBOT_BU || 0;
                return (
                  <div
                    onClick={() => toggleBrandCategory('ROBOT_BU')}
                    role="button"
                    tabIndex={0}
                    className={`p-4 rounded-xl border space-y-3 relative overflow-hidden transition-all cursor-pointer select-none text-left ${
                      isSelected
                        ? isLight 
                          ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20 transform -translate-y-0.5' 
                          : 'bg-[#18181D] border-amber-500 shadow-md ring-2 ring-amber-500/20 transform -translate-y-0.5'
                        : isLight 
                          ? 'bg-slate-50 border-dashed border-slate-300 opacity-55 hover:opacity-85' 
                          : 'bg-[#121215] border-dashed border-[#2F2F37] opacity-50 hover:opacity-85'
                    }`}
                    style={{ borderTop: `4px solid ${isSelected ? '#D97706' : '#64748B'}` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs ${isSelected ? 'text-amber-600' : 'text-gray-400'}`}>
                        ROBOT BU (Storytelling)
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 ${
                        isSelected ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                      }`}>
                        {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                        <span>{isSelected ? `${ratio}% (Đã chọn)` : 'Bỏ qua (0%)'}</span>
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed ${isSelected ? (isLight ? 'text-slate-600' : 'text-gray-300') : 'text-gray-400'}`}>
                      Người bạn trợ thủ đồng hành trên táp-lô, giải mã thắc mắc đèn xe, khám phá phòng Lab kiểm định quang học.
                    </p>

                    <div className="text-[10px] text-amber-600 font-semibold">
                      Tone: Thân thiện, công nghệ 3D, vui vẻ, tận tâm.
                    </div>

                    {isSelected && (
                      <div className="pt-2 border-t border-dashed border-inherit space-y-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-500">Tỷ trọng tuyến bài:</span>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={ratio}
                              onChange={(e) => handleUpdateCategoryRatio('ROBOT_BU', Number(e.target.value))}
                              className={`w-12 p-1 text-center rounded border font-bold text-xs ${
                                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                              }`}
                            />
                            <span className="font-bold">%</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 flex justify-between">
                          <span>Ước tính:</span>
                          <strong className="text-amber-600 font-bold">~{Math.round(targetTotal * ratio / 100)} bài tháng</strong>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* CARD 3: TƯƠNG TÁC & MINIGAME */}
              {(() => {
                const isSelected = selectedBrandCategories.includes('INTERACTION');
                const ratio = brandCategoryRatios.INTERACTION || 0;
                return (
                  <div
                    onClick={() => toggleBrandCategory('INTERACTION')}
                    role="button"
                    tabIndex={0}
                    className={`p-4 rounded-xl border space-y-3 relative overflow-hidden transition-all cursor-pointer select-none text-left ${
                      isSelected
                        ? isLight 
                          ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20 transform -translate-y-0.5' 
                          : 'bg-[#18181D] border-blue-500 shadow-md ring-2 ring-blue-500/20 transform -translate-y-0.5'
                        : isLight 
                          ? 'bg-slate-50 border-dashed border-slate-300 opacity-55 hover:opacity-85' 
                          : 'bg-[#121215] border-dashed border-[#2F2F37] opacity-50 hover:opacity-85'
                    }`}
                    style={{ borderTop: `4px solid ${isSelected ? '#2563EB' : '#64748B'}` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                        TƯƠNG TÁC & MINIGAME
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 ${
                        isSelected ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                      }`}>
                        {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                        <span>{isSelected ? `${ratio}% (Đã chọn)` : 'Bỏ qua (0%)'}</span>
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed ${isSelected ? (isLight ? 'text-slate-600' : 'text-gray-300') : 'text-gray-400'}`}>
                      Hỏi đáp trải nghiệm phượt đêm, minigame đố vui nhận quà nâng cấp đèn, bình chọn góc độ ánh sáng văn minh.
                    </p>

                    <div className="text-[10px] text-blue-600 font-semibold">
                      Tone: Cởi mở, mời gọi bình luận, tag bạn bè.
                    </div>

                    {isSelected && (
                      <div className="pt-2 border-t border-dashed border-inherit space-y-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-500">Tỷ trọng tuyến bài:</span>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={ratio}
                              onChange={(e) => handleUpdateCategoryRatio('INTERACTION', Number(e.target.value))}
                              className={`w-12 p-1 text-center rounded border font-bold text-xs ${
                                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                              }`}
                            />
                            <span className="font-bold">%</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 flex justify-between">
                          <span>Ước tính:</span>
                          <strong className="text-blue-600 font-bold">~{Math.round(targetTotal * ratio / 100)} bài tháng</strong>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>

            {/* Sub-tab 2 Footer Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-inherit">
              <button
                type="button"
                onClick={() => setActiveSubTab('GOALS')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                  isLight ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' : 'bg-[#121215] hover:bg-[#202026] border-[#2F2F37] text-gray-300'
                }`}
              >
                ← Mục 1: Mục Tiêu & Tuyến Ý Tưởng
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleExportBrandingPlanPdf}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
                  title="Tải kế hoạch phân bổ Content Branding dạng tài liệu PDF A4 ngang để dễ theo dõi"
                >
                  <FileText className="w-4 h-4" />
                  <span>Tải Kế Hoạch Branding (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportBrandingPlan}
                  className={`px-2.5 py-2 rounded-xl border text-xs font-semibold transition ${
                    isLight ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' : 'bg-[#121215] hover:bg-[#202026] border-[#2F2F37] text-gray-300'
                  }`}
                  title="Tải file dữ liệu bảng tính (.CSV / Excel)"
                >
                  <Download className="w-3.5 h-3.5 text-blue-500" />
                  <span>.CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('SCHEDULE')}
                  className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
                >
                  <span>Áp Dụng San Phân Bổ & Sang Bước 3 Triển Khai ➔</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 4. SUB-TAB 3: LỊCH PHÂN BỔ & AI STUDIO THƯƠNG HIỆU */}
      {activeSubTab === 'SCHEDULE' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Thanh Toolbar lọc & thêm bài mới */}
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#18181D] border-[#2A2A32]'
          }`}>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm bài viết thương hiệu..."
                  className={`pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none border ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121215] border-[#2F2F37] text-gray-200'
                  }`}
                />
              </div>

              {/* Lọc Kênh */}
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value as any)}
                className={`py-1.5 px-2.5 rounded-lg text-xs border font-semibold ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121215] border-[#2F2F37] text-gray-200'
                }`}
              >
                <option value="ALL">Tất cả kênh</option>
                <option value="Facebook">🔴 Facebook</option>
                <option value="TikTok">🌐 TikTok</option>
              </select>

              {/* Lọc Tuyến */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className={`py-1.5 px-2.5 rounded-lg text-xs border font-semibold ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121215] border-[#2F2F37] text-gray-200'
                }`}
              >
                <option value="ALL">Tất cả tuyến (Brand + BU)</option>
                <option value="BRANDING">🛡️ Tuyến Branding</option>
                <option value="ROBOT_BU">🤖 Tuyến Robot BU</option>
              </select>

              {/* Chuyển chế độ xem */}
              <div className="flex items-center space-x-1 pl-2 border-l border-inherit">
                <button
                  type="button"
                  onClick={() => setViewMode('WEEK_CARDS')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === 'WEEK_CARDS'
                      ? 'bg-amber-600 text-white'
                      : isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#121215] text-gray-400'
                  }`}
                >
                  Thẻ tuần
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('SMART_TABLE')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === 'SMART_TABLE'
                      ? 'bg-amber-600 text-white'
                      : isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#121215] text-gray-400'
                  }`}
                >
                  Bảng tinh gọn
                </button>
              </div>
            </div>

            {/* Các nút hành động & Tải kế hoạch */}
            <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
              <button
                type="button"
                onClick={handleExportBrandingPlanPdf}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                title="Tải toàn bộ kế hoạch phân bổ Content Branding dạng tài liệu PDF A4 ngang để theo dõi và gửi nhân sự triển khai"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tải Kế Hoạch Branding (PDF)</span>
              </button>

              <button
                type="button"
                onClick={handleExportBrandingPlan}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                  isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#121215] hover:bg-[#202026] border-[#2F2F37] text-gray-300'
                }`}
                title="Tải file dữ liệu bảng tính (.CSV / Excel)"
              >
                <Download className="w-3 h-3 text-blue-500" />
                <span>.CSV</span>
              </button>

              <button
                type="button"
                onClick={() => handleCreateNewBrandPost('BRANDING')}
                className="px-3 py-1.5 rounded-lg bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold transition flex items-center space-x-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Bài Branding</span>
              </button>

              <button
                type="button"
                onClick={() => handleCreateNewBrandPost('ROBOT_BU')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center space-x-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Bài Robot BU</span>
              </button>
            </div>
          </div>

          {/* CHẾ ĐỘ 1: THẺ TUẦN (WEEK CARDS) */}
          {viewMode === 'WEEK_CARDS' && (
            <div className="space-y-6">
              {weeksData.map((week) => {
                if (week.items.length === 0) return null;

                return (
                  <div key={week.weekNum} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <h3 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                        {week.label} ({week.items.length} bài)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {week.items.map((item) => {
                        const hasGenerated = Boolean(item.facebookCaption || item.tiktokCaption);
                        const isMascot = item.productLine === 'Linh Vật Robot BU';
                        const compResult = checkBrandCompliance(
                          `${item.facebookCaption || ''} ${item.tiktokCaption || ''}`,
                          settings.complianceRules || DEFAULT_COMPLIANCE_RULES
                        );

                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md ${
                              isLight 
                                ? 'bg-white border-slate-200 hover:border-amber-400' 
                                : 'bg-[#18181D] border-[#2F2F37] hover:border-amber-500/60'
                            }`}
                          >
                            <div className="space-y-2.5">
                              {/* Header Card */}
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-1.5">
                                  <CalendarDays className="w-3.5 h-3.5 text-bulbtek-red" />
                                  <span className="font-mono font-bold">{item.date}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.channel === 'Facebook'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                    : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                                }`}>
                                  {item.channel}
                                </span>
                              </div>

                              {/* Type Badge & Title */}
                              <div>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded inline-flex items-center space-x-1 ${
                                  isMascot
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                }`}>
                                  {isMascot ? <Bot className="w-3 h-3 inline mr-1" /> : <Shield className="w-3 h-3 inline mr-1" />}
                                  <span>{isMascot ? 'Robot BU' : 'Branding'}</span>
                                </span>

                                <h4 className={`text-xs font-bold mt-1.5 line-clamp-2 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                  {item.creativeHeadline || item.title}
                                </h4>
                              </div>

                              {/* Caption Preview */}
                              {hasGenerated ? (
                                <div className={`p-2 rounded-lg text-xs line-clamp-2 border ${
                                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#121215] border-[#2A2A32] text-gray-200'
                                }`}>
                                  <span className="text-bulbtek-red font-semibold text-[10px] uppercase mr-1">Caption:</span>
                                  <span className="italic">"{item.facebookCaption || item.tiktokCaption}"</span>
                                </div>
                              ) : (
                                <div className={`p-2.5 rounded-lg text-xs border border-dashed flex items-center space-x-1.5 ${
                                  isLight ? 'bg-amber-50/60 border-amber-200 text-amber-800' : 'bg-[#141418] border-amber-500/30 text-amber-300/80'
                                }`}>
                                  <span className="text-amber-500 shrink-0">✍️</span>
                                  <span className="text-[11px] leading-tight">
                                    Chưa có caption — bấm <strong>Tạo AI Content</strong> để sinh bài viết thương hiệu
                                  </span>
                                </div>
                              )}

                              {/* Compliance Warning if violated */}
                              {hasGenerated && compResult.isViolated && (
                                <div className={`p-2 rounded-lg text-[11px] border flex items-start space-x-1.5 ${
                                  isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/40 border-amber-800 text-amber-200'
                                }`}>
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <span className="font-bold">⚠️ Cảnh báo tuân thủ: </span>
                                    <span>{compResult.violations.map(v => v.keyword).join(', ')}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Card Footer */}
                            <div className={`pt-2.5 border-t flex items-center justify-between text-xs ${isLight ? 'border-slate-100 text-slate-500' : 'border-[#2A2A32] text-gray-400'}`}>
                              <span className="text-[11px] font-semibold">{item.assigneeName || 'Linh'}</span>

                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenAiStudio(item)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                                    hasGenerated
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300'
                                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                                  }`}
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>{hasGenerated ? '✓ Sửa AI' : '✨ Tạo AI'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => deleteContentItem(item.id)}
                                  className={`p-1.5 rounded-lg transition ${
                                    isLight ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-950/30'
                                  }`}
                                  title="Xóa bài viết"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredBrandContents.length === 0 && (
                <div className={`p-12 text-center rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#121215] border-[#2F2F37] text-gray-400'}`}>
                  <Award className="w-10 h-10 mx-auto opacity-50 mb-2" />
                  <p className="text-sm font-bold">Chưa có bài viết Thương hiệu / Robot BU nào trong tháng {selectedMonth}.</p>
                  <p className="text-xs opacity-75 mt-1">Hãy bấm các nút "+ Thêm Bài Branding" hoặc "+ Thêm Bài Robot BU" ở trên để lên lịch.</p>
                </div>
              )}
            </div>
          )}

          {/* CHẾ ĐỘ 2: BẢNG TINH GỌN (SMART TABLE) */}
          {viewMode === 'SMART_TABLE' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`uppercase tracking-wider text-[11px] border-y ${isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-[#121215] text-gray-400 border-[#2F2F37]'}`}>
                  <tr>
                    <th className="py-3 px-3">Ngày</th>
                    <th className="py-3 px-3">Kênh</th>
                    <th className="py-3 px-3">Tuyến bài</th>
                    <th className="py-3 px-3">Tiêu đề / Headline</th>
                    <th className="py-3 px-3">Phụ trách</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#2A2A32]'}`}>
                  {filteredBrandContents.map((item) => {
                    const hasGenerated = Boolean(item.facebookCaption || item.tiktokCaption);
                    const isMascot = item.productLine === 'Linh Vật Robot BU';

                    return (
                      <tr key={item.id} className={`transition ${isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-[#18181D] text-gray-300'}`}>
                        <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">{item.date}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.channel === 'Facebook'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                          }`}>
                            {item.channel}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isMascot
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}>
                            {isMascot ? 'Robot BU' : 'Branding'}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-xs truncate font-semibold">
                          {item.creativeHeadline || item.title}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">{item.assigneeName}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            item.status === 'Pending' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                            'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenAiStudio(item)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                                hasGenerated
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-600 hover:bg-amber-700 text-white'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{hasGenerated ? 'Sửa AI' : 'Tạo AI'}</span>
                            </button>
                            <button
                              onClick={() => deleteContentItem(item.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600"
                              title="Xóa"
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

        </div>
      )}

      {/* 🌟 5. MODAL AI CONTENT STUDIO CHUYÊN BIỆT CHO THƯƠNG HIỆU */}
      {generatingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className={`border rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl animate-fadeIn ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#18181D] border-[#2A2A32] text-white'
          }`}>
            
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black flex items-center space-x-2">
                    <span>AI Studio — Sáng Tạo Nội Dung Thương Hiệu Bulbtek</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      {generatingItem.productLine === 'Linh Vật Robot BU' ? 'Linh Vật Robot BU' : 'Branding Sản Phẩm'}
                    </span>
                  </h3>
                  <div className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    Ngày đăng: <strong className="font-mono">{generatingItem.date}</strong> | Kênh: <strong>{generatingItem.channel}</strong> | Phụ trách: <strong>{generatingItem.assigneeName}</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGeneratingItem(null)}
                className={`p-2 rounded-xl transition ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-gray-800 text-gray-400'}`}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Nhập thông tin bổ sung / yêu cầu sáng tạo */}
              <div className={`p-4 rounded-xl border space-y-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Nhập thông tin thêm (Bối cảnh / Yêu cầu sáng tạo phối hợp cùng AI):</span>
                </div>
                <textarea
                  rows={2}
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="VD: Nhấn mạnh văn hóa không chói mắt xe đối diện; Kể câu chuyện bác tài chở gia đình về quê; Nhắc chương trình bảo hành 1 đổi 1 tận nơi..."
                  className={`w-full rounded-xl p-2.5 text-xs leading-relaxed focus:outline-none focus:border-amber-500 border ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                  }`}
                />

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleRunAiGeneration}
                    disabled={isGeneratingAi}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isGeneratingAi 
                        ? 'AI đang viết content thương hiệu...' 
                        : (editedFbCaption || editedTiktokCaption)
                          ? '🔄 Viết lại biến thể mới (Không trùng lặp)'
                          : '✨ Tiến hành sinh Caption FB & TikTok'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Caption Editor & Output */}
              {(editedFbCaption || editedTiktokCaption) && (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between border-b pb-2 border-inherit">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setActiveOutputTab('FACEBOOK')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                          activeOutputTab === 'FACEBOOK'
                            ? 'bg-bulbtek-red text-white'
                            : isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#121215] text-gray-400'
                        }`}
                      >
                        🔴 Facebook (150-300 từ)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveOutputTab('TIKTOK')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                          activeOutputTab === 'TIKTOK'
                            ? 'bg-cyan-600 text-white'
                            : isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#121215] text-gray-400'
                        }`}
                      >
                        🌐 TikTok (50-100 từ)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const txt = activeOutputTab === 'FACEBOOK' ? editedFbCaption : editedTiktokCaption;
                        navigator.clipboard.writeText(txt);
                        if (activeOutputTab === 'FACEBOOK') {
                          setCopiedFb(true);
                          setTimeout(() => setCopiedFb(false), 2000);
                        } else {
                          setCopiedTiktok(true);
                          setTimeout(() => setCopiedTiktok(false), 2000);
                        }
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 border"
                    >
                      {copiedFb || copiedTiktok ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFb || copiedTiktok ? 'Đã copy' : 'Copy'}</span>
                    </button>
                  </div>

                  {activeOutputTab === 'FACEBOOK' ? (
                    <textarea
                      rows={9}
                      value={editedFbCaption}
                      onChange={(e) => setEditedFbCaption(e.target.value)}
                      className={`w-full rounded-xl p-4 text-xs font-sans leading-relaxed focus:outline-none focus:border-amber-500 border ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-gray-100'
                      }`}
                    />
                  ) : (
                    <textarea
                      rows={7}
                      value={editedTiktokCaption}
                      onChange={(e) => setEditedTiktokCaption(e.target.value)}
                      className={`w-full rounded-xl p-4 text-xs font-sans leading-relaxed focus:outline-none focus:border-amber-500 border ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-gray-100'
                      }`}
                    />
                  )}

                  {/* Compliance Check Alert */}
                  {(() => {
                    const currentCap = activeOutputTab === 'FACEBOOK' ? editedFbCaption : editedTiktokCaption;
                    const comp = checkBrandCompliance(currentCap, settings.complianceRules || DEFAULT_COMPLIANCE_RULES);

                    if (comp.isViolated) {
                      return (
                        <div className={`p-3 rounded-xl border space-y-2 ${
                          isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/40 border-amber-700 text-amber-200'
                        }`}>
                          <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Cảnh báo tuân thủ 3 nguyên tắc thương hiệu ({comp.violations.length} điểm cần lưu ý):</span>
                          </div>
                          <div className="space-y-1.5 pl-6 text-xs">
                            {comp.violations.map((v, i) => (
                              <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 text-[11px]">
                                <span className="font-bold text-bulbtek-red shrink-0">• "{v.keyword}" [{v.principle}]:</span>
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
                        <span>✓ Đạt chuẩn 3 nguyên tắc thương hiệu Bulbtek (Không Chém Gió Ảo • Không Cắt Dây Điện • Không Gây Chói Lóa).</span>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className={`p-4 sm:p-5 border-t flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
            }`}>
              <button
                type="button"
                onClick={() => setGeneratingItem(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'}`}
              >
                Đóng
              </button>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setBriefPrefillItem(generatingItem);
                    setActiveTab(5); // Chuyển sang Tab 5: Design Brief & AI
                  }}
                  className="px-4 py-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 bg-white dark:bg-[#18181D] hover:bg-slate-100"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tạo Design Brief</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveModal}
                  className="px-5 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold transition shadow-glow-red flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>💾 Lưu Lại Vào Lịch</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Toast thông báo sao chép & áp dụng ý tưởng */}
      {copiedActionToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-2xl flex items-center space-x-2 border border-slate-700 dark:border-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{copiedActionToast}</span>
          </div>
        </div>
      )}

    </div>
  );
};
