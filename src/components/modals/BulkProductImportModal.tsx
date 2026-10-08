import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Link2, 
  Clipboard, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  RefreshCw, 
  Info, 
  Check, 
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  parseExcelFile, 
  fetchAndParseGoogleSheet, 
  parseClipboardText, 
  downloadTemplateExcel, 
  downloadTemplateCsv, 
  ProductImportSummary,
  ParsedProductItem
} from '../../services/productImportService';

interface BulkProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (result: { added: number; updated: number; total: number }) => void;
}

type ImportSourceTab = 'file' | 'googledrive' | 'clipboard';

export const BulkProductImportModal: React.FC<BulkProductImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const { products: existingProducts, bulkAddProducts, theme } = useApp();
  const isLight = theme === 'light';

  const [activeSourceTab, setActiveSourceTab] = useState<ImportSourceTab>('file');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleUrl, setGoogleUrl] = useState<string>('');
  const [clipboardText, setClipboardText] = useState<string>('');
  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(true);
  
  // Parsed results from productImportService
  const [summaryData, setSummaryData] = useState<ProductImportSummary | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);

  if (!isOpen) return null;

  // 1. File Upload handler
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const summary = await parseExcelFile(file, existingProducts);
      if (summary.items.length === 0) {
        setErrorMsg('Tệp không chứa sản phẩm hợp lệ nào.');
        setSummaryData(null);
      } else {
        setSummaryData(summary);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể đọc file Excel/CSV. Vui lòng kiểm tra định dạng.');
      setSummaryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 2. Google Drive / Sheets URL Fetcher
  const handleFetchGoogle = async () => {
    if (!googleUrl.trim()) {
      setErrorMsg('Vui lòng dán liên kết Google Sheets hoặc Google Drive chứa bảng dữ liệu.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const summary = await fetchAndParseGoogleSheet(googleUrl.trim(), existingProducts);
      if (summary.items.length === 0) {
        setErrorMsg('Không tìm thấy dòng sản phẩm nào từ liên kết Google Sheets/Drive.');
        setSummaryData(null);
      } else {
        setSummaryData(summary);
      }
    } catch (err: any) {
      setErrorMsg(
        (err.message || 'Không thể tải dữ liệu từ liên kết.') + 
        ' Gợi ý: Hãy kiểm tra file đã bật "Bất kỳ ai có liên kết đều có thể xem", hoặc dùng Tab "Dán từ bảng tính" để copy-paste trực tiếp.'
      );
      setSummaryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Clipboard Text Parse
  const handleParseClipboard = () => {
    if (!clipboardText.trim()) {
      setErrorMsg('Vui lòng dán nội dung từ bảng tính vào ô văn bản.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const summary = parseClipboardText(clipboardText, existingProducts);
      if (summary.items.length === 0) {
        setErrorMsg('Dữ liệu dán không chứa sản phẩm nào.');
        setSummaryData(null);
      } else {
        setSummaryData(summary);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể xử lý văn bản đã dán.');
      setSummaryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove an item from preview table
  const handleRemoveRow = (index: number) => {
    if (!summaryData) return;
    const newItems = [...summaryData.items];
    newItems.splice(index, 1);
    const validCount = newItems.filter(i => i.isValid).length;
    const errorCount = newItems.filter(i => !i.isValid).length;
    const warningCount = newItems.filter(i => i.warnings.length > 0).length;
    const duplicateSkuCount = newItems.filter(i => i.isDuplicateSku).length;
    const newCount = validCount - duplicateSkuCount;
    setSummaryData({
      items: newItems,
      validCount,
      errorCount,
      warningCount,
      duplicateSkuCount,
      newCount
    });
  };

  // Perform final import into AppContext
  const handleConfirmImport = () => {
    if (!summaryData || summaryData.items.length === 0) return;

    // Filter candidate products to import (valid products with non-empty names)
    const candidatesToImport = summaryData.items
      .filter(item => item.product.name.trim() !== '')
      .map(item => item.product);

    if (candidatesToImport.length === 0) {
      setErrorMsg('Không có sản phẩm hợp lệ nào để nhập.');
      return;
    }

    const result = bulkAddProducts(candidatesToImport, overwriteExisting);
    if (onImportSuccess) {
      onImportSuccess(result);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className={`border rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#18181D] border-[#2A2A32] text-white'
      }`}>
        
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between sticky top-0 z-10 ${
          isLight ? 'bg-white/95 border-slate-200' : 'bg-[#18181D]/95 border-[#2A2A32]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isLight ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}>
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Thêm Sản Phẩm Hàng Loạt
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 font-semibold border border-red-500/30">
                  Bulk Import
                </span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Nhập danh mục sản phẩm nhanh chóng qua tệp Excel, CSV hoặc Google Drive / Sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-neutral-800'
              }`}
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
          
          {/* Top Info Banner & Step 1: Template Download & Guidelines */}
          <div className={`p-4 rounded-xl border space-y-3 transition-all ${
            isLight ? 'bg-amber-50/80 border-amber-200 text-slate-800' : 'bg-neutral-800/70 border-neutral-700/80 text-neutral-200'
          }`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 shrink-0 mt-0.5">
                  <Info className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
                      Bước 1: Tải Biểu Mẫu Chuẩn (Tránh Lỗi Sai Định Dạng Cột)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium text-[11px] border border-emerald-500/30">
                      Đồng bộ 100%
                    </span>
                  </div>
                  <p className={isLight ? 'text-slate-600' : 'text-neutral-400'}>
                    Tệp mẫu Excel gồm <strong>2 Sheet</strong>: Sheet 1 (Danh sách SP mẫu chuẩn hóa) và Sheet 2 (Bảng hướng dẫn quy chuẩn chi tiết từng cột).
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={downloadTemplateExcel}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition text-xs font-semibold shadow-sm"
                  title="Tải biểu mẫu Excel gồm 2 Sheet có sẵn dữ liệu mẫu"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải Biểu Mẫu Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={downloadTemplateCsv}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border transition text-xs font-semibold ${
                    isLight 
                      ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm' 
                      : 'bg-neutral-700/60 text-neutral-200 border-neutral-600 hover:bg-neutral-700'
                  }`}
                  title="Tải biểu mẫu CSV chuẩn UTF-8"
                >
                  <Download className="w-3.5 h-3.5" />
                  Mẫu CSV (.csv)
                </button>
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                    showGuide
                      ? 'bg-amber-500 text-white border-amber-500'
                      : isLight 
                        ? 'bg-amber-100/70 hover:bg-amber-200/80 border-amber-300 text-amber-900' 
                        : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
                  }`}
                  title="Bấm để xem hướng dẫn quy chuẩn các cột dữ liệu"
                >
                  {showGuide ? 'Ẩn quy chuẩn ✕' : '📖 Xem quy chuẩn cột'}
                </button>
              </div>
            </div>

            {/* Accordion Guide Table */}
            {showGuide && (
              <div className={`pt-3 border-t text-xs space-y-2 animate-fadeIn ${
                isLight ? 'border-amber-200/80' : 'border-neutral-700'
              }`}>
                <p className="font-semibold text-amber-600 dark:text-amber-400">
                  📋 Bảng Hướng Dẫn Quy Chuẩn Các Cột Trong Biểu Mẫu:
                </p>
                <div className={`border rounded-lg overflow-hidden max-h-56 overflow-y-auto ${
                  isLight ? 'border-slate-200 bg-white' : 'border-neutral-700 bg-neutral-900/60'
                }`}>
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className={isLight ? 'bg-slate-100 text-slate-700' : 'bg-neutral-800 text-neutral-300'}>
                      <tr>
                        <th className="py-2 px-3 font-semibold border-b border-inherit w-36">Tên Cột</th>
                        <th className="py-2 px-3 font-semibold border-b border-inherit w-24">Bắt buộc?</th>
                        <th className="py-2 px-3 font-semibold border-b border-inherit">Giá trị hợp lệ / Định dạng</th>
                        <th className="py-2 px-3 font-semibold border-b border-inherit">Vai trò đối với AI Content</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-neutral-800 text-neutral-300'}`}>
                      <tr>
                        <td className="py-1.5 px-3 font-bold text-red-600 dark:text-red-400">Tên Sản Phẩm (*)</td>
                        <td className="py-1.5 px-3 font-semibold text-red-600">BẮT BUỘC</td>
                        <td className="py-1.5 px-3">Tên thương mại đầy đủ (VD: Bi LED Laser Matrix Pro V2)</td>
                        <td className="py-1.5 px-3">Chủ đề chính bài viết, định danh sản phẩm</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-medium">Mã SKU</td>
                        <td className="py-1.5 px-3 text-amber-600">Khuyên dùng</td>
                        <td className="py-1.5 px-3 font-mono">BTK-LS-PRO, BTK-FOG-3000...</td>
                        <td className="py-1.5 px-3">Nhận diện chống trùng lặp & ghi đè cập nhật</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-medium">Dòng Sản Phẩm</td>
                        <td className="py-1.5 px-3 opacity-70">Tùy chọn</td>
                        <td className="py-1.5 px-3">Bi LED | Bi Gầm | Bóng LED | Bi LED Mini | Trợ Sáng</td>
                        <td className="py-1.5 px-3">Phân loại bộ lọc Tab 1 và ngữ cảnh bài viết</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-medium text-blue-600 dark:text-blue-400">Sản Phẩm Phù Hợp</td>
                        <td className="py-1.5 px-3 text-amber-600">Khuyên dùng</td>
                        <td className="py-1.5 px-3 font-semibold">Xe ô tô | Xe máy/mô tô | Cả Hai</td>
                        <td className="py-1.5 px-3">Định hướng AI viết đúng đối tượng chủ xe ô tô hay biker</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-medium">Kích Thước (inch)</td>
                        <td className="py-1.5 px-3 text-amber-600">Khuyên dùng</td>
                        <td className="py-1.5 px-3">3.0 inch | 2.0 inch | 1.8 inch | 1.5 inch...</td>
                        <td className="py-1.5 px-3">Kích thước chóa độ xe chính xác để tư vấn</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-medium">Chuẩn Kháng Nước</td>
                        <td className="py-1.5 px-3 text-amber-600">Khuyên dùng</td>
                        <td className="py-1.5 px-3">IP68 | IP67 | IP65...</td>
                        <td className="py-1.5 px-3">Dữ liệu kháng nước cho AI nhấn mạnh độ bền</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-medium">Giá Bán Lẻ</td>
                        <td className="py-1.5 px-3 opacity-70">Tùy chọn</td>
                        <td className="py-1.5 px-3">8.500.000 đ hoặc 8500000</td>
                        <td className="py-1.5 px-3">Báo giá chính xác & lời kêu gọi hành động (CTA)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-medium">Trạng Thái</td>
                        <td className="py-1.5 px-3 opacity-70">Tùy chọn</td>
                        <td className="py-1.5 px-3">Hero Product | Sản phẩm mới | Sản phẩm hiện hữu | Clearance</td>
                        <td className="py-1.5 px-3">Xác định tông giọng (Ra mắt, Bán chạy, Xả kho)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-medium">Lợi Ích Cốt Lõi</td>
                        <td className="py-1.5 px-3 text-amber-600">Khuyên dùng</td>
                        <td className="py-1.5 px-3">1-2 câu miêu tả giá trị nổi bật nhất</td>
                        <td className="py-1.5 px-3">Kim chỉ nam tạo Hook Facebook & TikTok</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-medium">Chip LED, Công Suất, Bảo Hành</td>
                        <td className="py-1.5 px-3 opacity-70">Tùy chọn</td>
                        <td className="py-1.5 px-3">Osram, Cos 65W/Pha 85W, 3 năm 1 đổi 1...</td>
                        <td className="py-1.5 px-3">Thông số kỹ thuật chuẩn xác, chống AI bịa đặt</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Source Tabs */}
          <div className={`flex border-b ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
            <button
              onClick={() => setActiveSourceTab('file')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                activeSourceTab === 'file'
                  ? 'border-red-500 text-red-600 dark:text-red-400 bg-red-500/5'
                  : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              1. Tải lên File Excel / CSV
            </button>
            <button
              onClick={() => setActiveSourceTab('googledrive')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                activeSourceTab === 'googledrive'
                  ? 'border-red-500 text-red-600 dark:text-red-400 bg-red-500/5'
                  : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Link2 className="w-4 h-4" />
              2. Google Drive / Sheets Link
            </button>
            <button
              onClick={() => setActiveSourceTab('clipboard')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                activeSourceTab === 'clipboard'
                  ? 'border-red-500 text-red-600 dark:text-red-400 bg-red-500/5'
                  : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Clipboard className="w-4 h-4" />
              3. Dán bảng tính trực tiếp (Ctrl+V)
            </button>
          </div>

          {/* Tab 1: File Upload */}
          {activeSourceTab === 'file' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={onFileInputChange}
                className="hidden"
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-xl cursor-pointer flex flex-col items-center justify-center text-center transition ${
                  dragOver 
                    ? 'border-red-500 bg-red-500/10' 
                    : isLight
                      ? 'border-slate-300 bg-slate-50/70 hover:border-red-400 hover:bg-slate-100/70'
                      : 'border-neutral-700 bg-neutral-800/30 hover:border-neutral-500 hover:bg-neutral-800/60'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-3 ${
                  isLight ? 'bg-white border-slate-200 text-red-600' : 'bg-neutral-800 border-neutral-700 text-red-400'
                }`}>
                  <Upload className="w-6 h-6" />
                </div>
                <p className={`text-sm font-semibold mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  Kéo thả tệp Excel / CSV vào đây hoặc <span className="text-red-600 dark:text-red-400 underline">bấm để chọn tệp</span>
                </p>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Hỗ trợ định dạng: .xlsx, .xls, .csv (Tự động nhận diện các cột Tên sản phẩm, Mã SKU, Giá, Dòng SP, Phân khúc...)
                </p>
                <div className="mt-4 pt-3 border-t border-dashed border-inherit flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadTemplateExcel();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold underline transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Chưa có tệp đúng chuẩn? Bấm vào đây để tải Biểu Mẫu Excel chuẩn (.xlsx)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Google Drive / Sheets Link */}
          {activeSourceTab === 'googledrive' && (
            <div className={`space-y-3 p-4 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-800/40 border-neutral-800'
            }`}>
              <div className="flex items-start gap-2 text-xs">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Cách kết nối file Google Drive / Google Sheets:</p>
                  <ol className={`list-decimal ml-4 mt-1 space-y-0.5 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    <li>Mở tệp Google Sheets hoặc file Excel trên Google Drive của bạn.</li>
                    <li>Bấm nút <strong>Chia sẻ (Share)</strong> ở góc trên bên phải → Đặt quyền <strong>"Bất kỳ ai có đường liên kết (Anyone with link) - Người xem"</strong>.</li>
                    <li>Sao chép liên kết và dán vào ô bên dưới rồi bấm <strong>"Tải & Đọc dữ liệu"</strong>.</li>
                  </ol>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <input
                  type="text"
                  value={googleUrl}
                  onChange={(e) => setGoogleUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/... hoặc https://drive.google.com/file/d/..."
                  className={`flex-1 border rounded-xl px-4 py-2.5 text-xs transition focus:outline-none focus:border-red-500 ${
                    isLight 
                      ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' 
                      : 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleFetchGoogle}
                  disabled={isLoading || !googleUrl.trim()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold transition shrink-0"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      Tải & Đọc dữ liệu
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Clipboard Paste */}
          {activeSourceTab === 'clipboard' && (
            <div className="space-y-3">
              <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                Mở bảng tính Google Sheets hoặc Excel, bôi đen các ô dữ liệu (bao gồm cả dòng tiêu đề), bấm <kbd className={`px-1.5 py-0.5 border rounded ${isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-neutral-800 border-neutral-700 text-neutral-200'}`}>Ctrl + C</kbd>, sau đó bấm vào khung bên dưới và bấm <kbd className={`px-1.5 py-0.5 border rounded ${isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-neutral-800 border-neutral-700 text-neutral-200'}`}>Ctrl + V</kbd>.
              </div>
              <textarea
                rows={5}
                value={clipboardText}
                onChange={(e) => setClipboardText(e.target.value)}
                placeholder="Dán hàng bảng tính vào đây (vd: Tên sản phẩm [Tab] SKU [Tab] Dòng sản phẩm [Tab] Giá bán...)"
                className={`w-full border rounded-xl p-3 text-xs focus:outline-none focus:border-red-500 font-mono ${
                  isLight 
                    ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' 
                    : 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-600'
                }`}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParseClipboard}
                  disabled={isLoading || !clipboardText.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold transition"
                >
                  <FileCheck className="w-4 h-4" />
                  Xử lý dữ liệu đã dán
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Section */}
          {summaryData && (
            <div className={`space-y-4 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
              {/* Summary Stats & Options */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-800/50 border-neutral-700/60'
              }`}>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Đã đọc được: <span className="text-red-600 dark:text-red-400">{summaryData.items.length}</span> sản phẩm
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    <Check className="w-3 h-3" /> Hợp lệ: {summaryData.validCount}
                  </span>
                  {summaryData.duplicateSkuCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      <AlertTriangle className="w-3 h-3" /> Trùng SKU: {summaryData.duplicateSkuCount}
                    </span>
                  )}
                  {summaryData.errorCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                      <AlertCircle className="w-3 h-3" /> Thiếu tên: {summaryData.errorCount}
                    </span>
                  )}
                </div>

                <label className={`flex items-center gap-2 text-xs cursor-pointer select-none ${
                  isLight ? 'text-slate-700' : 'text-neutral-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    className="rounded border-slate-300 dark:border-neutral-700 text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span>Ghi đè thông tin nếu trùng SKU hoặc Tên</span>
                </label>
              </div>

              {/* Data Preview Table */}
              <div className={`border rounded-xl overflow-hidden max-h-[280px] overflow-y-auto ${
                isLight ? 'border-slate-200 bg-white' : 'border-neutral-700/80 bg-neutral-900/40'
              }`}>
                <table className="w-full text-left text-xs border-collapse">
                  <thead className={`sticky top-0 z-10 ${
                    isLight ? 'bg-slate-100 text-slate-700' : 'bg-neutral-800 text-neutral-300'
                  }`}>
                    <tr>
                      <th className="py-2.5 px-3 font-semibold border-b border-inherit w-12 text-center">STT</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-inherit w-28">Trạng thái</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-inherit min-w-[160px]">Tên sản phẩm</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-inherit w-28">Mã SKU</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-inherit w-28">Dòng SP</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-inherit w-28 text-blue-500">Phù hợp</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-inherit w-24">Size Lens</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-inherit w-28">Kháng nước</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-inherit w-24">Phân khúc</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-inherit w-28">Giá niêm yết</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-inherit min-w-[160px]">Lợi ích cốt lõi</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-inherit w-12 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-[11px] ${
                    isLight ? 'divide-slate-200 text-slate-800' : 'divide-neutral-800 text-neutral-300'
                  }`}>
                    {summaryData.items.map((item: ParsedProductItem, idx: number) => (
                      <tr 
                        key={idx}
                        className={`transition ${
                          isLight 
                            ? !item.isValid ? 'bg-rose-50' : item.isDuplicateSku ? 'bg-amber-50/60' : 'hover:bg-slate-50'
                            : !item.isValid ? 'bg-rose-950/20' : item.isDuplicateSku ? 'bg-amber-950/10' : 'hover:bg-neutral-800/40'
                        }`}
                      >
                        <td className="py-2 px-3 text-center opacity-60">{idx + 1}</td>
                        <td className="py-2 px-3">
                          {item.isValid && !item.isDuplicateSku && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Mới
                            </span>
                          )}
                          {item.isDuplicateSku && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" title={item.warnings.join(', ') || 'SKU đã tồn tại trong kho'}>
                              <AlertTriangle className="w-3 h-3" /> Trùng SKU
                            </span>
                          )}
                          {!item.isValid && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" title={item.errors.join(', ')}>
                              <AlertCircle className="w-3 h-3" /> Lỗi
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold font-sans">
                          {item.product.name || <span className="text-rose-500 italic">Thiếu tên sản phẩm</span>}
                        </td>
                        <td className="py-2 px-3 font-mono">{item.product.sku || '-'}</td>
                        <td className="py-2 px-3 font-sans opacity-80">{item.product.productLine || '-'}</td>
                        <td className="py-2 px-3 font-sans font-medium text-blue-600 dark:text-blue-400">
                          {item.product.suitableFor || 'Xe ô tô'}
                        </td>
                        <td className="py-2 px-3 font-mono">{item.product.specs?.sizeInch || '-'}</td>
                        <td className="py-2 px-3 font-sans opacity-80">{item.product.specs?.waterproof || '-'}</td>
                        <td className="py-2 px-3 font-sans opacity-80">{item.product.segment || '-'}</td>
                        <td className="py-2 px-3 font-semibold text-red-600 dark:text-red-400 font-mono">{item.product.retailPrice || '-'}</td>
                        <td className="py-2 px-3 font-sans opacity-80 truncate max-w-[200px]" title={item.product.coreBenefit}>
                          {item.product.coreBenefit || '-'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="opacity-50 hover:opacity-100 hover:text-rose-500 transition"
                            title="Xóa dòng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between sticky bottom-0 ${
          isLight ? 'bg-white/95 border-slate-200' : 'bg-[#18181D]/95 border-[#2A2A32]'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
              isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {summaryData && summaryData.items.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isLoading || summaryData.items.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition shadow-lg shadow-red-600/20"
              >
                <Check className="w-4 h-4" />
                Xác nhận nhập ({summaryData.items.length} sản phẩm) vào kho
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
