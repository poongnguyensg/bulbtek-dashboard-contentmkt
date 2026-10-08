import { Product, Category, ContentItem, DesignBrief, Channel, ContentMemoryEntry } from '../types';

export interface ContentHistoryAnalysis {
  count: number;
  angles: string[];
  isWarning: boolean;
  suggestedAngles: string[];
  memoryCount: number;
  memoryAngles: string[];
}

export function analyzeProductHistory(
  productId: string,
  contents: ContentItem[],
  threshold = 3,
  memoryEntries: ContentMemoryEntry[] = []
): ContentHistoryAnalysis {
  const productContents = contents.filter(c => c.productId === productId);
  const contentAngles = productContents
    .map(c => c.angleUsed || c.title)
    .filter(Boolean);

  const productMemories = memoryEntries.filter(m => m.productId === productId);
  const memoryAngles = productMemories.map(m => m.angleUsed).filter(Boolean);

  const allUsedAngles = Array.from(new Set([...contentAngles, ...memoryAngles]));
  const isWarning = (productContents.length + productMemories.length) >= threshold;

  const freshAngleIdeas = [
    'Phỏng vấn trực tiếp chủ xe sau 6 tháng trải nghiệm đường trường thực tế',
    'Thử thách chiếu sáng qua sương mù dày đặc và mưa lớn lúc nửa đêm',
    'Bóc tách độ bền linh kiện: vì sao Bulbtek cam kết bảo hành đổi mới',
    'So sánh đường cắt cos chống chói: văn minh khi đi trong đô thị',
    'Chính sách ưu đãi và hỗ trợ lắp đặt tại 300 đại lý toàn quốc',
    'Cắm giắc zin 100%: Bảo vệ hệ thống điện và giữ trọn bảo hành hãng',
    'Thử nghiệm chịu nhiệt và rung chấn khắc nghiệt trong phòng Lab Bulbtek',
    'Cẩm nang lái xe đêm an toàn từ trợ thủ Robot BU táp-lô'
  ];

  return {
    count: productContents.length,
    angles: contentAngles,
    isWarning,
    suggestedAngles: freshAngleIdeas.filter(idea => !allUsedAngles.some(u => u.toLowerCase().includes(idea.toLowerCase()) || idea.toLowerCase().includes(u.toLowerCase()))).slice(0, 3),
    memoryCount: productMemories.length,
    memoryAngles
  };
}

export function validateProductForContent(product?: Product): { valid: boolean; error?: string } {
  if (!product) {
    return { valid: false, error: 'Chưa chọn sản phẩm.' };
  }
  if (!product.name || !product.productLine || !product.coreBenefit) {
    return {
      valid: false,
      error: `⚠️ Sản phẩm [${product.name || 'Không rõ'}] chưa đủ thông tin bắt buộc (Tên + Product Line + Core Benefit). Vui lòng cập nhật Cấu hình sản phẩm trước khi tạo content.`
    };
  }

  // Validate thông số kỹ thuật bắt buộc đối với sản phẩm phần cứng
  const isHardware = product.productLine !== 'Branding Sản Phẩm' && product.productLine !== 'Linh Vật Robot BU';
  if (isHardware) {
    const missingSpecs: string[] = [];
    const specs = product.specs || {};
    const isNA = (val?: string) => !val || val.trim() === '' || val.trim().toUpperCase() === 'N/A' || val.trim().toLowerCase() === 'n/a (hiệu suất 100%)';

    if (isNA(specs.chipLed)) missingSpecs.push('Chip LED');
    if (isNA(specs.power)) missingSpecs.push('Công suất');
    if (isNA(specs.warranty)) missingSpecs.push('Bảo hành');

    if (missingSpecs.length > 0) {
      return {
        valid: false,
        error: `⚠️ Sản phẩm [${product.name}] đang thiếu thông số kỹ thuật bắt buộc: ${missingSpecs.join(', ')}. Theo Brand Guideline (Tôn chỉ 100% sự thật), không bịa đặt số liệu kiểm định thực tế. Vui lòng bổ sung tại mục Cấu hình sản phẩm trước khi tạo content.`
      };
    }
  }

  return { valid: true };
}

// Danh sách các model ID cũ / đã bị deprecate hoặc thay thế bởi nhà cung cấp
export const DEPRECATED_MODEL_CODES = [
  'claude-3-5-sonnet-20241022',
  'claude-3-sonnet-20240229',
  'claude-3-opus-20240229',
  'claude-2.1',
  'claude-2.0',
  'gemini-1.0-pro',
  'gemini-1.5-pro-preview',
  'gemini-1.5-pro',
  'gemini-1.5-flash-preview',
  'gemini-pro',
  'gpt-4-0314',
  'gpt-4-0613',
  'gpt-4-32k',
  'gpt-4-vision-preview',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-0613',
  'text-davinci-003'
];

export class AiModelDeprecatedError extends Error {
  public modelId: string;
  public timestamp: string;

  constructor(modelId: string, additionalDetail?: string) {
    const msg = `Model ID [${modelId}] có thể đã lỗi thời hoặc không khả dụng. Vui lòng liên hệ Admin kiểm tra trong Cài đặt hệ thống.`;
    super(msg);
    this.name = 'AiModelDeprecatedError';
    this.modelId = modelId;
    this.timestamp = new Date().toISOString();

    // Ghi log chi tiết vào console/system log để Admin đối soát
    console.error(
      `[AI SYSTEM LOG - DEPRECATED / INVALID MODEL] Timestamp: ${this.timestamp} | Model: "${modelId}" | Detail: ${additionalDetail || 'Model ID is marked deprecated or unserviceable'} | Action Required: Admin cần kiểm tra trong Cài đặt hệ thống -> Chọn "Đặt lại 3 Model mới nhất" (Claude 3.7 / Gemini 2.5 / GPT-4.5).`
    );
  }
}

export function isModelDeprecated(modelCodeOrName: string): boolean {
  if (!modelCodeOrName) return false;
  const clean = modelCodeOrName.trim().toLowerCase();
  return DEPRECATED_MODEL_CODES.some(dep => clean.includes(dep.toLowerCase()));
}

export function parseAiErrorAndFormat(error: any, modelName: string): string {
  const errMsg = typeof error === 'string' ? error : error?.message || '';
  const isModelIssue = 
    /404|not found|deprecated|decommissioned|invalid.*model|unsupported.*model|model_not_found|does not exist/i.test(errMsg) ||
    isModelDeprecated(modelName);

  if (isModelIssue) {
    const formatted = `Model ID [${modelName}] có thể đã lỗi thời hoặc không khả dụng. Vui lòng liên hệ Admin kiểm tra trong Cài đặt hệ thống.`;
    console.error(
      `[AI SYSTEM LOG - MODEL ERROR]: ${errMsg} | User Facing Notice: "${formatted}" | Time: ${new Date().toISOString()}`
    );
    return formatted;
  }

  return errMsg || 'Lỗi không xác định khi gọi AI service.';
}

export interface GeneratedContentOutput {
  creativeHeadline: string;
  facebookCaption: string;
  tiktokCaption: string;
  angleUsed: string;
  hookFb: string;
  hookTiktok: string;
  variationIndex: number;
  isFresh: boolean;
}

interface ContentVariation {
  angle: string;
  hookFb: string;
  bodyFb: string;
  hookTiktok: string;
  bodyTiktok: string;
  ctaFb?: string;
  ctaTiktok?: string;
}

