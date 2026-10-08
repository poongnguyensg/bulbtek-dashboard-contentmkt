import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BrandColorItem, 
  BrandGuideline, 
  PhilosophyPoint, 
  ThreeNoRule, 
  CoreValueItem, 
  BrandTypography 
} from '../../types';
import { 
  INITIAL_BRAND_COLORS, 
  INITIAL_SECONDARY_COLORS, 
  INITIAL_PHILOSOPHY_POINTS, 
  INITIAL_MISSION_POINTS, 
  INITIAL_THREE_NO_RULES, 
  INITIAL_CORE_VALUES, 
  INITIAL_TYPOGRAPHY 
} from '../../data/initialData';
import { 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Heart, 
  Bot, 
  Copy, 
  Check, 
  Share2, 
  Layers, 
  Eye, 
  Palette, 
  CheckCircle2, 
  MessageSquare, 
  Sliders, 
  Flag, 
  Zap, 
  Flame, 
  Car, 
  BookOpen, 
  ExternalLink,
  ShieldAlert,
  Edit3,
  Save,
  Radio,
  Plus,
  Trash2,
  RotateCcw,
  Pipette,
  Upload,
  Download,
  Type,
  RefreshCw,
  ImageIcon,
  X,
  FileDown,
  Printer
} from 'lucide-react';
import { exportBrandIdentityPdf } from '../../services/pdfReportGenerator';

const PRESET_BRAND_COLORS = [
  { name: 'Đỏ BULBTEK', hex: '#AF2024', role: 'Primary Color', desc: 'Màu nhận diện thương hiệu chủ đạo' },
  { name: 'Đỏ Thể Thao Racing', hex: '#DC2626', role: 'Accent / Sport', desc: 'Nổi bật, năng động, nhiệt huyết' },
  { name: 'Đỏ Đô Crimson', hex: '#991B1B', role: 'Deep Red', desc: 'Trầm ấm, quyền lực, vững chãi' },
  { name: 'Đen Titan', hex: '#1A1A1A', role: 'Dark Cockpit', desc: 'Nền buồng lái ban đêm huyền bí' },
  { name: 'Đen Tuyệt Đối', hex: '#0D0D11', role: 'Obsidian Black', desc: 'Nền tương phản cực cao' },
  { name: 'Trắng Tinh Khiết', hex: '#FFFFFF', role: 'White Contrast', desc: 'Luồng ánh sáng thuần khiết' },
  { name: 'Trắng Ấm 5500K', hex: '#FFF8E7', role: 'Pha Bám Đường', desc: 'Nhiệt màu bám đường tự nhiên' },
  { name: 'Vàng Phá Sương 3000K', hex: '#F59E0B', role: 'Bi Gầm / Phá Sương', desc: 'Xuyên mưa bão đèo dốc hiểm trở' },
  { name: 'Cam Hổ Phách Amber', hex: '#EA580C', role: 'Cảnh Báo / Nổi Bật', desc: 'Tín hiệu dẫn đường an toàn' },
  { name: 'Xanh Cyan Robot BU', hex: '#06B6D4', role: 'Mascot / Tech', desc: 'Mắt LED thông thái, công nghệ tương lai' },
  { name: 'Xanh Bi-LED Laser', hex: '#2563EB', role: 'Tâm Pha Laser', desc: 'Ánh sáng tâm pha gom xa hàng trăm mét' },
  { name: 'Tím Indigo AR', hex: '#6366F1', role: 'Thấu Kính AR', desc: 'Lớp phủ lens chống lóa ngược chiều' },
  { name: 'Xanh Emerald An Toàn', hex: '#10B981', role: 'Safe Driving', desc: 'Bảo vệ hành trình vạn dặm bình an' },
  { name: 'Bạc Titan Nhôm', hex: '#94A3B8', role: 'Hardware Material', desc: 'Hợp kim nhôm tản nhiệt hàng không' },
  { name: 'Vàng Kim Gold', hex: '#EAB308', role: 'Luxury / Highlight', desc: 'Đẳng cấp xe sang' },
];

