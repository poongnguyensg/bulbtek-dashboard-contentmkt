import React, { useState } from 'react';
import { Product } from '../../types';
import { apiScrapeProductUrl } from '../../services/api';
import { extractProductSpecsFromText, ExtractedProductResult } from '../../services/productAiExtractor';
import { 
  Sparkles, 
  X, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Eye, 
  Save, 
  FileEdit,
  Clipboard,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';

interface AiProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToForm: (product: Partial<Product>) => void;
  onSaveDirectly: (product: Product) => void;
  theme: 'light' | 'dark';
}

export const AiProductImportModal: React.FC<AiProductImportModalProps> = ({
  isOpen,
  onClose,
  onApplyToForm,
  onSaveDirectly,
  theme
}) => {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  const [url, setUrl] = useState<string>('');
  const [manualText, setManualText] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedResult, setExtractedResult] = useState<ExtractedProductResult | null>(null);
  const [editedProduct, setEditedProduct] = useState<Partial<Product> | null>(null);

  // Dán nhanh từ clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.startsWith('http://') || text.startsWith('https://')) {
        setUrl(text);
      } else {
        setManualText(text);
        setShowManualInput(true);
      }
    } catch (err) {
      // Fallback
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim() && !manualText.trim()) {
      setErrorMsg('Vui lòng nhập đường link sản phẩm hoặc dán nội dung thông số kỹ thuật!');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setExtractedResult(null);

    try {
      let textToExtract = manualText;
      let scrapedTitle = '';
      let scrapedImage = '';

      if (url.trim()) {
        try {
          const scraped = await apiScrapeProductUrl(url.trim());
          if (scraped && scraped.success) {
            textToExtract = `${scraped.title}\n${scraped.description}\n${scraped.text}\n${manualText}`;
            scrapedTitle = scraped.title;
            scrapedImage = scraped.imageUrl;
          } else {
            console.warn('Backend scrape URL warning:', scraped?.error);
            if (!manualText.trim()) {
              textToExtract = url;
            }
          }
        } catch (scrapeErr: any) {
          console.warn('Scrape URL request failed, extracting from input:', scrapeErr);
          if (!manualText.trim()) {
            textToExtract = url;
          }
        }
      }

      const result = extractProductSpecsFromText(textToExtract, scrapedTitle, scrapedImage, url.trim());
      setExtractedResult(result);
      setEditedProduct(result.product);
    } catch (err: any) {
      setErrorMsg(`Không thể phân tích dữ liệu: ${err.message || 'Lỗi không xác định'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyToForm = () => {
    if (!editedProduct) return;
    onApplyToForm(editedProduct);
    onClose();
  };

  const handleSaveDirectly = () => {
    if (!editedProduct || !editedProduct.name) return;
    onSaveDirectly(editedProduct as Product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#18181D] border-[#2A2A32]'
      }`}>
        
        {/* MODAL HEADER */}
        <div className={`p-5 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#121215] border-[#2A2A32]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span>Nhập Sản Phẩm Tự Động Bằng AI</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">
                  Auto Scraper & Specs Parser
                </span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Thả link bài viết/sản phẩm bất kỳ. AI sẽ tự động phân tích và trích xuất toàn bộ biến số thông số kỹ thuật chuẩn Bulbtek.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#202026] text-gray-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* INPUT FORM: LINK & MANUAL TEXT */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
          }`}>
            <label className={`block font-bold text-xs ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
              🔗 Đường dẫn Link Sản phẩm (Website, Fanpage, Shopee, Đại lý, Báo chí...):
            </label>
            
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Ví dụ: https://bulbtek.vn/san-pham/bi-led-sunset/ hoặc link bài viết giới thiệu..."
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 transition ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                  }`}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
              </div>

              <button
                type="button"
                onClick={handlePasteClipboard}
                className={`px-3 py-2.5 rounded-xl border font-semibold flex items-center space-x-1 transition ${
                  isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#18181D] hover:bg-[#202026] border-[#2F2F37] text-gray-300'
                }`}
                title="Dán từ Clipboard"
              >
                <Clipboard className="w-4 h-4" />
                <span>Dán</span>
              </button>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold transition flex items-center space-x-2 shadow-md shadow-indigo-500/20 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang phân tích AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Trích Xuất Thông Số ✨</span>
                  </>
                )}
              </button>
            </div>

            {/* Toggle Dán nội dung thô bổ sung */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold flex items-center space-x-1"
              >
                {showManualInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{showManualInput ? 'Ẩn ô dán văn bản / thông số thô' : '+ Hoặc dán trực tiếp đoạn văn bản / thông số kỹ thuật nếu link bị chặn'}</span>
              </button>

              {showManualInput && (
                <div className="mt-2 animate-fadeIn">
                  <textarea
                    rows={4}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Dán thông số kỹ thuật thô, bài đăng giới thiệu, bảng cấu hình chi tiết..."
                    className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* EXTRACTED RESULTS PREVIEW */}
          {editedProduct && extractedResult && (
            <div className="space-y-4 animate-fadeIn">
              
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Kết Quả Trích Xuất Thông Số Bằng AI:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    Độ tin cậy: {extractedResult.confidence}%
                  </span>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  {extractedResult.rawSummary}
                </span>
              </div>

              {/* CARD PREVIEW TOP: Name, SKU, Price, Image */}
              <div className={`p-4 rounded-xl border grid grid-cols-1 md:grid-cols-4 gap-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2F2F37]'
              }`}>
                {/* Image */}
                <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-inherit">
                  {editedProduct.imageUrl ? (
                    <img 
                      src={editedProduct.imageUrl} 
                      alt={editedProduct.name} 
                      className="w-full h-28 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-28 flex flex-col items-center justify-center text-gray-500">
                      <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                      <span className="text-[10px]">Chưa có ảnh</span>
                    </div>
                  )}
                  <input
                    type="text"
                    value={editedProduct.imageUrl || ''}
                    onChange={(e) => setEditedProduct({ ...editedProduct, imageUrl: e.target.value })}
                    placeholder="URL ảnh sản phẩm..."
                    className={`mt-2 w-full p-1.5 rounded text-[11px] border ${
                      isLight ? 'bg-white border-slate-300' : 'bg-[#18181D] border-[#2F2F37] text-white'
                    }`}
                  />
                </div>

                {/* Primary Info Inputs */}
                <div className="md:col-span-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">Tên sản phẩm (*):</label>
                      <input
                        type="text"
                        value={editedProduct.name || ''}
                        onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                        className={`w-full p-2 rounded-lg border font-bold ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">Dòng sản phẩm (*):</label>
                      <select
                        value={editedProduct.productLine || 'Bi LED'}
                        onChange={(e) => setEditedProduct({ ...editedProduct, productLine: e.target.value as any })}
                        className={`w-full p-2 rounded-lg border font-bold ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                        }`}
                      >
                        <option value="Bi LED">Bi LED</option>
                        <option value="Bi Gầm">Bi Gầm</option>
                        <option value="Bóng LED">Bóng LED</option>
                        <option value="Bi LED Mini">Bi LED Mini</option>
                        <option value="Trợ Sáng">Trợ Sáng</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">Mã SKU:</label>
                      <input
                        type="text"
                        value={editedProduct.sku || ''}
                        onChange={(e) => setEditedProduct({ ...editedProduct, sku: e.target.value })}
                        className={`w-full p-2 rounded-lg border font-mono ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">Giá bán niêm yết:</label>
                      <input
                        type="text"
                        value={editedProduct.retailPrice || ''}
                        onChange={(e) => setEditedProduct({ ...editedProduct, retailPrice: e.target.value })}
                        className={`w-full p-2 rounded-lg border font-bold text-bulbtek-red ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#18181D] border-[#2F2F37]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">Phân khúc:</label>
                      <select
                        value={editedProduct.segment || 'Mid'}
                        onChange={(e) => setEditedProduct({ ...editedProduct, segment: e.target.value as any })}
                        className={`w-full p-2 rounded-lg border ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                        }`}
                      >
                        <option value="Entry">Entry (Phổ thông)</option>
                        <option value="Mid">Mid (Trung cấp)</option>
                        <option value="High">High (Cận cao cấp)</option>
                        <option value="Premium">Premium (Cao cấp)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">Lợi ích cốt lõi (Core Benefit):</label>
                    <textarea
                      rows={2}
                      value={editedProduct.coreBenefit || ''}
                      onChange={(e) => setEditedProduct({ ...editedProduct, coreBenefit: e.target.value })}
                      className={`w-full p-2 rounded-lg border leading-relaxed ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* TECHNICAL SPECS DETAILED GRID */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-500">
                  <Cpu className="w-4 h-4" />
                  <span>Các Biến Số Thông Số Kỹ Thuật (Specs):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  
                  {/* Chip LED */}
                  <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Chip LED:</label>
                    <input
                      type="text"
                      value={editedProduct.specs?.chipLed || ''}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        specs: { ...editedProduct.specs, chipLed: e.target.value }
                      })}
                      className={`w-full p-1.5 rounded border text-xs font-semibold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                      }`}
                    />
                  </div>

                  {/* Công suất */}
                  <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Công suất (Cos / Pha):</label>
                    <input
                      type="text"
                      value={editedProduct.specs?.power || ''}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        specs: { ...editedProduct.specs, power: e.target.value }
                      })}
                      className={`w-full p-1.5 rounded border text-xs font-semibold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                      }`}
                    />
                  </div>

                  {/* Nhiệt màu */}
                  <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nhiệt màu (Kelvin):</label>
                    <input
                      type="text"
                      value={editedProduct.specs?.colorTemp || ''}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        specs: { ...editedProduct.specs, colorTemp: e.target.value }
                      })}
                      className={`w-full p-1.5 rounded border text-xs font-semibold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                      }`}
                    />
                  </div>

                  {/* Độ rọi / Lux */}
                  <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Độ rọi / Quang thông:</label>
                    <input
                      type="text"
                      value={editedProduct.specs?.brightness || ''}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        specs: { ...editedProduct.specs, brightness: e.target.value }
                      })}
                      className={`w-full p-1.5 rounded border text-xs font-semibold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                      }`}
                    />
                  </div>

                  {/* Thời gian bảo hành */}
                  <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Thời gian bảo hành:</label>
                    <input
                      type="text"
                      value={editedProduct.specs?.warranty || ''}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        specs: { ...editedProduct.specs, warranty: e.target.value }
                      })}
                      className={`w-full p-1.5 rounded border text-xs font-semibold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                      }`}
                    />
                  </div>

                  {/* Chuẩn chống nước */}
                  <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Chống nước:</label>
                    <input
                      type="text"
                      value={editedProduct.specs?.waterproof || ''}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        specs: { ...editedProduct.specs, waterproof: e.target.value }
                      })}
                      className={`w-full p-1.5 rounded border text-xs font-semibold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                      }`}
                    />
                  </div>

                  {/* Kích thước Lens */}
                  <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Kích thước Lens:</label>
                    <input
                      type="text"
                      value={editedProduct.specs?.sizeInch || ''}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        specs: { ...editedProduct.specs, sizeInch: e.target.value }
                      })}
                      className={`w-full p-1.5 rounded border text-xs font-semibold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                      }`}
                    />
                  </div>

                  {/* Điện áp */}
                  <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Điện áp hoạt động:</label>
                    <input
                      type="text"
                      value={editedProduct.specs?.voltage || ''}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        specs: { ...editedProduct.specs, voltage: e.target.value }
                      })}
                      className={`w-full p-1.5 rounded border text-xs font-semibold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                      }`}
                    />
                  </div>

                  {/* Tuổi thọ */}
                  <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tuổi thọ bóng:</label>
                    <input
                      type="text"
                      value={editedProduct.specs?.lifespan || ''}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        specs: { ...editedProduct.specs, lifespan: e.target.value }
                      })}
                      className={`w-full p-1.5 rounded border text-xs font-semibold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                      }`}
                    />
                  </div>

                  {/* Khả năng tương thích */}
                  <div className={`p-2.5 rounded-xl border sm:col-span-2 ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Khả năng tương thích (Pát / Jack cắm):</label>
                    <input
                      type="text"
                      value={editedProduct.specs?.compatibility || ''}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        specs: { ...editedProduct.specs, compatibility: e.target.value }
                      })}
                      className={`w-full p-1.5 rounded border text-xs font-semibold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                      }`}
                    />
                  </div>

                  {/* Tính năng đặc biệt */}
                  <div className={`p-2.5 rounded-xl border sm:col-span-3 ${isLight ? 'bg-white border-slate-200' : 'bg-[#121215] border-[#2F2F37]'}`}>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tính năng & Điểm nhấn đặc biệt:</label>
                    <input
                      type="text"
                      value={editedProduct.specs?.specialFeatures || ''}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        specs: { ...editedProduct.specs, specialFeatures: e.target.value }
                      })}
                      className={`w-full p-1.5 rounded border text-xs font-semibold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#18181D] border-[#2F2F37] text-white'
                      }`}
                    />
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className={`p-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2A2A32]'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
              isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#18181D] hover:bg-[#202026] border-[#2F2F37] text-gray-300'
            }`}
          >
            Đóng
          </button>

          {editedProduct && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleApplyToForm}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 ${
                  isLight 
                    ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-300 text-indigo-700' 
                    : 'bg-indigo-950/40 hover:bg-indigo-900/50 border-indigo-800 text-indigo-300'
                }`}
                title="Điền dữ liệu trích xuất vào form chính để tiếp tục chỉnh sửa"
              >
                <FileEdit className="w-4 h-4" />
                <span>Điền vào Form cấu hình</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDirectly}
                className="px-5 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition flex items-center space-x-1.5"
                title="Lưu ngay sản phẩm này vào cơ sở dữ liệu và chọn làm sản phẩm hiện tại"
              >
                <Save className="w-4 h-4" />
                <span>Lưu & Thêm ngay vào kho SP</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