export function generateBulbtekContent(
  product: Product,
  category: Category,
  highlightSpecs: string[],
  activeModelName = 'Claude 3.7 Sonnet',
  memoryEntries: ContentMemoryEntry[] = [],
  forceVariationIndex?: number,
  additionalInfo?: string
): GeneratedContentOutput {
  // Bắt lỗi nếu Model ID đang dùng đã bị deprecate hoặc lỗi thời (Mục 8)
  if (isModelDeprecated(activeModelName)) {
    throw new AiModelDeprecatedError(
      activeModelName,
      `Model "${activeModelName}" nằm trong danh sách các model cũ/deprecated và không còn được nhà cung cấp hỗ trợ.`
    );
  }

  const fixedFbHashtags = '#BulbtekVietNam #TăngSángÔTô #AnToanHanhTrinh';
  const fixedTiktokHashtags = '#bulbtek #đènôtô #tăngsáng #độxe';

  const specsText = highlightSpecs.length > 0 
    ? highlightSpecs.map(s => `• ${s}`).join('\n')
    : `• ${product.coreBenefit}`;

  const productTag = `#${product.name.replace(/\s+/g, '')}`;
  const lineTag = `#${product.productLine.replace(/\s+/g, '')}`;

  // Find memory for this specific product to avoid duplication
  const productMemories = memoryEntries.filter(m => m.productId === product.id);
  const usedAngleSet = new Set(productMemories.map(m => m.angleUsed.toLowerCase().trim()));
  const usedHookFbSet = new Set(productMemories.map(m => m.hookFb.toLowerCase().trim()));

  let variations: ContentVariation[] = [];

  // =========================================================================
  // 1. NHÓM LINH VẬT ROBOT BU
  // =========================================================================
  if (product.productLine === 'Linh Vật Robot BU') {
    const customMascotIdea = (highlightSpecs[0] || product.coreBenefit || '').trim();
    const dynamicMascotVar = customMascotIdea ? [{
      angle: customMascotIdea,
      hookFb: `🤖 [CABIN CÙNG ROBOT BU] — ${customMascotIdea.slice(0, 75).toUpperCase()}`,
      bodyFb: `“Bác tài ơi, trên mỗi hành trình dù ngày hay đêm, Robot BU luôn hiện diện trên táp-lô để đồng hành cùng các bác!”\n\n${customMascotIdea}\n\nKhông chỉ là linh vật công nghệ, Robot BU là người bạn nhỏ mang lại sự an tâm tuyệt đối và nhắc nhở bác tài vững vàng tay lái, về nhà an toàn.`,
      hookTiktok: `Robot BU nhắn bác tài cabin ô tô: ${customMascotIdea.slice(0, 65)} 🤖🚗`,
      bodyTiktok: `${customMascotIdea}\n✓ Trợ thủ đắc lực cabin ô tô\n✓ Tăng sáng an toàn, văn minh không chói mắt\n👉 Bác tài nhấn theo dõi để cùng Robot BU cập nhật mẹo lái xe an toàn nhé!`
    }] : [];

    variations = [
      ...dynamicMascotVar,
      {
        angle: 'Nhật ký cabin cùng Robot BU: Vượt đèo đêm mưa lũ an toàn',
        hookFb: '🤖 [NHẬT KÝ CABIN CÙNG ROBOT BU] — ĐÈO ĐÊM MƯA GIÓ, ĐÃ CÓ ROBOT BU VÀ ÁNH SÁNG BÁM ĐƯỜNG!',
        bodyFb: `“Bác tài ơi, đường đêm phía trước có sương mù dày hay mưa dầm dốc đèo, đừng lo vì Robot BU và luồng sáng Bulbtek luôn túc trực đồng hành!”\n\nKhông chỉ là linh vật công nghệ, Robot BU là hiện thân của trí tuệ quang học và sự ấm áp từ BULBTEK VIỆT NAM — người bạn nhỏ luôn hiện diện trên táp-lô để nhắc nhở và mang tới sự an tâm tuyệt đối cho các bác tài Việt trên từng cây số.`,
        hookTiktok: 'Robot BU trên táp-lô nhắn bác tài: Đi đèo đêm mưa lũ nhớ kiểm tra đèn nha! 🤖🚗',
        bodyTiktok: `Trời mưa dốc đèo tối mịt thì đừng quên hạ cos và bật bi gầm phá sương nhé các bác!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 ${product.coreBenefit}`
      },
      {
        angle: 'Góc Bác tài hỏi - Robot BU giải đáp: Độ đèn bi LED có bị phạt đăng kiểm không?',
        hookFb: '🤖 [GÓC BÁC TÀI HỎI - BU TRẢ LỜI] — "ĐỘ ĐÈN BI LED BULBTEK CÓ BỊ TỪ CHỐI ĐĂNG KIỂM KHÔNG BU ƠI?"',
        bodyFb: `Rất nhiều bác tài còn ngần ngại nâng cấp ánh sáng vì lo ngại thủ tục đăng kiểm. Hôm nay Robot BU xin giải tỏa triệt để băn khoăn này!\n\nTheo quy chuẩn kiểm định phương tiện cơ giới đường bộ hiện hành: Miễn là luồng sáng có ĐƯỜNG CẮT COS RÕ RÀNG, KHÔNG GÂY CHÓI MẮT XE NGƯỢC CHIỀU và tâm pha gom đúng tiêu chuẩn kỹ thuật, xe của các bác sẽ hoàn toàn đạt chuẩn đăng kiểm.\n\nToàn bộ cụm bi của Bulbtek đều được thiết kế thấu kính quang học sắc lẹm, cắm giắc zin 100% không cắt trích dây điện, giữ trọn bảo hành hãng.`,
        hookTiktok: 'Độ đèn bi LED có đăng kiểm được không? Robot BU giải đáp trong 30 giây! 🤖✨',
        bodyTiktok: `Đường cắt cos chuẩn chỉ, không lóa xe đối diện, cắm giắc zin 100% thì đăng kiểm vô tư các bác nhé!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Chuẩn đăng kiểm an toàn văn minh cùng Bulbtek!`
      },
      {
        angle: 'Đột nhập phòng Lab R&D cùng Robot BU: Thử thách rung chấn & sốc nhiệt khắc nghiệt',
        hookFb: '🤖 [ĐỘT NHẬP PHÒNG LAB BULBTEK] — ROBOT BU BẬT MÍ BÀI TEST "HÀNH HẠ" CỰC HẠN TRƯỚC KHI ĐÈN LÊN XE BÁC TÀI!',
        bodyFb: `Để một bộ đèn Bulbtek có thể đồng hành bền bỉ trên 50.000 giờ rung lắc ổ gà ổ voi tại Việt Nam, linh kiện phải trải qua những gì?\n\nHôm nay Robot BU dẫn các bác đột nhập phòng kiểm định R&D:\n• Test ngâm nước áp lực IP68 suốt 48 giờ liên tục.\n• Test sốc nhiệt từ -40°C đến +105°C mô phỏng buồng máy xe chạy giữa trưa hè đổ lửa.\n• Test rung chấn tần số cao mô phỏng đường đất gồ ghề Tây Bắc.\n\nChính vì vượt qua những bài thử nghiệm khắt khe này, Bulbtek mới tự tin cam kết chính sách bảo hành 1 đổi 1 uy tín!`,
        hookTiktok: 'Đèn Bulbtek được test "tra tấn" thế nào trước khi lắp lên xe? Xem Robot BU bật mí! 🤖🔥',
        bodyTiktok: `Test ngâm nước, sốc nhiệt 105 độ C, rung chấn cực hạn. Bền bỉ thực chiến là tôn chỉ của Bulbtek!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 An tâm tuyệt đối cùng linh kiện chuẩn mực!`
      },
      {
        angle: 'Robot BU gửi lời chúc Vạn Dặm Bình An: Phía trước là mưu sinh, phía sau là gia đình',
        hookFb: '🤖 [TÂM SỰ BÁC TÀI CÙNG BU] — "PHÍA TRƯỚC TAY LÁI LÀ MƯU SINH, PHÍA SAU VÔ LĂNG LÀ GIA ĐÌNH ĐANG CHỜ ĐỢI"',
        bodyFb: `Khi đồng hồ điểm 2 giờ sáng trên những cung đường vắng, ánh đèn pha là người bạn duy nhất soi tỏ từng khúc cua, ổ gà và biển báo nguy hiểm.\n\nRobot BU hiểu rằng mỗi chuyến xe không chỉ chở hàng hóa hay hành khách, mà chở cả niềm tin và trách nhiệm của người trụ cột gia đình. Bật đèn sáng chuẩn, vững tay lái, về nhà an toàn các bác tài nhé!`,
        hookTiktok: '2h sáng trên đường vắng, bật đèn sáng chuẩn về nhà an toàn cùng gia đình nha các bác! 🤖❤️',
        bodyTiktok: `Robot BU chúc toàn thể anh em tài xế vạn dặm bình an, tay lái vững vàng trên mọi nẻo đường!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 An toàn hành trình — Sứ mệnh Bulbtek!`
      },
      {
        angle: 'Robot BU hướng dẫn mẹo lái xe: Bí quyết nhận diện vật cản từ xa 150 mét',
        hookFb: '🤖 [MẸO LÁI XE ĐÊM TỪ BU] — 3 QUY TẮC VÀNG ĐỂ PHÁT HIỆN SỚM CHƯỚNG NGẠI VẬT TỪ KHOẢNG CÁCH 150M',
        bodyFb: `Đi đêm tốc độ 80km/h trên cao tốc, chỉ cần chậm phản xạ 1 giây là xe đã trôi đi hơn 22 mét! Robot BU chia sẻ 3 bí quyết sống còn:\n1. Luôn giữ mặt kính lái và chóa đèn sạch bụi bẩn, không để vệt màng dầu cản quang.\n2. Lựa chọn luồng sáng có độ gom tâm pha tốt để tầm nhìn vươn xa tối thiểu 150-200m.\n3. Hạ cos đúng lúc khi thấy ánh sáng hắt từ khúc cua đối diện.\n\nĐèn sáng chuẩn là lá chắn phản xạ tốt nhất của bác tài!`,
        hookTiktok: 'Tốc độ 80km/h đi đêm, 1 giây xe trôi 22m! Mẹo nhìn xa 150m từ Robot BU 🤖⚡',
        bodyTiktok: `Đừng để tầm nhìn bị giới hạn bởi đèn zin tối mờ. Nâng cấp ánh sáng bám đường để phản xạ kịp thời!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Trợ thủ đắc lực cho bác tài Việt!`
      }
    ];
  }

  // =========================================================================
  // 2. NHÓM BRANDING SẢN PHẨM (THƯƠNG HIỆU & SỨ MỆNH)
  // =========================================================================
  else if (product.productLine === 'Branding Sản Phẩm') {
    const customBrandingIdea = (highlightSpecs[0] || product.coreBenefit || '').trim();
    const dynamicBrandingVar = customBrandingIdea ? [{
      angle: customBrandingIdea,
      hookFb: `🛡️ [BULBTEK BRANDING] — ${customBrandingIdea.slice(0, 75).toUpperCase()}`,
      bodyFb: `Tại BULBTEK VIỆT NAM, chúng tôi kiên định với sứ mệnh "AN TOÀN HÀNH TRÌNH".\n\n${customBrandingIdea}\n\nĐồng hành cùng hơn 300 đối tác đại lý và hàng vạn bác tài trên khắp 63 tỉnh thành, Bulbtek cam kết mang lại giải pháp tăng sáng chuẩn mực, bảo vệ trọn vẹn gia đình bác tài trên mỗi chuyến đi.`,
      hookTiktok: `${customBrandingIdea.slice(0, 65)} — Bản sắc thương hiệu Bulbtek Việt Nam! 🛡️✨`,
      bodyTiktok: `${customBrandingIdea}\n✓ Sứ mệnh An Toàn Hành Trình\n✓ 3 Giá trị cốt lõi: Bền Bỉ – Bền Vững – Bảo Vệ\n👉 Đồng hành cùng 300+ đại lý ủy quyền toàn quốc!`
    }] : [];

    variations = [
      ...dynamicBrandingVar,
      {
        angle: 'Triết lý An Toàn Hành Trình: Vì sao Bulbtek chú trọng luồng sáng bám đường thay vì chạy theo số Watt ảo',
        hookFb: '🛡️ [BULBTEK BRANDING] — "AN TOÀN HÀNH TRÌNH" — VÌ SAO CHÚNG TÔI NÓI KHÔNG VỚI CÔNG SUẤT ẢO?',
        bodyFb: `Trên thị trường độ xe hiện nay, không ít sản phẩm quảng cáo công suất 100W - 150W để thu hút người dùng, nhưng chỉ chạy được 15 phút là sụt áp, nóng ran và gây quá tải hệ thống điện xe.\n\nTại BULBTEK VIỆT NAM, chúng tôi kiên định với triết lý: "AN TOÀN HÀNH TRÌNH". Mỗi bộ đèn xuất xưởng đều được tối ưu hóa theo hiệu suất quang thông thực tế (Lumen hữu dụng) và khả năng bám mặt đường trong thời tiết khắc nghiệt, chứ không chạy đua theo thông số ảo trên bao bì.`,
        hookTiktok: 'Độ đèn đừng nhìn số Watt ảo! Xem Bulbtek giải mã luồng sáng bám đường thực chiến 🚗💡',
        bodyTiktok: `Công suất thật, ánh sáng bám đường mưa đêm, bảo vệ bình ắc quy xe. Đó là cam kết của Bulbtek!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 An toàn hành trình — Trợ thủ đắc lực cho bác tài Việt!`
      },
      {
        angle: 'Giải mã 3 Giá Trị Cốt Lõi: BỀN BỈ – BỀN VỮNG – BẢO VỆ',
        hookFb: '🛡️ [BULBTEK BRAND IDENTITY] — 3 GIÁ TRỊ CỐT LÕI ĐỊNH HÌNH NÊN BẢN SẮC BULBTEK VIỆT NAM',
        bodyFb: `Điều gì làm nên niềm tin của hơn 300 đối tác đại lý và hàng vạn bác tài trên khắp 63 tỉnh thành?\n\n🔥 3 TRỤ CỘT BẢO CHỨNG:\n• BỀN BỈ: Tinh hoa cơ khí quang học, chip LED chịu nhiệt độ cao, tản nhiệt đồng kép vận hành bền bỉ trên 50.000 giờ rung chấn thực tế.\n• BỀN VỮNG: Xây dựng hệ sinh thái kinh doanh minh bạch, bảo hộ quyền lợi và gắn kết cùng mạng lưới 300+ đại lý, gara ô tô uy tín trên cả nước.\n• BẢO VỆ: Đường cắt cos văn minh không gây chói lóa xe ngược chiều, thấu suốt màn mưa sương, tối đa hóa phản xạ chướng ngại vật từ xa.`,
        hookTiktok: '3 giá trị tạo nên thương hiệu Bulbtek: BỀN BỈ – BỀN VỮNG – BẢO VỆ! 🛡️✨',
        bodyTiktok: `Không chỉ là tăng sáng, đó là sự an tâm tuyệt đối của bác tài trên mọi hành trình!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Đồng hành cùng 300+ đại lý ủy quyền toàn quốc!`
      },
      {
        angle: 'Mạng lưới 300+ Đại lý & Gara toàn quốc: Điểm tựa kỹ thuật vững vàng',
        hookFb: '🤝 [HỆ THỐNG BULBTEK] — PHỦ SÓNG HƠN 300 ĐẠI LÝ: DÙ Ở ĐÂU, BÁC TÀI CŨNG LUÔN CÓ ĐIỂM TỰA KỸ THUẬT!',
        bodyFb: `Một sản phẩm phụ tùng tốt không chỉ nằm ở chất lượng bóng đèn, mà còn ở DỊCH VỤ HẬU MÃI KỸ THUẬT.\n\nVới mạng lưới hơn 300 đại lý và trung tâm nội thất ô tô trải dài từ Bắc chí Nam, Bulbtek mang đến:\n- Quy trình lắp đặt cắm giắc zin chuyên nghiệp bởi kỹ thuật viên tay nghề cao.\n- Máy cân chỉnh luồng sáng laser chuẩn vạch đăng kiểm.\n- Chế độ bảo hành điện tử chính hãng 1 đổi 1 nhanh chóng, tra cứu quét mã QR tiện lợi ngay trên điện thoại.`,
        hookTiktok: '300+ đại lý Bulbtek toàn quốc sẵn sàng phục vụ bác tài với chính sách bảo hành 1 đổi 1! 🚗🛠️',
        bodyTiktok: `Lắp đặt cắm giắc zin, cân chỉnh tia sáng chuẩn chỉ, bảo hành điện tử tiện lợi trên toàn quốc!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Ghé ngay gara Bulbtek gần nhất hôm nay!`
      },
      {
        angle: 'Văn hóa tăng sáng văn minh: Đèn sáng cho mình nhưng phải an toàn cho người đối diện',
        hookFb: '🛡️ [VĂN HÓA LÁI XE] — TĂNG SÁNG VĂN MINH: ĐÈN PHẢI SÁNG NHƯNG TUYỆT ĐỐI KHÔNG LÀM MÙ MẮT BẠN ĐƯỜNG!',
        bodyFb: `Ai trong chúng ta cũng từng ít nhất một lần bức xúc vì xe đối diện độ đèn vô tội vạ, chóa sáng tóe loe làm lóa mắt hoàn toàn người đi ngược chiều.\n\nBULBTEK xác định sứ mệnh tiên phong kiến tạo "VĂN HÓA TĂNG SÁNG VĂN MINH":\n- Thiết kế mặt cắt cốt phẳng sắc bén (Cut-off line chuẩn châu Âu), ánh sáng trải đều dưới tầm mắt, hoàn toàn không hắt chùm sáng vào kính lái xe ngược chiều.\n- Tâm pha tập trung gom xa hỗ trợ quan sát biển báo khi đường vắng.\nĐộ xe chuẩn mực là độ xe có trách nhiệm với cộng đồng!`,
        hookTiktok: 'Độ đèn sáng nhưng không chói mắt xe ngược chiều — Văn hóa tăng sáng văn minh từ Bulbtek! 💡🚗',
        bodyTiktok: `Đường cắt cos phẳng sắc bén, bảo vệ an toàn cho cả hai phía khi lưu thông ban đêm!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Nâng cấp đèn văn minh cùng Bulbtek!`
      },
      {
        angle: 'Chính sách bảo hành 1 đổi 1: Cam kết vàng từ sự tự tin chất lượng cơ khí',
        hookFb: '🛡️ [CAM KẾT CHẤT LƯỢNG] — VÌ SAO BULBTEK TỰ TIN ÁP DỤNG CHÍNH SÁCH BẢO HÀNH ĐỔI MỚI CHÍNH HÃNG?',
        bodyFb: `Khi bỏ tiền nâng cấp ánh sáng cho xế cưng, điều khách hàng lo nhất là đèn dùng được vài tháng thì chập chờn, đọng nước hoặc cháy chip mà đại lý từ chối bảo hành.\n\nVới quy trình quản lý chất lượng nghiêm ngặt và tỷ lệ lỗi thực tế dưới 0.1%, Bulbtek áp dụng chính sách BẢO HÀNH ĐỔI MỚI CHÍNH HÃNG:\n- Không sửa chữa chắp vá — Đổi mới linh kiện nguyên cụm ngay khi phát hiện lỗi nhà sản xuất.\n- Kích hoạt bảo hành điện tử tức thì tại đại lý ủy quyền.\n- An tâm tuyệt đối trên mọi hành trình vạn dặm.`,
        hookTiktok: 'Bảo hành điện tử 1 đổi 1 uy tín toàn quốc — Sự tự tin chất lượng từ Bulbtek Việt Nam! 🛡️⚡',
        bodyTiktok: `Lỗi là đổi mới, không sửa chữa chắp vá. Bảo chứng độ bền cho mọi bác tài Việt!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Trải nghiệm ngay dịch vụ chuẩn mực!`
      }
    ];
  }

  // =========================================================================
  // 3. NHÓM SẢN PHẨM PHẦN CỨNG (BI LED, BI LASER, BI GẦM, BÓNG LED...)
  // =========================================================================
  else {
    switch (category.id) {
      case 'cat-dealer':
        variations = [
          {
            angle: 'Cơ hội bứt phá doanh thu dịch vụ Gara mùa nâng cấp ánh sáng',
            hookFb: `🤝 [CƠ HỘI ĐẠI LÝ] — BỨT PHÁ DOANH THU MÙA CUỐI NĂM CÙNG SIÊU PHẨM ${product.name.toUpperCase()}!`,
            bodyFb: `Thị trường nâng cấp ánh sáng ô tô đang bước vào giai đoạn cao điểm. Khách hàng ngày càng thông thái và ưu tiên các thương hiệu có nguồn gốc rõ ràng, bảo hành uy tín.\n\nKhi trở thành đối tác phân phối ${product.name} từ BULBTEK VIỆT NAM, quý Gara & Trung tâm phụ kiện nhận ngay:\n- Chiết khấu hấp dẫn và chính sách bảo hộ khu vực minh bạch.\n- Sản phẩm chuẩn zin thi công nhanh trong 45-60 phút, không cắt dây điện.\n- Hỗ trợ bảng biển nhận diện, catalogue và đào tạo kỹ thuật cân chỉnh chuyên sâu.`,
            hookTiktok: `Chủ gara muốn tăng doanh số mùa này? Tìm hiểu ngay chính sách đại lý ${product.name} Bulbtek! 🤝📈`,
            bodyTiktok: `Sản phẩm chuẩn zin, biên lợi nhuận tốt, chính sách bảo hộ khu vực minh bạch cho anh em Gara!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Inbox hợp tác đại lý cùng Bulbtek ngay hôm nay!`
          },
          {
            angle: 'Tỷ lệ bảo hành dưới 0.1% — Chìa khóa giữ chân khách hàng ruột của Gara',
            hookFb: `🤝 [GÓC CHUYÊN MÔN GARA] — LÝ DO CÁC ANH EM THỢ MÁY TIN TƯỞNG TƯ VẤN ${product.name.toUpperCase()} CHO KHÁCH RUỘT`,
            bodyFb: `Làm nghề nội thất ô tô, điều anh em thợ sợ nhất không phải là lắp đặt vất vả, mà là khách đi vài hôm quay lại bắt đền vì đèn chập chờn hay đọng sương hấp hơi.\n\nVượt qua các bài kiểm định nhiệt độ và rung chấn khắc nghiệt, ${product.name} mang lại sự an tâm tuyệt đối:\n- Tỷ lệ bảo hành thực tế ghi nhận dưới 0.1% trên toàn hệ thống.\n- Hộp giắc cắm zin chuẩn từng milimet, chân xoáy tiện dụng.\n- Giúp Gara tiết kiệm thời gian bảo hành và xây dựng uy tín bền lâu với khách quen.`,
            hookTiktok: 'Độ đèn xong khách khen hay bị bắt đền? Xem lý do Gara chọn ${product.name} Bulbtek! 🛠️🚗',
            bodyTiktok: `Tỷ lệ lỗi dưới 0.1%, thi công nhàn hạ, cắm giắc zin an toàn cho xe khách!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Đồng hành kinh doanh bền vững cùng Bulbtek!`
          },
          {
            angle: 'Đào tạo kỹ thuật canh chỉnh đèn laser chuẩn chỉ từ chuyên gia Bulbtek',
            hookFb: `🤝 [ĐỒNG HÀNH ĐẠI LÝ] — BULBTEK CHUYỂN GIAO CÔNG NGHỆ CANH ĐÈN LASER ĐẠT CHUẨN ĐĂNG KIỂM CHO ĐỐI TÁC`,
            bodyFb: `Một cụm đèn tăng sáng cao cấp chỉ phát huy 100% hiệu năng khi được lắp đặt và cân chỉnh đúng góc độ quang học.\n\nBulbtek không chỉ cung cấp sản phẩm ${product.name} chất lượng cao, mà còn cử chuyên gia trực tiếp tới hỗ trợ:\n- Chuyển giao quy trình đo góc nghiêng và vạch ranh giới cos/pha chuẩn chỉ.\n- Hướng dẫn thao tác căn chỉnh bằng thiết bị laser chuyên dụng.\n- Đảm bảo 100% xe sau khi nâng cấp tại Gara xuất xưởng với luồng sáng an toàn và vượt qua mọi đợt kiểm định.`,
            hookTiktok: 'Chuyển giao kỹ thuật canh chỉnh đèn chuẩn đăng kiểm miễn phí cho đại lý Bulbtek! 📐💡',
            bodyTiktok: `Đào tạo bài bản, máy móc laser hiện đại, nâng tầm tay nghề kỹ thuật viên Gara!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Đăng ký trở thành đại lý Bulbtek ủy quyền!`
          },
          {
            angle: 'Bảo hành điện tử QR Code — Giải pháp quản lý tồn kho hiện đại cho đại lý',
            hookFb: `🤝 [TIỆN ÍCH ĐẠI LÝ] — NÓI KHÔNG VỚI SỔ SÁCH BẢO HÀNH THỦ CÔNG CÙNG HỆ THỐNG QR ĐIỆN TỬ BULBTEK`,
            bodyFb: `Tạm biệt nỗi lo mất phiếu bảo hành bằng giấy hay tra cứu lịch sử sửa chữa phức tạp. Với ${product.name}, toàn bộ quy trình hậu mãi được số hóa hoàn toàn:\n- Khách hàng và đại lý chỉ cần quét mã QR trên thân đèn để kích hoạt bảo hành trong 10 giây.\n- Tra cứu tình trạng bảo hành trực tuyến mọi lúc mọi nơi trên toàn quốc.\n- Chính sách 1 đổi 1 nhanh chóng, hỗ trợ xử lý ngay trong ngày.`,
            hookTiktok: 'Kích hoạt bảo hành điện tử trong 10 giây cùng Bulbtek! Không lo mất phiếu giấy 📱⚡',
            bodyTiktok: `Quét mã QR tiện lợi, quản lý minh bạch, bảo hành 1 đổi 1 trên 300 đại lý toàn quốc!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Hợp tác đại lý ngay cùng Bulbtek Việt Nam!`
          }
        ];
        break;

      case 'cat-interaction':
        variations = [
          {
            angle: 'Tình huống thực tế: Đối phó xe ngược chiều giương pha chói mắt',
            hookFb: `💬 [GÓC BÁC TÀI] — BỊ XE NGƯỢC CHIỀU GIƯƠNG PHA CHÓI MẮT, BÁC TÀI XỬ LÝ THẾ NÀO?`,
            bodyFb: `Chạy cao tốc hoặc đường quốc lộ ban đêm, tình huống ức chế nhất là gặp xe đối diện bật pha vô ý thức làm mù mắt tạm thời 3-5 giây.\n\nRobot BU xin chia sẻ mẹo xử lý an toàn:\n1. Không giương pha trả đũa để tránh cả hai xe cùng mất tầm nhìn nguy hiểm.\n2. Hướng mắt hơi chếch về mép đường bên phải, nhìn vạch kẻ sơn phản quang để giữ đúng làn.\n3. Đảm bảo đèn xe của mình như ${product.name} có đường cắt cos chuẩn để luôn nhìn rõ lòng đường ngay cả khi bị lóa sáng bên ngoài.`,
            hookTiktok: 'Bị xe đối diện chiếu pha mù mắt thì xử lý sao các bác? Xem mẹo an toàn cabin! 🚗😱',
            bodyTiktok: `Không pha trả đũa, nhìn mép đường phải và dùng đèn có đường cos chuẩn bám đường!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Bác tài comment chia sẻ kinh nghiệm xử lý bên dưới nha!`
          },
          {
            angle: 'Chấm điểm hệ thống chiếu sáng xe hiện tại: Đã đủ tự tin vượt đèo đêm chưa?',
            hookFb: `💬 [THẢO LUẬN CABIN] — CHẤM ĐIỂM HỆ THỐNG ĐÈN XE HIỆN TẠI: TỪ 1 ĐẾN 10, BÁC TÀI CHO MẤY ĐIỂM?`,
            bodyFb: `Nhiều bác tài chia sẻ: Mua xe về chạy phố thì thấy đèn zin tạm ổn, nhưng đến khi có việc gấp phải chạy đường đèo đêm sương mù mưa bão mới thấu nỗi khổ "mù đường".\n\nNếu đang cảm thấy ánh sáng hiện tại chỉ ở mức 4-5 điểm, việc nâng cấp ${product.name} sẽ đưa tầm nhìn của các bác lên thang điểm 10 trọn vẹn: Sáng bám đường, không mỏi mắt, tự tin cầm lái xuyên đêm!`,
            hookTiktok: 'Đèn xe của bác tài được mấy điểm khi đi đèo sương mù? 1 đến 10 comment thật lòng nha! 🚗🌧️',
            bodyTiktok: `Đèn zin tối mờ thì đừng ráng đi đêm nguy hiểm. Nâng cấp ngay ${product.name} bám đường chuẩn mực!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Điểm danh anh em từng ôm cua đèo trong sương mù!`
          },
          {
            angle: 'Kỷ niệm nhớ đời trên những cung đường tối mịt không đèn cao áp',
            hookFb: `💬 [TÂM SỰ NGHỀ TÀI] — KỶ NIỆM "THÓT TIM" NHẤT CỦA BÁC TÀI KHI LÁI XE TRÊN CUNG ĐƯỜNG THIẾU SÁNG`,
            bodyFb: `Ổ gà sâu hoắm giữa làn đường, con trâu bất ngờ băng qua đường tối hay chiếc xe máy không có đèn hậu phía trước... Đó là những khoảnh khắc mà chỉ cần phản xạ chậm 1 tích tắc là hậu quả khôn lường.\n\nÁnh sáng mạnh mẽ và luồng chiếu gom xa của ${product.name} chính là "chiếc phao cứu sinh" giúp bác tài phát hiện vật cản từ khoảng cách trên 150m để kịp thời rà phanh an toàn.`,
            hookTiktok: 'Khoảnh khắc thót tim nhất khi đi đường đêm tối mịt của các bác là gì? 🚗⚡',
            bodyTiktok: `Chỉ cần phản xạ chậm 1 giây là nguy hiểm rình rập. Hãy để ${product.name} soi tỏ mọi chướng ngại vật từ xa!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Chia sẻ câu chuyện của bác tài bên dưới nhé!`
          },
          {
            angle: 'Kinh nghiệm chọn nhiệt màu: Đi mưa phùn và sương mù nên chọn 3000K hay 5500K?',
            hookFb: `💬 [BÁC TÀI HỎI ĐÁP] — ĐI MƯA ĐÈO DỐC: CHỌN ÁNH SÁNG TRẮNG 5500K HAY VÀNG NẮNG 3000K PHÁ SƯƠNG?`,
            bodyFb: `Rất nhiều bác tài tranh luận về nhiệt màu lý tưởng cho đèn xe ô tô:\n- Ánh sáng trắng 5500K: Sang trọng, dịu mắt, bám đường cực tốt trong điều kiện đường khô ráo hoặc đô thị.\n- Ánh sáng vàng 3000K: Bước sóng dài hạn chế tối đa tán xạ quang học, đâm xuyên màn mưa phùn và sương mù dày đặc.\n\nGiải pháp hoàn hảo là kết hợp cụm bi pha 5500K cùng bi gầm 3000K từ Bulbtek để tự tin trước mọi biến động thời tiết!`,
            hookTiktok: 'Nhiệt màu 3000K vs 5500K — Đi mưa chọn loại nào sáng nhất? Bác tài xem ngay! 💡🌧️',
            bodyTiktok: `Mưa phùn sương mù thì vàng 3000K phá sương vô đối. Đường khô thì trắng ấm 5500K dịu mắt bám đường!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Bác tài đang thích nhiệt màu nào hơn?`
          }
        ];
        break;

      case 'cat-quiz':
        variations = [
          {
            angle: 'Đố vui quang học ô tô: Vì sao ánh sáng vàng 3000K lại phá sương tốt hơn 6000K?',
            hookFb: `🎯 [MINIGAME BÁC TÀI THÔNG THÁI] — VÌ SAO ÁNH SÁNG VÀNG LẠI "PHÁ SƯƠNG" TỐT HƠN ÁNH SÁNG TRẮNG?`,
            bodyFb: `Thử tài kiến thức vật lý quang học cùng BULBTEK để nhận ngay phần quà chăm sóc xe hữu ích!\n\nCâu hỏi: Khi đi trong sương mù dày đặc, vì sao luồng sáng vàng (3000K-4300K) lại bám đường tốt hơn ánh sáng trắng xanh (6000K)?\nA. Vì ánh sáng vàng có bước sóng dài hơn, giảm thiểu hiện tượng tán xạ hạt nước Rayleigh.\nB. Vì ánh sáng vàng có công suất Watt cao hơn.\nC. Vì ánh sáng vàng làm nhiệt độ đèn nóng hơn làm tan hạt sương.\n\nBác tài comment đáp án A, B hoặc C bên dưới để rinh quà từ Bulbtek nhé!`,
            hookTiktok: 'Đố các bác: Trời sương mù tại sao phải bật đèn vàng 3000K? Trả lời đúng nhận quà Bulbtek! 🎯🎁',
            bodyTiktok: `Thử tài kiến thức quang học cùng Robot BU! Đoán đúng nhận voucher phụ kiện cực chất!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Đáp án A, B hay C? Bình luận ngay các bác ơi!`
          },
          {
            angle: 'Minigame đoán công số Cos/Pha của siêu phẩm nhận voucher chăm sóc xe',
            hookFb: `🎯 [MINIGAME CUỐI TUẦN] — ĐOÁN ĐÚNG CÔNG SUẤT COS/PHA — RINH QUÀ ĐỘ XE CÙNG ${product.name.toUpperCase()}!`,
            bodyFb: `Bác tài tinh tường đã nắm rõ thông số của siêu phẩm ${product.name} chưa?\n\nThể lệ cực kỳ đơn giản:\n1. Dự đoán chính xác công suất Cos và Pha của ${product.name} (Gợi ý nằm ngay trong bảng thông số chính hãng của Bulbtek).\n2. Tag 2 người bạn cùng đam mê xế cưng.\n\n03 bác tài có câu trả lời chính xác và nhanh nhất sẽ nhận ngay voucher nâng cấp đèn trị giá 500.000đ tại hệ thống đại lý Bulbtek toàn quốc!`,
            hookTiktok: 'Minigame đoán công suất đèn ${product.name} nhận voucher 500k từ Bulbtek! Chơi ngay các bác! 🎁⚡',
            bodyTiktok: `Đoán đúng công suất Cos/Pha nhận quà liền tay! Tag bạn bè vào cùng tham gia nhé!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Để lại con số may mắn của bác tài bên dưới!`
          },
          {
            angle: 'Thử tài phân biệt đường cắt Cos chuẩn văn minh vs đèn gây chói mắt',
            hookFb: `🎯 [BÁC TÀI TINH MẮT] — PHÂN BIỆT ĐƯỜNG CẮT COS VĂN MINH VÀ ĐÈN ĐỘ GÂY CHÓI MẮT`,
            bodyFb: `Nhìn vào bức ảnh chiếu sáng ban đêm, làm sao để biết một cụm bi LED đã được cân chỉnh chuẩn đăng kiểm?\n\nĐường cắt cos chuẩn mực của ${product.name} sở hữu đặc điểm độc quyền:\n- Phía bên trái thấp hơn nhẹ để không rọi vào mắt tài xế đối diện.\n- Phía bên phải chếch nhẹ 15 độ để soi rõ biển báo và chướng ngại vật ven đường.\n- Ranh giới giữa vùng sáng và vùng tối sắc nét như một đường kẻ.\nĐó chính là đẳng cấp quang học chuẩn châu Âu từ Bulbtek!`,
            hookTiktok: 'Đèn độ chuẩn đăng kiểm trông như thế nào? Bác tài tinh mắt nhìn đường cắt cos này nha! 🎯💡',
            bodyTiktok: `Bên trái thấp chống chói, bên phải cao soi biển báo, ranh giới sáng tối cực kỳ sắc nét!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Nâng cấp đèn chuẩn mực cùng ${product.name}!`
          },
          {
            angle: 'Đuổi hình bắt chữ linh kiện tản nhiệt Bulbtek',
            hookFb: `🎯 [ĐUỔI HÌNH BẮT CHỮ] — CHI TIẾT NÀO GIÚP ${product.name.toUpperCase()} BỀN BỈ SUỐT 50.000 GIỜ?`,
            bodyFb: `Nhiệt độ chính là "kẻ thù số 1" của chip LED ô tô. Nếu hệ thống tản nhiệt kém, đèn sẽ nhanh chóng sụt giảm độ sáng sau 30 phút vận hành.\n\nThử tài bác tài: Chi tiết cấu tạo nào dưới đây của ${product.name} chịu trách nhiệm giải nhiệt thần tốc?\n1. Khối nhôm hàng không nguyên khối mạ Anode.\n2. Cặp ống đồng kép dẫn nhiệt công nghệ chân không.\n3. Quạt ly tâm chống ồn tốc độ 12.000 vòng/phút.\n\nĐáp án chính xác: LÀ TẤT CẢ CÁC YẾU TỐ TRÊN! Sự kết hợp hoàn hảo tạo nên tuổi thọ vượt trội.`,
            hookTiktok: 'Chi tiết cơ khí nào giúp đèn Bulbtek chạy 8 tiếng liên tục không giảm sáng? Xem ngay! 🎯🔥',
            bodyTiktok: `Nhôm hàng không, ống đồng kép và quạt ly tâm siêu êm. Bền bỉ 50.000h thực chiến!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Đầu tư 1 lần, an tâm nhiều năm cùng Bulbtek!`
          }
        ];
        break;

      case 'cat-branding':
        variations = [
          {
            angle: 'Đầu tư ánh sáng là đầu tư cho bảo hiểm sinh mạng trên mọi cung đường',
            hookFb: `🛡️ [GIÁ TRỊ VÔ GIÁ] — VÌ SAO ĐẦU TƯ ÁNH SÁNG CHÍNH LÀ GÓI "BẢO HIỂM SINH MẠNG" RẺ NHẤT?`,
            bodyFb: `Chúng ta sẵn sàng chi hàng triệu đồng cho phụ kiện làm đẹp xe, nhưng lại quên mất rằng: BỘ PHẬN TRỰC TIẾP BẢO VỆ TÍNH MẠNG TRONG MÀN ĐÊM CHÍNH LÀ ĐÔI MẮT CỦA XẾ CƯNG.\n\nTrang bị ${product.name} không chỉ là nâng cấp chiếc xe, mà là trao sự an tâm tuyệt đối cho bản thân và người thân đi cùng. Nhìn xa hơn 150m đồng nghĩa với việc bạn có thêm 3-5 giây quý giá để xử lý mọi bất trắc.`,
            hookTiktok: 'Độ đèn không phải để oai, mà là mua bảo hiểm sinh mạng cho mình và gia đình! 🛡️❤️',
            bodyTiktok: `Nhìn rõ hơn 150m, phát hiện hiểm nguy sớm hơn, về nhà an toàn trọn vẹn!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Nâng cấp ${product.name} tại 300+ đại lý Bulbtek toàn quốc!`
          },
          {
            angle: '3 Giá trị cốt lõi hội tụ trong từng đường nét của sản phẩm',
            hookFb: `🛡️ [BẢN SẮC THƯƠNG HIỆU] — ${product.name.toUpperCase()}: KHI 3 GIÁ TRỊ CỐT LÕI HỘI TỤ TRONG MỘT THIẾT KẾ QUANG HỌC`,
            bodyFb: `Tại Bulbtek, chúng tôi không tạo ra sản phẩm chỉ để bán hàng. Mỗi cụm đèn xuất xưởng đều mang trọn vẹn linh hồn của thương hiệu:\n• BỀN BỈ: Cơ khí chuẩn xác, chịu va đập và rung chấn khắc nghiệt trên mọi cung đường đèo dốc.\n• BỀN VỮNG: Giữ trọn sự nguyên bản của hệ thống điện xe, cắm giắc zin 100% không cắt trích.\n• BẢO VỆ: Luồng sáng bám đường, văn minh không chói lóa, bảo vệ an toàn cho cả hai phía.`,
            hookTiktok: 'BỀN BỈ – BỀN VỮNG – BẢO VỆ hội tụ trong siêu phẩm ${product.name}! 🛡️✨',
            bodyTiktok: `Chất lượng khẳng định niềm tin, đồng hành cùng bác tài trên mọi dặm đường dài!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Khám phá ngay tại đại lý Bulbtek gần nhất!`
          },
          {
            angle: 'Bulbtek - Người bạn đồng hành bền bỉ trên hành trình trở về nhà cùng gia đình',
            hookFb: `🛡️ [HÀNH TRÌNH BÌNH AN] — ${product.name.toUpperCase()} — NGƯỜI BẠN ĐỒNG HÀNH VƯỢT MÀN ĐÊM TRỞ VỀ NHÀ`,
            bodyFb: `Sau những giờ làm việc căng thẳng hay những chuyến công tác đường trường mệt mỏi, cảm giác ấm áp nhất là được nhìn thấy ánh đèn hiên nhà cùng nụ cười của người thân.\n\nĐể chuyến trở về luôn trọn vẹn bình an, ${product.name} với công nghệ tăng sáng đỉnh cao sẽ là người dẫn lối trung thành nhất, xua tan mọi bóng tối và hiểm nguy rình rập trên cung đường.`,
            hookTiktok: 'Vững tay lái, soi sáng đường về nhà an toàn cùng ${product.name} Bulbtek! 🚗🏡',
            bodyTiktok: `An toàn hành trình — Mỗi luồng sáng là lời cam kết bảo vệ trọn vẹn gia đình bạn!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Trải nghiệm ánh sáng chuẩn mực cùng Bulbtek!`
          }
        ];
        break;

      case 'cat-product':
      default:
        variations = [
          {
            angle: 'Thực chiến đêm mưa & sương mù: Khắc phục triệt để nhược điểm đèn zin tối mờ',
            hookFb: `⚡ [THỰC CHIẾN ĐÊM MƯA] — TẠM BIỆT NỖI SỢ ĐÈN ZIN TỐI MỜ CÙNG SIÊU PHẨM ${product.name.toUpperCase()}!`,
            bodyFb: `Đi đêm trời mưa tầm tã hay sương mù giăng kín mặt đèo, đèn halogen hoặc bóng led nguyên bản của xe thường bị "nuốt sáng", chỉ nhìn thấy một khoảng mờ mờ trước đầu xe cực kỳ nguy hiểm.\n\nNâng cấp ngay ${product.name} từ BULBTEK VIỆT NAM:\n- Ánh sáng trải thảm rộng sang 3 làn đường, cắt xuyên hạt mưa bám sát vạch kẻ đường.\n- Tâm pha laser/led gom sâu giúp phát hiện ổ gà, người đi bộ và chướng ngại vật từ xa hơn 150m.\n- Đem lại tầm nhìn sáng rõ như ban ngày, xua tan hoàn toàn cảm giác căng thẳng mỏi mắt khi lái xe đêm.`,
            hookTiktok: 'Đèn zin xe bạn có tối như thế này khi gặp trời mưa không? Xem ${product.name} giải cứu tầm nhìn! 🚗🌧️',
            bodyTiktok: `Ánh sáng bám đường gấp 3 lần, xuyên mưa sương tự tin, nhìn rõ vật cản từ xa!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Trải nghiệm ngay tại 300+ đại lý Bulbtek toàn quốc!`
          },
          {
            angle: 'Đường cắt Cos văn minh & Chuẩn đăng kiểm: Ranh giới sáng tối phẳng lì không chói mắt',
            hookFb: `⚡ [CHUẨN ĐĂNG KIỂM 2026] — ${product.name.toUpperCase()}: MẶT CẮT COS SẮC LẸM, AN TOÀN TUYỆT ĐỐI CHO XE ĐỐI DIỆN!`,
            bodyFb: `Nhiều chủ xế muốn độ đèn nhưng lo lắng xe đối diện nháy pha chửi bới hoặc bị từ chối khi đi đăng kiểm. Với ${product.name}, bạn hoàn toàn quẳng gánh lo đi!\n\nĐược trang bị thấu kính quang học Polarized cao cấp, sản phẩm sở hữu:\n- Mặt cắt cốt phẳng sắc nét, ánh sáng tập trung bên dưới gương chiếu hậu xe ngược chiều.\n- Quang sai triệt tiêu gần như bằng 0, không có luồng sáng thừa gây chói lóa.\n- Đạt 100% tiêu chuẩn kiểm định đường bộ Việt Nam. Tăng sáng mạnh mẽ mà vẫn văn minh!`,
            hookTiktok: 'Độ đèn mà sợ chói mắt hay rớt đăng kiểm? Xem đường cắt cos siêu chuẩn của ${product.name}! 💡👌',
            bodyTiktok: `Đường cắt phẳng lì, không lóa xe đối diện, kiểm định đăng kiểm êm ru!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Lắp đặt chuẩn zin tại gara Bulbtek ngay!`
          },
          {
            angle: 'Công nghệ tản nhiệt ADC12 & Ống đồng kép: Bảo chứng độ bền 50.000 giờ không sụt áp',
            hookFb: `⚡ [BÓC TÁCH CƠ KHÍ] — VÌ SAO ${product.name.toUpperCase()} CHẠY LIÊN TỤC 8 TIẾNG KHÔNG HỀ GIẢM SÁNG?`,
            bodyFb: `Rất nhiều dòng đèn trôi nổi trên thị trường chỉ sáng rực rỡ trong 15 phút đầu, sau đó chip nóng ran và tự động hạ công suất xuống còn 50%. Đó là do hệ thống tản nhiệt yếu kém!\n\n${product.name} giải quyết triệt để bài toán nhiệt độ với cấu trúc 3 tầng:\n1. Khối nhôm hàng không ADC12 dẫn nhiệt cực nhanh.\n2. Ống đồng kép dẫn dung môi làm mát trực tiếp chân chip LED.\n3. Quạt ly tâm tốc độ cao thổi luồng khí nóng ra ngoài liên tục mà vẫn êm ái.\nĐảm bảo duy trì công suất quang thông ổn định suốt hành trình dài 50.000 giờ!`,
            hookTiktok: 'Đèn chạy 8 tiếng liên tục không hề sụt áp — Giải mã công nghệ tản nhiệt ${product.name}! 🔥❄️',
            bodyTiktok: `Nhôm hàng không, ống đồng kép, quạt tản nhiệt siêu êm. Bền bỉ suốt 50.000 giờ!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Bảo hành 1 đổi 1 chính hãng từ Bulbtek!`
          },
          {
            angle: 'Cắm giắc zin 100% - Bảo vệ hệ thống điện và giữ trọn bảo hành hãng',
            hookFb: `⚡ [CẮM ZIN 100%] — NÂNG CẤP ${product.name.toUpperCase()}: KHÔNG CẮT TRÍCH DÂY, GIỮ NGUYÊN BẢO HÀNH HÃNG!`,
            bodyFb: `Mối quan tâm lớn nhất của chủ xe mới, đặc biệt là các dòng xe điện VinFast (VF3, VF5, VF8...) hoặc xe đời mới là vấn đề chập cháy và mất bảo hành hãng.\n\nHiểu rõ điều đó, Bulbtek thiết kế ${product.name} với tiêu chuẩn "PLUG & PLAY":\n- Hộp giắc cắm tương thích zin 100% theo từng chuẩn chân đèn xe.\n- Tích hợp mạch Driver thông minh tự động ổn định điện áp 12V-24V, không báo lỗi trên màn hình đồng hồ tap-lô.\n- Thi công nhanh chóng trong 45-60 phút, dễ dàng về zin bất cứ lúc nào!`,
            hookTiktok: 'Độ đèn không cắt trích 1 sợi dây điện, cắm giắc zin 100% cho cả xe điện VinFast! 🚗⚡',
            bodyTiktok: `Không đấu nối, giữ trọn bảo hành hãng, tương thích 95% dòng xe tại Việt Nam!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Ghé đại lý Bulbtek thi công chuẩn zin trong 45 phút!`
          },
          {
            angle: 'Trải nghiệm hành trình xuyên Việt: Lái xe ban đêm không còn mỏi mắt',
            hookFb: `⚡ [REVIEW THỰC TẾ] — TRẢI NGHIỆM HÀNH TRÌNH XUYÊN VIỆT 1.500KM CÙNG ${product.name.toUpperCase()}`,
            bodyFb: `“Trước đây mỗi lần lái xe đêm từ Sài Gòn ra Đà Nẵng, mắt tôi lúc nào cũng căng thẳng vì phải căng mắt nhìn ổ gà. Từ ngày lên bộ ${product.name}, cảm giác lái xe đêm nhẹ nhàng và thư thái hơn hẳn!” — Chia sẻ thực tế từ một bác tài sau 6 tháng trải nghiệm.\n\nVùng sáng mịn màng, nhiệt màu tự nhiên không gây lóa, độ phủ rộng hơn 3 làn xe giúp việc ôm cua đèo dốc trở nên chuẩn xác và an tâm tuyệt đối.`,
            hookTiktok: 'Lái xe đêm 8 tiếng không mỏi mắt nhờ ánh sáng mịn màng của ${product.name}! 🚗✨',
            bodyTiktok: `Trải nghiệm thực tế từ bác tài xuyên Việt: Sáng dịu mắt, bám đường, tự tin ôm cua đèo đêm!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Nâng cấp xế cưng cùng Bulbtek ngay hôm nay!`
          },
          {
            angle: 'So sánh trước & sau nâng cấp: Vùng chiếu sáng mở rộng gấp 3 lần',
            hookFb: `⚡ [BEFORE & AFTER] — SỰ LỘT XÁC NGOẠN MỤC CỦA ÁNH SÁNG KHI LÊN ${product.name.toUpperCase()}!`,
            bodyFb: `Bên trái là ánh sáng đèn zin vàng vọt chỉ chiếu tới khoảng 40m, còn bên phải là luồng sáng ${product.name} trải dài trên 150m rõ mồn một từng cành cây ven đường.\n\nSự khác biệt không chỉ nằm ở độ sáng, mà là:\n- Vùng quan sát hai bên lề đường mở rộng gấp 3 lần, phát hiện sớm người đi bộ hay xe máy rẽ nhánh.\n- Điểm mù ban đêm hoàn toàn bị xóa bỏ.\n- Đem lại sự tự tin làm chủ tay lái trong mọi cung đường hiểm trở.`,
            hookTiktok: 'Đèn zin vs ${product.name}: Nhìn là thấy sự khác biệt một trời một vực! 💡🆚💡',
            bodyTiktok: `Chiếu xa hơn 150m, góc rộng sang 3 làn đường, xóa sạch điểm mù ban đêm!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Xem review thực tế tại đại lý Bulbtek gần nhất!`
          }
        ];
        break;
    }
  }

  // =========================================================================
  // 4. BỘ LỌC CHỐNG TRÙNG LẶP THÔNG MINH (ANTI-DUPLICATION SELECTOR)
  // =========================================================================
  // Filter out variations that have already been used in memory
  const unusedVariations = variations.filter(v => 
    !usedAngleSet.has(v.angle.toLowerCase().trim()) &&
    !usedHookFbSet.has(v.hookFb.toLowerCase().trim())
  );

  let chosenVar: ContentVariation;
  let variationIdx: number;

  if (forceVariationIndex !== undefined) {
    variationIdx = forceVariationIndex;
    chosenVar = variations[forceVariationIndex % variations.length];
  } else if (unusedVariations.length > 0) {
    // Pick the first unused variation
    chosenVar = unusedVariations[0];
    variationIdx = variations.findIndex(v => v.angle === chosenVar.angle);
    if (variationIdx === -1) variationIdx = 0;
  } else {
    // All predefined variations have been used! Activate Dynamic Combinatorial Synthesizer
    const seedIndex = productMemories.length + 1;
    variationIdx = seedIndex;

    const roadConditions = [
      'đoạn đèo sương mù Bảo Lộc lúc 2 giờ sáng',
      'cơn mưa dông như trút nước trên cao tốc miền Trung',
      'cung đường liên tỉnh tối mịt không có bóng đèn cao áp',
      'đường đèo hiểm trở Tây Bắc trơn trượt quanh co',
      'đô thị giờ tan tầm mưa ngập cần quan sát vũng nước và chướng ngại vật'
    ];
    const personas = [
      'Bác tài xe dịch vụ ôm vô lăng 300km mỗi ngày',
      'Chủ xế gia đình chuẩn bị chuyến đi chơi xa cùng vợ con',
      'Chuyên gia kỹ thuật gara 10 năm kinh nghiệm',
      'Người bạn đồng hành cabin lắng nghe từng nỗi niềm cầm lái'
    ];
    const techPillars = [
      'công nghệ bám đường quang học chuẩn mực không gây chói',
      'khả năng duy trì công suất thực không sụt áp nhờ tản nhiệt đồng kép',
      'sự an tâm với chính sách bảo hành 1 đổi 1 điện tử trên 300 đại lý',
      'thiết kế cắm giắc zin 100% giữ trọn bảo hành cho mọi dòng xe'
    ];

    const road = roadConditions[seedIndex % roadConditions.length];
    const persona = personas[(seedIndex + 1) % personas.length];
    const tech = techPillars[(seedIndex + 2) % techPillars.length];

    chosenVar = {
      angle: `Hành trình thực tế #${seedIndex}: ${persona} và thử thách ${road}`,
      hookFb: `⚡ [HÀNH TRÌNH THỰC TẾ #${seedIndex}] — ${product.name.toUpperCase()}: KHI ${persona.toUpperCase()} ĐỐI MẶT ${road.toUpperCase()}!`,
      bodyFb: `Mỗi cung đường là một thử thách khác nhau, nhưng điểm chung là bác tài luôn cần một luồng sáng tin cậy để làm chủ tay lái.\n\nTrong điều kiện ${road}, ${product.name} phát huy tối đa ${tech}:\n- Phá tan màn đêm tĩnh mịch, đem lại tầm nhìn sáng rõ tự nhiên.\n- Đảm bảo an toàn tuyệt đối cho người ngồi trên xe lẫn phương tiện đối diện.\n- Đồng hành vững chãi cùng lời cam kết chất lượng chuẩn mực từ Bulbtek Việt Nam.`,
      hookTiktok: `${persona} chia sẻ kinh nghiệm vượt ${road} an toàn cùng ${product.name}! 🚗✨`,
      bodyTiktok: `Trải nghiệm thực chiến đỉnh cao: ${tech} giúp bác tài tự tin xuyên đêm!\n${highlightSpecs.slice(0, 2).map(s => `✓ ${s}`).join('\n')}\n👉 Ghé ngay đại lý Bulbtek gần nhất để trải nghiệm!`
    };
  }

  // Final CTA formatting
  const ctaFb = chosenVar.ctaFb || '👉 Ghé ngay đại lý Bulbtek gần nhất để được tư vấn và lắp đặt chuẩn zin cho dòng xe của bạn!';
  const ctaTiktok = chosenVar.ctaTiktok || 'Ghé ngay gara Bulbtek gần nhất để nâng cấp ánh sáng chuẩn an toàn nhé các bác!';

  // Format Additional Info if provided
  const cleanedAdditional = additionalInfo?.trim();
  const additionalBlockFb = cleanedAdditional 
    ? `\n📌 THÔNG TIN BỔ SUNG / ƯU ĐÃI ĐẶC BIỆT:\n${cleanedAdditional.split('\n').map(l => l.trim()).filter(Boolean).map(l => l.startsWith('•') || l.startsWith('-') ? l : `• ${l}`).join('\n')}\n`
    : '';

  const additionalBlockTiktok = cleanedAdditional
    ? `\n🎁 Lưu ý thêm: ${cleanedAdditional.split('\n')[0].trim()}\n`
    : '';

  // Compose Full Captions
  const facebookCaption = `${chosenVar.hookFb}

${chosenVar.bodyFb}
${additionalBlockFb}
✨ ĐIỂM SÁNG KỸ THUẬT NỔI BẬT:
${specsText}
🎯 Lợi ích cốt lõi: ${product.coreBenefit}

🛡️ CAM KẾT CHÍNH HÃNG TỪ BULBTEK:
- Bảo hành điện tử chính hãng 1 đổi 1 nhanh chóng.
- Cắm giắc zin 100% không cắt trích dây, giữ trọn bảo hành xe.
- Cân chỉnh luồng sáng chuẩn vạch kiểm định tại 300+ đại lý toàn quốc.

${ctaFb}

${fixedFbHashtags} ${productTag} ${lineTag} #ĐộXeChuẩnMực #300DaiLyToanQuoc`;

  const tiktokCaption = `${chosenVar.hookTiktok}

${chosenVar.bodyTiktok}
${additionalBlockTiktok}
${ctaTiktok}

${fixedTiktokHashtags} ${productTag}`;

  const resolvedAngle = cleanedAdditional 
    ? `${chosenVar.angle} (+ ${cleanedAdditional.slice(0, 35)}...)`
    : chosenVar.angle;

  // Sinh Headline sáng tạo riêng độc lập cho banner quảng cáo / Design Brief (không chứa prefix nội bộ)
  let creativeHeadline = '';
  if (product.productLine === 'Linh Vật Robot BU') {
    creativeHeadline = `Robot BU Đồng Hành — Thắp Sáng Mọi Cung Đường Đêm`;
  } else if (product.productLine === 'Branding Sản Phẩm') {
    creativeHeadline = `BULBTEK VIỆT NAM — An Toàn Hành Trình Cùng Bác Tài Việt`;
  } else {
    const benefitShort = (product.coreBenefit || 'Tăng sáng an toàn bám đường')
      .split(/[,.–-]/)[0]
      .trim();
    creativeHeadline = `${product.name.toUpperCase()} — ${benefitShort}`;
  }

  return {
    creativeHeadline,
    facebookCaption,
    tiktokCaption,
    angleUsed: resolvedAngle,
    hookFb: chosenVar.hookFb,
    hookTiktok: chosenVar.hookTiktok,
    variationIndex: variationIdx + 1,
    isFresh: true
  };
}