export const TabBrandInfo: React.FC = () => {
  const { theme, settings, updateSettings, currentUser, setActiveTab, setPlanningSubTab } = useApp();
  const isLight = theme === 'light';
  const isAdmin = currentUser.role === 'ADMIN';

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeMascotAngle, setActiveMascotAngle] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // SECTION 1: TRIẾT LÝ & SỨ MỆNH STATE
  // ----------------------------------------------------
  const [isEditingSec1, setIsEditingSec1] = useState<boolean>(false);
  const currentPhilTitle = settings.brandGuideline.philosophyTitle || 'An Toàn Hành Trình';
  const currentPhilDesc = settings.brandGuideline.philosophyDesc || 'Tại BULBTEK VIỆT NAM, chúng tôi tin rằng đèn ô tô không chỉ đơn thuần là phụ kiện trang trí làm đẹp xe, mà là hệ thống phòng vệ chủ động tối thượng bảo vệ tính mạng của người cầm lái và cả gia đình phía sau vô lăng.';
  const currentPhilPoints = settings.brandGuideline.philosophyPoints || INITIAL_PHILOSOPHY_POINTS;

  const currentMisTitle = settings.brandGuideline.missionTitle || 'Trợ Thủ Đắc Lực Cho Bác Tài Việt';
  const currentMisDesc = settings.brandGuideline.missionDesc || 'Bulbtek sinh ra để phụng sự cộng đồng bác tài Việt Nam — từ bác tài xe tải đường dài thức thâu đêm, anh em tài xế xe công nghệ mưu sinh mỗi ngày, đến các gia đình trên từng chuyến du lịch khám phá mọi miền Tổ quốc.';
  const currentMisPoints = settings.brandGuideline.missionPoints || INITIAL_MISSION_POINTS;

  const currentThreeNoRules = settings.brandGuideline.threeNoRules || INITIAL_THREE_NO_RULES;

  const [editedSec1, setEditedSec1] = useState({
    philosophyTitle: currentPhilTitle,
    philosophyDesc: currentPhilDesc,
    philosophyPoints: currentPhilPoints,
    missionTitle: currentMisTitle,
    missionDesc: currentMisDesc,
    missionPoints: currentMisPoints,
    threeNoRules: currentThreeNoRules
  });

  const handleToggleEditSec1 = () => {
    if (!isEditingSec1) {
      setEditedSec1({
        philosophyTitle: currentPhilTitle,
        philosophyDesc: currentPhilDesc,
        philosophyPoints: currentPhilPoints,
        missionTitle: currentMisTitle,
        missionDesc: currentMisDesc,
        missionPoints: currentMisPoints,
        threeNoRules: currentThreeNoRules
      });
      setIsEditingSec1(true);
    } else {
      setIsEditingSec1(false);
    }
  };

  const handleSaveSec1 = () => {
    updateSettings({
      brandGuideline: {
        ...settings.brandGuideline,
        ...editedSec1
      }
    });
    setIsEditingSec1(false);
    setCopiedKey('saved_sec1');
    setTimeout(() => setCopiedKey(null), 3000);
  };

  // ----------------------------------------------------
  // SECTION 2: 3 GIÁ TRỊ CỐT LÕI STATE
  // ----------------------------------------------------
  const [isEditingSec2, setIsEditingSec2] = useState<boolean>(false);
  const currentCoreValues = settings.brandGuideline.coreValuePillars || INITIAL_CORE_VALUES;
  const [editedCoreValues, setEditedCoreValues] = useState<CoreValueItem[]>(currentCoreValues);

  const handleToggleEditSec2 = () => {
    if (!isEditingSec2) {
      setEditedCoreValues(currentCoreValues);
      setIsEditingSec2(true);
    } else {
      setIsEditingSec2(false);
    }
  };

  const handleSaveSec2 = () => {
    updateSettings({
      brandGuideline: {
        ...settings.brandGuideline,
        coreValuePillars: editedCoreValues
      }
    });
    setIsEditingSec2(false);
    setCopiedKey('saved_sec2');
    setTimeout(() => setCopiedKey(null), 3000);
  };

  // ----------------------------------------------------
  // SECTION 3: MASCOT ASSETS (UPLOAD & DOWNLOAD)
  // ----------------------------------------------------
  const mascotImage = settings.brandGuideline.mascotImage || null;

  const handleUploadMascotImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh tối đa là 5MB!');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        updateSettings({
          brandGuideline: {
            ...settings.brandGuideline,
            mascotImage: dataUrl
          }
        });
        setCopiedKey('mascot_uploaded');
        setTimeout(() => setCopiedKey(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadMascotImage = () => {
    const link = document.createElement('a');
    link.download = `Robot_BU_Bulbtek_Official.png`;
    if (mascotImage) {
      link.href = mascotImage;
      link.click();
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const bgGrad = ctx.createLinearGradient(0, 0, 600, 600);
        bgGrad.addColorStop(0, '#121215');
        bgGrad.addColorStop(1, '#1A1A1A');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 600, 600);

        ctx.save();
        ctx.shadowColor = '#AF2024';
        ctx.shadowBlur = 40;
        ctx.strokeStyle = '#AF2024';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(300, 300, 220, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ROBOT BU', 300, 240);

        ctx.fillStyle = '#AF2024';
        ctx.font = 'bold 22px Arial, sans-serif';
        ctx.fillText('BULBTEK VIỆT NAM', 300, 290);

        ctx.fillStyle = '#06B6D4';
        ctx.font = 'italic 18px Arial, sans-serif';
        ctx.fillText('⚡ Trợ Thủ Đắc Lực Cho Bác Tài Việt ⚡', 300, 340);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '14px Arial, sans-serif';
        ctx.fillText('Mascot Identity Asset • An Toàn Hành Trình', 300, 380);

        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    }
    setCopiedKey('mascot_downloaded');
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const handleResetMascotImage = () => {
    if (window.confirm('Khôi phục ảnh Robot BU về hình tượng đồ họa mặc định?')) {
      updateSettings({
        brandGuideline: {
          ...settings.brandGuideline,
          mascotImage: undefined
        }
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadBrandPdf = () => {
    exportBrandIdentityPdf(settings.brandGuideline);
  };

  // ----------------------------------------------------
  // SECTION 4: COLOR PALETTE & HASHTAGS STATE
  // ----------------------------------------------------
  const [isEditingSec4, setIsEditingSec4] = useState<boolean>(false);
  const primaryPalette: BrandColorItem[] = (settings.brandGuideline.colorPalette && settings.brandGuideline.colorPalette.length > 0)
    ? settings.brandGuideline.colorPalette
    : INITIAL_BRAND_COLORS;

  const secondaryPalette: BrandColorItem[] = (settings.brandGuideline.secondaryColors && settings.brandGuideline.secondaryColors.length > 0)
    ? settings.brandGuideline.secondaryColors
    : INITIAL_SECONDARY_COLORS;

  const [editedPrimaryColors, setEditedPrimaryColors] = useState<BrandColorItem[]>(primaryPalette);
  const [editedSecondaryColors, setEditedSecondaryColors] = useState<BrandColorItem[]>(secondaryPalette);
  const [editedFbHashtags, setEditedFbHashtags] = useState(settings.brandGuideline.fbHashtags);
  const [editedTiktokHashtags, setEditedTiktokHashtags] = useState(settings.brandGuideline.tiktokHashtags);

  // Sec 1 Helpers
  const handleAddPhilosophyPoint = () => {
    const nextIdx = editedSec1.philosophyPoints.length + 1;
    setEditedSec1(prev => ({
      ...prev,
      philosophyPoints: [
        ...prev.philosophyPoints,
        { id: `phil-${Date.now()}`, title: `Luận điểm ${nextIdx}`, desc: 'Mô tả chi tiết về luận điểm triết lý an toàn...' }
      ]
    }));
  };

  const handleRemovePhilosophyPoint = (id: string) => {
    if (editedSec1.philosophyPoints.length <= 1) {
      alert('Triết lý cần duy trì ít nhất 1 luận điểm!');
      return;
    }
    setEditedSec1(prev => ({
      ...prev,
      philosophyPoints: prev.philosophyPoints.filter(p => p.id !== id)
    }));
  };

  const handleUpdatePhilosophyPoint = (id: string, field: 'title' | 'desc', val: string) => {
    setEditedSec1(prev => ({
      ...prev,
      philosophyPoints: prev.philosophyPoints.map(p => p.id === id ? { ...p, [field]: val } : p)
    }));
  };

  const handleAddMissionPoint = () => {
    const nextIdx = editedSec1.missionPoints.length + 1;
    setEditedSec1(prev => ({
      ...prev,
      missionPoints: [
        ...prev.missionPoints,
        { id: `mis-${Date.now()}`, title: `Cam kết ${nextIdx}`, desc: 'Mô tả chi tiết về cam kết sứ mệnh phục vụ bác tài...' }
      ]
    }));
  };

  const handleRemoveMissionPoint = (id: string) => {
    if (editedSec1.missionPoints.length <= 1) {
      alert('Sứ mệnh cần duy trì ít nhất 1 cam kết!');
      return;
    }
    setEditedSec1(prev => ({
      ...prev,
      missionPoints: prev.missionPoints.filter(p => p.id !== id)
    }));
  };

  const handleUpdateMissionPoint = (id: string, field: 'title' | 'desc', val: string) => {
    setEditedSec1(prev => ({
      ...prev,
      missionPoints: prev.missionPoints.map(p => p.id === id ? { ...p, [field]: val } : p)
    }));
  };

  const handleAddThreeNoRule = () => {
    const nextNum = editedSec1.threeNoRules.length + 1;
    setEditedSec1(prev => ({
      ...prev,
      threeNoRules: [
        ...prev.threeNoRules,
        { id: `no-${Date.now()}`, number: nextNum, title: `${nextNum}. KHÔNG ...`, desc: 'Mô tả chi tiết nguyên tắc bắt buộc tuân thủ...' }
      ]
    }));
  };

  const handleRemoveThreeNoRule = (id: string) => {
    if (editedSec1.threeNoRules.length <= 1) {
      alert('Quy tắc bắt buộc phải có ít nhất 1 điều!');
      return;
    }
    setEditedSec1(prev => ({
      ...prev,
      threeNoRules: prev.threeNoRules.filter(r => r.id !== id)
    }));
  };

  const handleUpdateThreeNoRule = (id: string, field: 'title' | 'desc', val: string) => {
    setEditedSec1(prev => ({
      ...prev,
      threeNoRules: prev.threeNoRules.map(r => r.id === id ? { ...r, [field]: val } : r)
    }));
  };

  // Sec 2 Helpers
  const handleAddCoreValuePillar = () => {
    const nextNum = editedCoreValues.length + 1;
    const newPillar: CoreValueItem = {
      id: `val-${Date.now()}`,
      title: `GIÁ TRỊ MỚI #${nextNum}`,
      subtitle: `Trụ Cột ${nextNum}`,
      icon: '💎',
      desc: 'Mô tả ý nghĩa và tầm quan trọng của giá trị cốt lõi mới đối với Bulbtek...',
      bullets: [
        'Cam kết chất lượng thực tế đến khách hàng.',
        'Quy chuẩn dịch vụ hậu mãi và bảo hành.'
      ]
    };
    setEditedCoreValues(prev => [...prev, newPillar]);
  };

  const handleRemoveCoreValuePillar = (id: string) => {
    if (editedCoreValues.length <= 1) {
      alert('Phải duy trì ít nhất 1 giá trị cốt lõi!');
      return;
    }
    setEditedCoreValues(prev => prev.filter(v => v.id !== id));
  };

  const handleUpdateCoreValueField = (id: string, field: keyof CoreValueItem, val: any) => {
    setEditedCoreValues(prev => prev.map(v => v.id === id ? { ...v, [field]: val } : v));
  };

  const handleAddCoreValueBullet = (pillarId: string) => {
    setEditedCoreValues(prev => prev.map(v => {
      if (v.id === pillarId) {
        return {
          ...v,
          bullets: [...v.bullets, 'Nội dung cam kết hoặc tiêu chuẩn kỹ thuật mới...']
        };
      }
      return v;
    }));
  };

  const handleRemoveCoreValueBullet = (pillarId: string, bulletIdx: number) => {
    setEditedCoreValues(prev => prev.map(v => {
      if (v.id === pillarId) {
        return {
          ...v,
          bullets: v.bullets.filter((_, idx) => idx !== bulletIdx)
        };
      }
      return v;
    }));
  };

  const handleUpdateCoreValueBullet = (pillarId: string, bulletIdx: number, val: string) => {
    setEditedCoreValues(prev => prev.map(v => {
      if (v.id === pillarId) {
        const updated = [...v.bullets];
        updated[bulletIdx] = val;
        return {
          ...v,
          bullets: updated
        };
      }
      return v;
    }));
  };

  const handleToggleEditSec4 = () => {
    if (!isEditingSec4) {
      setEditedPrimaryColors(primaryPalette);
      setEditedSecondaryColors(secondaryPalette);
      setEditedFbHashtags(settings.brandGuideline.fbHashtags);
      setEditedTiktokHashtags(settings.brandGuideline.tiktokHashtags);
      setIsEditingSec4(true);
    } else {
      setIsEditingSec4(false);
    }
  };

  const handleUpdatePrimaryColor = (id: string, field: keyof BrandColorItem, value: any) => {
    setEditedPrimaryColors(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleUpdateSecondaryColor = (id: string, field: keyof BrandColorItem, value: any) => {
    setEditedSecondaryColors(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleAddSecondaryColor = () => {
    const nextIdx = editedSecondaryColors.length + 1;
    const newColor: BrandColorItem = {
      id: `sec-${Date.now()}`,
      name: `Màu Phụ Mới #${nextIdx}`,
      hex: '#F59E0B',
      role: 'Màu Phụ Phối Hợp',
      description: 'Màu phụ bổ trợ phối hợp cho chiến dịch quảng bá hoặc ấn phẩm đặc thù',
      isCustom: true
    };
    setEditedSecondaryColors(prev => [...prev, newColor]);
  };

  const handleRemoveSecondaryColor = (id: string) => {
    if (editedSecondaryColors.length <= 1) {
      alert('Bảng màu phụ phối hợp cần duy trì ít nhất 1 màu!');
      return;
    }
    setEditedSecondaryColors(prev => prev.filter(c => c.id !== id));
  };

  const handleResetDefaultColors = () => {
    if (window.confirm('Khôi phục cả bảng màu chính và bảng màu phụ về mặc định của Bulbtek?')) {
      setEditedPrimaryColors(INITIAL_BRAND_COLORS);
      setEditedSecondaryColors(INITIAL_SECONDARY_COLORS);
    }
  };

  const handleSaveSec4 = () => {
    const primary = editedPrimaryColors.find(c => c.role.toLowerCase().includes('primary') || c.id === 'color-primary')?.hex || editedPrimaryColors[0]?.hex || '#AF2024';
    const dark = editedPrimaryColors.find(c => c.role.toLowerCase().includes('dark') || c.id === 'color-dark')?.hex || editedPrimaryColors[1]?.hex || '#1A1A1A';
    const white = editedPrimaryColors.find(c => c.role.toLowerCase().includes('white') || c.id === 'color-white')?.hex || editedPrimaryColors[2]?.hex || '#FFFFFF';

    updateSettings({
      brandGuideline: {
        ...settings.brandGuideline,
        primaryColor: primary,
        darkColor: dark,
        whiteColor: white,
        colorPalette: editedPrimaryColors,
        secondaryColors: editedSecondaryColors,
        fbHashtags: editedFbHashtags,
        tiktokHashtags: editedTiktokHashtags
      }
    });
    setIsEditingSec4(false);
    setCopiedKey('saved_sec4');
    setTimeout(() => setCopiedKey(null), 3000);
  };

  // ----------------------------------------------------
  // SECTION 5: BRAND TYPOGRAPHY STATE
  // ----------------------------------------------------
  const [isEditingSec5, setIsEditingSec5] = useState<boolean>(false);
  const currentTypography = settings.brandGuideline.typography || INITIAL_TYPOGRAPHY;
  const [editedTypography, setEditedTypography] = useState<BrandTypography>(currentTypography);
  const [typeTesterText, setTypeTesterText] = useState<string>('BULBTEK — AN TOÀN HÀNH TRÌNH, TRỢ THỦ ĐẮC LỰC CHO BÁC TÀI VIỆT');

  const handleToggleEditSec5 = () => {
    if (!isEditingSec5) {
      setEditedTypography(currentTypography);
      setIsEditingSec5(true);
    } else {
      setIsEditingSec5(false);
    }
  };

  const handleSaveSec5 = () => {
    updateSettings({
      brandGuideline: {
        ...settings.brandGuideline,
        typography: editedTypography
      }
    });
    setIsEditingSec5(false);
    setCopiedKey('saved_sec5');
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const handleUpdateTypographyField = (field: keyof BrandTypography, val: any) => {
    setEditedTypography(prev => ({ ...prev, [field]: val }));
  };

  const handleApplyPresetToPrimary = (id: string, preset: { name: string; hex: string; role: string; desc: string }) => {
    setEditedPrimaryColors(prev => prev.map(c => c.id === id ? { ...c, hex: preset.hex, name: preset.name } : c));
  };

  const handleApplyPresetToSecondary = (id: string, preset: { name: string; hex: string; role: string; desc: string }) => {
    setEditedSecondaryColors(prev => prev.map(c => c.id === id ? { ...c, hex: preset.hex, name: preset.name } : c));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const cardClass = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#18181D] border-[#2A2A32] shadow-xl';
  const innerCardClass = isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121215] border-[#2F2F37] text-gray-200';

  const mascotPillars = [
    {
      title: 'Nhật Ký Robot BU Xuyên Đêm Mưa Bão',
      tag: 'Storytelling & Tình Huống',
      badgeColor: isLight ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-950/70 text-amber-300 border-amber-800',
      description: 'Khắc họa các tình huống hiểm nghèo trên đèo dốc sương mù (Hải Vân, Ô Quy Hồ, đèo Pha Đin) khi xe đối diện giương pha mù lóa và giải pháp ánh sáng bám đường từ bi gầm Bulbtek.',
      hookExample: 'Đêm qua đèo sương mù đặc quánh, gạt mưa hết cỡ vẫn không thấy vạch kẻ đường. May có Robot BU và cặp bi gầm 3000K phá tan sương, soi sáng từng mét đường dốc...',
      aiAngle: 'Khơi gợi sự thấu cảm, nhấn mạnh tính năng chống chói và khả năng phá sương vàng 3000K.'
    },
    {
      title: 'Robot BU "Đột Nhập" Phòng Lab R&D',
      tag: 'Giải Mã Công Nghệ',
      badgeColor: isLight ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-blue-950/70 text-blue-300 border-blue-800',
      description: 'Robot BU giải thích nguyên lý quang học phức tạp (chip LED Osram, ống đồng kép tản nhiệt, thấu kính phủ AR xanh tím) bằng ngôn ngữ hóm hỉnh, dễ hiểu.',
      hookExample: 'Nhiều bác tài hỏi BU: Tại sao đèn tăng sáng mà sờ chóa vẫn mát rượi? Cùng BU đột nhập phòng thí nghiệm xem ống đồng kép hoạt động thế nào nhé!',
      aiAngle: '70% lý tính chuẩn xác, nâng cao độ tin cậy về mặt kỹ thuật mà không gây nhàm chán.'
    },
    {
      title: 'Góc Bác Tài Hỏi — Robot BU Trả Lời',
      tag: 'Hỏi Đáp Q&A Văn Minh',
      badgeColor: isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-emerald-950/70 text-emerald-300 border-emerald-800',
      description: 'Giải đáp những lo lắng thực tế của người dùng: Độ đèn có bị phạt đăng kiểm không? Cắm giắc zin xe điện VinFast VF3 có làm chai bình điện hay mất bảo hành xe?',
      hookExample: 'Xe VinFast VF3 chóa vuông độ bi LED có phải cắt khoét mặt ca-lăng không BU ơi? Trả lời: Cắm giắc zin 100% khớp từng milimet, giữ trọn bảo hành hãng các bác nhé!',
      aiAngle: 'Giải tỏa triệt để rào cản tâm lý mua hàng, hướng dẫn đăng kiểm an toàn văn minh.'
    },
    {
      title: 'Robot BU Gửi Lời Chúc Vạn Dặm Bình An',
      tag: 'Cảm Xúc & Tri Ân',
      badgeColor: isLight ? 'bg-red-100 text-red-800 border-red-200' : 'bg-red-950/70 text-red-300 border-red-800',
      description: 'Các bài viết gắn kết gia đình, tri ân nghề tài xế, minigame tặng voucher bảo dưỡng xe và quà tặng kỷ niệm tại mạng lưới đại lý Bulbtek.',
      hookExample: 'Phía trước tay lái là mưu sinh, phía sau vô lăng là gia đình đang chờ đợi. Bật đèn sáng chuẩn, vững tay lái, về nhà an toàn các bác tài nhé!',
      aiAngle: '30% cảm xúc chân thành, biến Bulbtek từ nhà cung cấp phụ tùng thành người bạn tri kỷ.'
    }
  ];

  const robotBuPrompt = `3D mascot character named Robot BU of Bulbtek automotive lighting brand, cute yet high-tech humanoid robot made of automotive matte black titanium and glossy racing red accents (#AF2024), illuminated friendly cyan LED eyes with warm expression, glowing chest emblem with letter 'B', holding a miniature high-tech automotive bi-LED projector lens that emits a warm clean twilight beam. Cinematic automotive dark background, sharp focus, octane render, 8k resolution.`;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 🌟 TOP BANNER: HERO BRAND HEADER */}
      <div className={`border rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#18181D] border-[#2A2A32]'
      }`}>
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-gradient-to-br from-bulbtek-red/20 via-red-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider border flex items-center space-x-1.5 ${
                isLight ? 'bg-red-50 text-bulbtek-red border-red-200' : 'bg-bulbtek-red/20 text-red-400 border-bulbtek-red/40'
              }`}>
                <ShieldCheck className="w-4 h-4" />
                <span>Brand Identity & Philosophy</span>
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-gray-300'
              }`}>
                Phiên bản v2.6 • Chuẩn AI Studio
              </span>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Thông Tin Thương Hiệu <span className="text-bulbtek-red">BULBTEK VIỆT NAM</span>
            </h1>

            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
              Trung tâm tri thức và nhận diện cốt lõi của thương hiệu. Nơi định hình triết lý <strong>"An Toàn Hành Trình"</strong>, sứ mệnh vì bác tài Việt, 3 giá trị <strong>BỀN BỈ – BỀN VỮNG – BẢO VỆ</strong> và linh vật <strong>Robot BU</strong>. Toàn bộ nội dung do AI tạo ra đều bắt buộc phải tuân thủ và trích xuất từ chuẩn mực này.
            </p>

            {/* Core Badges Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#121215] border-[#2F2F37] text-gray-300'
              }`}>
                <Flag className="w-3.5 h-3.5 text-bulbtek-red" />
                <span>Slogan: <strong className={isLight ? 'text-slate-900' : 'text-white'}>"An Toàn Hành Trình"</strong></span>
              </div>

              <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#121215] border-[#2F2F37] text-gray-300'
              }`}>
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>Thông điệp: <strong className={isLight ? 'text-slate-900' : 'text-white'}>"Trợ Thủ Đắc Lực Cho Bác Tài Việt"</strong></span>
              </div>

              <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#121215] border-[#2F2F37] text-gray-300'
              }`}>
                <Bot className="w-3.5 h-3.5 text-cyan-500" />
                <span>Linh vật: <strong className={isLight ? 'text-slate-900' : 'text-white'}>Robot BU</strong></span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => copyToClipboard(
                `THƯƠNG HIỆU: BULBTEK VIỆT NAM\nSLOGAN: "An Toàn Hành Trình"\nTHÔNG ĐIỆP: "Trợ Thủ Đắc Lực Cho Bác Tài Việt"\n3 GIÁ TRỊ CỐT LÕI: BỀN BỈ – BỀN VỮNG – BẢO VỆ\nLINH VẬT: Robot BU (Thân thiện, hóm hỉnh, am hiểu kỹ thuật)\nTỶ LỆ NỘI DUNG: 70% Lý tính (kỹ thuật, bám đường) / 30% Cảm xúc (hành trình bác tài)\nBẢNG MÀU CHÍNH: ${primaryPalette.map(c => `${c.name} (${c.hex})`).join(' | ')}\nBẢNG MÀU PHỤ: ${secondaryPalette.map(c => `${c.name} (${c.hex})`).join(' | ')}\nHASHTAG FB: ${settings.brandGuideline.fbHashtags}\nHASHTAG TIKTOK: ${settings.brandGuideline.tiktokHashtags}`,
                'all_guidelines'
              )}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
            >
              {copiedKey === 'all_guidelines' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'all_guidelines' ? 'Đã sao chép Brand Guidelines!' : 'Sao chép Brand Guidelines'}</span>
            </button>

            <button
              onClick={handleDownloadBrandPdf}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold border border-slate-700 shadow-md transition group"
              title="Xuất tài liệu quy chuẩn thương hiệu Bulbtek khổ A4 dọc (gửi lưu hành nội bộ hoặc in ấn)"
            >
              <FileDown className="w-4 h-4 text-bulbtek-red group-hover:scale-110 transition-transform" />
              <span>Tải Báo Cáo PDF (Dọc A4)</span>
            </button>

            <button
              onClick={() => setActiveTab(8)}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition"
              title="Chuyển sang Tab Content Branding Planning ngoài menu chính"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Sáng Tạo Content Thương Hiệu ➔</span>
            </button>

            <button
              onClick={() => setActiveTab(1)}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
                isLight ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' : 'bg-[#121215] hover:bg-[#22222a] border-[#2F2F37] text-gray-200'
              }`}
            >
              <Car className="w-4 h-4 text-bulbtek-red" />
              <span>Xem Kho Dữ Liệu Sản Phẩm →</span>
            </button>
          </div>
        </div>

        {copiedKey === 'saved_success' && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã lưu cập nhật thông tin thương hiệu Bulbtek thành công!</span>
          </div>
        )}
      </div>

      {/* 🌟 PHẦN 1: TRIẾT LÝ "AN TOÀN HÀNH TRÌNH" — SỨ MỆNH BULBTEK */}
      <div className={`border rounded-2xl p-6 space-y-6 ${cardClass}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3 ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-red-600/15 text-bulbtek-red border border-bulbtek-red/30">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h2 className={`text-base font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                1. Triết Lý "{editedSec1.philosophyTitle}" — Sứ Mệnh Bulbtek
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Định vị cốt lõi giúp phân biệt Bulbtek với các thương hiệu độ đèn trôi nổi trên thị trường.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
              isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-950/60 text-red-300 border-red-800'
            }`}>
              Tôn Chỉ Số 1
            </span>

            {isAdmin && (
              <button
                type="button"
                onClick={handleToggleEditSec1}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingSec1 ? 'Đóng chỉnh sửa' : 'Chỉnh sửa Triết Lý & Sứ Mệnh (Admin)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* VIEW MODE: Section 1 */}
        {!isEditingSec1 ? (
          <>
            {/* 2 Main Hero Blocks: Triết lý & Sứ mệnh */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Card Triết Lý */}
              <div className={`p-5 rounded-2xl border relative overflow-hidden space-y-4 ${
                isLight 
                  ? 'bg-gradient-to-br from-red-50/70 via-white to-slate-50 border-red-200' 
                  : 'bg-gradient-to-br from-red-950/30 via-[#18181D] to-[#121215] border-red-900/40'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-bulbtek-red text-white flex items-center justify-center font-black text-lg shadow-glow-red">
                    🛡️
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-bulbtek-red block">Triết Lý Cốt Lõi</span>
                    <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      "{editedSec1.philosophyTitle}"
                    </h3>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                  {editedSec1.philosophyDesc}
                </p>

                <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                  isLight ? 'bg-white/80 border-slate-200 text-slate-700' : 'bg-black/40 border-[#2A2A32] text-gray-300'
                }`}>
                  {editedSec1.philosophyPoints.map((point) => (
                    <div key={point.id} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>{point.title}:</strong> {point.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Sứ Mệnh */}
              <div className={`p-5 rounded-2xl border relative overflow-hidden space-y-4 ${
                isLight 
                  ? 'bg-gradient-to-br from-slate-50 via-white to-blue-50/50 border-slate-200' 
                  : 'bg-gradient-to-br from-[#121215] via-[#18181D] to-blue-950/20 border-blue-900/30'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    🤝
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-blue-500 block">Sứ Mệnh Thương Hiệu</span>
                    <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      "{editedSec1.missionTitle}"
                    </h3>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                  {editedSec1.missionDesc}
                </p>

                <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                  isLight ? 'bg-white/80 border-slate-200 text-slate-700' : 'bg-black/40 border-[#2A2A32] text-gray-300'
                }`}>
                  {editedSec1.missionPoints.map((point) => (
                    <div key={point.id} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-bulbtek-red shrink-0 mt-1.5"></span>
                      <span><strong>{point.title}:</strong> {point.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 🌟 Cam kết 3 KHÔNG của Bulbtek */}
            <div className={`p-4 rounded-xl border ${innerCardClass}`}>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-bulbtek-red mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Nguyên Tắc Bắt Buộc Nhúng Vào Content AI ({editedSec1.threeNoRules.length} ĐIỀU):</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {editedSec1.threeNoRules.map((rule) => (
                  <div key={rule.id} className={`p-3 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-black/30 border-[#2F2F37]'}`}>
                    <strong className="text-red-500 block mb-1">{rule.title}</strong>
                    <span>{rule.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* EDIT MODE: Section 1 */
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/30 border-amber-800 text-amber-300'
            }`}>
              <span className="text-xs font-medium">
                ⚠️ Bạn đang ở chế độ Chỉnh Sửa Triết Lý, Sứ Mệnh & Quy Tắc Bắt Buộc. Mọi thay đổi sẽ được lưu và nhúng vào các bài viết do AI tạo.
              </span>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditingSec1(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveSec1}
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Triết Lý */}
              <div className={`p-5 rounded-2xl border space-y-4 ${innerCardClass}`}>
                <div className="flex items-center justify-between">
                  <strong className="text-xs uppercase tracking-wider text-bulbtek-red flex items-center space-x-1.5">
                    <span>🛡️ Chỉnh sửa Triết Lý</span>
                  </strong>
                  <button
                    type="button"
                    onClick={handleAddPhilosophyPoint}
                    className="text-xs text-bulbtek-red font-semibold hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm luận điểm</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">Tiêu đề Triết Lý:</label>
                  <input
                    type="text"
                    value={editedSec1.philosophyTitle}
                    onChange={(e) => setEditedSec1(prev => ({ ...prev, philosophyTitle: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-bold focus:outline-none focus:border-bulbtek-red ${
                      isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">Mô tả khái quát Triết Lý:</label>
                  <textarea
                    rows={3}
                    value={editedSec1.philosophyDesc}
                    onChange={(e) => setEditedSec1(prev => ({ ...prev, philosophyDesc: e.target.value }))}
                    className={`w-full p-2.5 rounded-lg border text-xs leading-relaxed focus:outline-none focus:border-bulbtek-red ${
                      isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                    }`}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-[11px] font-semibold">Các luận điểm chi tiết:</label>
                  {editedSec1.philosophyPoints.map((point) => (
                    <div key={point.id} className={`p-3 rounded-xl border space-y-2 relative ${
                      isLight ? 'bg-white border-slate-200' : 'bg-black/40 border-[#2F2F37]'
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={point.title}
                          onChange={(e) => handleUpdatePhilosophyPoint(point.id, 'title', e.target.value)}
                          placeholder="Tiêu đề luận điểm..."
                          className={`w-full px-2 py-1 rounded border text-xs font-bold focus:outline-none focus:border-bulbtek-red ${
                            isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#18181D] border-[#2F2F37]'
                          }`}
                        />
                        {editedSec1.philosophyPoints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePhilosophyPoint(point.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-500 transition"
                            title="Xóa luận điểm này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        value={point.desc}
                        onChange={(e) => handleUpdatePhilosophyPoint(point.id, 'desc', e.target.value)}
                        placeholder="Mô tả luận điểm..."
                        className={`w-full p-2 rounded border text-xs leading-relaxed focus:outline-none focus:border-bulbtek-red ${
                          isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#18181D] border-[#2F2F37]'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Sứ Mệnh */}
              <div className={`p-5 rounded-2xl border space-y-4 ${innerCardClass}`}>
                <div className="flex items-center justify-between">
                  <strong className="text-xs uppercase tracking-wider text-blue-500 flex items-center space-x-1.5">
                    <span>🤝 Chỉnh sửa Sứ Mệnh</span>
                  </strong>
                  <button
                    type="button"
                    onClick={handleAddMissionPoint}
                    className="text-xs text-blue-500 font-semibold hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm cam kết</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">Tiêu đề Sứ Mệnh:</label>
                  <input
                    type="text"
                    value={editedSec1.missionTitle}
                    onChange={(e) => setEditedSec1(prev => ({ ...prev, missionTitle: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-bold focus:outline-none focus:border-bulbtek-red ${
                      isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">Mô tả khái quát Sứ Mệnh:</label>
                  <textarea
                    rows={3}
                    value={editedSec1.missionDesc}
                    onChange={(e) => setEditedSec1(prev => ({ ...prev, missionDesc: e.target.value }))}
                    className={`w-full p-2.5 rounded-lg border text-xs leading-relaxed focus:outline-none focus:border-bulbtek-red ${
                      isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                    }`}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-[11px] font-semibold">Các cam kết phụng sự:</label>
                  {editedSec1.missionPoints.map((point) => (
                    <div key={point.id} className={`p-3 rounded-xl border space-y-2 relative ${
                      isLight ? 'bg-white border-slate-200' : 'bg-black/40 border-[#2F2F37]'
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={point.title}
                          onChange={(e) => handleUpdateMissionPoint(point.id, 'title', e.target.value)}
                          placeholder="Tiêu đề cam kết..."
                          className={`w-full px-2 py-1 rounded border text-xs font-bold focus:outline-none focus:border-bulbtek-red ${
                            isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#18181D] border-[#2F2F37]'
                          }`}
                        />
                        {editedSec1.missionPoints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMissionPoint(point.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-500 transition"
                            title="Xóa cam kết này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        value={point.desc}
                        onChange={(e) => handleUpdateMissionPoint(point.id, 'desc', e.target.value)}
                        placeholder="Mô tả cam kết..."
                        className={`w-full p-2 rounded border text-xs leading-relaxed focus:outline-none focus:border-bulbtek-red ${
                          isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#18181D] border-[#2F2F37]'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Quy tắc 3 KHÔNG */}
            <div className={`p-5 rounded-2xl border space-y-3 ${innerCardClass}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-bulbtek-red">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Chỉnh sửa các nguyên tắc "KHÔNG" bắt buộc:</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddThreeNoRule}
                  className="flex items-center space-x-1 text-xs text-bulbtek-red font-semibold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm điều KHÔNG mới</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                {editedSec1.threeNoRules.map((rule) => (
                  <div key={rule.id} className={`p-3.5 rounded-xl border space-y-2 relative ${
                    isLight ? 'bg-white border-slate-200' : 'bg-black/50 border-[#2F2F37]'
                  }`}>
                    <div className="flex items-center justify-between gap-1">
                      <input
                        type="text"
                        value={rule.title}
                        onChange={(e) => handleUpdateThreeNoRule(rule.id, 'title', e.target.value)}
                        placeholder="Ví dụ: 1. KHÔNG Chém Gió Ảo"
                        className={`w-full px-2 py-1 rounded border text-xs font-bold text-red-500 focus:outline-none focus:border-bulbtek-red ${
                          isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#18181D] border-[#2F2F37]'
                        }`}
                      />
                      {editedSec1.threeNoRules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveThreeNoRule(rule.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-500 transition shrink-0"
                          title="Xóa nguyên tắc này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={rule.desc}
                      onChange={(e) => handleUpdateThreeNoRule(rule.id, 'desc', e.target.value)}
                      placeholder="Nội dung chi tiết quy tắc..."
                      className={`w-full p-2 rounded border text-[11px] leading-relaxed focus:outline-none focus:border-bulbtek-red ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#18181D] border-[#2F2F37]'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveSec1}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
              >
                <Save className="w-4 h-4" />
                <span>Lưu toàn bộ Triết Lý & Sứ Mệnh</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 PHẦN 2: 3 GIÁ TRỊ CỐT LÕI (BỀN BỈ – BỀN VỮNG – BẢO VỆ) */}
      <div className={`border rounded-2xl p-6 space-y-6 ${cardClass}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3 ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-600/15 text-amber-500 border border-amber-500/30">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className={`text-base font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                2. {editedCoreValues.length} Giá Trị Cốt Lõi: {editedCoreValues.map(v => v.title).join(' – ')}
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Trụ cột nền móng xuất hiện xuyên suốt trong mọi ấn phẩm truyền thông, video và chiến dịch của thương hiệu.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
              isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-950/60 text-amber-300 border-amber-800'
            }`}>
              Core Values
            </span>

            {isAdmin && (
              <button
                type="button"
                onClick={handleToggleEditSec2}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingSec2 ? 'Đóng chỉnh sửa' : 'Chỉnh sửa Giá Trị Cốt Lõi (Admin)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* VIEW MODE: Section 2 */}
        {!isEditingSec2 ? (
          <div className={`grid grid-cols-1 md:grid-cols-${Math.min(editedCoreValues.length, 3)} gap-5`}>
            {editedCoreValues.map((val, idx) => (
              <div 
                key={val.id}
                className={`border rounded-2xl p-5 space-y-3 transition-all hover:scale-[1.01] ${
                  idx === 0 
                    ? (isLight ? 'bg-gradient-to-b from-red-50/50 to-white border-red-200 shadow-xs' : 'bg-gradient-to-b from-red-950/20 to-[#121215] border-red-900/30')
                    : idx === 1
                    ? (isLight ? 'bg-gradient-to-b from-amber-50/50 to-white border-amber-200 shadow-xs' : 'bg-gradient-to-b from-amber-950/20 to-[#121215] border-amber-900/30')
                    : (isLight ? 'bg-gradient-to-b from-emerald-50/50 to-white border-emerald-200 shadow-xs' : 'bg-gradient-to-b from-emerald-950/20 to-[#121215] border-emerald-900/30')
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-lg ${
                    idx === 0 
                      ? 'bg-bulbtek-red/20 text-bulbtek-red border-bulbtek-red/30'
                      : idx === 1
                      ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                  }`}>
                    {val.icon}
                  </span>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded text-white font-bold ${
                    idx === 0 ? 'bg-bulbtek-red' : idx === 1 ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}>
                    {val.subtitle || `Trụ Cột ${idx + 1}`}
                  </span>
                </div>

                <h3 className={`text-lg font-black tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {val.title}
                </h3>

                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                  {val.desc}
                </p>

                <ul className={`text-xs space-y-1.5 pt-2 border-t ${isLight ? 'border-slate-200 text-slate-700' : 'border-[#2A2A32] text-gray-300'}`}>
                  {val.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-center space-x-1.5">
                      <Check className={`w-3.5 h-3.5 shrink-0 ${
                        idx === 0 ? 'text-bulbtek-red' : idx === 1 ? 'text-amber-500' : 'text-emerald-500'
                      }`} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          /* EDIT MODE: Section 2 */
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/30 border-amber-800 text-amber-300'
            }`}>
              <span className="text-xs font-medium">
                ⚠️ Bạn đang chỉnh sửa các Trụ Cột Giá Trị Cốt Lõi. Bạn có thể sửa tên, emoji, thêm/bớt các gạch đầu dòng cam kết hoặc thêm trụ cột mới.
              </span>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAddCoreValuePillar}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#18181D] hover:bg-[#22222a] border-[#2F2F37] text-gray-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 text-amber-500" />
                  <span>Thêm trụ cột giá trị</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSec2(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveSec2}
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {editedCoreValues.map((val) => (
                <div 
                  key={val.id}
                  className={`p-5 rounded-2xl border space-y-4 relative ${innerCardClass}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={val.icon}
                        onChange={(e) => handleUpdateCoreValueField(val.id, 'icon', e.target.value)}
                        className={`w-10 h-10 text-center rounded-xl border text-base font-bold focus:outline-none focus:border-bulbtek-red ${
                          isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                        }`}
                        title="Biểu tượng Emoji"
                      />
                      <input
                        type="text"
                        value={val.subtitle}
                        onChange={(e) => handleUpdateCoreValueField(val.id, 'subtitle', e.target.value)}
                        placeholder="Trụ Cột 1"
                        className={`w-28 px-2 py-1 rounded border text-xs font-bold focus:outline-none focus:border-bulbtek-red ${
                          isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                        }`}
                      />
                    </div>

                    {editedCoreValues.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCoreValuePillar(val.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition border border-transparent hover:border-red-500/30"
                        title="Xóa trụ cột này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Tên Giá Trị Cốt Lõi:</label>
                    <input
                      type="text"
                      value={val.title}
                      onChange={(e) => handleUpdateCoreValueField(val.id, 'title', e.target.value)}
                      placeholder="Ví dụ: BỀN BỈ"
                      className={`w-full px-3 py-1.5 rounded-lg border text-sm font-black focus:outline-none focus:border-bulbtek-red ${
                        isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Mô tả khái quát:</label>
                    <textarea
                      rows={2}
                      value={val.desc}
                      onChange={(e) => handleUpdateCoreValueField(val.id, 'desc', e.target.value)}
                      placeholder="Mô tả ý nghĩa của giá trị này..."
                      className={`w-full p-2 rounded-lg border text-xs leading-relaxed focus:outline-none focus:border-bulbtek-red ${
                        isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                      }`}
                    />
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-[#2A2A32]">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        Danh sách cam kết & tiêu chuẩn:
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAddCoreValueBullet(val.id)}
                        className="text-[11px] text-bulbtek-red hover:underline flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm cam kết</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {val.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center space-x-1.5">
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => handleUpdateCoreValueBullet(val.id, bIdx, e.target.value)}
                            placeholder="Nội dung cam kết..."
                            className={`w-full px-2 py-1 rounded border text-xs focus:outline-none focus:border-bulbtek-red ${
                              isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                            }`}
                          />
                          {val.bullets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCoreValueBullet(val.id, bIdx)}
                              className="p-1 text-gray-400 hover:text-red-500 transition shrink-0"
                              title="Xóa cam kết này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveSec2}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
              >
                <Save className="w-4 h-4" />
                <span>Lưu toàn bộ 3 Giá Trị Cốt Lõi</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 PHẦN 3: LINH VẬT ROBOT BU (BRAND MASCOT) */}
      <div className={`border rounded-2xl p-6 space-y-6 ${cardClass}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3 ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cyan-600/15 text-cyan-500 border border-cyan-500/30">
              <Bot className="w-5 h-5" />
            </span>
            <div>
              <h2 className={`text-base font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                3. Linh Vật Robot BU — Đại Sứ Tăng Sáng Của Bác Tài
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Nhân cách hóa công nghệ đèn tăng sáng thành người bạn đồng hành ấm áp, hóm hỉnh và đáng tin cậy.
              </p>
            </div>
          </div>

          <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
            isLight ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
          }`}>
            Mascot Robot BU
          </span>
        </div>

        {/* Mascot Profile & Persona */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Col: Robot BU Identity Card */}
          <div className={`lg:col-span-5 p-5 rounded-2xl border space-y-4 ${innerCardClass}`}>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bulbtek-red via-red-700 to-black p-0.5 shadow-glow-red flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#121215] rounded-2xl flex flex-col items-center justify-center text-center">
                  <Bot className="w-8 h-8 text-bulbtek-red animate-pulse" />
                  <span className="text-[9px] font-black text-white font-mono tracking-tighter">BU BOT</span>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Robot BU</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-bulbtek-red text-white">Chính Thức</span>
                </div>
                <p className="text-xs text-bulbtek-red font-semibold">Trợ Thủ Đắc Lực Cho Bác Tài Việt</p>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Hình tượng: Robot công nghệ đèn tăng sáng</p>
              </div>
            </div>

            {/* Mascot Image Asset & Upload / Download Box */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-black/40 border-[#2A2A32]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>Hình Ảnh Linh Vật Robot BU</span>
                </span>
                {mascotImage ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/30">
                    ● Ảnh tùy chỉnh
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30">
                    ● Đồ họa 3D chuẩn
                  </span>
                )}
              </div>

              {/* Mascot Visual Frame */}
              <div className={`relative rounded-xl border overflow-hidden flex flex-col items-center justify-center p-3 transition-all min-h-[160px] ${
                isLight ? 'bg-gradient-to-b from-slate-100 to-white border-slate-200' : 'bg-gradient-to-b from-[#18181D] to-[#0D0D11] border-[#2F2F37]'
              }`}>
                {mascotImage ? (
                  <div className="relative group w-full flex flex-col items-center">
                    <img 
                      src={mascotImage} 
                      alt="Linh vật Robot BU Bulbtek" 
                      className="max-h-48 object-contain rounded-lg shadow-md transition-transform group-hover:scale-105" 
                    />
                    <span className="text-[10px] mt-2 font-mono text-gray-400">
                      Định dạng chuẩn nhận diện Robot BU
                    </span>
                  </div>
                ) : (
                  <div className="text-center space-y-2 py-2">
                    <div className="relative w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-bulbtek-red via-slate-900 to-cyan-900 border-2 border-cyan-500/40 flex items-center justify-center shadow-glow-red group">
                      <Bot className="w-10 h-10 text-cyan-400 animate-pulse" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-bulbtek-red text-white flex items-center justify-center text-[10px] font-black shadow">
                        ⚡
                      </div>
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        Robot BU • Trợ Thủ Bác Tài
                      </p>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        Nhấn nút bên dưới để tải ảnh linh vật mới lên hoặc tải về máy
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadMascotImage}
                accept="image/*"
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-sm"
                  title="Tải ảnh Robot BU (PNG, JPG, WebP, SVG - Tối đa 5MB)"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh lên</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadMascotImage}
                  className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition ${
                    isLight ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#18181D] hover:bg-[#25252c] border-[#2F2F37] text-gray-200'
                  }`}
                  title="Tải ảnh Robot BU về máy để sử dụng"
                >
                  <Download className="w-3.5 h-3.5 text-bulbtek-red" />
                  <span>Tải ảnh về máy</span>
                </button>
              </div>

              {mascotImage && (
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={handleResetMascotImage}
                    className="text-[11px] text-gray-400 hover:text-red-500 flex items-center space-x-1 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Khôi phục đồ họa mặc định</span>
                  </button>
                </div>
              )}

              {copiedKey === 'mascot_uploaded' && (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold animate-fadeIn">
                  ✓ Đã tải ảnh linh vật Robot BU lên thành công!
                </div>
              )}
              {copiedKey === 'mascot_downloaded' && (
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs text-center font-bold animate-fadeIn">
                  ✓ Đã xuất và tải file PNG linh vật Robot BU về máy!
                </div>
              )}
            </div>

            <div className={`p-3.5 rounded-xl border text-xs space-y-2 leading-relaxed ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-black/40 border-[#2A2A32] text-gray-300'
            }`}>
              <div>
                <strong className={isLight ? 'text-slate-900' : 'text-white'}>Tính cách:</strong> Chân thành, hóm hỉnh, am hiểu sâu về ô tô, luôn coi bác tài như người anh em trong nhà.
              </div>
              <div>
                <strong className={isLight ? 'text-slate-900' : 'text-white'}>Giọng điệu (Tone of Voice):</strong> Thân thiện, gần gũi kiểu cánh tài xế Việt ("Bác tài", "Xế cưng", "Ôm vô lăng", "Vạn dặm bình an"), không dùng thuật ngữ học thuật khó hiểu.
              </div>
              <div>
                <strong className={isLight ? 'text-slate-900' : 'text-white'}>Tỷ lệ phân bổ vàng:</strong> 
                <span className="font-bold text-bulbtek-red ml-1">70% Lý tính</span> (Thông số, kiểm định, bám đường) + 
                <span className="font-bold text-cyan-500 ml-1">30% Cảm xúc</span> (Hành trình, gia đình, tâm sự).
              </div>
            </div>

            {/* Prompt AI Image Generator for Robot BU */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${
              isLight ? 'bg-white border-slate-200' : 'bg-black/50 border-[#2F2F37]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-bulbtek-red flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Prompt AI Sinh Ảnh Robot BU:</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(robotBuPrompt, 'mascot_prompt')}
                  className="text-[10px] text-blue-500 hover:underline flex items-center space-x-1"
                >
                  {copiedKey === 'mascot_prompt' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'mascot_prompt' ? 'Đã copy!' : 'Copy prompt'}</span>
                </button>
              </div>

              <div className={`text-[10px] font-mono p-2 rounded-lg border max-h-24 overflow-y-auto leading-normal ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#121215] border-[#2A2A32] text-gray-400'
              }`}>
                {robotBuPrompt}
              </div>
            </div>
          </div>

          {/* Right Col: 4 Content Pillars of Robot BU */}
          <div className="lg:col-span-7 space-y-3">
            <span className={`text-xs font-bold uppercase tracking-wider block ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              Các Tuyến Nội Dung Sáng Tạo Cùng Robot BU:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mascotPillars.map((pillar, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveMascotAngle(idx)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    activeMascotAngle === idx
                      ? (isLight ? 'bg-red-50/70 border-bulbtek-red shadow-xs ring-1 ring-bulbtek-red' : 'bg-bulbtek-red/10 border-bulbtek-red shadow-glow-red')
                      : (isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-[#121215] border-[#2F2F37] hover:border-gray-600')
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${pillar.badgeColor}`}>
                      {pillar.tag}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">#0{idx + 1}</span>
                  </div>

                  <h4 className={`text-xs font-bold leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {pillar.title}
                  </h4>

                  <p className={`text-[11px] mt-1.5 line-clamp-2 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                    {pillar.description}
                  </p>

                  <div className={`mt-2.5 pt-2 border-t text-[10px] italic ${
                    isLight ? 'border-slate-100 text-bulbtek-red font-medium' : 'border-[#2F2F37] text-red-300'
                  }`}>
                    Góc bài AI: "{pillar.aiAngle}"
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Pillar Detail Preview */}
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121215] border-[#2A2A32] text-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <strong className={isLight ? 'text-slate-900' : 'text-white'}>
                  Ví dụ câu Hook mở đầu bài viết (Tuyến {activeMascotAngle + 1}):
                </strong>
                <button
                  type="button"
                  onClick={() => copyToClipboard(mascotPillars[activeMascotAngle].hookExample, `hook_${activeMascotAngle}`)}
                  className="text-xs text-bulbtek-red hover:underline flex items-center space-x-1"
                >
                  {copiedKey === `hook_${activeMascotAngle}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === `hook_${activeMascotAngle}` ? 'Đã copy!' : 'Copy câu hook'}</span>
                </button>
              </div>

              <div className={`p-3 rounded-lg border font-mono text-xs italic leading-relaxed ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-black/50 border-[#2F2F37] text-gray-300'
              }`}>
                "{mascotPillars[activeMascotAngle].hookExample}"
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🌟 PHẦN 4: BỘ QUY CHUẨN NHẬN DIỆN & KÊNH TRUYỀN THÔNG */}
      <div className={`border rounded-2xl p-6 space-y-6 ${cardClass}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3 ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-purple-600/15 text-purple-500 border border-purple-500/30">
              <Palette className="w-5 h-5" />
            </span>
            <div>
              <h2 className={`text-base font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                4. Bộ Quy Chuẩn Nhận Diện & Kênh Truyền Thông
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Bảng màu nhận diện chính, hệ màu phụ phối hợp quang học, bộ hashtag cố định và quy chuẩn kênh đăng bài.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
              isLight ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-950/60 text-purple-300 border-purple-800'
            }`}>
              Brand Kit & Palette
            </span>

            {isAdmin && (
              <button
                type="button"
                onClick={handleToggleEditSec4}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingSec4 ? 'Đóng chỉnh sửa' : 'Chỉnh sửa Bộ Quy Chuẩn (Admin)'}</span>
              </button>
            )}
          </div>
        </div>

        {copiedKey === 'saved_sec4' && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã lưu thành công bộ màu sắc nhận diện & kênh truyền thông Bulbtek!</span>
          </div>
        )}

        {/* 🌟 4.1 BẢNG MÀU NHẬN DIỆN CHÍNH (PRIMARY BRAND PALETTE) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-bold flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <ShieldCheck className="w-4 h-4 text-bulbtek-red" />
                <span>4.1. Bảng Màu Nhận Diện Chính (3 Màu Cốt Lõi)</span>
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Đỏ BULBTEK (nhiệt huyết & ánh sáng), Đen Titan (chiều sâu không gian buồng lái) và Trắng Tinh Khiết (luồng sáng thuần khiết).
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-bulbtek-red">
              Primary Palette
            </span>
          </div>

          {!isEditingSec4 ? (
            /* VIEW MODE: Primary Colors */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {primaryPalette.map((col) => (
                <div 
                  key={col.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all hover:scale-[1.01] ${innerCardClass}`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div 
                      className="w-14 h-14 rounded-xl shadow-md shrink-0 border relative flex items-center justify-center overflow-hidden" 
                      style={{ 
                        backgroundColor: col.hex,
                        borderColor: col.hex.toLowerCase() === '#ffffff' ? '#cbd5e1' : 'rgba(255,255,255,0.15)' 
                      }}
                    >
                      {col.hex.toLowerCase() === '#ffffff' && (
                        <span className="text-[10px] text-slate-400 font-mono font-bold">WHITE</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {col.name}
                        </span>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                          col.role.toLowerCase().includes('primary')
                            ? 'bg-red-500/10 text-bulbtek-red border-red-500/30'
                            : col.role.toLowerCase().includes('dark')
                            ? (isLight ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white/10 text-gray-300 border-white/20')
                            : (isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-white/10 text-gray-200 border-white/20')
                        }`}>
                          {col.role}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <strong className={`text-xs font-mono tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {col.hex}
                        </strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(col.hex, `color_${col.id}`)}
                          className="text-[10px] text-blue-500 hover:underline flex items-center space-x-1"
                        >
                          {copiedKey === `color_${col.id}` ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedKey === `color_${col.id}` ? 'Đã copy' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className={`text-[11px] leading-relaxed pt-2 border-t ${
                    isLight ? 'border-slate-200 text-slate-600' : 'border-[#2A2A32] text-gray-400'
                  }`}>
                    {col.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            /* EDIT MODE: Primary Colors */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {editedPrimaryColors.map((col, idx) => (
                <div 
                  key={col.id}
                  className={`p-4 rounded-xl border space-y-3 relative ${
                    isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-[#18181D] border-[#34343e]'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative group cursor-pointer shrink-0">
                      <div 
                        className="w-12 h-12 rounded-xl shadow border flex items-center justify-center relative overflow-hidden"
                        style={{ 
                          backgroundColor: col.hex,
                          borderColor: col.hex.toLowerCase() === '#ffffff' ? '#cbd5e1' : 'rgba(255,255,255,0.2)' 
                        }}
                      >
                        <input
                          type="color"
                          value={col.hex.startsWith('#') ? col.hex : `#${col.hex}`}
                          onChange={(e) => handleUpdatePrimaryColor(col.id, 'hex', e.target.value.toUpperCase())}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          title="Click để chọn màu"
                        />
                        <Pipette className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                          col.hex.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'
                        }`} />
                      </div>
                      <span className="text-[9px] text-center block text-gray-400 mt-0.5 font-mono">Đổi màu</span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                        Màu Chính #0{idx + 1}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-mono font-bold text-gray-400">HEX:</span>
                        <input
                          type="text"
                          value={col.hex}
                          onChange={(e) => handleUpdatePrimaryColor(col.id, 'hex', e.target.value)}
                          className={`w-full px-2 py-1 rounded border text-xs font-mono font-bold focus:outline-none focus:border-bulbtek-red ${
                            isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/60 border-[#2F2F37] text-white'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Tên màu:</label>
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => handleUpdatePrimaryColor(col.id, 'name', e.target.value)}
                        className={`w-full px-2 py-1 rounded border text-xs font-medium focus:outline-none focus:border-bulbtek-red ${
                          isLight ? 'bg-slate-50 border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Vai trò:</label>
                      <input
                        type="text"
                        value={col.role}
                        onChange={(e) => handleUpdatePrimaryColor(col.id, 'role', e.target.value)}
                        className={`w-full px-2 py-1 rounded border text-xs font-medium focus:outline-none focus:border-bulbtek-red ${
                          isLight ? 'bg-slate-50 border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Mô tả ứng dụng:</label>
                      <textarea
                        rows={2}
                        value={col.description}
                        onChange={(e) => handleUpdatePrimaryColor(col.id, 'description', e.target.value)}
                        className={`w-full p-1.5 rounded border text-[11px] leading-relaxed focus:outline-none focus:border-bulbtek-red ${
                          isLight ? 'bg-slate-50 border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🌟 4.2 BẢNG MÀU PHỤ PHỐI HỢP (SECONDARY PALETTE & PHÂN TÍCH QUANG HỌC) */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  4.2. Bảng Màu Phụ Phối Hợp Dựa Trên Màu Chính (Secondary Palette)
                </h3>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Hệ màu phụ bổ trợ được tính toán dựa trên tính năng thực chiến ngành đèn ô tô: phá sương 3000K, luồng laser, chip hợp kim nhôm tản nhiệt và cam kết an toàn.
              </p>
            </div>

            {isEditingSec4 && (
              <button
                type="button"
                onClick={handleAddSecondaryColor}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-bulbtek-red to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-bold shadow-glow-red transition self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm màu phụ mới</span>
              </button>
            )}
          </div>

          {!isEditingSec4 ? (
            /* VIEW MODE: Secondary Colors with In-depth Optical Analysis */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {secondaryPalette.map((col) => (
                <div 
                  key={col.id} 
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all hover:scale-[1.01] ${innerCardClass}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3.5">
                      <div 
                        className="w-14 h-14 rounded-xl shadow-md shrink-0 border relative flex items-center justify-center overflow-hidden" 
                        style={{ 
                          backgroundColor: col.hex,
                          borderColor: col.hex.toLowerCase() === '#ffffff' ? '#cbd5e1' : 'rgba(255,255,255,0.15)' 
                        }}
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {col.name}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/30 shrink-0">
                            {col.role}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <strong className={`text-xs font-mono tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {col.hex}
                          </strong>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(col.hex, `sec_color_${col.id}`)}
                            className="text-[10px] text-blue-500 hover:underline flex items-center space-x-1"
                          >
                            {copiedKey === `sec_color_${col.id}` ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedKey === `sec_color_${col.id}` ? 'Đã copy' : 'Copy'}</span>
                          </button>
                          {col.isCustom && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30 font-medium">
                              Tùy chỉnh
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                      {col.description}
                    </p>
                  </div>

                  {/* Optical & Automotive Analysis Block */}
                  {col.opticalAnalysis && (
                    <div className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                      isLight 
                        ? 'bg-amber-50/60 border-amber-200 text-amber-950' 
                        : 'bg-black/40 border-[#2F2F37] text-gray-300'
                    }`}>
                      <span className="font-bold text-bulbtek-red block mb-0.5">
                        🔬 Phân tích quang học & ứng dụng xe hơi:
                      </span>
                      <span>{col.opticalAnalysis}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* EDIT MODE: Secondary Colors */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editedSecondaryColors.map((col, idx) => (
                  <div 
                    key={col.id} 
                    className={`p-4 rounded-xl border space-y-3 relative ${
                      isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-[#18181D] border-[#34343e]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="relative group cursor-pointer shrink-0">
                          <div 
                            className="w-12 h-12 rounded-xl shadow border flex items-center justify-center relative overflow-hidden" 
                            style={{ 
                              backgroundColor: col.hex,
                              borderColor: col.hex.toLowerCase() === '#ffffff' ? '#cbd5e1' : 'rgba(255,255,255,0.2)' 
                            }}
                          >
                            <input
                              type="color"
                              value={col.hex.startsWith('#') ? col.hex : `#${col.hex}`}
                              onChange={(e) => handleUpdateSecondaryColor(col.id, 'hex', e.target.value.toUpperCase())}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              title="Nhấp để đổi màu"
                            />
                            <Pipette className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                              col.hex.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'
                            }`} />
                          </div>
                          <span className="text-[9px] text-center block text-gray-400 mt-0.5 font-mono">Đổi màu</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                            Màu Phụ #0{idx + 1}
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-mono font-bold text-gray-400">HEX:</span>
                            <input
                              type="text"
                              value={col.hex}
                              onChange={(e) => handleUpdateSecondaryColor(col.id, 'hex', e.target.value)}
                              className={`w-28 px-2 py-1 rounded border text-xs font-mono font-bold focus:outline-none focus:border-bulbtek-red ${
                                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/60 border-[#2F2F37] text-white'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {editedSecondaryColors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSecondaryColor(col.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition"
                          title="Xóa màu phụ này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Tên màu phụ:</label>
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) => handleUpdateSecondaryColor(col.id, 'name', e.target.value)}
                          className={`w-full px-2 py-1 rounded border text-xs font-medium focus:outline-none focus:border-bulbtek-red ${
                            isLight ? 'bg-slate-50 border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Vai trò / Phân loại:</label>
                        <input
                          type="text"
                          value={col.role}
                          onChange={(e) => handleUpdateSecondaryColor(col.id, 'role', e.target.value)}
                          className={`w-full px-2 py-1 rounded border text-xs font-medium focus:outline-none focus:border-bulbtek-red ${
                            isLight ? 'bg-slate-50 border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                          }`}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Mô tả ứng dụng:</label>
                        <input
                          type="text"
                          value={col.description}
                          onChange={(e) => handleUpdateSecondaryColor(col.id, 'description', e.target.value)}
                          className={`w-full px-2 py-1 rounded border text-xs focus:outline-none focus:border-bulbtek-red ${
                            isLight ? 'bg-slate-50 border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                          }`}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-bulbtek-red mb-0.5">
                          Phân tích quang học & tính năng ô tô:
                        </label>
                        <textarea
                          rows={2}
                          value={col.opticalAnalysis || ''}
                          onChange={(e) => handleUpdateSecondaryColor(col.id, 'opticalAnalysis', e.target.value)}
                          placeholder="Ví dụ: Bước sóng vàng 580nm phá sương đèo dốc hiểm trở, chống chói..."
                          className={`w-full p-1.5 rounded border text-[11px] leading-relaxed focus:outline-none focus:border-bulbtek-red ${
                            isLight ? 'bg-slate-50 border-slate-300' : 'bg-black/60 border-[#2F2F37]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleAddSecondaryColor}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl border border-dashed text-xs font-semibold transition ${
                    isLight 
                      ? 'border-slate-300 hover:border-bulbtek-red text-slate-700 hover:text-bulbtek-red bg-white' 
                      : 'border-[#383844] hover:border-bulbtek-red text-gray-300 hover:text-white bg-black/30'
                  }`}
                >
                  <Plus className="w-4 h-4 text-bulbtek-red" />
                  <span>+ Thêm màu phụ mới vào hệ thống</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 🌟 PRESET PALETTE QUICK BAR (15 MÀU ĐỀ XUẤT NGÀNH ĐÈN Ô TÔ) */}
        <div className={`p-4 rounded-xl border space-y-2 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2A2A32]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
              <Pipette className="w-3.5 h-3.5 text-bulbtek-red" />
              <span>Bảng màu đề xuất chuyên dụng ngành tăng sáng & nhận diện (Click mã để copy):</span>
            </span>
            <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
              15 mã màu quang học ô tô
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {PRESET_BRAND_COLORS.map((preset, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => copyToClipboard(preset.hex, `preset_${pIdx}`)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs transition group ${
                  isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/40 hover:bg-black/60 border-[#2F2F37] text-gray-300'
                }`}
                title={`${preset.name}: ${preset.hex} - ${preset.desc}`}
              >
                <span 
                  className="w-3.5 h-3.5 rounded-full border shadow-xs shrink-0" 
                  style={{ 
                    backgroundColor: preset.hex,
                    borderColor: preset.hex.toLowerCase() === '#ffffff' ? '#94a3b8' : 'rgba(255,255,255,0.2)'
                  }} 
                />
                <span className="font-medium text-[11px]">{preset.name}</span>
                <span className="text-[10px] font-mono text-gray-400 group-hover:text-bulbtek-red">{preset.hex}</span>
                {copiedKey === `preset_${pIdx}` && (
                  <Check className="w-3 h-3 text-emerald-500 ml-0.5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 🌟 4.3 CHANNELS & HASHTAGS MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Facebook Guidelines */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            isLight ? 'bg-blue-50/40 border-blue-200' : 'bg-blue-950/20 border-blue-900/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>Kênh Facebook (16 bài / tháng)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/15 text-blue-600 font-bold">
                T2, T4, T6, T7
              </span>
            </div>

            <p className={isLight ? 'text-slate-600' : 'text-gray-300'}>
              Định dạng: Hình ảnh album, infographic thông số, bài viết chia sẻ kỹ thuật và minigame gắn kết cộng đồng bác tài.
            </p>

            <div className={`p-3 rounded-xl border space-y-1.5 ${
              isLight ? 'bg-white border-blue-200 text-slate-800' : 'bg-black/40 border-[#2A2A32] text-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-600">Bộ Hashtag Cố Định Facebook:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.brandGuideline.fbHashtags, 'fb_tags')}
                  className="text-[11px] text-blue-600 hover:underline flex items-center space-x-1"
                >
                  {copiedKey === 'fb_tags' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'fb_tags' ? 'Đã copy!' : 'Copy'}</span>
                </button>
              </div>

              {isEditingSec4 ? (
                <input
                  type="text"
                  value={editedFbHashtags}
                  onChange={(e) => setEditedFbHashtags(e.target.value)}
                  className={`w-full p-2 rounded-lg border text-xs font-mono font-bold focus:outline-none focus:border-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/60 border-[#2F2F37] text-white'
                  }`}
                />
              ) : (
                <div className="font-mono font-bold text-bulbtek-red text-xs">
                  {settings.brandGuideline.fbHashtags}
                </div>
              )}
            </div>
          </div>

          {/* TikTok Guidelines */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            isLight ? 'bg-teal-50/40 border-teal-200' : 'bg-teal-950/20 border-teal-900/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-teal-600">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                <span>Kênh TikTok (10 bài / tháng)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-600/15 text-teal-600 font-bold">
                T3, T5, CN
              </span>
            </div>

            <p className={isLight ? 'text-slate-600' : 'text-gray-300'}>
              Định dạng: Video dọc 9:16 (15s – 45s), so sánh ánh sáng thực tế trước & sau, lồng ghép nhân vật Robot BU.
            </p>

            <div className={`p-3 rounded-xl border space-y-1.5 ${
              isLight ? 'bg-white border-teal-200 text-slate-800' : 'bg-black/40 border-[#2A2A32] text-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-teal-600">Bộ Hashtag Cố Định TikTok:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.brandGuideline.tiktokHashtags, 'tiktok_tags')}
                  className="text-[11px] text-teal-600 hover:underline flex items-center space-x-1"
                >
                  {copiedKey === 'tiktok_tags' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'tiktok_tags' ? 'Đã copy!' : 'Copy'}</span>
                </button>
              </div>

              {isEditingSec4 ? (
                <input
                  type="text"
                  value={editedTiktokHashtags}
                  onChange={(e) => setEditedTiktokHashtags(e.target.value)}
                  className={`w-full p-2 rounded-lg border text-xs font-mono font-bold focus:outline-none focus:border-teal-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/60 border-[#2F2F37] text-white'
                  }`}
                />
              ) : (
                <div className="font-mono font-bold text-teal-700 dark:text-teal-400 text-xs">
                  {settings.brandGuideline.tiktokHashtags}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Row when Editing Section 4 */}
        {isEditingSec4 && (
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/30 border-amber-800'
          }`}>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
                ⚠️ Bạn đang chỉnh sửa bộ quy chuẩn thương hiệu trực tiếp cho toàn hệ thống AI.
              </span>
              <button
                type="button"
                onClick={handleResetDefaultColors}
                className="text-[11px] text-bulbtek-red hover:underline ml-2"
              >
                (Khôi phục mặc định)
              </button>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditingSec4(false)}
                className={`px-3 py-1.5 rounded-lg text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveSec4}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu toàn bộ Phần 4</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 PHẦN 5: BRAND TYPOGRAPHY GUIDELINES */}
      <div className={`border rounded-2xl p-6 space-y-6 ${cardClass}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3 ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-600/15 text-indigo-500 border border-indigo-500/30">
              <Type className="w-5 h-5" />
            </span>
            <div>
              <h2 className={`text-base font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                5. Brand Typography Guidelines (Quy Chuẩn Kiểu Chữ Thương Hiệu)
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Hệ thống 3 bộ phông chữ tiêu chuẩn cho tiêu đề, nội dung và bảng thông số kỹ thuật quang học Bulbtek.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
              isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-950/60 text-indigo-300 border-indigo-800'
            }`}>
              Brand Typography
            </span>

            {isAdmin && (
              <button
                type="button"
                onClick={handleToggleEditSec5}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingSec5 ? 'Đóng chỉnh sửa' : 'Chỉnh sửa Typography (Admin)'}</span>
              </button>
            )}
          </div>
        </div>

        {copiedKey === 'saved_sec5' && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã lưu thành công quy chuẩn Typography thương hiệu!</span>
          </div>
        )}

        {/* 🌟 5.1 THREE CORE FONT FAMILIES CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Headline Font */}
          <div className={`p-5 rounded-2xl border space-y-3 transition-all hover:scale-[1.01] ${innerCardClass}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-bulbtek-red text-white">
                Headline / Display
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(`font-family: '${currentTypography.headlineFont}', sans-serif;`, 'css_headline')}
                className="text-[10px] text-blue-500 hover:underline flex items-center space-x-1"
                title="Sao chép CSS font-family"
              >
                {copiedKey === 'css_headline' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'css_headline' ? 'Đã copy CSS' : 'Copy CSS'}</span>
              </button>
            </div>

            <div>
              <h3 className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {currentTypography.headlineFont}
              </h3>
              <p className="text-xs text-bulbtek-red font-semibold">Phông Chữ Tiêu Đề & Slogan</p>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
              {currentTypography.headlineUsage}
            </p>

            <div className={`p-3 rounded-xl border space-y-1.5 text-xs ${
              isLight ? 'bg-white border-slate-200' : 'bg-black/40 border-[#2A2A32]'
            }`}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Trọng số (Weights):</span>
                <span className="font-mono font-bold text-bulbtek-red">{currentTypography.headlineWeights.join(', ')}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Đặc tính:</span>
                <span className={isLight ? 'text-slate-800' : 'text-gray-200'}>Sans-serif thể thao, uy lực</span>
              </div>
              <div className="pt-1 border-t border-slate-100 dark:border-[#2F2F37]">
                <span className="text-[10px] text-gray-400 block mb-0.5">Hiển thị mẫu:</span>
                <p className="text-sm font-black tracking-tight text-bulbtek-red" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  AN TOÀN HÀNH TRÌNH 2026
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Body Font */}
          <div className={`p-5 rounded-2xl border space-y-3 transition-all hover:scale-[1.01] ${innerCardClass}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-600 text-white">
                Body / Editorial
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(`font-family: '${currentTypography.bodyFont}', sans-serif;`, 'css_body')}
                className="text-[10px] text-blue-500 hover:underline flex items-center space-x-1"
                title="Sao chép CSS font-family"
              >
                {copiedKey === 'css_body' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'css_body' ? 'Đã copy CSS' : 'Copy CSS'}</span>
              </button>
            </div>

            <div>
              <h3 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`} style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                {currentTypography.bodyFont}
              </h3>
              <p className="text-xs text-blue-500 font-semibold">Phông Chữ Nội Dung & Bài Viết</p>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
              {currentTypography.bodyUsage}
            </p>

            <div className={`p-3 rounded-xl border space-y-1.5 text-xs ${
              isLight ? 'bg-white border-slate-200' : 'bg-black/40 border-[#2A2A32]'
            }`}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Trọng số (Weights):</span>
                <span className="font-mono font-bold text-blue-500">{currentTypography.bodyWeights.join(', ')}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Đặc tính:</span>
                <span className={isLight ? 'text-slate-800' : 'text-gray-200'}>Chuẩn Việt, tối ưu di động</span>
              </div>
              <div className="pt-1 border-t border-slate-100 dark:border-[#2F2F37]">
                <span className="text-[10px] text-gray-400 block mb-0.5">Hiển thị mẫu:</span>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-800' : 'text-gray-200'}`} style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                  Trợ thủ đắc lực cùng bác tài ôm vô lăng xuyên màn đêm mưa bão.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Monospace Specs Font */}
          <div className={`p-5 rounded-2xl border space-y-3 transition-all hover:scale-[1.01] ${innerCardClass}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                Technical Specs / Mono
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(`font-family: '${currentTypography.codeFont}', monospace;`, 'css_code')}
                className="text-[10px] text-blue-500 hover:underline flex items-center space-x-1"
                title="Sao chép CSS font-family"
              >
                {copiedKey === 'css_code' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'css_code' ? 'Đã copy CSS' : 'Copy CSS'}</span>
              </button>
            </div>

            <div>
              <h3 className={`text-2xl font-black font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {currentTypography.codeFont}
              </h3>
              <p className="text-xs text-emerald-500 font-semibold">Phông Thông Số & Dữ Liệu Kỹ Thuật</p>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
              {currentTypography.codeUsage}
            </p>

            <div className={`p-3 rounded-xl border space-y-1.5 text-xs ${
              isLight ? 'bg-white border-slate-200' : 'bg-black/40 border-[#2A2A32]'
            }`}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Trọng số (Weights):</span>
                <span className="font-mono font-bold text-emerald-500">{currentTypography.codeWeights.join(', ')}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Đặc tính:</span>
                <span className={isLight ? 'text-slate-800' : 'text-gray-200'}>Monospace đơn cách chính xác</span>
              </div>
              <div className="pt-1 border-t border-slate-100 dark:border-[#2F2F37]">
                <span className="text-[10px] text-gray-400 block mb-0.5">Hiển thị mẫu:</span>
                <p className="text-xs font-mono font-bold text-cyan-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  65W • 12,000 LM • 5500K • IP68
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 5.2 TYPE HIERARCHY MATRIX */}
        <div className={`p-5 rounded-2xl border space-y-3 ${innerCardClass}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center space-x-1.5">
              <Layers className="w-4 h-4" />
              <span>Bảng Phân Cấp Kích Cỡ & Trọng Số Kiểu Chữ (Type Hierarchy Matrix):</span>
            </span>
            <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Áp dụng cho ấn phẩm Social, Website & Video Thumbnail
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[11px] uppercase tracking-wider ${isLight ? 'border-slate-200 text-slate-500' : 'border-[#2A2A32] text-gray-400'}`}>
                  <th className="py-2.5 px-3">Cấp bậc (Level)</th>
                  <th className="py-2.5 px-3">Kích thước</th>
                  <th className="py-2.5 px-3">Trọng số</th>
                  <th className="py-2.5 px-3">Phông chữ</th>
                  <th className="py-2.5 px-3">Minh họa thực tế</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#24242c]">
                {currentTypography.fontHierarchy.map((tier, tIdx) => (
                  <tr key={tIdx} className={isLight ? 'hover:bg-slate-50/50' : 'hover:bg-white/[0.02]'}>
                    <td className="py-3 px-3 font-bold text-bulbtek-red whitespace-nowrap">
                      {tier.level}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">
                      {tier.size}
                    </td>
                    <td className="py-3 px-3 text-gray-400 whitespace-nowrap">
                      {tier.weight}
                    </td>
                    <td className="py-3 px-3 font-semibold whitespace-nowrap">
                      {tier.fontFamily}
                    </td>
                    <td className="py-3 px-3">
                      <span className={
                        tIdx === 0 
                          ? 'text-lg font-black text-bulbtek-red' 
                          : tIdx === 1 
                          ? 'text-base font-bold' 
                          : tIdx === 2
                          ? 'text-sm font-semibold'
                          : tIdx === 3
                          ? 'text-xs'
                          : 'font-mono text-xs font-bold text-emerald-500'
                      }>
                        {tier.example}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🌟 5.3 LIVE INTERACTIVE TYPE TESTER */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 border-indigo-200' : 'bg-gradient-to-br from-indigo-950/20 via-[#18181D] to-[#121215] border-indigo-900/40'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center space-x-1.5">
                <Sliders className="w-4 h-4" />
                <span>Trải Nghiệm Trực Quan Kiểu Chữ (Live Type Tester):</span>
              </span>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Nhập câu slogan hoặc nội dung bất kỳ để kiểm tra hiển thị đồng thời trên cả 3 phông chữ chuẩn Bulbtek.
              </p>
            </div>

            {/* Quick Slogan Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTypeTesterText('BULBTEK — AN TOÀN HÀNH TRÌNH, TRỢ THỦ ĐẮC LỰC CHO BÁC TÀI VIỆT')}
                className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition ${
                  isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-black/40 hover:bg-black/60 border-[#2F2F37] text-gray-300'
                }`}
              >
                Slogan Thương Hiệu
              </button>
              <button
                type="button"
                onClick={() => setTypeTesterText('ROBOT BU: ĐÊM QUA ĐÈO SƯƠNG MÙ Ô QUY HỒ BÁC TÀI VẪN VỮNG TAY LÁI')}
                className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition ${
                  isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-black/40 hover:bg-black/60 border-[#2F2F37] text-gray-300'
                }`}
              >
                Robot BU Story
              </button>
              <button
                type="button"
                onClick={() => setTypeTesterText('BI GẦM FOG LIGHT: 55W • 9,800 LUMENS • 3000K VÀNG PHÁ SƯƠNG • CHIP OSRAM')}
                className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition ${
                  isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-black/40 hover:bg-black/60 border-[#2F2F37] text-gray-300'
                }`}
              >
                Thông Số Kỹ Thuật
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              value={typeTesterText}
              onChange={(e) => setTypeTesterText(e.target.value)}
              placeholder="Nhập câu thử nghiệm kiểu chữ..."
              className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-indigo-500 shadow-inner ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/60 border-[#2F2F37] text-white'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2A2A32]'}`}>
              <span className="text-[10px] font-mono text-bulbtek-red font-bold uppercase">1. Montserrat (Headline 800)</span>
              <p className={`text-sm font-extrabold leading-snug break-words ${isLight ? 'text-slate-900' : 'text-white'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {typeTesterText || 'Nhập nội dung để kiểm tra...'}
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2A2A32]'}`}>
              <span className="text-[10px] font-mono text-blue-500 font-bold uppercase">2. Be Vietnam Pro (Body 500)</span>
              <p className={`text-xs font-medium leading-relaxed break-words ${isLight ? 'text-slate-800' : 'text-gray-200'}`} style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                {typeTesterText || 'Nhập nội dung để kiểm tra...'}
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2A2A32]'}`}>
              <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase">3. JetBrains Mono (Specs 700)</span>
              <p className="text-xs font-mono font-bold leading-relaxed break-words text-cyan-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {typeTesterText || 'Nhập nội dung để kiểm tra...'}
              </p>
            </div>
          </div>
        </div>

        {/* 🌟 5.4 EDIT MODE FOR TYPOGRAPHY (ADMIN ONLY) */}
        {isEditingSec5 && (
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/30 border-amber-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 flex items-center space-x-1.5">
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh Sửa Bộ Quy Chuẩn Typography:</span>
              </span>
              <button
                type="button"
                onClick={() => setEditedTypography(INITIAL_TYPOGRAPHY)}
                className="text-[11px] text-bulbtek-red hover:underline"
              >
                (Khôi phục mặc định ban đầu)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-bulbtek-red">Headline Font:</label>
                <input
                  type="text"
                  value={editedTypography.headlineFont}
                  onChange={(e) => handleUpdateTypographyField('headlineFont', e.target.value)}
                  className={`w-full p-2 rounded border font-bold ${isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'}`}
                />
                <label className="block text-[11px] text-gray-400">Mô tả ứng dụng:</label>
                <textarea
                  rows={2}
                  value={editedTypography.headlineUsage}
                  onChange={(e) => handleUpdateTypographyField('headlineUsage', e.target.value)}
                  className={`w-full p-2 rounded border text-[11px] ${isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-blue-500">Body Font:</label>
                <input
                  type="text"
                  value={editedTypography.bodyFont}
                  onChange={(e) => handleUpdateTypographyField('bodyFont', e.target.value)}
                  className={`w-full p-2 rounded border font-bold ${isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'}`}
                />
                <label className="block text-[11px] text-gray-400">Mô tả ứng dụng:</label>
                <textarea
                  rows={2}
                  value={editedTypography.bodyUsage}
                  onChange={(e) => handleUpdateTypographyField('bodyUsage', e.target.value)}
                  className={`w-full p-2 rounded border text-[11px] ${isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-emerald-500">Technical Specs Font:</label>
                <input
                  type="text"
                  value={editedTypography.codeFont}
                  onChange={(e) => handleUpdateTypographyField('codeFont', e.target.value)}
                  className={`w-full p-2 rounded border font-bold ${isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'}`}
                />
                <label className="block text-[11px] text-gray-400">Mô tả ứng dụng:</label>
                <textarea
                  rows={2}
                  value={editedTypography.codeUsage}
                  onChange={(e) => handleUpdateTypographyField('codeUsage', e.target.value)}
                  className={`w-full p-2 rounded border text-[11px] ${isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-[#2F2F37]'}`}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-amber-200 dark:border-amber-800">
              <button
                type="button"
                onClick={() => setIsEditingSec5(false)}
                className={`px-3 py-1.5 rounded-lg text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveSec5}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu toàn bộ Typography</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
