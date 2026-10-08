import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ContentItem, Product, Category, DesignBrief } from '../../types';
import { generateDesignBrief, validateProductForContent } from '../../services/aiGenerator';
import { 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  Upload, 
  Layers, 
  Sliders, 
  Zap, 
  Palette,
  ExternalLink,
  AlertTriangle,
  Type
} from 'lucide-react';

export const Tab4DesignBrief: React.FC = () => {
  const { contents, products, categories, briefPrefillItem, setBriefPrefillItem, theme, setActiveTab, setSelectedProduct } = useApp();
  const isLight = theme === 'light';

  // Source toggle
  const [sourceType, setSourceType] = useState<'FROM_CALENDAR' | 'STANDALONE'>(
    briefPrefillItem ? 'FROM_CALENDAR' : 'FROM_CALENDAR'
  );
  const [selectedContentId, setSelectedContentId] = useState<string>(
    briefPrefillItem?.id || contents[0]?.id || ''
  );

  // Creative Headline riêng biệt (Mục 1: tách khỏi tiêu đề quản trị)
  const [customHeadline, setCustomHeadline] = useState<string>('');

  // Standalone fields
  const [customTitle, setCustomTitle] = useState<string>('Banner Chiến Dịch Mùa Mưa');
  const [customProductId, setCustomProductId] = useState<string>(products[0]?.id || '');
  const [customCategoryId, setCustomCategoryId] = useState<string>(categories[0]?.id || '');

  // Validation state (Mục 2: chặn generate brief nếu sản phẩm thiếu thông số bắt buộc)
  const [validationError, setValidationError] = useState<string | null>(null);

  // Formats Multi-select
  const AVAILABLE_FORMATS = [
    'Facebook post (1080×1080px — 1:1)',
    'Facebook story (1080×1920px — 9:16)',
    'TikTok thumbnail (1080×1920px — 9:16)',
    'TikTok cover (1080×1080px — 1:1)'
  ];
  const [selectedFormats, setSelectedFormats] = useState<string[]>([AVAILABLE_FORMATS[0]]);

  // Designer notes & Ref image
  const [designerNotes, setDesignerNotes] = useState<string>(
    'Làm nổi bật góc chiếu cos chống chói sắc nét. Đèn đặt chéo góc 45 độ hướng về phía trước bên phải.'
  );
  const [refImagePreview, setRefImagePreview] = useState<string | null>(null);

  // Generated Brief State
  const [currentBrief, setCurrentBrief] = useState<DesignBrief | null>(null);

  // Copy status
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedImagen, setCopiedImagen] = useState<boolean>(false);
  const [copiedMJ, setCopiedMJ] = useState<boolean>(false);

  // Handle pre-fill if navigating from Tab 2 or Tab 3
  useEffect(() => {
    if (briefPrefillItem) {
      setSourceType('FROM_CALENDAR');
      setSelectedContentId(briefPrefillItem.id);
      if (briefPrefillItem.creativeHeadline) {
        setCustomHeadline(briefPrefillItem.creativeHeadline);
      } else {
        setCustomHeadline('');
      }
      handleGenerate(briefPrefillItem);
    }
  }, [briefPrefillItem]);

  // Initial generation on first mount
  useEffect(() => {
    handleGenerate();
  }, []);

  const handleToggleFormat = (fmt: string) => {
    setSelectedFormats(prev => 
      prev.includes(fmt) 
        ? (prev.length > 1 ? prev.filter(f => f !== fmt) : prev) // keep at least 1
        : [...prev, fmt]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRefImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = (targetItemOverride?: ContentItem) => {
    let contentItem: Partial<ContentItem> = {};
    let product: Product | undefined;
    let category: Category | undefined;

    if (sourceType === 'FROM_CALENDAR') {
      const item = targetItemOverride || contents.find(c => c.id === selectedContentId) || contents[0];
      if (item) {
        contentItem = {
          ...item,
          creativeHeadline: customHeadline.trim() ? customHeadline.trim() : item.creativeHeadline
        };
        product = products.find(p => p.id === item.productId) || products[0];
        category = categories.find(c => c.id === item.categoryId) || categories[0];
      }
    } else {
      product = products.find(p => p.id === customProductId) || products[0];
      category = categories.find(c => c.id === customCategoryId) || categories[0];
      contentItem = {
        title: customTitle,
        creativeHeadline: customHeadline.trim() || undefined,
        channel: 'Facebook',
        date: new Date().toISOString().split('T')[0],
        highlightSpecs: Object.values(product?.specs || {}).filter(Boolean) as string[]
      };
    }

    if (!product || !category) return;

    // Validation: Chặn tạo Design Brief nếu sản phẩm thiếu thông số bắt buộc (Mục 2c)
    const validation = validateProductForContent(product);
    if (!validation.valid) {
      setValidationError(validation.error || 'Sản phẩm chưa đủ thông số kỹ thuật bắt buộc.');
      setCurrentBrief(null);
      return;
    }
    setValidationError(null);

    const brief = generateDesignBrief(contentItem, product, category, selectedFormats, designerNotes);
    if (refImagePreview) {
      brief.refImage = refImagePreview;
    }
    // Nếu người dùng có tự gõ customHeadline thì ưu tiên dùng
    if (customHeadline.trim()) {
      brief.textOverlay.headline = customHeadline.trim();
    }
    setCurrentBrief(brief);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const cardClass = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#18181D] border-[#2A2A32] shadow-xl';
  const inputClass = isLight 
    ? 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-bulbtek-red focus:bg-white placeholder-slate-400 transition' 
    : 'w-full bg-[#121215] border border-[#2F2F37] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-bulbtek-red transition';

  return (
    <div className="space-y-6">
      
      {/* Top Banner Context */}
      <div className={`border rounded-2xl p-5 shadow-lg ${cardClass}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`p-2 rounded-xl border ${
                isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-bulbtek-red/20 text-red-400 border-bulbtek-red/30'
              }`}>
                <Sparkles className="w-5 h-5" />
              </span>
              <h1 className={`text-xl font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Tạo Design Brief & AI Image Prompts
              </h1>
            </div>
            <p className={`text-sm mt-1 max-w-3xl ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Sinh đồng thời 2 output: Brief văn bản chuẩn chỉ cho designer nội bộ và Prompts hình ảnh chi tiết cho Imagen / Midjourney. Brand guideline Bulbtek được tích hợp tự động.
            </p>
          </div>

          <button
            onClick={() => handleGenerate()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-sm font-bold shadow-glow-red transition shrink-0"
          >
            <Zap className="w-4 h-4" />
            <span>⚡ Generate Brief</span>
          </button>
        </div>
      </div>

      {/* VALIDATION ERROR BANNER (MỤC 2C: CHẶN GENERATE BRIEF NẾU THIẾU THÔNG SỐ) */}
      {validationError && (
        <div className={`border rounded-2xl p-4 flex items-start space-x-3.5 shadow-md ${
          isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/40 border-amber-600/50 text-amber-200'
        }`}>
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs space-y-2">
            <div className="font-bold text-sm text-amber-800 dark:text-amber-300">
              ⚠️ Chặn Tạo Design Brief: Sản phẩm chưa đủ thông số kỹ thuật kiểm định
            </div>
            <p className="leading-relaxed opacity-90">{validationError}</p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  const targetProdId = sourceType === 'FROM_CALENDAR'
                    ? (contents.find(c => c.id === selectedContentId)?.productId || customProductId)
                    : customProductId;
                  const targetProduct = products.find(p => p.id === targetProdId);
                  if (targetProduct) {
                    setSelectedProduct(targetProduct);
                  }
                  setActiveTab(1); // Chuyển sang Cấu hình sản phẩm (Tab 1)
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center space-x-1.5 shadow-sm transition"
              >
                <span>Bổ sung thông số tại Cấu hình sản phẩm</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INPUT PANEL */}
      <div className={`border rounded-2xl p-5 space-y-5 ${cardClass}`}>
        <div className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider ${isLight ? 'text-red-700' : 'text-red-400'}`}>
          <Layers className="w-4 h-4" />
          <span>Cấu Hình Nguồn Brief & Định Dạng Output</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Nguồn Brief */}
          <div className="space-y-3">
            <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Nguồn dữ liệu Brief:</label>
            <div className={`flex space-x-4 text-xs ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="sourceType"
                  checked={sourceType === 'FROM_CALENDAR'}
                  onChange={() => {
                    setSourceType('FROM_CALENDAR');
                    const itm = contents.find(c => c.id === selectedContentId);
                    if (itm?.creativeHeadline) setCustomHeadline(itm.creativeHeadline);
                  }}
                  className="accent-bulbtek-red"
                />
                <span>Từ bài trong Calendar</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="sourceType"
                  checked={sourceType === 'STANDALONE'}
                  onChange={() => setSourceType('STANDALONE')}
                  className="accent-bulbtek-red"
                />
                <span>Tạo brief độc lập</span>
              </label>
            </div>

            {sourceType === 'FROM_CALENDAR' ? (
              <div>
                <label className={`block text-[11px] mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Chọn bài viết đã lên lịch:</label>
                <select
                  value={selectedContentId}
                  onChange={(e) => {
                    setSelectedContentId(e.target.value);
                    const itm = contents.find(c => c.id === e.target.value);
                    if (itm?.creativeHeadline) {
                      setCustomHeadline(itm.creativeHeadline);
                    } else {
                      setCustomHeadline('');
                    }
                  }}
                  className={inputClass}
                >
                  {contents.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.date}] {c.title || c.productName} ({c.channel})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Tiêu đề ấn phẩm thiết kế..."
                  className={inputClass}
                />
                <select
                  value={customProductId}
                  onChange={(e) => setCustomProductId(e.target.value)}
                  className={inputClass}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.productLine})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Headline sáng tạo (Mục 1: tách riêng khỏi tiêu đề quản trị) */}
            <div>
              <label className={`block text-xs font-semibold mb-1 flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                <span className="flex items-center space-x-1">
                  <Type className="w-3.5 h-3.5 text-bulbtek-red" />
                  <span>Headline Sáng Tạo Trên Ảnh:</span>
                </span>
                <span className={`text-[10px] font-normal ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                  (Độc lập, không chứa mã quản trị)
                </span>
              </label>
              <input
                type="text"
                value={customHeadline}
                onChange={(e) => setCustomHeadline(e.target.value)}
                placeholder="VD: BI GẦM RAY 2.0 — Phá Sương Xuyên Lũ, Đổi 3 Màu..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Chọn Format Output */}
          <div className="space-y-2">
            <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              Chọn format kích thước (multi-select):
            </label>
            <div className="space-y-1.5">
              {AVAILABLE_FORMATS.map(fmt => {
                const isSelected = selectedFormats.includes(fmt);
                return (
                  <div
                    key={fmt}
                    onClick={() => handleToggleFormat(fmt)}
                    className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center space-x-2 transition ${
                      isSelected
                        ? isLight ? 'bg-red-50 border-bulbtek-red text-red-900 font-semibold' : 'bg-bulbtek-red/20 border-bulbtek-red text-white'
                        : isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="accent-bulbtek-red rounded"
                    />
                    <span className="truncate">{fmt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ghi chú & Ref Upload */}
          <div className="space-y-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                Ghi chú đặc biệt cho Designer:
              </label>
              <textarea
                rows={2}
                value={designerNotes}
                onChange={(e) => setDesignerNotes(e.target.value)}
                placeholder="Yêu cầu cụ thể về ánh sáng, góc nghiêng..."
                className={inputClass}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                Ảnh tham khảo / Reference (tùy chọn):
              </label>
              <div className="flex items-center space-x-2">
                <label className={`cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs transition ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-[#121215] hover:bg-gray-800 border-[#2F2F37] text-gray-300'
                }`}>
                  <Upload className="w-3.5 h-3.5 text-bulbtek-red" />
                  <span>Chọn ảnh tải lên</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {refImagePreview && (
                  <span className={`text-[11px] flex items-center space-x-1 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã đính kèm ảnh</span>
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* OUTPUT — 2 CỘT SONG SONG */}
      {currentBrief && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CỘT TRÁI (7 cols): BRIEF VĂN BẢN CHO DESIGNER NỘI BỘ */}
          <div className={`lg:col-span-7 border rounded-2xl p-6 space-y-5 shadow-2xl relative ${cardClass}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-bulbtek-red" />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Brief Thiết Kế Chuẩn Cho Designer Nội Bộ
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const textContent = `━━━━━━━━━━━━━━━━━━━━\nBRIEF THIẾT KẾ BULBTEK\n━━━━━━━━━━━━━━━━━━━━\nBài: ${currentBrief.title}\nKênh: ${currentBrief.channel} | Format: ${currentBrief.formats.join(', ')}\nDeadline: ${currentBrief.deadline}\n\nSẢN PHẨM:\n- Tên: ${currentBrief.productName}\n- Thông số highlight: ${currentBrief.highlightSpecs.join('; ')}\n\nYÊU CẦU VISUAL:\n- Nền: ${currentBrief.visualRequirements.background}\n- Màu nhấn: ${currentBrief.visualRequirements.accentColor}\n- Bố cục: ${currentBrief.visualRequirements.composition}\n- Ánh sáng: ${currentBrief.visualRequirements.lighting}\n- Hiệu ứng: ${currentBrief.visualRequirements.effects}\n\nTEXT TRÊN ẢNH:\n- Headline: "${currentBrief.textOverlay.headline}"\n- Sub: "${currentBrief.textOverlay.subHeadline}"\n- Logo: ${currentBrief.textOverlay.logoPosition}\n\nBRAND CONSTANTS:\n- ${currentBrief.brandConstants.colors}\n- ${currentBrief.brandConstants.font}\n- ${currentBrief.brandConstants.style}\n━━━━━━━━━━━━━━━━━━━━`;
                    navigator.clipboard.writeText(textContent);
                    setCopiedText(true);
                    setTimeout(() => setCopiedText(false), 2000);
                  }}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs transition ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                      : 'bg-[#121215] hover:bg-gray-800 border-[#2F2F37] text-gray-200'
                  }`}
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Đã copy' : 'Copy Brief'}</span>
                </button>

                <button
                  onClick={handlePrintPdf}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-semibold shadow-glow-red transition"
                  title="In hoặc lưu dạng PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Xuất PDF / In</span>
                </button>
              </div>
            </div>

            {/* Document preview container */}
            <div className={`border rounded-xl p-5 font-mono text-xs space-y-4 leading-relaxed ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121215] border-[#2F2F37] text-gray-200'
            }`}>
              
              <div className={`text-center font-bold text-bulbtek-red text-sm tracking-widest border-b pb-2 ${
                isLight ? 'border-slate-200' : 'border-[#2F2F37]/80'
              }`}>
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br />
                BRIEF THIẾT KẾ BULBTEK VIỆT NAM<br />
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              </div>

              <div className="space-y-1">
                <div><strong>Bài:</strong> {currentBrief.title}</div>
                <div><strong>Kênh:</strong> {currentBrief.channel} | <strong>Format:</strong> {currentBrief.formats.join(' + ')}</div>
                <div><strong>Deadline:</strong> {currentBrief.deadline}</div>
              </div>

              <div className={`space-y-1 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-[#2F2F37]/60'}`}>
                <div className={`font-bold uppercase tracking-wider ${isLight ? 'text-red-700' : 'text-red-400'}`}>SẢN PHẨM:</div>
                <div>- <strong>Tên:</strong> {currentBrief.productName}</div>
                <div>
                  - <strong>Thông số highlight:</strong>
                  <ul className={`list-disc pl-5 mt-0.5 space-y-0.5 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                    {currentBrief.highlightSpecs.map((s, i) => {
                      const isMissing = s.includes('Chưa cập nhật thông số') || s.includes('N/A');
                      return (
                        <li key={i} className={isMissing ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''}>
                          {isMissing ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-sans">
                              <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span>Chưa cập nhật thông số kiểm định</span>
                            </span>
                          ) : (
                            <span>{s}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {refImagePreview && (
                  <div className="pt-2">
                    <span className={`font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>- Ảnh reference:</span>
                    <img src={refImagePreview} alt="Ref" className="mt-1 max-h-36 rounded border border-gray-300 dark:border-gray-700 object-cover" />
                  </div>
                )}
              </div>

              <div className={`space-y-1 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-[#2F2F37]/60'}`}>
                <div className={`font-bold uppercase tracking-wider ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>YÊU CẦU VISUAL:</div>
                <div>- <strong>Nền:</strong> {currentBrief.visualRequirements.background}</div>
                <div>- <strong>Màu nhấn:</strong> {currentBrief.visualRequirements.accentColor}</div>
                <div>- <strong>Sản phẩm:</strong> {currentBrief.visualRequirements.composition}</div>
                <div>- <strong>Ánh sáng:</strong> {currentBrief.visualRequirements.lighting}</div>
                <div>- <strong>Hiệu ứng:</strong> {currentBrief.visualRequirements.effects}</div>
              </div>

              <div className={`space-y-1 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-[#2F2F37]/60'}`}>
                <div className={`font-bold uppercase tracking-wider flex items-center justify-between ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                  <span>TEXT TRÊN ẢNH (KEY VISUAL):</span>
                  <span className="text-[10px] font-normal lowercase opacity-80">(Headline độc lập, không gắn mã nội bộ)</span>
                </div>
                <div>- <strong>Headline sáng tạo:</strong> <span className="text-bulbtek-red font-bold">"{currentBrief.textOverlay.headline}"</span></div>
                <div>- <strong>Sub:</strong> "{currentBrief.textOverlay.subHeadline}"</div>
                <div>- <strong>Logo:</strong> {currentBrief.textOverlay.logoPosition}</div>
                <div>- <strong>Hashtag/CTA:</strong> {currentBrief.textOverlay.hasCtaOrHashtag ? 'Có (Góc dưới)' : 'Không'}</div>
              </div>

              <div className={`space-y-1 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-[#2F2F37]/60'}`}>
                <div className={`font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>BRAND CONSTANTS (KHÔNG THAY ĐỔI):</div>
                <div>- <strong>Màu sắc:</strong> {currentBrief.brandConstants.colors}</div>
                <div>- <strong>Font chữ:</strong> {currentBrief.brandConstants.font}</div>
                <div>- <strong>Visual Style:</strong> {currentBrief.brandConstants.style}</div>
              </div>

            </div>
          </div>

          {/* CỘT PHẢI (5 cols): AI IMAGE PROMPT (IMAGEN & MIDJOURNEY) */}
          <div className={`lg:col-span-5 border rounded-2xl p-6 space-y-5 shadow-2xl flex flex-col ${cardClass}`}>
            <div className={`flex items-center space-x-2 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
              <ImageIcon className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                AI Image Prompts (Gemini / Midjourney)
              </h3>
            </div>

            {/* Version 1: Gemini Flow / Imagen */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold flex items-center space-x-1 ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>
                  <span>🔵 Imagen 3 / Gemini Prompt</span>
                  <span className={`text-[10px] font-mono font-normal ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>(English)</span>
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentBrief.imagenPrompt);
                    setCopiedImagen(true);
                    setTimeout(() => setCopiedImagen(false), 2000);
                  }}
                  className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition border ${
                    isLight 
                      ? 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100' 
                      : 'text-blue-400 hover:text-blue-300 bg-blue-950/40 border-blue-800/50'
                  }`}
                >
                  {copiedImagen ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedImagen ? 'Đã copy' : 'Copy Imagen Prompt'}</span>
                </button>
              </div>

              <div className={`p-3 border rounded-xl font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121215] border-[#2F2F37] text-gray-300'
              }`}>
                {currentBrief.imagenPrompt}
              </div>
            </div>

            {/* Version 2: Midjourney */}
            <div className={`space-y-2 flex-1 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-[#2A2A32]'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold flex items-center space-x-1 ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>
                  <span>🟣 Midjourney v6 Prompt</span>
                  <span className={`text-[10px] font-mono font-normal ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>(--style raw)</span>
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentBrief.midjourneyPrompt);
                    setCopiedMJ(true);
                    setTimeout(() => setCopiedMJ(false), 2000);
                  }}
                  className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition border ${
                    isLight 
                      ? 'text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100' 
                      : 'text-purple-400 hover:text-purple-300 bg-purple-950/40 border-purple-800/50'
                  }`}
                >
                  {copiedMJ ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedMJ ? 'Đã copy' : 'Copy MJ Prompt'}</span>
                </button>
              </div>

              <div className={`p-3 border rounded-xl font-mono text-[11px] leading-relaxed max-h-44 overflow-y-auto ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121215] border-[#2F2F37] text-gray-300'
              }`}>
                {currentBrief.midjourneyPrompt}
              </div>
            </div>

            {/* Visual Guidelines Quick Card */}
            <div className={`p-3 border rounded-xl text-xs space-y-1 ${
              isLight ? 'bg-slate-100/70 border-slate-200 text-slate-600' : 'bg-[#121215] border-[#2F2F37] text-gray-400'
            }`}>
              <div className={`font-bold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Mẹo tạo ảnh xe hơi Bulbtek:</div>
              <div className="text-[11px]">
                • Tỷ lệ hình ảnh: 1:1 cho Post vuông, 9:16 cho Story / TikTok Cover.<br />
                • Luôn chừa khoảng thở 20-25% trên và dưới để lồng Headline & Logo.<br />
                • Ánh sáng phản chiếu nền đường ướt tạo cảm giác bám đường chân thực.
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
