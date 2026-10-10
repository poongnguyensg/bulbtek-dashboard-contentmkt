import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductLine, ProductStatus, TargetAudience, SuitableVehicle, ProductSegment, ProductStage } from '../../types';
import { 
  Database,
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  Tag, 
  SlidersHorizontal,
  Trash2,
  Sparkles,
  Info,
  Car,
  FileSpreadsheet,
  Download,
  Upload,
  Image as ImageIcon,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { BulkProductImportModal } from '../modals/BulkProductImportModal';
import { AiProductImportModal } from '../modals/AiProductImportModal';
import { downloadTemplateExcel, exportProductsToExcel } from '../../services/productImportService';
import { uploadImageFile } from '../../services/api';

const PRODUCT_LINES: ProductLine[] = [
  'Bi LED',
  'Bi LASER',
  'Bi Gầm',
  'Bóng LED',
  'Bi LED Mini',
  'Trợ Sáng'
];

const STATUS_OPTIONS: ProductStatus[] = [
  'Hero Product',
  'Sản phẩm hiện hữu',
  'Sản phẩm mới',
  'Clearance'
];

export const Tab1Products: React.FC = () => {
  const { products, selectedProduct, setSelectedProduct, saveProduct, bulkAddProducts, deleteProduct, setActiveTab, setBriefPrefillItem, theme } = useApp();
  const isLight = theme === 'light';
  
  const [selectedLineFilter, setSelectedLineFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showBulkImportModal, setShowBulkImportModal] = useState<boolean>(false);
  const [showAiImportModal, setShowAiImportModal] = useState<boolean>(false);
  const [bulkImportNotification, setBulkImportNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Backup & Restore Ref & Handlers
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportProductsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Bulbtek_Products_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSaveMessage('💾 Đã xuất file sao lưu toàn bộ danh sách sản phẩm thành công!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleImportProductsJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported) && imported.length > 0) {
          const res = bulkAddProducts(imported, true);
          setBulkImportNotification({
            message: `🎉 Đã khôi phục thành công ${res.added + res.updated} sản phẩm từ file sao lưu!`,
            type: 'success'
          });
          setTimeout(() => setBulkImportNotification(null), 6000);
        } else {
          alert('Tệp JSON không chứa danh sách sản phẩm hợp lệ!');
        }
      } catch (err) {
        alert('Lỗi đọc tệp JSON sao lưu. Vui lòng kiểm tra lại cấu trúc file!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>(
    selectedProduct || {
      name: '',
      productLine: 'Bi LED',
      sku: '',
      status: 'Sản phẩm mới',
      retailPrice: '',
      suitableFor: 'Xe ô tô',
      targetAudience: 'Cả hai',
      segment: 'Mid',
      specs: {},
      coreBenefit: '',
      stage: 'Growth',
      internalNotes: ''
    }
  );

  // Update form when selectedProduct changes
  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setFormData(prod);
    setIsEditing(false);
    setSaveMessage(null);
  };

  const handleAddNew = () => {
    const newProduct: Partial<Product> = {
      id: `prod-${Date.now()}`,
      name: '',
      productLine: 'Bi LED',
      sku: `BTK-${Date.now().toString().slice(-4)}`,
      status: 'Sản phẩm mới',
      retailPrice: '',
      suitableFor: 'Xe ô tô',
      targetAudience: 'Cả hai',
      segment: 'Mid',
      specs: {
        chipLed: '',
        colorTemp: '',
        brightness: '',
        power: '',
        voltage: '12V',
        lifespan: '50.000 giờ',
        warranty: '2 năm',
        compatibility: '',
        specialFeatures: '',
        sizeInch: '',
        waterproof: ''
      },
      coreBenefit: '',
      stage: 'Launch',
      internalNotes: '',
      imageUrl: '',
      isHidden: false
    };
    setSelectedProduct(null);
    setFormData(newProduct);
    setIsEditing(true);
    setSaveMessage(null);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Hàm tự động nén ảnh xuống dưới 50KB để không bao giờ bị tràn dung lượng LocalStorage (5MB)
  const compressImageFile = (file: File, maxWidth = 600, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleApplyAiProductToForm = (prod: Partial<Product>) => {
    setFormData(prod);
    setIsEditing(true);
    setSaveMessage('✨ Đã điền thông số sản phẩm từ AI vào form! Bạn có thể kiểm tra và bấm "Lưu sản phẩm".');
    setTimeout(() => setSaveMessage(null), 5000);
  };

  const handleSaveAiProductDirectly = (prod: Product) => {
    saveProduct(prod);
    handleSelectProduct(prod);
    setBulkImportNotification({
      message: `🎉 Đã thêm sản phẩm "${prod.name}" (${prod.sku}) từ AI vào kho thành công!`,
      type: 'success'
    });
    setTimeout(() => setBulkImportNotification(null), 6000);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn đúng tệp định dạng hình ảnh (PNG, JPG, WEBP, GIF)!');
      return;
    }

    try {
      setSaveMessage('⏳ Đang xử lý và tải ảnh lên server...');
      try {
        // 1. Tải file vật lý lên server/uploads qua Backend API
        const uploadedUrl = await uploadImageFile(file);
        handleInputChange('imageUrl', uploadedUrl);
        setSaveMessage('📸 Đã lưu ảnh sản phẩm vào thư mục server/uploads thành công!');
      } catch (uploadErr) {
        console.warn('Backend upload chưa sẵn sàng, dùng giải pháp nén ảnh canvas dự phòng:', uploadErr);
        // 2. Dự phòng: nén ảnh canvas base64 siêu nhẹ (< 50KB)
        const compressedDataUrl = await compressImageFile(file, 600, 0.7);
        handleInputChange('imageUrl', compressedDataUrl);
        setSaveMessage('📸 Đã nén và lưu ảnh sản phẩm (chế độ dự phòng)!');
      }
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err) {
      alert('Không thể xử lý tệp ảnh này. Vui lòng thử lại với một ảnh khác!');
    }
    e.target.value = '';
  };

  const handleDeleteProduct = (prod: { id?: string; name?: string; sku?: string }) => {
    if (!prod.id) return;
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa sản phẩm "${prod.name || 'này'}" ${prod.sku ? `(${prod.sku})` : ''} khỏi hệ thống không?\n\nSản phẩm này sẽ bị gỡ bỏ khỏi kho cấu hình và không xuất hiện trong các kế hoạch content.`
    );
    if (confirmDelete) {
      deleteProduct(prod.id);
      setBulkImportNotification({
        message: `🗑️ Đã xóa sản phẩm "${prod.name || prod.sku}" khỏi hệ thống thành công!`,
        type: 'info'
      });
      setTimeout(() => setBulkImportNotification(null), 5000);

      if (selectedProduct?.id === prod.id || formData.id === prod.id) {
        const remaining = products.filter(p => p.id !== prod.id);
        if (remaining.length > 0) {
          handleSelectProduct(remaining[0]);
        } else {
          handleAddNew();
        }
      }
    }
  };

  const handleToggleHideProduct = (prod: Product) => {
    const nextHidden = !prod.isHidden;
    const updated: Product = {
      ...prod,
      isHidden: nextHidden,
      updatedAt: new Date().toISOString()
    };
    saveProduct(updated);
    if (selectedProduct?.id === prod.id) {
      setSelectedProduct(updated);
      setFormData(prev => ({ ...prev, isHidden: nextHidden }));
    }
    setSaveMessage(
      nextHidden 
        ? `👁️‍🗨️ Đã ẩn "${prod.name}" khỏi Lập kế hoạch & content!` 
        : `👁️ Đã hiển thị lại "${prod.name}" trong Lập kế hoạch & content!`
    );
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsEditing(true);
  };

  const handleSpecChange = (specKey: keyof Product['specs'], value: string) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [specKey]: value
      }
    }));
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }
    if (!formData.productLine) {
      alert('Vui lòng chọn Product line!');
      return;
    }
    if (!formData.coreBenefit?.trim()) {
      alert('Vui lòng nhập Core benefit (Lợi ích chính)!');
      return;
    }

    const finalProduct: Product = {
      id: formData.id || `prod-${Date.now()}`,
      name: formData.name.trim(),
      productLine: formData.productLine as ProductLine,
      sku: formData.sku?.trim() || `BTK-${Date.now().toString().slice(-4)}`,
      status: (formData.status as ProductStatus) || 'Sản phẩm mới',
      retailPrice: formData.retailPrice || '',
      suitableFor: (formData.suitableFor as SuitableVehicle) || 'Xe ô tô',
      targetAudience: (formData.targetAudience as TargetAudience) || 'Cả hai',
      segment: (formData.segment as ProductSegment) || 'Mid',
      specs: formData.specs || {},
      coreBenefit: formData.coreBenefit.trim(),
      stage: (formData.stage as ProductStage) || 'Growth',
      internalNotes: formData.internalNotes || '',
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80',
      isHidden: Boolean(formData.isHidden),
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveProduct(finalProduct);
    setSaveMessage('✅ Đã lưu thông tin sản phẩm thành công vào hệ thống!');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesLine = selectedLineFilter === 'ALL' || p.productLine === selectedLineFilter;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.coreBenefit.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLine && matchesSearch;
  });

  // Check specs completeness for AI readiness
  const isReadyForAI = Boolean(formData.name && formData.productLine && formData.coreBenefit);
  const specCount = formData.specs ? Object.values(formData.specs).filter(v => Boolean(v && v.trim())).length : 0;
  const isSpecsWeak = specCount < 2;

  const getStatusBadgeColor = (status: ProductStatus) => {
    switch (status) {
      case 'Hero Product':
        return isLight 
          ? 'bg-red-50 text-red-700 border-red-200' 
          : 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'Sản phẩm mới':
        return isLight 
          ? 'bg-blue-50 text-blue-700 border-blue-200' 
          : 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Sản phẩm hiện hữu':
        return isLight 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'Clearance':
        return isLight 
          ? 'bg-slate-100 text-slate-600 border-slate-200' 
          : 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const cardClass = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#18181D] border-[#2A2A32] shadow-xl';
  const inputClass = isLight 
    ? 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-bulbtek-red focus:bg-white placeholder-slate-400 transition' 
    : 'w-full bg-[#121215] border border-[#2F2F37] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-bulbtek-red placeholder-gray-500 transition';
  const labelClass = isLight ? 'block text-xs font-semibold text-slate-700 mb-1' : 'block text-xs font-semibold text-gray-300 mb-1';

  return (
    <div className="space-y-6">
      
      {/* Top Banner Context */}
      <div className={`border rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#18181D] border-[#2A2A32] shadow-lg'
      }`}>
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-bulbtek-red/10 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`p-2 rounded-xl border ${
                isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-bulbtek-red/20 text-red-400 border-bulbtek-red/30'
              }`}>
                <Database className="w-5 h-5" />
              </span>
              <h1 className={`text-xl font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Cấu hình sản phẩm (Product Configuration)
              </h1>
            </div>
            <p className={`text-sm mt-1 max-w-2xl ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Quản lý và cấu hình toàn bộ danh mục sản phẩm đèn tăng sáng ô tô BULBTEK. Dữ liệu kỹ thuật chuẩn xác và duy nhất để AI trích xuất thông số, tuân thủ nguyên tắc không bịa đặt.
            </p>
          </div>

          {/* Phần Thương hiệu Bulbtek nằm 1 góc bên phải */}
          <div className="shrink-0 flex items-center">
            <button
              onClick={() => setActiveTab(2)}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all group shadow-sm ${
                isLight 
                  ? 'bg-gradient-to-r from-red-50 to-white hover:bg-red-100/70 border-red-200 text-slate-800 hover:border-bulbtek-red/40' 
                  : 'bg-gradient-to-r from-red-950/40 to-[#121215] hover:bg-red-900/30 border-red-900/40 text-gray-200 hover:border-bulbtek-red/50'
              }`}
              title="Xem Triết Lý, Sứ Mệnh & Robot BU (Tab 2)"
            >
              <ShieldCheck className="w-4 h-4 text-bulbtek-red group-hover:scale-110 transition-transform duration-200" />
              <div className="text-left">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium leading-none">Hệ Thống</div>
                <div className="text-xs font-bold text-bulbtek-red flex items-center space-x-1 mt-0.5">
                  <span>Thương Hiệu Bulbtek</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* TOOLBAR CONTROLS: 3 Button dữ liệu + 2 Icon Sao lưu/Phục hồi rút gọn */}
      <div className={`p-3 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#18181D] border-[#2A2A32]'
      }`}>
        {/* 3 Button: Tải biểu mẫu, Thêm SP hàng loạt, Tải dữ liệu */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button 1: Tải biểu mẫu */}
          <button
            onClick={() => {
              downloadTemplateExcel();
              setBulkImportNotification({
                message: 'Đã tải xuống biểu mẫu Excel chuẩn Bulbtek (Bulbtek_Mau_Nhap_San_Pham.xlsx)! Bạn hãy điền thông tin theo các cột mẫu rồi bấm "Thêm SP hàng loạt" để đưa vào kho.',
                type: 'info'
              });
              setTimeout(() => setBulkImportNotification(null), 8000);
            }}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition hover:shadow-sm ${
              isLight 
                ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800' 
                : 'bg-blue-950/30 hover:bg-blue-900/40 border-blue-800/40 text-blue-400'
            }`}
            title="Tải biểu mẫu Excel chuẩn Bulbtek gồm 2 sheet: Danh sách SP mẫu và Hướng dẫn quy chuẩn các cột"
          >
            <Download className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Tải biểu mẫu</span>
          </button>

          {/* Button 2: Thêm SP hàng loạt */}
          <button
            onClick={() => setShowBulkImportModal(true)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition hover:shadow-sm ${
              isLight 
                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800' 
                : 'bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-800/40 text-emerald-400'
            }`}
            title="Nhập sản phẩm hàng loạt từ tệp Excel, CSV hoặc Google Drive / Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Thêm SP hàng loạt</span>
          </button>

          {/* Button 3: Tải dữ liệu (Xuất ra File Excel thông tin tất cả Cấu hình SP) */}
          <button
            onClick={() => {
              try {
                if (!products || products.length === 0) {
                  alert('Chưa có sản phẩm nào trong hệ thống để xuất file!');
                  return;
                }
                exportProductsToExcel(products);
                setBulkImportNotification({
                  message: `📊 Đã xuất thành công toàn bộ ${products.length} sản phẩm ra file Excel (.xlsx)! Bạn có thể mở trực tiếp bằng Microsoft Excel.`,
                  type: 'success'
                });
                setTimeout(() => setBulkImportNotification(null), 6000);
              } catch (err: any) {
                console.error('Lỗi khi xuất dữ liệu Excel:', err);
                alert(`Có lỗi xảy ra khi xuất file dữ liệu: ${err?.message || err}`);
              }
            }}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition hover:shadow-sm ${
              isLight 
                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800' 
                : 'bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-800/40 text-emerald-300'
            }`}
            title="Xuất toàn bộ cấu hình sản phẩm và thông số kỹ thuật ra file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Tải dữ liệu (Excel)</span>
          </button>
        </div>

        {/* 2 Sao lưu, Phục Hồi bố trí dạng icon rút gọn */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className={`text-[11px] font-medium hidden sm:inline ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
            Dữ liệu JSON:
          </span>

          {/* Input file ẩn phục hồi JSON */}
          <input
            type="file"
            ref={jsonFileInputRef}
            onChange={handleImportProductsJson}
            accept=".json"
            className="hidden"
          />

          {/* Icon Sao lưu */}
          <button
            onClick={handleExportProductsJson}
            className={`p-2.5 rounded-xl border transition group relative flex items-center justify-center ${
              isLight 
                ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700' 
                : 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-800/40 text-amber-400'
            }`}
            title="Sao lưu toàn bộ danh sách sản phẩm thành file .JSON"
          >
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="sr-only">Sao lưu (.JSON)</span>
          </button>

          {/* Icon Phục hồi */}
          <button
            onClick={() => jsonFileInputRef.current?.click()}
            className={`p-2.5 rounded-xl border transition group relative flex items-center justify-center ${
              isLight 
                ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700' 
                : 'bg-purple-950/30 hover:bg-purple-900/40 border-purple-800/40 text-purple-400'
            }`}
            title="Khôi phục lại danh sách sản phẩm từ file .JSON sao lưu"
          >
            <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="sr-only">Phục hồi (.JSON)</span>
          </button>
        </div>
      </div>

      {/* DEDICATED ACTION ROW: "Nhập sản phẩm bằng AI" và "Thêm sản phẩm" được bố cục chung 1 hàng bên dưới với hiệu ứng motion nhẹ nhàng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Nút 1: Nhập sản phẩm bằng AI */}
        <button
          type="button"
          onClick={() => setShowAiImportModal(true)}
          className="group relative overflow-hidden flex items-center justify-center space-x-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] cursor-pointer"
          title="Thả link sản phẩm bất kỳ để AI tự động phân tích và trích xuất toàn bộ thông số kỹ thuật"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform duration-200 shrink-0" />
          <span>✨ Nhập sản phẩm bằng AI</span>
          <span className="text-[10px] sm:text-[11px] font-normal px-2 py-0.5 rounded-full bg-white/20 text-white/90 hidden sm:inline-block">
            Tự động bóc tách link
          </span>
        </button>

        {/* Nút 2: Thêm sản phẩm */}
        <button
          type="button"
          onClick={handleAddNew}
          className="group relative overflow-hidden flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white font-bold text-xs sm:text-sm shadow-md shadow-red-900/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] cursor-pointer"
          title="Tạo mới sản phẩm thủ công bằng biểu mẫu chi tiết"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200 shrink-0" />
          <span>+ Thêm sản phẩm</span>
          <span className="text-[10px] sm:text-[11px] font-normal px-2 py-0.5 rounded-full bg-white/20 text-white/90 hidden sm:inline-block">
            Nhập form chi tiết
          </span>
        </button>
      </div>

      {/* Bulk Import Notification Toast / Banner */}
      {bulkImportNotification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between animate-fadeIn transition-all ${
          bulkImportNotification.type === 'success'
            ? isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            : isLight ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-blue-950/40 border-blue-800/60 text-blue-300'
        }`}>
          <div className="flex items-center space-x-2.5 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <span>{bulkImportNotification.message}</span>
          </div>
          <button 
            onClick={() => setBulkImportNotification(null)}
            className="text-xs font-medium px-2.5 py-1 rounded bg-black/5 dark:bg-white/10 hover:opacity-80 ml-4 shrink-0 transition"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Grid: Left List + Right Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Product List & Filters */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search & Filter Bar */}
          <div className={`border rounded-xl p-3 space-y-3 ${cardClass}`}>
            <div className="relative">
              <Search className={`w-4 h-4 absolute left-3 top-3 ${isLight ? 'text-slate-400' : 'text-gray-400'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên, mã SKU..."
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm transition focus:outline-none focus:border-bulbtek-red ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white' 
                    : 'bg-[#121215] border-[#2F2F37] text-gray-200 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Line Filter */}
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className={`w-4 h-4 shrink-0 ${isLight ? 'text-slate-400' : 'text-gray-400'}`} />
              <select
                value={selectedLineFilter}
                onChange={(e) => setSelectedLineFilter(e.target.value)}
                className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-bulbtek-red ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-[#121215] border-[#2F2F37] text-gray-300'
                }`}
              >
                <option value="ALL">Tất cả Product Lines ({products.length})</option>
                {PRODUCT_LINES.map(line => {
                  const count = products.filter(p => p.productLine === line).length;
                  return (
                    <option key={line} value={line}>{line} ({count})</option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Product Cards List */}
          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredProducts.map(prod => {
              const isSelected = selectedProduct?.id === prod.id;
              const hasWeakSpecs = Object.values(prod.specs || {}).filter(Boolean).length < 2;

              return (
                <div
                  key={prod.id}
                  onClick={() => handleSelectProduct(prod)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? isLight 
                        ? 'bg-red-50/80 border-bulbtek-red shadow-sm ring-1 ring-bulbtek-red' 
                        : 'bg-bulbtek-red/10 border-bulbtek-red shadow-glow-red'
                      : isLight 
                        ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm' 
                        : 'bg-[#18181D] border-[#2A2A32] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 min-w-0">
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-11 h-11 rounded-lg object-cover border shrink-0 bg-black/30"
                        />
                      ) : (
                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${
                          isLight ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-gray-800 border-gray-700 text-gray-500'
                        }`}>
                          <Car className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold text-base leading-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {prod.name}
                          </span>
                          {prod.status === 'Hero Product' && (
                            <span className="flex h-2 w-2 relative shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-bulbtek-red"></span>
                            </span>
                          )}
                        </div>
                        <div className={`text-xs mt-1 font-mono truncate ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                          {prod.sku} • <span className={isLight ? 'text-slate-700' : 'text-gray-300'}>{prod.productLine}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {prod.isHidden && (
                        <span 
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center space-x-1" 
                          title="Sản phẩm đang ẩn khỏi Lập kế hoạch & content"
                        >
                          <EyeOff className="w-2.5 h-2.5" />
                          <span>Đã ẩn</span>
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadgeColor(prod.status)}`}>
                        {prod.status}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleHideProduct(prod);
                        }}
                        className={`p-1.5 rounded-lg transition ${
                          prod.isHidden
                            ? isLight 
                              ? 'text-amber-700 bg-amber-100 hover:bg-amber-200 ring-1 ring-amber-300' 
                              : 'text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 ring-1 ring-amber-500/40'
                            : isLight 
                              ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' 
                              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                        }`}
                        title={
                          prod.isHidden 
                            ? `Sản phẩm "${prod.name}" đang bị ẩn khỏi Lập kế hoạch & content. Bấm để hiển thị lại.` 
                            : `Ẩn sản phẩm "${prod.name}" (không hiện lên trong Lập kế hoạch & content)`
                        }
                      >
                        {prod.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(prod);
                        }}
                        className={`p-1.5 rounded-lg transition ${
                          isLight 
                            ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' 
                            : 'text-gray-400 hover:text-red-400 hover:bg-red-950/40'
                        }`}
                        title={`Xóa sản phẩm "${prod.name}" nếu không phù hợp`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className={`text-xs mt-2 line-clamp-2 italic ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                    "{prod.coreBenefit}"
                  </p>

                  <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${
                    isLight ? 'border-slate-100' : 'border-[#2A2A32]'
                  }`}>
                    <span className={`font-semibold ${isLight ? 'text-red-700 font-bold' : 'text-red-400'}`}>
                      {prod.retailPrice || 'Chưa set giá'}
                    </span>
                    
                    {hasWeakSpecs ? (
                      <span className={`text-[11px] flex items-center space-x-1 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} title="Chưa đủ thông số kỹ thuật tối thiểu">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Ít thông số</span>
                      </span>
                    ) : (
                      <span className={`text-[11px] flex items-center space-x-1 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đủ data AI</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className={`text-center py-10 border rounded-xl ${isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#18181D] border-[#2A2A32] text-gray-400'}`}>
                <Info className={`w-8 h-8 mx-auto mb-2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                <p>Không tìm thấy sản phẩm phù hợp.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Product Detail Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className={`border rounded-2xl p-6 space-y-6 ${cardClass}`}>
            
            {/* Header & Status Indicator */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3 ${
              isLight ? 'border-slate-200' : 'border-[#2A2A32]'
            }`}>
              <div>
                <h2 className={`text-lg font-bold flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <span>{formData.name ? `Chi Tiết: ${formData.name}` : 'Thêm Sản Phẩm Mới'}</span>
                  {formData.sku && <span className={`text-xs font-mono font-normal ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>({formData.sku})</span>}
                </h2>
                <div className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  Cập nhật các thông số chuẩn xác làm dữ liệu nguồn duy nhất cho AI.
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {formData.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(formData as Product)}
                    className={`px-3.5 py-2 rounded-xl border flex items-center space-x-1.5 text-xs font-semibold transition ${
                      isLight 
                        ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100' 
                        : 'border-red-800/40 text-red-400 bg-red-950/30 hover:bg-red-900/40'
                    }`}
                    title="Xóa sản phẩm nếu không phù hợp"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>Xóa sản phẩm</span>
                  </button>
                )}

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white font-bold text-sm shadow-glow-red transition"
                >
                  Lưu sản phẩm
                </button>
              </div>
            </div>

            {/* Notification Banner if weak specs or saved */}
            {saveMessage && (
              <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center space-x-2 animate-fadeIn ${
                isLight 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              }`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                <span>{saveMessage}</span>
              </div>
            )}

            {!isReadyForAI && (
              <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center space-x-2 ${
                isLight 
                  ? 'bg-red-50 border-red-200 text-red-800' 
                  : 'bg-red-950/40 border-red-600/60 text-red-300'
              }`}>
                <AlertTriangle className={`w-4 h-4 shrink-0 ${isLight ? 'text-red-600' : 'text-red-400'}`} />
                <span>⚠️ Sản phẩm chưa đủ thông tin cơ bản (Tên, Product line, Core benefit). Vui lòng điền đủ trước khi tạo content bằng AI.</span>
              </div>
            )}

            {isReadyForAI && isSpecsWeak && (
              <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center space-x-2 ${
                isLight 
                  ? 'bg-amber-50 border-amber-200 text-amber-800' 
                  : 'bg-amber-950/40 border-amber-600/50 text-amber-300'
              }`}>
                <Info className={`w-4 h-4 shrink-0 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                <span>⚠️ Sản phẩm [{formData.name}] mới có ít thông số kỹ thuật. Khuyến nghị cập nhật thêm Công suất, Nhiệt màu, Chip LED để bài viết AI thuyết phục hơn.</span>
              </div>
            )}

            {/* SECTION 1: THÔNG TIN CƠ BẢN */}
            <div className="space-y-4">
              <div className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-red-700' : 'text-red-400'
              }`}>
                <Tag className="w-4 h-4" />
                <span>1. Thông Tin Cơ Bản</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Tên sản phẩm */}
                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="VD: Bi LED Sunset, Trợ Sáng CYBER 2 BOLT..."
                    className={inputClass}
                  />
                </div>

                {/* Product line */}
                <div>
                  <label className={labelClass}>
                    Product Line <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.productLine || 'Bi LED'}
                    onChange={(e) => handleInputChange('productLine', e.target.value)}
                    className={inputClass}
                  >
                    {PRODUCT_LINES.map(line => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                </div>

                {/* Mã sản phẩm */}
                <div>
                  <label className={labelClass}>Mã sản phẩm (SKU)</label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="BTK-LED-..."
                    className={`${inputClass} font-mono`}
                  />
                </div>

                {/* Trạng thái */}
                <div>
                  <label className={labelClass}>
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status || 'Sản phẩm mới'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={inputClass}
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Trạng thái hiển thị (Ẩn / Hiện) */}
                <div>
                  <label className={labelClass}>Hiển thị trong Lập kế hoạch</label>
                  <button
                    type="button"
                    onClick={() => handleInputChange('isHidden', !formData.isHidden)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                      formData.isHidden
                        ? isLight ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    }`}
                  >
                    <span className="flex items-center space-x-1.5">
                      {formData.isHidden ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                      <span>{formData.isHidden ? 'Đang ẩn khỏi Tab 2' : 'Hiển thị bình thường'}</span>
                    </span>
                    <span className="text-[10px] font-bold opacity-80">Bấm đổi</span>
                  </button>
                </div>

                {/* Giá bán lẻ */}
                <div>
                  <label className={labelClass}>Giá bán lẻ đề xuất</label>
                  <input
                    type="text"
                    value={formData.retailPrice || ''}
                    onChange={(e) => handleInputChange('retailPrice', e.target.value)}
                    placeholder="VD: 8.500.000 VNĐ / Cặp"
                    className={inputClass}
                  />
                </div>

                {/* Sản phẩm phù hợp */}
                <div>
                  <label className={labelClass}>Sản phẩm phù hợp</label>
                  <select
                    value={formData.suitableFor || 'Xe ô tô'}
                    onChange={(e) => handleInputChange('suitableFor', e.target.value)}
                    className={inputClass}
                  >
                    <option value="Xe ô tô">Xe ô tô</option>
                    <option value="Xe máy/mô tô">Xe máy/mô tô</option>
                    <option value="Cả Hai">Cả Hai</option>
                  </select>
                </div>

                {/* Phân khúc */}
                <div>
                  <label className={labelClass}>Phân khúc</label>
                  <select
                    value={formData.segment || 'Mid'}
                    onChange={(e) => handleInputChange('segment', e.target.value)}
                    className={inputClass}
                  >
                    <option value="Entry">Entry (Phổ thông - Tiếp cận nhanh)</option>
                    <option value="Mid">Mid (Tầm trung - Chủ lực)</option>
                    <option value="Premium">Premium (Cao cấp - Flagship)</option>
                  </select>
                </div>

                {/* Tải Ảnh Sản Phẩm */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className={labelClass}>
                    Tải Ảnh Sản Phẩm <span className={`font-normal ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>(Hình ảnh riêng biệt cho mỗi sản phẩm)</span>
                  </label>
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-4 transition-all ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
                  }`}>
                    {/* Image Preview Box */}
                    <div className={`relative w-28 h-28 rounded-xl overflow-hidden border shrink-0 flex items-center justify-center transition-all ${
                      formData.imageUrl 
                        ? 'border-bulbtek-red shadow-sm bg-black/40' 
                        : isLight ? 'border-dashed border-slate-300 bg-white' : 'border-dashed border-[#2F2F37] bg-black/20'
                    }`}>
                      {formData.imageUrl ? (
                        <>
                          <img
                            src={formData.imageUrl}
                            alt={formData.name || 'Sản phẩm'}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleInputChange('imageUrl', '')}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/90 hover:bg-red-600 text-white shadow-md transition"
                            title="Gỡ ảnh này"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 p-2 text-center">
                          <ImageIcon className="w-7 h-7 opacity-40 mb-1" />
                          <span className="text-[10px]">Chưa có ảnh</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls & URL */}
                    <div className="flex-1 w-full space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-sm transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{formData.imageUrl ? 'Tải ảnh khác từ máy' : 'Tải Ảnh Sản Phẩm Từ Máy'}</span>
                        </button>

                        {formData.imageUrl && (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã có ảnh riêng biệt</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                          Hoặc dán đường dẫn ảnh trực tuyến (Image URL):
                        </div>
                        <input
                          type="url"
                          value={formData.imageUrl || ''}
                          onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                          placeholder="https://... (dán link ảnh online)"
                          className={`${inputClass} text-xs py-1.5`}
                        />
                      </div>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                        Hỗ trợ định dạng PNG, JPG, WEBP (tối đa 4MB). Ảnh được hiển thị đồng bộ trong danh mục, Lịch bài viết và Design Brief.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION 2: THÔNG SỐ KỸ THUẬT */}
            <div className={`space-y-4 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-blue-700' : 'text-blue-400'
                }`}>
                  <Zap className="w-4 h-4" />
                  <span>2. Thông Số Kỹ Thuật (Nguồn trích xuất của AI)</span>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Đã điền {specCount}/11 thông số</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Chip LED */}
                <div>
                  <label className={labelClass}>Chip LED</label>
                  <input
                    type="text"
                    value={formData.specs?.chipLed || ''}
                    onChange={(e) => handleSpecChange('chipLed', e.target.value)}
                    placeholder="VD: Osram 6+3 Đức, Nichia Nhật Bản..."
                    className={inputClass}
                  />
                </div>

                {/* Nhiệt độ màu */}
                <div>
                  <label className={labelClass}>Nhiệt độ màu (K)</label>
                  <input
                    type="text"
                    value={formData.specs?.colorTemp || ''}
                    onChange={(e) => handleSpecChange('colorTemp', e.target.value)}
                    placeholder="VD: 5500K, 3000K-4300K-5500K..."
                    className={inputClass}
                  />
                </div>

                {/* Độ sáng */}
                <div>
                  <label className={labelClass}>Độ sáng (Lux/Lumen)</label>
                  <input
                    type="text"
                    value={formData.specs?.brightness || ''}
                    onChange={(e) => handleSpecChange('brightness', e.target.value)}
                    placeholder="VD: 12.000 Lux, 6.000 Lumen..."
                    className={inputClass}
                  />
                </div>

                {/* Công suất */}
                <div>
                  <label className={labelClass}>Công suất (W)</label>
                  <input
                    type="text"
                    value={formData.specs?.power || ''}
                    onChange={(e) => handleSpecChange('power', e.target.value)}
                    placeholder="VD: Cos 65W - Pha 75W"
                    className={inputClass}
                  />
                </div>

                {/* Điện áp */}
                <div>
                  <label className={labelClass}>Điện áp (V)</label>
                  <input
                    type="text"
                    value={formData.specs?.voltage || ''}
                    onChange={(e) => handleSpecChange('voltage', e.target.value)}
                    placeholder="VD: 12V, 9V - 36V DC"
                    className={inputClass}
                  />
                </div>

                {/* Tuổi thọ */}
                <div>
                  <label className={labelClass}>Tuổi thọ (giờ)</label>
                  <input
                    type="text"
                    value={formData.specs?.lifespan || ''}
                    onChange={(e) => handleSpecChange('lifespan', e.target.value)}
                    placeholder="VD: 50.000 giờ thắp sáng"
                    className={inputClass}
                  />
                </div>

                {/* Bảo hành */}
                <div>
                  <label className={labelClass}>Bảo hành</label>
                  <input
                    type="text"
                    value={formData.specs?.warranty || ''}
                    onChange={(e) => handleSpecChange('warranty', e.target.value)}
                    placeholder="VD: 3 năm (1 đổi 1 chính hãng)"
                    className={inputClass}
                  />
                </div>

                {/* Tương thích xe */}
                <div>
                  <label className={labelClass}>Tương thích xe</label>
                  <input
                    type="text"
                    value={formData.specs?.compatibility || ''}
                    onChange={(e) => handleSpecChange('compatibility', e.target.value)}
                    placeholder="VD: Chân xoáy đa năng 98% xe, cắm zin 100%..."
                    className={inputClass}
                  />
                </div>

                {/* Kích thước Lens (inch) */}
                <div>
                  <label className={labelClass}>Kích thước Lens (inch)</label>
                  <input
                    type="text"
                    value={formData.specs?.sizeInch || ''}
                    onChange={(e) => handleSpecChange('sizeInch', e.target.value)}
                    placeholder="VD: 3.0 inch, 2.0 inch, 1.8 inch..."
                    className={inputClass}
                  />
                </div>

                {/* Chuẩn kháng nước */}
                <div>
                  <label className={labelClass}>Chuẩn kháng nước</label>
                  <input
                    type="text"
                    value={formData.specs?.waterproof || ''}
                    onChange={(e) => handleSpecChange('waterproof', e.target.value)}
                    placeholder="VD: IP68 (Chống nước tuyệt đối), IP65..."
                    className={inputClass}
                  />
                </div>

                {/* Tính năng đặc biệt */}
                <div className="sm:col-span-3">
                  <label className={labelClass}>Tính năng đặc biệt</label>
                  <textarea
                    rows={2}
                    value={formData.specs?.specialFeatures || ''}
                    onChange={(e) => handleSpecChange('specialFeatures', e.target.value)}
                    placeholder="VD: Chống nước IP68, tản nhiệt đồng kép, đường cắt cos phẳng chống chói..."
                    className={inputClass}
                  />
                </div>

              </div>
            </div>

            {/* SECTION 3: THÔNG TIN MARKETING */}
            <div className={`space-y-4 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
              <div className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-amber-700' : 'text-amber-400'
              }`}>
                <ShieldCheck className="w-4 h-4" />
                <span>3. Thông Tin Marketing & Định Vị</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Core benefit */}
                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Core Benefit (1 câu mô tả lợi ích chính) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.coreBenefit || ''}
                    onChange={(e) => handleInputChange('coreBenefit', e.target.value)}
                    placeholder="VD: Ánh sáng cung hoàng hôn êm dịu, bám đường vượt trội không gây chói xe ngược chiều"
                    className={`${inputClass} font-medium`}
                  />
                  <span className={`text-[11px] mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                    AI sẽ dùng câu này làm kim chỉ nam xuyên suốt các bài viết.
                  </span>
                </div>

                {/* Giai đoạn sản phẩm */}
                <div>
                  <label className={labelClass}>Giai đoạn sản phẩm</label>
                  <select
                    value={formData.stage || 'Growth'}
                    onChange={(e) => handleInputChange('stage', e.target.value)}
                    className={inputClass}
                  >
                    <option value="Launch">Launch (Ra mắt chiến lược)</option>
                    <option value="Growth">Growth (Tăng trưởng doanh số)</option>
                    <option value="Maintain">Maintain (Duy trì thị phần)</option>
                    <option value="Clearance">Clearance (Thanh lý tồn kho)</option>
                  </select>
                </div>

                {/* Ghi chú nội bộ */}
                <div>
                  <label className={labelClass}>
                    Ghi chú nội bộ <span className={`font-normal ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>(Không đưa vào content public)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.internalNotes || ''}
                    onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                    placeholder="VD: Sản phẩm có chiết khấu gara tốt, đẩy mạnh đại lý tỉnh..."
                    className={inputClass}
                  />
                </div>

              </div>
            </div>

            {/* Form Actions */}
            <div className={`pt-4 border-t flex items-center justify-between ${
              isLight ? 'border-slate-200' : 'border-[#2A2A32]'
            }`}>
              <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                {formData.updatedAt && `Cập nhật lần cuối: ${new Date(formData.updatedAt).toLocaleString('vi-VN')}`}
              </div>

              <div className="flex items-center space-x-3">
                {formData.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(formData as Product)}
                    className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
                      isLight 
                        ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100' 
                        : 'border-red-800/40 text-red-400 bg-red-950/30 hover:bg-red-900/40'
                    }`}
                    title="Xóa sản phẩm nếu không phù hợp"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>Xóa sản phẩm này</span>
                  </button>
                )}

                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white font-bold text-sm shadow-glow-red transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu sản phẩm</span>
                </button>
              </div>
            </div>

          </form>
        </div>

      </div>

      {/* Bulk Product Import Modal */}
      <BulkProductImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onImportSuccess={(result) => {
          setBulkImportNotification({
            message: `Nhập thành công! Đã thêm mới ${result.added} sản phẩm, cập nhật ${result.updated} sản phẩm (Tổng cộng ${result.total} sản phẩm được xử lý).`,
            type: 'success'
          });
          setTimeout(() => {
            setBulkImportNotification(null);
          }, 8000);
        }}
      />

      {/* AI Product Import Modal */}
      <AiProductImportModal
        isOpen={showAiImportModal}
        onClose={() => setShowAiImportModal(false)}
        onApplyToForm={handleApplyAiProductToForm}
        onSaveDirectly={handleSaveAiProductDirectly}
        theme={theme}
      />
    </div>
  );
};