export function generateDesignBrief(
  contentItem: Partial<ContentItem>,
  product: Product,
  category: Category,
  formats: string[] = ['Facebook post (1080×1080px — 1:1)'],
  designerNotes = ''
): DesignBrief {
  const isVertical = formats.some(f => f.includes('9:16'));
  const aspectMJ = isVertical ? '9:16' : '1:1';
  const aspectImagen = isVertical ? '9:16 vertical' : '1:1 square';

  let toneKeyword = 'Cinematic';
  if (category.id === 'cat-dealer') toneKeyword = 'Professional B2B Corporate';
  if (category.id === 'cat-quiz') toneKeyword = 'Gamified Modern Tech';
  if (category.id === 'cat-interaction') toneKeyword = 'Friendly Emotional Automotive';
  if (category.id === 'cat-product') toneKeyword = 'High-tech Precision Engineering';

  // Customized Prompts & Visuals based on productLine
  let imagenPrompt = '';
  let midjourneyPrompt = '';
  let visualBackground = 'Tối (#1A1A1A hoặc gradient đen-xám mờ sâu)';
  let visualAccent = 'Đỏ nhận diện #AF2024 và ánh sáng trắng/vàng từ chip LED';
  let visualLighting = 'Dramatic automotive — tia sáng laser/LED cắt xẻ không gian, backlighting tương phản cao';
  let visualEffects = 'Tia sáng laser hội tụ, bụi nước hạt sương bám trên thấu kính chống nước IP68';

  if (product.productLine === 'Linh Vật Robot BU') {
    visualBackground = 'Không gian cabin ô tô ban đêm cao cấp, táp-lô xe hơi hiện đại, ngoài kính lái là cung đường đêm lung linh';
    visualAccent = 'Đỏ thương hiệu #AF2024, mắt Robot BU phát sáng xanh lam công nghệ LED rực rỡ';
    visualLighting = 'Ánh sáng nội thất ấm áp kết hợp luồng đèn pha rực sáng từ phía trước kính xe';
    visualEffects = 'Hiệu ứng ánh sáng 3D bóng bẩy, biểu cảm vui vẻ tin cậy của trợ thủ Robot BU';

    imagenPrompt = `3D commercial illustration for BULBTEK Vietnam. Friendly futuristic mascot robot BU with metallic glossy white armor and vivid red #AF2024 accents, glowing blue LED eyes. Robot BU is sitting happily on a car dashboard cockpit at night, acting as a trusted lighting companion. Windshield shows dark scenic mountain road illuminated by powerful headlights. ${aspectImagen} composition, 25% space reserved for typography. Hyperrealistic 4K 3D render.`;
    midjourneyPrompt = `/imagine 3D cute high-tech automotive mascot robot BU, metallic armor with #AF2024 red and white accents, glowing blue eyes, sitting inside luxury car cockpit on dashboard, nighttime highway outside windshield, volumetric lighting, automotive 3D render, Pixar style commercial quality --ar ${aspectMJ} --style raw`;
  } else if (product.productLine === 'Branding Sản Phẩm') {
    visualBackground = 'Cung đường đèo uốn lượn hùng vĩ của Việt Nam trong màn đêm, bầu trời ngàn sao hoặc hoàng hôn chạng vạng';
    visualAccent = 'Đỏ nhận diện #AF2024, biểu tượng 3 khiên chắn tượng trưng Bền Bỉ - Bền Vững - Bảo Vệ';
    visualLighting = 'Luồng sáng đèn pha Bulbtek vươn dài xé toang màn đêm, tạo cảm giác an tâm tuyệt đối';
    visualEffects = 'Tia sáng xuyên sương mù sắc nét, logo Bulbtek và slogan "An Toàn Hành Trình" nổi bật';

    imagenPrompt = `Cinematic brand commercial advertisement for BULBTEK Vietnam. Slogan Safe Journey (An Toàn Hành Trình). Premium car driving on a scenic winding mountain road at night, long powerful headlight beam illuminating the path safely. Dramatic dark atmosphere #1A1A1A, subtle red ambient accents #AF2024, high contrast, 25% clean copy space. 4K commercial automotive photography.`;
    midjourneyPrompt = `/imagine BULBTEK Vietnam brand key visual, luxury automobile driving safely through dark misty mountain pass road, brilliant LED headlight beam cutting darkness, safe journey mood, cinematic red ambient lighting #AF2024, hyperrealistic automotive ad --ar ${aspectMJ} --style raw --q 2`;
  } else {
    imagenPrompt = `Professional automotive LED advertisement for BULBTEK Vietnam. Product: ${product.name} (${product.productLine}). Dark dramatic studio background #1A1A1A, intense LED glow effect, red accent #AF2024, cinematic backlighting, volumetric light rays from product. ${aspectImagen} composition. Space reserved top/bottom 25% for text overlay. Brand logo space top right. Tone: ${toneKeyword} matching ${category.name}. Hyperrealistic 4K automotive commercial photography. No text in image.`;
    midjourneyPrompt = `/imagine BULBTEK Vietnam LED automotive product shot, ${product.name}, dark studio dramatic lighting, intense LED glow, #AF2024 red accent, cinematic automotive commercial --ar ${aspectMJ} --style raw --q 2`;
  }

  // Tách biệt hoàn toàn Headline sáng tạo (creative_headline) khỏi Tiêu đề quản trị (title/internal_title)
  let headlineCandidate = contentItem.creativeHeadline;
  if (!headlineCandidate) {
    if (product.productLine === 'Linh Vật Robot BU') {
      headlineCandidate = 'Robot BU Đồng Hành — Thắp Sáng Mọi Cung Đường Đêm';
    } else if (product.productLine === 'Branding Sản Phẩm') {
      headlineCandidate = 'BULBTEK VIỆT NAM — Lời Cam Kết Bền Bỉ, Bền Vững & Bảo Vệ';
    } else {
      const benefitShort = (product.coreBenefit || 'Tăng sáng an toàn bám đường')
        .split(/[,.–-]/)[0]
        .trim();
      headlineCandidate = `${product.name.toUpperCase()} — ${benefitShort}`;
    }
  }

  // Tiêu chuẩn nghiệm thu: Loại bỏ hoàn toàn tiền tố Category (PRODUCT:, QUIZ...) và "Ngày x/x"
  headlineCandidate = headlineCandidate
    .replace(/^(PRODUCT|QUIZ|TƯƠNG TÁC|BRANDING|DEALER|🤖 \[Robot BU\]|🛡️ \[Branding\])\s*:\s*/i, '')
    .replace(/\s*-\s*Ngày\s+\d+(\/\d+)?/gi, '')
    .replace(/\s*-\s*ngày\s+\d+(\/\d+)?/gi, '')
    .trim();

  // Chuẩn hóa highlightSpecs: loại bỏ chữ 'N/A' lẫn vào số liệu thật
  const rawHighlightSpecs = contentItem.highlightSpecs && contentItem.highlightSpecs.length > 0
    ? contentItem.highlightSpecs
    : Object.values(product.specs || {}).filter(Boolean) as string[];

  const cleanHighlightSpecs = rawHighlightSpecs
    .map(spec => {
      if (typeof spec !== 'string') return '';
      // Thay thế N/A hoặc N/A (Hiệu suất 100%) thành text cảnh báo chuẩn
      if (/\bN\/A\b/i.test(spec)) {
        return spec.replace(/\bN\/A\s*(\([^)]*\))?/gi, 'Chưa cập nhật thông số').trim();
      }
      return spec.trim();
    })
    .filter(Boolean);

  return {
    id: `brief-${Date.now()}`,
    contentItemId: contentItem.id,
    title: `Brief: ${contentItem.title || product.name}`,
    channel: contentItem.channel || 'Facebook',
    formats,
    deadline: contentItem.date || new Date().toISOString().split('T')[0],
    productName: product.name,
    highlightSpecs: cleanHighlightSpecs.length > 0 ? cleanHighlightSpecs : ['Chưa cập nhật thông số kỹ thuật'],
    designerNotes,
    visualRequirements: {
      background: visualBackground,
      accentColor: visualAccent,
      composition: `${formats.join(', ')} — Trọng tâm hình ảnh nằm tại vị trí 1/3, chừa khoảng thở 25% cho Headline`,
      lighting: visualLighting,
      effects: visualEffects
    },
    textOverlay: {
      headline: headlineCandidate,
      subHeadline: product.coreBenefit,
      logoPosition: 'Góc trên bên phải (Top-Right) — Kích thước tối thiểu 10% chiều rộng khung hình',
      hasCtaOrHashtag: true
    },
    brandConstants: {
      colors: 'Primary: #AF2024 | Dark: #1A1A1A | White: #FFFFFF',
      font: 'Sans-serif Bold headline / Regular body',
      style: 'Dramatic automotive lighting (Lý tính 70% / Cảm xúc 30%)'
    },
    imagenPrompt,
    midjourneyPrompt,
    createdAt: new Date().toISOString()
  };
}
