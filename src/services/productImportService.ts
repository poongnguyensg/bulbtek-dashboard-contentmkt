import * as XLSX from 'xlsx';
import { Product, ProductLine, ProductStatus, TargetAudience, SuitableVehicle, ProductSegment, ProductStage } from '../types';

export interface ParsedProductItem {
  rawRow: Record<string, any>;
  product: Product;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicateSku: boolean;
}

export interface ProductImportSummary {
  items: ParsedProductItem[];
  validCount: number;
  warningCount: number;
  errorCount: number;
  duplicateSkuCount: number;
  newCount: number;
}

/**
 * Loại bỏ dấu tiếng Việt và ký tự đặc biệt để chuẩn hoá tên cột
 */
const cleanKey = (str: string): string => {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

/**
 * Chuẩn hóa Dòng sản phẩm (Product Line) của Bulbtek
 */
const normalizeProductLine = (val: any): ProductLine => {
  const s = cleanKey(String(val || ''));
  if (s.includes('bilaser') || s.includes('laser')) return 'Bi LASER';
  if (s.includes('biledmini') || s.includes('miniled') || s.includes('mini')) return 'Bi LED Mini';
  if (s.includes('bigam') || s.includes('fog') || s.includes('gam')) return 'Bi Gầm';
  if (s.includes('bongled') || s.includes('bong')) return 'Bóng LED';
  if (s.includes('trosang') || s.includes('tro')) return 'Trợ Sáng';
  if (s.includes('branding')) return 'Branding Sản Phẩm';
  if (s.includes('robot') || s.includes('mascot')) return 'Linh Vật Robot BU';
  return 'Bi LED'; // Mặc định
};

/**
 * Chuẩn hóa Trạng thái sản phẩm
 */
const normalizeStatus = (val: any): ProductStatus => {
  const s = cleanKey(String(val || ''));
  if (s.includes('hero') || s.includes('chudao') || s.includes('hot')) return 'Hero Product';
  if (s.includes('moi') || s.includes('new') || s.includes('launch')) return 'Sản phẩm mới';
  if (s.includes('xakho') || s.includes('clearance') || s.includes('giamgia')) return 'Clearance';
  return 'Sản phẩm hiện hữu';
};

/**
 * Chuẩn hóa Phân khúc sản phẩm
 */
const normalizeSegment = (val: any): ProductSegment => {
  const s = cleanKey(String(val || ''));
  if (s.includes('premium') || s.includes('caocap') || s.includes('cao')) return 'Premium';
  if (s.includes('entry') || s.includes('phothong') || s.includes('tieucheuan')) return 'Entry';
  return 'Mid';
};

/**
 * Chuẩn hóa Khách hàng mục tiêu
 */
const normalizeAudience = (val: any): TargetAudience => {
  const s = cleanKey(String(val || ''));
  if (s.includes('b2b') || s.includes('daily') || s.includes('gara')) return 'B2B Dealer';
  if (s.includes('b2c') || s.includes('nguoidung') || s.includes('cuoi')) return 'B2C Người dùng cuối';
  return 'Cả hai';
};

/**
 * Chuẩn hóa Vòng đời (Stage)
 */
const normalizeStage = (val: any): ProductStage => {
  const s = cleanKey(String(val || ''));
  if (s.includes('launch') || s.includes('ramat')) return 'Launch';
  if (s.includes('maintain') || s.includes('duytri')) return 'Maintain';
  if (s.includes('clearance') || s.includes('xakho')) return 'Clearance';
  return 'Growth';
};

/**
 * Chuẩn hóa Sản phẩm phù hợp (Xe ô tô, Xe máy/mô tô, Cả Hai)
 */
export const normalizeSuitableFor = (val: any): SuitableVehicle => {
  const s = cleanKey(String(val || ''));
  if (s.includes('moto') || s.includes('xemay') || s.includes('may') || s.includes('2banh')) return 'Xe máy/mô tô';
  if (s.includes('cahai') || s.includes('ca2') || s.includes('both') || s.includes('tatca')) return 'Cả Hai';
  if (s.includes('oto') || s.includes('xehoi') || s.includes('car') || s.includes('4banh')) return 'Xe ô tô';
  return 'Xe ô tô'; // Mặc định
};

/**
 * Chuyển đổi 1 dòng thô từ Excel/Google Sheets thành đối tượng Product hoàn chỉnh
 */
export const mapRawRowToProduct = (
  row: Record<string, any>, 
  index: number,
  existingProducts: Product[] = []
): ParsedProductItem => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Tạo map chuẩn hoá key
  const normalizedRow: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    if (value !== undefined && value !== null) {
      normalizedRow[cleanKey(key)] = typeof value === 'string' ? value.trim() : String(value);
    }
  }

  // 1. Tên sản phẩm
  const name = 
    normalizedRow['tensanpham'] || 
    normalizedRow['tensp'] || 
    normalizedRow['ten'] || 
    normalizedRow['productname'] || 
    normalizedRow['name'] || 
    normalizedRow['sanpham'] || 
    '';

  if (!name) {
    errors.push('Thiếu tên sản phẩm bắt buộc.');
  }

  // 2. Mã SKU
  let sku = 
    normalizedRow['masku'] || 
    normalizedRow['sku'] || 
    normalizedRow['masanpham'] || 
    normalizedRow['masp'] || 
    normalizedRow['code'] || 
    '';

  if (!sku) {
    // Tự sinh SKU nếu thiếu
    sku = `BTK-${Date.now().toString().slice(-4)}-${index + 1}`;
    warnings.push(`Thiếu mã SKU, hệ thống tự động gán: ${sku}`);
  }

  // Kiểm tra trùng SKU trong danh sách hiện hữu
  const isDuplicateSku = existingProducts.some(p => p.sku?.toUpperCase() === sku.toUpperCase());

  // 3. Dòng sản phẩm
  const lineRaw = 
    normalizedRow['dongsanpham'] || 
    normalizedRow['dongsp'] || 
    normalizedRow['productline'] || 
    normalizedRow['line'] || 
    normalizedRow['phanloai'] || 
    '';
  const productLine = normalizeProductLine(lineRaw);

  // 4. Giá bán lẻ
  let retailPrice = 
    normalizedRow['giabanle'] || 
    normalizedRow['giaban'] || 
    normalizedRow['gia'] || 
    normalizedRow['retailprice'] || 
    normalizedRow['price'] || 
    normalizedRow['gianiemyet'] || 
    '';
  if (!retailPrice) {
    retailPrice = 'Liên hệ đại lý';
  } else if (!retailPrice.toLowerCase().includes('đ') && !retailPrice.toLowerCase().includes('vnd')) {
    // Thêm ký hiệu tiền tệ nếu là số thuần
    const num = Number(retailPrice.replace(/[^0-9]/g, ''));
    if (!isNaN(num) && num > 0) {
      retailPrice = num.toLocaleString('vi-VN') + ' đ';
    }
  }

  // 5. Trạng thái & Phân khúc
  const status = normalizeStatus(normalizedRow['trangthai'] || normalizedRow['status'] || normalizedRow['tinhtrang']);
  const segment = normalizeSegment(normalizedRow['phankhuc'] || normalizedRow['segment']);
  const targetAudience = normalizeAudience(normalizedRow['khachhangmuctieu'] || normalizedRow['doituong'] || normalizedRow['targetaudience']);
  const suitableFor = normalizeSuitableFor(
    normalizedRow['sanphamphuhop'] ||
    normalizedRow['phuhop'] ||
    normalizedRow['dongxe'] ||
    normalizedRow['loaixe'] ||
    normalizedRow['xe'] ||
    normalizedRow['phuhopcho'] ||
    normalizedRow['suitablefor'] ||
    'Xe ô tô'
  );
  const stage = normalizeStage(normalizedRow['giaidoan'] || normalizedRow['stage']);

  // 6. Lợi ích cốt lõi
  let coreBenefit = 
    normalizedRow['loichcotloi'] || 
    normalizedRow['corebenefit'] || 
    normalizedRow['diemnoibat'] || 
    normalizedRow['uudiem'] || 
    normalizedRow['benefit'] || 
    normalizedRow['congdung'] || 
    '';
  if (!coreBenefit) {
    coreBenefit = `Tăng sáng an toàn, bám đường vượt trội trong mọi điều kiện thời tiết`;
    warnings.push('Chưa có lợi ích cốt lõi, áp dụng mô tả tiêu chuẩn');
  }

  // 7. Thông số kỹ thuật (Specs)
  const specs = {
    chipLed: 
      normalizedRow['chipled'] || 
      normalizedRow['chip'] || 
      normalizedRow['loaichip'] || 
      normalizedRow['ledchip'] || 
      'Osram LED Chips công nghệ cao',
    colorTemp: 
      normalizedRow['nhietmau'] || 
      normalizedRow['mau'] || 
      normalizedRow['colortemp'] || 
      normalizedRow['kelvin'] || 
      '5500K (Trắng ấm bám đường)',
    brightness: 
      normalizedRow['dosang'] || 
      normalizedRow['lumen'] || 
      normalizedRow['lux'] || 
      normalizedRow['brightness'] || 
      '9.500 Lux — 12.000 LM',
    power: 
      normalizedRow['congsuat'] || 
      normalizedRow['power'] || 
      normalizedRow['watt'] || 
      normalizedRow['w'] || 
      'Cos 55W / Pha 65W',
    voltage: 
      normalizedRow['dienap'] || 
      normalizedRow['voltage'] || 
      normalizedRow['volt'] || 
      '12V - 24V',
    lifespan: 
      normalizedRow['tuoitho'] || 
      normalizedRow['lifespan'] || 
      '50.000 giờ',
    warranty: 
      normalizedRow['baohanh'] || 
      normalizedRow['warranty'] || 
      '3 năm 1 đổi 1 chính hãng',
    compatibility: 
      normalizedRow['tuongthich'] || 
      normalizedRow['chanxoay'] || 
      normalizedRow['compatibility'] || 
      'Cắm giắc zin 100%, chân xoáy đa năng tương thích 95% dòng xe',
    sizeInch:
      normalizedRow['kichthuocinch'] ||
      normalizedRow['kichthuoc'] ||
      normalizedRow['inch'] ||
      normalizedRow['lens'] ||
      normalizedRow['size'] ||
      normalizedRow['sizeinch'] ||
      '3.0 inch',
    waterproof:
      normalizedRow['chuankhangnuoc'] ||
      normalizedRow['khangnuoc'] ||
      normalizedRow['chongnuoc'] ||
      normalizedRow['waterproof'] ||
      normalizedRow['ip'] ||
      'IP68',
    specialFeatures: 
      normalizedRow['tinhnangdacbiet'] || 
      normalizedRow['dacdiemnoibat'] || 
      normalizedRow['specialfeatures'] || 
      'Đường cắt cos sắc nét chống chói, tản nhiệt nhôm ADC12 + ống đồng kép'
  };

  // 8. Link ảnh & Ghi chú
  const imageUrl = 
    normalizedRow['linkanh'] || 
    normalizedRow['hinhanh'] || 
    normalizedRow['image'] || 
    normalizedRow['imageurl'] || 
    normalizedRow['anh'] || 
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&auto=format&fit=crop&q=80';

  const internalNotes = 
    normalizedRow['ghichu'] || 
    normalizedRow['ghichunoibo'] || 
    normalizedRow['notes'] || 
    'Nhập tự động từ bảng tính';

  const product: Product = {
    id: `prod-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
    name,
    productLine,
    sku,
    status,
    retailPrice,
    suitableFor,
    targetAudience,
    segment,
    specs,
    coreBenefit,
    stage,
    internalNotes,
    imageUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return {
    rawRow: row,
    product,
    isValid: errors.length === 0,
    errors,
    warnings,
    isDuplicateSku
  };
};

/**
 * Xử lý danh sách thô sau khi parse thành summary
 */
export const processRawRowsToSummary = (
  rawRows: Record<string, any>[],
  existingProducts: Product[] = []
): ProductImportSummary => {
  const items: ParsedProductItem[] = rawRows
    .filter(row => row && Object.keys(row).length > 0)
    .map((row, idx) => mapRawRowToProduct(row, idx, existingProducts));

  const validCount = items.filter(i => i.isValid).length;
  const errorCount = items.filter(i => !i.isValid).length;
  const warningCount = items.filter(i => i.warnings.length > 0).length;
  const duplicateSkuCount = items.filter(i => i.isDuplicateSku).length;
  const newCount = validCount - duplicateSkuCount;

  return {
    items,
    validCount,
    warningCount,
    errorCount,
    duplicateSkuCount,
    newCount
  };
};

/**
 * Đọc file Excel / CSV tải lên từ máy tính
 */
export const parseExcelFile = async (
  file: File, 
  existingProducts: Product[] = []
): Promise<ProductImportSummary> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Lấy sheet đầu tiên
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        if (!worksheet) {
          throw new Error('Tệp không có dữ liệu bảng tính hợp lệ.');
        }

        // Chuyển sheet sang mảng JSON đối tượng
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        const summary = processRawRowsToSummary(rawJson, existingProducts);
        resolve(summary);
      } catch (err: any) {
        reject(new Error(err.message || 'Không thể đọc tệp Excel/CSV. Vui lòng kiểm tra lại định dạng.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Lỗi khi đọc file từ hệ thống.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Phân tích dữ liệu văn bản copy từ clipboard (TSV / CSV)
 */
export const parseClipboardText = (
  text: string, 
  existingProducts: Product[] = []
): ProductImportSummary => {
  if (!text || !text.trim()) {
    return {
      items: [],
      validCount: 0,
      warningCount: 0,
      errorCount: 0,
      duplicateSkuCount: 0,
      newCount: 0
    };
  }

  // Tách dòng
  const lines = text.trim().split(/\r\n|\n|\r/).filter(Boolean);
  if (lines.length < 2) {
    throw new Error('Dữ liệu dán cần có ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu.');
  }

  // Nhận diện phân cách (Tab hoặc Dấu phẩy)
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));

  const rawRows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
    const row: Record<string, any> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] !== undefined ? values[idx] : '';
    });
    rawRows.push(row);
  }

  return processRawRowsToSummary(rawRows, existingProducts);
};

/**
 * Tự động tải và phân tích dữ liệu từ liên kết Google Sheets hoặc Google Drive
 */
export const fetchAndParseGoogleSheet = async (
  inputUrl: string, 
  existingProducts: Product[] = []
): Promise<ProductImportSummary> => {
  const url = inputUrl.trim();

  let fetchUrl = url;

  // 1. Nếu là Google Sheets thông thường:
  // Ví dụ: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing
  const sheetsRegex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const sheetsMatch = url.match(sheetsRegex);

  if (sheetsMatch && sheetsMatch[1]) {
    const sheetId = sheetsMatch[1];
    // Chuyển sang endpoint xuất CSV công khai của Google
    fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  } 
  // 2. Nếu là Google Drive file chia sẻ:
  // Ví dụ: https://drive.google.com/file/d/1_abc123/view?usp=sharing
  else if (url.includes('drive.google.com')) {
    const driveRegex = /\/file\/d\/([a-zA-Z0-9-_]+)/;
    const driveMatch = url.match(driveRegex);
    if (driveMatch && driveMatch[1]) {
      const fileId = driveMatch[1];
      fetchUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }

  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`Máy chủ Google phản hồi mã lỗi: ${response.status}. Vui lòng đảm bảo bảng tính được chia sẻ ở chế độ "Bất kỳ ai có liên kết đều có thể xem".`);
    }

    const contentType = response.headers.get('content-type') || '';

    // Nếu trả về nhị phân (Excel)
    if (contentType.includes('spreadsheet') || contentType.includes('octet-stream')) {
      const buffer = await response.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
      return processRawRowsToSummary(rawJson, existingProducts);
    } 
    // Nếu trả về CSV / text
    else {
      const csvText = await response.text();
      // Nếu Google yêu cầu login (trả về trang HTML đăng nhập Google)
      if (csvText.includes('<!DOCTYPE html>') || csvText.includes('google-site-verification')) {
        throw new Error('Liên kết Google Sheets này chưa được bật quyền công khai. Vui lòng vào Google Sheet -> Chia sẻ -> Chọn "Bất kỳ ai có đường liên kết đều có thể xem", hoặc copy dữ liệu rồi dùng tab "Dán Bảng Tính".');
      }

      // Đọc CSV bằng XLSX
      const workbook = XLSX.read(csvText, { type: 'string' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
      return processRawRowsToSummary(rawJson, existingProducts);
    }
  } catch (err: any) {
    throw new Error(
      err.message || 'Không thể kết nối lấy dữ liệu từ Google Drive/Sheets. Bạn có thể mở bảng tính, bôi đen copy các dòng và chọn tab "Dán Dữ Liệu Bảng" để nhập nhanh 100% không lo lỗi quyền!'
    );
  }
};

/**
 * Tạo và tải xuống file mẫu Excel chuẩn (.xlsx) có 2 Sheet:
 * Sheet 1: Danh_Muc_San_Pham (Chứa dữ liệu mẫu chuẩn của Bulbtek)
 * Sheet 2: Huong_Dan_Quy_Chuan (Giải thích ý nghĩa từng cột và giá trị chuẩn)
 */
export const downloadTemplateExcel = () => {
  // 1. Dữ liệu sản phẩm mẫu
  const sampleData = [
    {
      'Tên Sản Phẩm': 'Bi LED Laser Matrix Pro V2',
      'Mã SKU': 'BTK-LS-PRO',
      'Dòng Sản Phẩm': 'Bi LED',
      'Giá Bán Lẻ': '8.500.000 đ',
      'Sản Phẩm Phù Hợp': 'Xe ô tô',
      'Trạng Thái': 'Hero Product',
      'Phân Khúc': 'Flagship',
      'Giai Đoạn': 'Growth',
      'Lợi Ích Cốt Lõi': 'Pha Laser tâm gom sâu 800m, đường cắt Cos sắc lẹm chống chói đối diện, thấu kính phủ Polarized xanh tím',
      'Chip LED': 'Osram Đức 6+3 Nhân LED + 1 Diode Laser',
      'Kích Thước (inch)': '3.0 inch',
      'Chuẩn Kháng Nước': 'IP65',
      'Nhiệt Màu': '5500K (Trắng ấm bám đường tự nhiên)',
      'Độ Sáng': '12.000 LM — 15.000 Lux',
      'Công Suất': 'Cos 65W — Pha 85W',
      'Điện Áp': '12V - 24V (Tương thích cả xe con & xe tải)',
      'Tuổi Thọ': '50.000 giờ',
      'Bảo Hành': '3 năm 1 đổi 1 chính hãng',
      'Tương Thích': 'Cắm giắc zin 100%, chân xoáy đa năng lắp vừa 95% dòng xe',
      'Tính Năng Đặc Biệt': 'Tản nhiệt quạt ly tâm kép + 2 ống đồng tản nhiệt chân không, đạt chuẩn đăng kiểm',
      'Ghi Chú Nội Bộ': 'Sản phẩm chủ lực cao cấp, chiết khấu gara hấp dẫn'
    },
    {
      'Tên Sản Phẩm': 'Bi Gầm FOG Titan 3000K Phá Sương',
      'Mã SKU': 'BTK-FOG-3000',
      'Dòng Sản Phẩm': 'Bi Gầm',
      'Giá Bán Lẻ': '4.200.000 đ',
      'Sản Phẩm Phù Hợp': 'Cả Hai',
      'Trạng Thái': 'Sản phẩm mới',
      'Phân Khúc': 'Mid',
      'Giai Đoạn': 'Launch',
      'Lợi Ích Cốt Lõi': 'Nhiệt màu vàng 3000K đâm xuyên sương mù và mưa bão, chuẩn chống nước IP68 lội nước vô tư',
      'Chip LED': 'Custom High-Lumen Automotive LED',
      'Kích Thước (inch)': '3.0 inch',
      'Chuẩn Kháng Nước': 'IP68 Chống Nước Tuyệt Đối',
      'Nhiệt Màu': '3000K Vàng Phá Sương',
      'Độ Sáng': '8.500 LM — 10.000 Lux',
      'Công Suất': 'Cos 45W — Pha 55W',
      'Điện Áp': '12V',
      'Tuổi Thọ': '50.000 giờ',
      'Bảo Hành': '2 năm 1 đổi 1 chính hãng',
      'Tương Thích': 'Pass theo xe Toyota, Ford, Hyundai, VinFast cắm zin 100%',
      'Tính Năng Đặc Biệt': 'Tiêu chuẩn chống nước IP68, van thoát hơi tản nhiệt 1 chiều',
      'Ghi Chú Nội Bộ': 'Đẩy mạnh bán vào mùa mưa bão quý 3-4'
    },
    {
      'Tên Sản Phẩm': 'Bi LED Mini Lens H4 Plug & Play',
      'Mã SKU': 'BTK-MINI-H4',
      'Dòng Sản Phẩm': 'Bi LED Mini',
      'Giá Bán Lẻ': '1.800.000 đ',
      'Sản Phẩm Phù Hợp': 'Cả Hai',
      'Trạng Thái': 'Sản phẩm hiện hữu',
      'Phân Khúc': 'Entry',
      'Giai Đoạn': 'Maintain',
      'Lợi Ích Cốt Lõi': 'Giải pháp bi mini lắp chóa đèn H4 không cần đục khoét chóa, giữ trọn zin xe điện và xe xăng',
      'Chip LED': 'CSP High Power Automotive Chips',
      'Kích Thước (inch)': '1.5 inch (Mini H4)',
      'Chuẩn Kháng Nước': 'IP68',
      'Nhiệt Màu': '5500K Ánh sáng chuẩn ban ngày',
      'Độ Sáng': '6.000 LM',
      'Công Suất': 'Cos 35W — Pha 45W',
      'Điện Áp': '12V',
      'Tuổi Thọ': '30.000 giờ',
      'Bảo Hành': '2 năm 1 đổi 1 chính hãng',
      'Tương Thích': 'Chân cắm H4 zin 100%, lắp đặt nhanh 15 phút',
      'Tính Năng Đặc Biệt': 'Có đường cắt cos như bi projector lớn, tự lắp tại nhà dễ dàng',
      'Ghi Chú Nội Bộ': 'Sản phẩm dễ tiếp cận cho người mới bắt đầu độ đèn'
    }
  ];

  // 2. Dữ liệu bảng hướng dẫn quy chuẩn
  const guidelineData = [
    {
      'Tên Cột': 'Tên Sản Phẩm (*)',
      'Bắt Buộc?': 'BẮT BUỘC',
      'Các Giá Trị Hợp Lệ / Định Dạng': 'Tên thương mại đầy đủ (VD: Bi LED Laser Matrix Pro V2)',
      'Ý Nghĩa Đối Với AI Content': 'Dùng làm chủ đề chính của bài viết và định danh sản phẩm'
    },
    {
      'Tên Cột': 'Mã SKU',
      'Bắt Buộc?': 'Khuyên dùng',
      'Các Giá Trị Hợp Lệ / Định Dạng': 'Mã nhận diện duy nhất (VD: BTK-LS-PRO, BTK-FOG-3000)',
      'Ý Nghĩa Đối Với AI Content': 'Dùng để kiểm tra trùng lặp và ghi đè sản phẩm khi cập nhật'
    },
    {
      'Tên Cột': 'Dòng Sản Phẩm',
      'Bắt Buộc?': 'Tùy chọn',
      'Các Giá Trị Hợp Lệ / Định Dạng': 'Bi LED | Bi LASER | Bi Gầm | Bóng LED | Bi LED Mini | Trợ Sáng',
      'Ý Nghĩa Đối Với AI Content': 'Phân loại dòng sản phẩm trên thanh lọc và AI chọn từ vựng kỹ thuật'
    },
    {
      'Tên Cột': 'Sản Phẩm Phù Hợp',
      'Bắt Buộc?': 'Khuyên dùng',
      'Các Giá Trị Hợp Lệ / Định Dạng': 'Xe ô tô | Xe máy/mô tô | Cả Hai',
      'Ý Nghĩa Đối Với AI Content': 'Xác định xe lắp đặt để AI viết đúng bối cảnh chủ xe ô tô hay biker'
    },
    {
      'Tên Cột': 'Giá Bán Lẻ',
      'Bắt Buộc?': 'Tùy chọn',
      'Các Giá Trị Hợp Lệ / Định Dạng': 'Số tiền hoặc chuỗi (VD: 8.500.000 đ, 4.200.000)',
      'Ý Nghĩa Đối Với AI Content': 'Để AI kêu gọi hành động (CTA) và báo giá chính xác'
    },
    {
      'Tên Cột': 'Kích Thước (inch)',
      'Bắt Buộc?': 'Khuyên dùng',
      'Các Giá Trị Hợp Lệ / Định Dạng': '3.0 inch | 2.0 inch | 1.8 inch | 1.5 inch... (VD: 3.0 inch)',
      'Ý Nghĩa Đối Với AI Content': 'Thông số quang học quan trọng để tư vấn độ xe chuẩn chóa'
    },
    {
      'Tên Cột': 'Chuẩn Kháng Nước',
      'Bắt Buộc?': 'Khuyên dùng',
      'Các Giá Trị Hợp Lệ / Định Dạng': 'IP68 | IP67 | IP65... (VD: IP68 Chống Nước)',
      'Ý Nghĩa Đối Với AI Content': 'Nhấn mạnh độ bền bỉ khi lội nước, rửa xe cao áp, mưa bão'
    },
    {
      'Tên Cột': 'Trạng Thái',
      'Bắt Buộc?': 'Tùy chọn',
      'Các Giá Trị Hợp Lệ / Định Dạng': 'Hero Product | Sản phẩm mới | Sản phẩm hiện hữu | Clearance',
      'Ý Nghĩa Đối Với AI Content': 'Giúp AI xác định mức độ ưu tiên và tông giọng ra mắt hay thanh lý'
    },
    {
      'Tên Cột': 'Phân Khúc',
      'Bắt Buộc?': 'Tùy chọn',
      'Các Giá Trị Hợp Lệ / Định Dạng': 'Entry (Phổ thông) | Mid (Tầm trung) | High (Cao cấp) | Flagship (Đầu bảng)',
      'Ý Nghĩa Đối Với AI Content': 'Định vị phong cách bài viết sang trọng hay bình dân'
    },
    {
      'Tên Cột': 'Lợi Ích Cốt Lõi',
      'Bắt Buộc?': 'Khuyên dùng',
      'Các Giá Trị Hợp Lệ / Định Dạng': '1-2 câu miêu tả giá trị lớn nhất (VD: Pha xa 800m, cắt cos chống chói)',
      'Ý Nghĩa Đối Đối Với AI Content': 'Kim chỉ nam xuyên suốt để AI tạo các câu Hook và Caption'
    },
    {
      'Tên Cột': 'Chip LED / Công Suất / Bảo Hành',
      'Bắt Buộc?': 'Tùy chọn',
      'Các Giá Trị Hợp Lệ / Định Dạng': 'VD: Osram, Cos 65W/Pha 85W, 3 năm 1 đổi 1',
      'Ý Nghĩa Đối Với AI Content': 'Dữ liệu kỹ thuật chính xác tuyệt đối, tránh AI bịa đặt thông số'
    }
  ];

  // Tạo Sheet 1: Danh sách sản phẩm
  const wsProducts = XLSX.utils.json_to_sheet(sampleData);
  wsProducts['!cols'] = [
    { wch: 32 }, // Tên Sản Phẩm
    { wch: 16 }, // Mã SKU
    { wch: 16 }, // Dòng Sản Phẩm
    { wch: 16 }, // Giá Bán Lẻ
    { wch: 20 }, // Sản Phẩm Phù Hợp
    { wch: 18 }, // Trạng Thái
    { wch: 14 }, // Phân Khúc
    { wch: 14 }, // Giai Đoạn
    { wch: 50 }, // Lợi Ích Cốt Lõi
    { wch: 30 }, // Chip LED
    { wch: 18 }, // Kích Thước (inch)
    { wch: 24 }, // Chuẩn Kháng Nước
    { wch: 28 }, // Nhiệt Màu
    { wch: 22 }, // Độ Sáng
    { wch: 20 }, // Công Suất
    { wch: 18 }, // Điện Áp
    { wch: 16 }, // Tuổi Thọ
    { wch: 24 }, // Bảo Hành
    { wch: 38 }, // Tương Thích
    { wch: 40 }, // Tính Năng Đặc Biệt
    { wch: 35 }  // Ghi Chú Nội Bộ
  ];

  // Tạo Sheet 2: Hướng dẫn quy chuẩn
  const wsGuide = XLSX.utils.json_to_sheet(guidelineData);
  wsGuide['!cols'] = [
    { wch: 26 }, // Tên Cột
    { wch: 16 }, // Bắt Buộc?
    { wch: 48 }, // Giá trị hợp lệ
    { wch: 55 }  // Ý nghĩa
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, wsProducts, 'DanhSachSanPham');
  XLSX.utils.book_append_sheet(workbook, wsGuide, 'HuongDan_QuyChuan');

  saveWorkbookInBrowser(workbook, 'Bulbtek_Mau_Nhap_San_Pham.xlsx');
};

/**
 * Tải xuống file Excel (.xlsx) trong môi trường trình duyệt một cách an toàn
 * Sử dụng Blob nhị phân và ObjectURL, không phụ thuộc vào Node.js fs.writeFileSync
 */
export const saveWorkbookInBrowser = (workbook: XLSX.WorkBook, fileName: string) => {
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatDateSafe = (dateVal: any): string => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  } catch (e) {
    return String(dateVal);
  }
};

/**
 * Tạo và tải xuống file mẫu CSV (.csv) chuẩn UTF-8 có BOM
 */
export const downloadTemplateCsv = () => {
  const headers = [
    'Tên Sản Phẩm',
    'Mã SKU',
    'Dòng Sản Phẩm',
    'Giá Bán Lẻ',
    'Sản Phẩm Phù Hợp',
    'Trạng Thái',
    'Phân Khúc',
    'Giai Đoạn',
    'Lợi Ích Cốt Lõi',
    'Chip LED',
    'Kích Thước (inch)',
    'Chuẩn Kháng Nước',
    'Nhiệt Màu',
    'Độ Sáng',
    'Công Suất',
    'Điện Áp',
    'Tuổi Thọ',
    'Bảo Hành',
    'Tương Thích',
    'Tính Năng Đặc Biệt',
    'Ghi Chú Nội Bộ'
  ];

  const rows = [
    [
      'Bi LED Laser Matrix Pro V2',
      'BTK-LS-PRO',
      'Bi LED',
      '8.500.000 đ',
      'Xe ô tô',
      'Hero Product',
      'Flagship',
      'Growth',
      'Pha Laser tâm gom sâu 800m đường cắt Cos sắc lẹm chống chói',
      'Osram Đức 6+3 Nhân LED',
      '3.0 inch',
      'IP65',
      '5500K',
      '12.000 LM',
      'Cos 65W Pha 85W',
      '12V - 24V',
      '50.000 giờ',
      '3 năm 1 đổi 1',
      'Cắm giắc zin 100%',
      'Tản nhiệt quạt ly tâm kép',
      'Sản phẩm chủ lực cao cấp'
    ],
    [
      'Bi Gầm FOG Titan 3000K Phá Sương',
      'BTK-FOG-3000',
      'Bi Gầm',
      '4.200.000 đ',
      'Cả Hai',
      'Sản phẩm mới',
      'Mid',
      'Launch',
      'Nhiệt màu vàng 3000K đâm xuyên sương mù và mưa bão chống nước IP68',
      'Custom High-Lumen Automotive LED',
      '3.0 inch',
      'IP68 Chống Nước',
      '3000K Vàng Phá Sương',
      '8.500 LM',
      'Cos 45W Pha 55W',
      '12V',
      '50.000 giờ',
      '2 năm 1 đổi 1',
      'Pass theo xe cắm zin 100%',
      'Chuẩn chống nước IP68',
      'Đẩy mạnh bán mùa mưa bão'
    ]
  ];

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Bulbtek_Mau_Nhap_San_Pham.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Xuất toàn bộ dữ liệu cấu hình sản phẩm ra file Excel (.xlsx) chuẩn
 * Người dùng có thể mở và chỉnh sửa trực tiếp trên Microsoft Excel hoặc tải lên Google Sheets
 */
export const exportProductsToExcel = (products: Product[]) => {
  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new Error('Danh sách sản phẩm trống, chưa có dữ liệu để xuất.');
  }

  const exportData = products.map((p, idx) => ({
    'STT': idx + 1,
    'Tên Sản Phẩm': p.name || '',
    'Mã SKU': p.sku || '',
    'Dòng Sản Phẩm': p.productLine || 'Bi LED',
    'Trạng Thái': p.status || 'Sản phẩm mới',
    'Giá Bán Lẻ': p.retailPrice || '',
    'Sản Phẩm Phù Hợp': p.suitableFor || 'Xe ô tô',
    'Đối Tượng Mục Tiêu': p.targetAudience || 'Cả hai',
    'Phân Khúc': p.segment || 'Mid',
    'Giai Đoạn': p.stage || 'Growth',
    'Lợi Ích Cốt Lõi': p.coreBenefit || '',
    'Chip LED': p.specs?.chipLed || '',
    'Kích Thước Lens (inch)': p.specs?.sizeInch || '',
    'Chuẩn Kháng Nước': p.specs?.waterproof || '',
    'Nhiệt Màu': p.specs?.colorTemp || '',
    'Độ Sáng': p.specs?.brightness || '',
    'Công Suất': p.specs?.power || '',
    'Điện Áp': p.specs?.voltage || '',
    'Tuổi Thọ': p.specs?.lifespan || '',
    'Bảo Hành': p.specs?.warranty || '',
    'Tương Thích Xe': p.specs?.compatibility || '',
    'Tính Năng Đặc Biệt': p.specs?.specialFeatures || '',
    'Ghi Chú Nội Bộ': p.internalNotes || '',
    'Link Ảnh': p.imageUrl || '',
    'Trạng Thái Hiển Thị': p.isHidden ? 'Đang ẩn' : 'Hiển thị',
    'Ngày Tạo': formatDateSafe(p.createdAt),
    'Cập Nhật Cuối': formatDateSafe(p.updatedAt)
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 32 }, // Tên Sản Phẩm
    { wch: 18 }, // Mã SKU
    { wch: 18 }, // Dòng Sản Phẩm
    { wch: 18 }, // Trạng Thái
    { wch: 16 }, // Giá Bán Lẻ
    { wch: 18 }, // Sản Phẩm Phù Hợp
    { wch: 20 }, // Đối Tượng Mục Tiêu
    { wch: 14 }, // Phân Khúc
    { wch: 14 }, // Giai Đoạn
    { wch: 45 }, // Lợi Ích Cốt Lõi
    { wch: 28 }, // Chip LED
    { wch: 18 }, // Kích Thước Lens (inch)
    { wch: 18 }, // Chuẩn Kháng Nước
    { wch: 24 }, // Nhiệt Màu
    { wch: 20 }, // Độ Sáng
    { wch: 20 }, // Công Suất
    { wch: 16 }, // Điện Áp
    { wch: 16 }, // Tuổi Thọ
    { wch: 20 }, // Bảo Hành
    { wch: 32 }, // Tương Thích Xe
    { wch: 35 }, // Tính Năng Đặc Biệt
    { wch: 30 }, // Ghi Chú Nội Bộ
    { wch: 35 }, // Link Ảnh
    { wch: 18 }, // Trạng Thái Hiển Thị
    { wch: 16 }, // Ngày Tạo
    { wch: 16 }  // Cập Nhật Cuối
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DuLieu_CauHinh_SanPham');

  const today = new Date().toISOString().slice(0, 10);
  saveWorkbookInBrowser(wb, `Bulbtek_DuLieu_CauHinh_SanPham_${today}.xlsx`);
};

export const exportProductsToGoogleSheets = exportProductsToExcel;

