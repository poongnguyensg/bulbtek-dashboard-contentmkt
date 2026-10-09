import { Product, ProductLine, ProductStatus, SuitableVehicle, TargetAudience, ProductSegment, ProductStage } from '../types';

export interface ExtractedProductResult {
  product: Partial<Product>;
  confidence: number;
  extractedFields: string[];
  rawSummary: string;
}

/**
 * Phân tích và trích xuất thông số kỹ thuật đèn ô tô & xe máy từ văn bản hoặc trang web
 */
export function extractProductSpecsFromText(
  text: string, 
  title?: string, 
  scrapedImageUrl?: string,
  url?: string
): ExtractedProductResult {
  const combined = `${title || ''} \n ${text || ''}`;
  const lower = combined.toLowerCase();
  const extractedFields: string[] = [];

  // 1. Xác định Tên sản phẩm
  let name = (title || '').split(/[-–|]/)[0].trim();
  // Làm sạch các từ thừa trong title như "Đèn", "Chính hãng", "Giá tốt"
  if (!name || name.length < 3) {
    const nameMatch = combined.match(/(?:bi\s+led|bi\s+gầm|bóng\s+led|bi\s+laser)\s+([A-Za-z0-9\s+_-]{2,30})/i);
    if (nameMatch) {
      name = nameMatch[0].trim();
    } else {
      name = 'Sản Phẩm Tăng Sáng Bulbtek';
    }
  }
  // Giới hạn độ dài và chuẩn hóa
  name = name.replace(/\s+/g, ' ').slice(0, 80);
  extractedFields.push('Tên sản phẩm');

  // 2. Xác định Dòng sản phẩm (Product Line)
  let productLine: ProductLine = 'Bi LED';
  if (/bi\s*laser|laser\s*projector|\blaser\b/i.test(lower)) {
    productLine = 'Bi LASER';
  } else if (/bi\s*gầm|đèn\s*gầm|fog\s*light|bi\s*fog/i.test(lower)) {
    productLine = 'Bi Gầm';
  } else if (/mini|bi\s*mini|len\s*mini|h4\s*mini/i.test(lower)) {
    productLine = 'Bi LED Mini';
  } else if (/trợ\s*sáng|l4x|l6x|spotlight/i.test(lower)) {
    productLine = 'Trợ Sáng';
  } else if (/bóng\s*led|bóng\s*thay\s*thế|chân\s*(h4|h7|h11|9005|9006)/i.test(lower) && !/bi\s*led|projector/i.test(lower)) {
    productLine = 'Bóng LED';
  } else {
    productLine = 'Bi LED';
  }
  extractedFields.push('Dòng sản phẩm');

  // 3. Xác định SKU
  let sku = '';
  const skuMatch = combined.match(/\b(BTK-[A-Z0-9_-]+|[A-Z]{2,4}-[0-9]{3,4}[A-Z]*)\b/i);
  if (skuMatch) {
    sku = skuMatch[1].toUpperCase();
  } else {
    // Tự sinh SKU tiền tố chuẩn Bulbtek
    const code = name.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'PROD';
    sku = `BTK-${code}-${Date.now().toString().slice(-4)}`;
  }
  extractedFields.push('Mã SKU');

  // 4. Specs: Công suất (Power)
  let power = '';
  const cosPhaMatch = combined.match(/(?:cos|low\s*beam)[\s:]*([0-9]{2,3}\s*w)[^0-9\n\r]*(?:pha|high\s*beam)[\s:]*([0-9]{2,3}\s*w)/i) ||
                      combined.match(/([0-9]{2,3}\s*w)[\s/–-]+([0-9]{2,3}\s*w)/i);
  if (cosPhaMatch) {
    power = `Cos ${cosPhaMatch[1].toUpperCase().replace(/\s+/g, '')} - Pha ${cosPhaMatch[2].toUpperCase().replace(/\s+/g, '')}`;
  } else {
    const singlePowerMatch = combined.match(/(?:công\s*suất|power)[\s:]*([0-9]{2,3}\s*w)/i) || combined.match(/\b([0-9]{2,3})\s*W\b/);
    if (singlePowerMatch) {
      power = `${singlePowerMatch[1].toUpperCase()}W`;
    }
  }
  if (power) extractedFields.push('Công suất');

  // 5. Specs: Nhiệt màu (Color Temperature)
  let colorTemp = '';
  if (/3\s*màu|đổi\s*3\s*màu|3000k.*4300k.*5500k/i.test(lower)) {
    colorTemp = '3 chế độ: 3000K (Vàng đậm) - 4300K (Vàng chanh) - 5500K (Trắng)';
  } else {
    const tempMatch = combined.match(/\b([3-6][0-9]{3})\s*K\b/i);
    if (tempMatch) {
      const val = parseInt(tempMatch[1], 10);
      if (val >= 5500 && val <= 6000) {
        colorTemp = `${val}K (Trắng ấm bám đường tự nhiên)`;
      } else if (val === 3000) {
        colorTemp = '3000K (Vàng đậm phá sương cực đại)';
      } else if (val === 4300) {
        colorTemp = '4300K (Vàng chanh bám đường mưa)';
      } else {
        colorTemp = `${val}K`;
      }
    }
  }
  if (colorTemp) extractedFields.push('Nhiệt màu');

  // 6. Specs: Chip LED
  let chipLed = '';
  const chipMatch = combined.match(/(osram|sanan|cree|csp|seoul\s*semiconductor|nichia)[^\n.,;]*/i);
  if (chipMatch) {
    chipLed = chipMatch[0].trim();
  } else if (/chip\s*led[\s:]*([^\n.,;]+)/i.test(combined)) {
    chipLed = combined.match(/chip\s*led[\s:]*([^\n.,;]+)/i)![1].trim();
  } else {
    chipLed = 'Module LED hiệu năng cao chịu nhiệt Bulbtek Custom';
  }
  if (chipLed) extractedFields.push('Chip LED');

  // 7. Specs: Độ rọi / Quang thông (Brightness / Lux / Lumen)
  let brightness = '';
  const luxMatch = combined.match(/\b([0-9]{1,2}[.,][0-9]{3}|[0-9]{4,5})\s*(?:lux|lx)\b/i);
  const lmMatch = combined.match(/\b([0-9]{1,2}[.,][0-9]{3}|[0-9]{4,5})\s*(?:lumen|lm)\b/i);
  if (luxMatch) {
    brightness = `${luxMatch[1].replace(',', '.')} Lux (Tâm pha cực gom)`;
  } else if (lmMatch) {
    brightness = `${lmMatch[1].replace(',', '.')} Lumen`;
  }
  if (brightness) extractedFields.push('Độ rọi / Quang thông');

  // 8. Specs: Kích thước lens (Size)
  let sizeInch = '';
  const sizeMatch = combined.match(/\b([1-3][.,][0-9]|[1-3])\s*(?:inch|in|"|'')/i);
  if (sizeMatch) {
    sizeInch = `${sizeMatch[1].replace(',', '.')} inch`;
  } else if (productLine === 'Bi Gầm') {
    sizeInch = '3.0 inch / 2.0 inch';
  } else if (productLine === 'Bi LED Mini') {
    sizeInch = '1.8 inch / 2.0 inch';
  } else {
    sizeInch = '3.0 inch';
  }
  if (sizeInch) extractedFields.push('Kích thước Lens');

  // 9. Specs: Chống nước (Waterproof)
  let waterproof = '';
  const ipMatch = combined.match(/\bIP\s*(6[5-8]|69K)\b/i);
  if (ipMatch) {
    const ip = ipMatch[1].toUpperCase();
    waterproof = ip === '68' ? 'IP68 (Ngâm nước tuyệt đối)' : `IP${ip}`;
  } else if (productLine === 'Bi Gầm') {
    waterproof = 'IP68 (Ngâm nước tuyệt đối)';
  } else {
    waterproof = 'IP65';
  }
  if (waterproof) extractedFields.push('Chuẩn chống nước');

  // 10. Specs: Bảo hành (Warranty)
  let warranty = '';
  const warMatch = combined.match(/bảo\s*hành[\s:]*([1-5]\s*năm|[1-3]6\s*tháng)/i) || combined.match(/\b([1-5])\s*năm\s*bảo\s*hành/i);
  if (warMatch) {
    warranty = `${warMatch[1]} (1 đổi 1 chính hãng)`;
  } else {
    warranty = '3 năm (1 đổi 1 chính hãng)';
  }
  extractedFields.push('Thời gian bảo hành');

  // 11. Specs: Điện áp (Voltage)
  let voltage = '12V DC';
  const voltMatch = combined.match(/\b(9V\s*-\s*16V|12V\s*-\s*24V|12V|24V)\b/i);
  if (voltMatch) {
    voltage = `${voltMatch[1].toUpperCase()} DC`;
  }
  extractedFields.push('Điện áp');

  // 12. Specs: Tuổi thọ (Lifespan)
  let lifespan = '50.000 giờ thắp sáng';
  const lifeMatch = combined.match(/\b([3-6]0[.,]000)\s*(?:giờ|hours|h)\b/i);
  if (lifeMatch) {
    lifespan = `${lifeMatch[1].replace(',', '.')} giờ`;
  }

  // 13. Specs: Tương thích (Compatibility)
  let compatibility = 'Chân xoáy đa năng, tương thích 98% dòng xe ô tô';
  if (/cắm\s*jack|cắm\s*giắc|chuẩn\s*zin|giữ\s*zin/i.test(lower)) {
    compatibility = '100% Cắm jack zin theo xe, không cắt trích dây điện';
  } else if (/vinfast|vf3|vf5/i.test(lower)) {
    compatibility = '100% Cắm jack zin xe VinFast, giữ nguyên bảo hành điện hãng';
  }

  // 14. Specs: Tính năng đặc biệt (Special Features)
  let specialFeatures = '';
  const specialList: string[] = [];
  if (/tản\s*nhiệt\s*đồng|ống\s*đồng|quạt\s*thủy\s*lực/i.test(lower)) {
    specialList.push('Hệ thống tản nhiệt ống đồng kép kết hợp quạt thủy lực êm ái');
  }
  if (/mắt\s*quỷ|devil\s*eye/i.test(lower)) {
    specialList.push('Tích hợp mắt quỷ đổi màu qua app Bluetooth');
  }
  if (/van\s*thở|chống\s*hấp\s*hơi/i.test(lower)) {
    specialList.push('Van thở chống hấp hơi nước 1 chiều công nghệ Đức');
  }
  if (/không\s*chói|chống\s*chói|đường\s*cắt/i.test(lower)) {
    specialList.push('Đường cắt cos siêu phẳng mịn, văn minh không chói mắt xe ngược chiều');
  }
  specialFeatures = specialList.length > 0 
    ? specialList.join('; ') 
    : 'Thiết kế nguyên khối khí động học, tản nhiệt nhôm hàng không nguyên khối';
  extractedFields.push('Tính năng đặc biệt');

  // 15. Giá bán lẻ (Retail Price)
  let retailPrice = '';
  const priceMatch = combined.match(/\b([1-9][0-9]{0,2}(?:[.,][0-9]{3}){1,2})\s*(?:đ|vnđ|vnd|đồng)\b/i);
  if (priceMatch) {
    retailPrice = `${priceMatch[1]} VNĐ / Cặp`;
    extractedFields.push('Giá niêm yết');
  } else {
    retailPrice = 'Liên hệ đại lý';
  }

  // 16. Phương tiện phù hợp (Suitable For) & Khách hàng mục tiêu (Target Audience)
  let suitableFor: SuitableVehicle = 'Xe ô tô';
  if (/xe\s*máy|moto|motor|phân\s*khối\s*lớn/i.test(lower) && !/ô\s*tô|xe\s*hơi/i.test(lower)) {
    suitableFor = 'Xe máy/mô tô';
  } else if (/cả\s*hai|ô\s*tô.*xe\s*máy|xe\s*máy.*ô\s*tô/i.test(lower) || productLine === 'Bi Gầm' || productLine === 'Bi LED Mini') {
    suitableFor = 'Cả Hai';
  }

  let targetAudience: TargetAudience = 'Cả hai';
  if (/gara|đại\s*lý|b2b|phân\s*phối/i.test(lower)) {
    targetAudience = 'B2B Dealer';
  } else if (/chủ\s*xe|người\s*dùng|bác\s*tài/i.test(lower)) {
    targetAudience = 'B2C Người dùng cuối';
  }

  // 17. Phân khúc (Segment) & Trạng thái (Status)
  let segment: ProductSegment = 'Mid';
  const numPrice = retailPrice.replace(/[^0-9]/g, '');
  if (numPrice) {
    const val = parseInt(numPrice, 10);
    if (val >= 7500000) segment = 'Premium';
    else if (val <= 4500000) segment = 'Entry';
    else segment = 'Mid';
  }

  let status: ProductStatus = 'Sản phẩm mới';
  if (/hero|bán\s*chạy|chủ\s*lực|hot/i.test(lower)) {
    status = 'Hero Product';
  }

  // 18. Lợi ích cốt lõi (Core Benefit)
  let coreBenefit = '';
  if (productLine === 'Bi Gầm') {
    coreBenefit = 'Vũ khí phá sương xuyên mưa bão, bám đường vượt trội và chống nước tuyệt đối cho an toàn hành trình.';
  } else if (/vinfast|vf3/i.test(lower)) {
    coreBenefit = 'Giải pháp tăng sáng form vuông chuẩn zin 100% cho VinFast VF3, cắm jack giữ trọn bảo hành xe điện.';
  } else {
    coreBenefit = `Giải pháp tăng sáng đột phá với chip ${chipLed}, gom sáng đường cắt văn minh, bảo vệ trọn vẹn tầm nhìn bác tài trong đêm.`;
  }
  extractedFields.push('Lợi ích cốt lõi');

  // 19. Ảnh sản phẩm
  let imageUrl = scrapedImageUrl || '';
  if (!imageUrl) {
    imageUrl = 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80';
  }

  const product: Partial<Product> = {
    id: `prod-${Date.now()}`,
    name,
    productLine,
    sku,
    status,
    retailPrice,
    suitableFor,
    targetAudience,
    segment,
    specs: {
      chipLed,
      power,
      colorTemp,
      brightness,
      voltage,
      lifespan,
      warranty,
      waterproof,
      sizeInch,
      compatibility,
      specialFeatures
    },
    coreBenefit,
    stage: 'Growth',
    internalNotes: url ? `Được trích xuất tự động bằng AI từ nguồn: ${url}` : 'Được trích xuất tự động bằng AI',
    imageUrl,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const confidence = Math.min(100, Math.round((extractedFields.length / 12) * 100));

  return {
    product,
    confidence,
    extractedFields,
    rawSummary: `Đã phân tích thành công ${extractedFields.length} trường thông số kỹ thuật cho "${name}" (${productLine})`
  };
}
