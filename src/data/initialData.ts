import { 
  Product, 
  Category, 
  TeamMember, 
  SystemSettings, 
  ContentItem, 
  EmailLog,
  BrandColorItem,
  PhilosophyPoint,
  ThreeNoRule,
  CoreValueItem,
  BrandTypography,
  ComplianceRule
} from '../types';
import { DEFAULT_COMPLIANCE_RULES } from './complianceKeywords';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-sunset',
    name: 'Bi LED Sunset',
    productLine: 'Bi LED',
    sku: 'BTK-LED-SUNSET',
    status: 'Hero Product',
    retailPrice: '8.500.000 VNĐ / Cặp',
    suitableFor: 'Xe ô tô',
    targetAudience: 'Cả hai',
    segment: 'Premium',
    specs: {
      chipLed: 'Osram 6+3 nhân công nghệ Đức',
      colorTemp: '5500K (Trắng ấm tự nhiên)',
      brightness: '12.000 Lux (Tâm pha cực gom)',
      power: 'Cos 65W - Pha 75W',
      voltage: '9V - 16V DC',
      lifespan: '50.000 giờ thắp sáng',
      warranty: '3 năm (1 đổi 1 chính hãng)',
      compatibility: 'Chân xoáy đa năng, tương thích 98% dòng xe ô tô',
      sizeInch: '3.0 inch',
      waterproof: 'IP65',
      specialFeatures: 'Ánh sáng cung hoàng hôn dịu mắt, bám đường vượt trội trong mưa phùn, tản nhiệt đồng kép quạt thủy lực không ồn'
    },
    coreBenefit: 'Tầm nhìn đỉnh cao hoàng hôn, bám đường êm dịu, không gây chói xe ngược chiều',
    stage: 'Growth',
    internalNotes: 'Sản phẩm chủ lực đánh phân khúc sedan và SUV cao cấp, đại lý có biên độ lợi nhuận tốt',
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-09-01T09:30:00Z'
  },
  {
    id: 'prod-vista',
    name: 'Bi LED Vista',
    productLine: 'Bi LED',
    sku: 'BTK-LED-VISTA',
    status: 'Sản phẩm hiện hữu',
    retailPrice: '6.200.000 VNĐ / Cặp',
    suitableFor: 'Xe ô tô',
    targetAudience: 'B2C Người dùng cuối',
    segment: 'Mid',
    specs: {
      chipLed: 'Sanan Opto thế hệ mới',
      colorTemp: '5500K',
      brightness: '9.500 Lux',
      power: 'Cos 55W - Pha 65W',
      voltage: '12V',
      lifespan: '45.000 giờ',
      warranty: '2 năm chính hãng',
      compatibility: 'Tương thích hầu hết các xe chóa H4, H7, 9005',
      sizeInch: '3.0 inch',
      waterproof: 'IP65',
      specialFeatures: 'Đường cắt cos phẳng mịn nét như kẻ chỉ, thấu kính phủ AR xanh tím chống lóa'
    },
    coreBenefit: 'Mở rộng tối đa góc quan sát hai bên lề đường, lái xe thư thái an toàn trong phố',
    stage: 'Maintain',
    internalNotes: 'Dành cho khách nâng cấp lần đầu từ đèn halogen nguyên bản',
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-08-20T14:00:00Z'
  },
  {
    id: 'prod-blackhole',
    name: 'Bi LED Blackhole',
    productLine: 'Bi LED',
    sku: 'BTK-LED-BLACKHOLE',
    status: 'Sản phẩm mới',
    retailPrice: '9.800.000 VNĐ / Cặp',
    targetAudience: 'Cả hai',
    segment: 'Premium',
    specs: {
      chipLed: 'Custom 9 nhân Nichia Nhật Bản',
      colorTemp: '5200K sâu thẳm',
      brightness: '13.500 Lux',
      power: 'Cos 70W - Pha 85W',
      voltage: '12V - 24V',
      lifespan: '55.000 giờ',
      warranty: '3 năm đổi mới',
      compatibility: 'Khung pat chuyên dụng cho Toyota, Ford, Hyundai, Kia',
      specialFeatures: 'Hệ thống quạt hút chân không Blackhole Vortex tản nhiệt tức thì, tâm pha laser trợ lực'
    },
    coreBenefit: 'Hút trọn bóng đêm, gom sáng xuyên thấu hàng trăm mét cho tay lái việt dã tốc độ cao',
    stage: 'Launch',
    internalNotes: 'Flagship mới ra mắt Q3/2026, đẩy mạnh truyền thông công nghệ tản nhiệt',
    imageUrl: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-09-02T11:00:00Z'
  },
  {
    id: 'prod-leader',
    name: 'Bi LED Leader',
    productLine: 'Bi LED',
    sku: 'BTK-LED-LEADER',
    status: 'Sản phẩm hiện hữu',
    retailPrice: '7.500.000 VNĐ / Cặp',
    targetAudience: 'B2B Dealer',
    segment: 'Mid',
    specs: {
      chipLed: 'LED Module kép cao cấp',
      colorTemp: '5500K',
      brightness: '10.800 Lux',
      power: 'Cos 58W - Pha 68W',
      voltage: '12V',
      lifespan: '50.000 giờ',
      warranty: '3 năm',
      compatibility: 'Phù hợp xe gầm cao Crossover và Bán tải',
      specialFeatures: 'Khả năng kích sáng tức thì 0.1s, không có độ trễ khi đá pha xin đường'
    },
    coreBenefit: 'Dẫn đầu cung đường trường với luồng sáng pha hội tụ chuẩn xác và phản hồi chớp nhoáng',
    stage: 'Growth',
    internalNotes: 'Được các gara tỉnh rất chuộng vì độ bền vô đối, tỉ lệ bảo hành < 0.2%',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-07-15T15:00:00Z'
  },
  {
    id: 'prod-ray2',
    name: 'Bi Gầm RAY 2.0',
    productLine: 'Bi Gầm',
    sku: 'BTK-FOG-RAY20',
    status: 'Hero Product',
    retailPrice: '4.800.000 VNĐ / Cặp',
    targetAudience: 'Cả hai',
    segment: 'Mid',
    specs: {
      chipLed: 'Tùy biến 6 nhân CSP công suất cao',
      colorTemp: '3 chế độ: 3000K (Vàng đậm) - 4300K (Vàng chanh) - 5500K (Trắng)',
      brightness: '8.800 Lux',
      power: 'Cos 45W - Pha 55W',
      voltage: '12V - 24V',
      lifespan: '50.000 giờ',
      warranty: '2 năm',
      compatibility: 'Pat zin chuyên biệt cho tất cả dòng xe trên thị trường',
      specialFeatures: 'Chống nước ngâm chuẩn IP68 tuyệt đối, vỏ nhôm phay CNC chống ăn mòn sình lầy'
    },
    coreBenefit: 'Chuyên gia phá sương xuyên mưa lũ, đổi màu linh hoạt theo thời tiết ngay trên công tắc zin',
    stage: 'Growth',
    internalNotes: 'Top 1 doanh số mùa mưa bão tại miền Bắc & Tây Nguyên',
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'prod-phantom4500k',
    name: 'Bi Gầm Phantom 4500K',
    productLine: 'Bi Gầm',
    sku: 'BTK-FOG-PHANTOM45',
    status: 'Sản phẩm hiện hữu',
    retailPrice: '5.200.000 VNĐ / Cặp',
    targetAudience: 'B2C Người dùng cuối',
    segment: 'Mid',
    specs: {
      chipLed: 'Osram Germany',
      colorTemp: '4500K chuẩn ánh sáng ban ngày tự nhiên',
      brightness: '9.200 Lux',
      power: 'Cos 48W - Pha 58W',
      voltage: '12V',
      lifespan: '48.000 giờ',
      warranty: '2 năm',
      compatibility: 'Kích thước chuẩn 3.0 inch, kèm tai bắt thông minh',
      specialFeatures: 'Vệt cắt cos trải đều phẳng lì, hỗ trợ góc chiếu rộng trải dài 2 bên mép đường'
    },
    coreBenefit: 'Ánh sáng 4500K trung tính thân thiện với mắt tài xế, bám mặt đường nhựa ướt xuất sắc',
    stage: 'Maintain',
    internalNotes: 'Sản phẩm yêu thích của các bác tài chạy dịch vụ ban đêm liên tỉnh',
    imageUrl: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-07-28T16:00:00Z'
  },
  {
    id: 'prod-cyber2bolt',
    name: 'Trợ Sáng CYBER 2 BOLT',
    productLine: 'Trợ Sáng',
    sku: 'BTK-AUX-CYBER2',
    status: 'Hero Product',
    retailPrice: '2.400.000 VNĐ / Cặp',
    targetAudience: 'Cả hai',
    segment: 'Mid',
    specs: {
      chipLed: 'Dual LED Core Cree XHP',
      colorTemp: 'Cos Vàng 3500K - Pha Trắng 6000K',
      brightness: '6.500 Lux',
      power: '35W / Đèn',
      voltage: '9V - 36V (Dùng được cả xe máy & xe tải)',
      lifespan: '40.000 giờ',
      warranty: '18 tháng',
      compatibility: 'Pát nhôm CNC gắn chân gương, cản trước, hốc gió, phuộc xe',
      specialFeatures: 'Kích thước siêu mini chỉ bằng quả bóng golf, thấu kính lồi gom luồng sáng siêu phẳng không chói xe đối diện'
    },
    coreBenefit: 'Nhỏ gọn uy lực, trợ thủ đắc lực chống mù sương cho cả mô tô phân khối lớn lẫn ô tô',
    stage: 'Growth',
    internalNotes: 'Hero product hiện tại được review rầm rộ trên TikTok, giới trẻ độ xe rất chuộng',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-04-10T08:00:00Z',
    updatedAt: '2026-09-05T09:00:00Z'
  },
  {
    id: 'prod-bisquare-vf3',
    name: 'Bi Square 3.0 (VinFast VF3)',
    productLine: 'Bi LED',
    sku: 'BTK-SPE-VF3-SQ30',
    status: 'Hero Product',
    retailPrice: '7.900.000 VNĐ / Bộ cắm zin',
    targetAudience: 'B2C Người dùng cuối',
    segment: 'Premium',
    specs: {
      chipLed: 'Custom Square LED Matrix 6+2',
      colorTemp: '5500K',
      brightness: '11.000 Lux',
      power: 'Cos 50W - Pha 60W (Tối ưu điện bình xe điện)',
      voltage: '12V DC ổn áp kỹ thuật số',
      lifespan: '50.000 giờ',
      warranty: '3 năm',
      compatibility: 'Chuyên dụng 100% cho xe điện VinFast VF3',
      specialFeatures: 'Thiết kế chóa vuông nguyên bản khớp 100% mặt ca-lăng VF3, cắm giắc zin 100% không cắt trích dây giữ trọn bảo hành xe'
    },
    coreBenefit: 'Khắc phục hoàn toàn điểm yếu đèn nguyên bản của VinFast VF3, tăng sáng gấp 5 lần mà vẫn giữ trọn bảo hành hãng',
    stage: 'Launch',
    internalNotes: 'Sản phẩm chiến lược đón đầu làn sóng xe VinFast VF3 giao hàng toàn quốc năm 2026',
    imageUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-07-01T08:00:00Z',
    updatedAt: '2026-09-06T10:00:00Z'
  },
  {
    id: 'prod-am12',
    name: 'Bi LED Mini AM-12',
    productLine: 'Bi LED Mini',
    sku: 'BTK-MINI-AM12',
    status: 'Sản phẩm hiện hữu',
    retailPrice: '1.600.000 VNĐ / Cặp',
    targetAudience: 'B2C Người dùng cuối',
    segment: 'Entry',
    specs: {
      chipLed: 'CSP High-Lumen Chip',
      colorTemp: '5500K',
      brightness: '5.500 Lux',
      power: 'Cos 30W - Pha 38W',
      voltage: '12V',
      lifespan: '35.000 giờ',
      warranty: '1 năm',
      compatibility: 'Chuyên xe máy (Honda SH, Air Blade, Exciter, Winner X)',
      specialFeatures: 'Lắp đặt chóa xe máy gọn gàng, không làm yếu bình acquy, mặt cắt thẳng không làm lóa mắt người đối diện'
    },
    coreBenefit: 'Tăng sáng vượt trội cho xe máy hai bánh, an toàn trên từng ngõ ngách và quốc lộ đêm',
    stage: 'Maintain',
    internalNotes: 'Doanh số bán lẻ phụ tùng xe 2 bánh ổn định',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-03-20T08:00:00Z',
    updatedAt: '2026-08-10T11:00:00Z'
  },
  {
    id: 'prod-bklh-neo',
    name: 'Bóng LED BKLH NEO',
    productLine: 'Bóng LED',
    sku: 'BTK-BULB-BKLH-NEO',
    status: 'Sản phẩm mới',
    retailPrice: '1.800.000 VNĐ / Cặp',
    targetAudience: 'Cả hai',
    segment: 'Entry',
    specs: {
      chipLed: 'LatticePower CSP siêu nhỏ',
      colorTemp: '6000K Trắng pha lê',
      brightness: '6.000 Lumen',
      power: '45W / Bóng',
      voltage: '12V - 24V',
      lifespan: '40.000 giờ',
      warranty: '2 năm',
      compatibility: 'Đầy đủ chân bóng: H1, H4, H7, H11, 9005, 9012',
      specialFeatures: 'Ống dẫn nhiệt đồng kép tản nhiệt tức thì, kích thước 1:1 y hệt bóng sợi đốt Halogen'
    },
    coreBenefit: 'Thay bóng zin trong 5 phút, giữ zin nguyên bản xe, sáng gấp 3 lần halogen tiêu chuẩn',
    stage: 'Growth',
    internalNotes: 'Giải pháp nâng cấp nhanh chi phí hợp lý cho xe còn bảo hành hoặc đăng kiểm khắt khe',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-05-15T08:00:00Z',
    updatedAt: '2026-08-25T14:00:00Z'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-branding',
    name: 'BRANDING',
    tone: 'Cảm xúc, thương hiệu, câu chuyện',
    color: '#AF2024',
    exampleAngle: 'Hành trình bác tài xuyên đêm cùng sự bền bỉ của Bulbtek, triết lý An Toàn Hành Trình',
    icon: 'ShieldAlert'
  },
  {
    id: 'cat-product',
    name: 'PRODUCT',
    tone: 'Kỹ thuật, thông số, lợi ích, thuyết phục',
    color: '#2563EB',
    exampleAngle: 'So sánh đường cắt ánh sáng Cos/Pha, giải mã công nghệ tản nhiệt đồng kép và chip LED Osram',
    icon: 'Zap'
  },
  {
    id: 'cat-interaction',
    name: 'TƯƠNG TÁC',
    tone: 'Vui, câu hỏi, mời gọi, tag bạn bè',
    color: '#F59E0B',
    exampleAngle: 'Bác tài sợ nhất điều gì khi lái xe đêm trời mưa bão? Chia sẻ kỉ niệm phượt cùng xế cưng',
    icon: 'MessageSquare'
  },
  {
    id: 'cat-quiz',
    name: 'QUIZ',
    tone: 'Gamification, đố vui, giáo dục nhẹ',
    color: '#10B981',
    exampleAngle: 'Đố vui chọn đúng nhiệt màu đi mưa: 3000K hay 6000K? Minigame nhận quà nâng cấp đèn Bulbtek',
    icon: 'HelpCircle'
  },
  {
    id: 'cat-dealer',
    name: 'DEALER',
    tone: 'B2B, lợi ích kinh doanh, số liệu, professional',
    color: '#EA580C',
    exampleAngle: 'Chính sách chiết khấu gara hấp dẫn, hỗ trợ biển bảng POSM và đào tạo kỹ thuật lắp đặt độc quyền',
    icon: 'Briefcase'
  }
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'user-philip',
    name: 'Philip',
    email: 'philip.coo@bulbtek.vn',
    role: 'ADMIN',
    roleTitle: 'COO (Chief Operating Officer)',
    status: 'Active',
    addedDate: '2025-10-01',
    avatar: 'PL'
  },
  {
    id: 'user-tuananh',
    name: 'Tuấn Anh',
    email: 'tuananh.lead@bulbtek.vn',
    role: 'APPROVER',
    roleTitle: 'Marketing & Ecom Team Lead',
    status: 'Active',
    addedDate: '2025-11-15',
    avatar: 'TA'
  },
  {
    id: 'user-linh',
    name: 'Linh',
    email: 'linh.mkt@bulbtek.vn',
    role: 'CREATOR',
    roleTitle: 'Marketing Executive (Content & SEO)',
    status: 'Active',
    addedDate: '2026-02-01',
    avatar: 'LH'
  },
  {
    id: 'user-duc',
    name: 'Đức',
    email: 'duc.copy@bulbtek.vn',
    role: 'CREATOR',
    roleTitle: 'Content Specialist',
    status: 'Active',
    addedDate: '2026-03-10',
    avatar: 'MD'
  }
];

export const INITIAL_BRAND_COLORS: BrandColorItem[] = [
  {
    id: 'color-primary',
    name: 'Đỏ BULBTEK',
    hex: '#AF2024',
    role: 'Primary Color',
    description: 'Nút bấm chính, viền glow, điểm nhấn thương hiệu nhận diện',
    isCustom: false
  },
  {
    id: 'color-dark',
    name: 'Đen Titan',
    hex: '#1A1A1A',
    role: 'Dark Cockpit',
    description: 'Nền buồng lái ô tô ban đêm, huyền bí, sang trọng',
    isCustom: false
  },
  {
    id: 'color-white',
    name: 'Trắng Tinh Khiết',
    hex: '#FFFFFF',
    role: 'White Contrast',
    description: 'Nền sáng văn phòng, luồng ánh sáng thuần khiết',
    isCustom: false
  }
];

export const INITIAL_SECONDARY_COLORS: BrandColorItem[] = [
  {
    id: 'sec-amber',
    name: 'Vàng Phá Sương 3000K',
    hex: '#F59E0B',
    role: 'Bi Gầm / Phá Sương',
    description: 'Quang phổ bước sóng dài xuyên mưa bão, sương mù đèo dốc. Tạo cảm giác ấm áp, an tâm khi cầm lái ban đêm.',
    opticalAnalysis: 'Bước sóng dài 580–590nm hạn chế hiện tượng tán xạ Rayleigh trong giọt nước mưa và hạt sương mù, giúp ánh sáng bám mặt đường gấp 3 lần so với ánh sáng trắng 6000K.',
    isCustom: false
  },
  {
    id: 'sec-cyan',
    name: 'Xanh Cyan BU Bot & Laser',
    hex: '#06B6D4',
    role: 'Mascot & High-Tech',
    description: 'Mắt LED thông thái Robot BU, tâm pha laser gom sáng và thấu kính phủ AR chống chói. Tương phản bổ túc rực rỡ với đỏ #AF2024.',
    opticalAnalysis: 'Tương phản bổ trợ tự nhiên với Đỏ BULBTEK (#AF2024). Đại diện cho chùm laser định hướng tâm xa 800m và lớp phủ Polarized AR tráng trên thấu kính giúp triệt tiêu quang sai.',
    isCustom: false
  },
  {
    id: 'sec-slate',
    name: 'Xám Titan Hợp Kim',
    hex: '#475569',
    role: 'Hardware Material',
    description: 'Vỏ nhôm hàng không nguyên khối tản nhiệt CNC, ống đồng kép. Màu đệm trung tính cho thẻ thông số kỹ thuật (Specs badge).',
    opticalAnalysis: 'Màu trung tính mô phỏng hợp kim nhôm ADC12 mạ Anode và lõi đồng nguyên chất dẫn nhiệt. Giữ vai trò cân bằng thị giác, giúp người dùng tập trung vào các thông số đo lường thực tế.',
    isCustom: false
  },
  {
    id: 'sec-emerald',
    name: 'Xanh Emerald Bảo Vệ',
    hex: '#10B981',
    role: 'Safe Driving / Warranty',
    description: 'Biểu tượng của giá trị cốt lõi BẢO VỆ, bảo hành chính hãng 1 đổi 1 từ 2-3 năm và thông điệp văn hóa giao thông an toàn.',
    opticalAnalysis: 'Dải màu sinh thái (520–550nm) mang lại tín hiệu an toàn và bình tâm tuyệt đối cho tài xế đường dài. Đại diện cho cam kết bảo vệ sinh mạng và bảo hành 3 năm 1 đổi 1.',
    isCustom: false
  }
];

export const INITIAL_PHILOSOPHY_POINTS: PhilosophyPoint[] = [
  {
    id: 'phil-1',
    title: 'Soi rọi hiểm nguy từ xa',
    desc: 'Luồng sáng gom xa hàng trăm mét giúp bác tài chủ động nhận diện vật cản, ổ gà, động vật băng đường trước nhiều giây phản xạ.'
  },
  {
    id: 'phil-2',
    title: 'Bám đường trong thời tiết khắc nghiệt',
    desc: 'Cung cấp dải nhiệt màu tối ưu (3000K – 4300K – 5500K) phá tan màn sương mù dày đặc và mưa xối xả đèo dốc Việt Nam.'
  },
  {
    id: 'phil-3',
    title: 'Tăng sáng văn minh',
    desc: 'Đường cắt Cos phẳng lì sắc nét, tuyệt đối không hắt chùm sáng vào mắt xe ngược chiều, giữ gìn văn hóa giao thông an toàn.'
  }
];

export const INITIAL_MISSION_POINTS: PhilosophyPoint[] = [
  {
    id: 'mis-1',
    title: 'Hệ sinh thái ~300 đại lý toàn quốc',
    desc: 'Mang dịch vụ lắp đặt chuẩn kỹ thuật, máy canh chỉnh laser chuyên nghiệp đến tận cửa ngõ 63 tỉnh thành.'
  },
  {
    id: 'mis-2',
    title: 'Bảo vệ trọn vẹn xe zin',
    desc: 'Cung cấp giải pháp pát chuyên dụng, giắc cắm Plug & Play 100% không cắt trích dây, tương thích hoàn hảo cả xe xăng lẫn xe điện VinFast (VF3, VF5, VF8...).'
  },
  {
    id: 'mis-3',
    title: 'Tôn chỉ 100% sự thật',
    desc: 'Tuyệt đối không bịa đặt thông số quang học ảo. Công suất, nhiệt màu, quang thông công bố trên hộp là số đo kiểm định thực tế.'
  }
];

export const INITIAL_THREE_NO_RULES: ThreeNoRule[] = [
  {
    id: 'no-1',
    number: 1,
    title: 'KHÔNG Chém Gió Ảo',
    desc: 'Không phóng đại thông số Lux/Lumen vô căn cứ. Chỉ dùng dữ liệu đã kiểm định tại Tab Sản Phẩm.'
  },
  {
    id: 'no-2',
    number: 2,
    title: 'KHÔNG Cắt Dây Điện',
    desc: 'Luôn tôn vinh giải pháp cắm jack zin, giữ gìn bảo hành điện và an toàn phòng chống cháy nổ ô tô.'
  },
  {
    id: 'no-3',
    number: 3,
    title: 'KHÔNG Gây Chói Lóa',
    desc: 'Truyền thông đường cắt ánh sáng văn minh, không cổ xúy việc độ đèn vô ý thức gây hại cộng đồng.'
  }
];

export const INITIAL_CORE_VALUES: CoreValueItem[] = [
  {
    id: 'val-ben-bi',
    title: 'BỀN BỈ',
    subtitle: 'Trụ Cột 1',
    icon: '⚡',
    desc: 'Đại diện cho chất lượng phần cứng vượt trội, khả năng chịu nhiệt và rung chấn phi thường trên đường sá Việt Nam.',
    bullets: [
      '50.000 giờ thử nghiệm thắp sáng liên tục.',
      'Tản nhiệt ống đồng kép + quạt thủy lực êm ái.',
      'Chống nước, chống bụi chuẩn quân đội IP68.'
    ]
  },
  {
    id: 'val-ben-vung',
    title: 'BỀN VỮNG',
    subtitle: 'Trụ Cột 2',
    icon: '🌱',
    desc: 'Hợp tác kinh doanh lâu dài cùng hơn 300 đại lý, gara ủy quyền và phát triển hệ sinh thái phụ tùng ô tô minh bạch.',
    bullets: [
      'Bảo hộ vùng kinh doanh cho đối tác gara.',
      'Bảo hành chính hãng 1 đổi 1 từ 2 – 3 năm.',
      'Đào tạo kỹ thuật canh chỉnh máy laser chuẩn mực.'
    ]
  },
  {
    id: 'val-bao-ve',
    title: 'BẢO VỆ',
    subtitle: 'Trụ Cột 3',
    icon: '🔒',
    desc: 'Tấm khiên an toàn bảo vệ sinh mạng tài xế, bảo vệ hệ thống điện xe zin và bảo vệ văn hóa giao thông đường bộ.',
    bullets: [
      'Xóa tan điểm mù, mở rộng góc nhìn 2 bên lề đường.',
      'Đường cắt Cos phẳng lì, chống lóa cho xe ngược chiều.',
      'Mạch Driver bảo vệ quá áp, giữ an toàn điện xe hơi.'
    ]
  }
];

export const INITIAL_TYPOGRAPHY: BrandTypography = {
  headlineFont: 'Montserrat',
  headlineWeights: ['700 Bold', '800 ExtraBold', '900 Black'],
  headlineUsage: 'Tiêu đề banner, Slogan "AN TOÀN HÀNH TRÌNH", tên dòng sản phẩm (Bi LED, Laser, Bi Gầm), poster ra mắt.',
  bodyFont: 'Be Vietnam Pro',
  bodyWeights: ['400 Regular', '500 Medium', '600 SemiBold'],
  bodyUsage: 'Văn bản nội dung Facebook, kịch bản video ngắn TikTok, bài viết kỹ thuật, lời khuyên Robot BU, caption social.',
  codeFont: 'JetBrains Mono',
  codeWeights: ['500 Medium', '700 Bold'],
  codeUsage: 'Thông số kỹ thuật quang học: Lux, Lumen, Kelvin 3000K/5500K, Cos 65W / Pha 75W, Mã SKU, mã bảo hành điện tử.',
  hierarchyNotes: 'H1 Display (36-48px Black 900) > H2 Section (22-28px Bold 800) > H3 Card (16-18px Bold 700) > Body (14-15px Regular 400) > Specs (11-12px Mono Bold)',
  fontHierarchy: [
    { level: 'H1 / Hero Title', size: '32px – 48px', weight: 'Black 900', fontFamily: 'Montserrat', example: 'AN TOÀN HÀNH TRÌNH' },
    { level: 'H2 / Section Title', size: '20px – 28px', weight: 'Bold 700', fontFamily: 'Montserrat', example: 'BI LED MONSTER & ULTRA LASER' },
    { level: 'H3 / Card Title', size: '16px – 18px', weight: 'SemiBold 600', fontFamily: 'Montserrat', example: 'Độ Bám Đường Vượt Trội 3000K' },
    { level: 'Body / Text Copy', size: '14px – 15px', weight: 'Regular 400', fontFamily: 'Be Vietnam Pro', example: 'Trợ thủ đắc lực cùng bác tài ôm vô lăng xuyên màn đêm mưa bão.' },
    { level: 'Specs / Data Badge', size: '11px – 13px', weight: 'Bold 700', fontFamily: 'JetBrains Mono', example: '65W • 12,000 LM • 5500K • IP68' }
  ],
  primaryFont: 'Montserrat, sans-serif',
  primaryUsage: 'Tiêu đề chính, Slogan "AN TOÀN HÀNH TRÌNH", Banner Poster, Tên sản phẩm, Chữ in hoa (Uppercase)',
  monoFont: 'JetBrains Mono, monospace',
  monoUsage: 'Thông số kỹ thuật quang học: Lux, Lumen, Kelvin 3000K/5500K, Cos 65W / Pha 75W, Mã SKU'
};

export const INITIAL_SETTINGS: SystemSettings = {
  activeModel: 'CLAUDE',
  models: [
    {
      id: 'CLAUDE',
      name: 'Claude 3.7 Sonnet',
      modelCode: 'claude-3-7-sonnet-20250219',
      endpoint: 'https://api.anthropic.com/v1/messages',
      description: 'Khuyến nghị hàng đầu: Model Hybrid Reasoning tiên tiến nhất, viết content tiếng Việt sâu sắc, tự nhiên, tuân thủ brand guideline tuyệt đối.',
      apiKey: 'sk-ant-api03-••••••••••••••••••••••••••••••••',
      isActive: true
    },
    {
      id: 'GEMINI',
      name: 'Gemini 2.5 Pro',
      modelCode: 'gemini-2.5-pro',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      description: 'Khuyến nghị: Thế hệ flagship mới nhất của Google DeepMind với khả năng tư duy đa phương thức (Multimodal), phân tích ảnh ô tô và tạo prompt Midjourney xuất sắc.',
      apiKey: 'AIzaSy•••••••••••••••••••••••••••••••',
      isActive: false
    },
    {
      id: 'GPT4',
      name: 'GPT-4.5 (Orion)',
      modelCode: 'gpt-4.5-preview',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      description: 'Khuyến nghị: Flagship thế hệ mới nhất của OpenAI với khả năng suy luận mở rộng, cấu trúc chiến lược marketing đa kênh và phân tích tâm lý khách hàng tối ưu.',
      apiKey: 'sk-proj-••••••••••••••••••••••••••••••••',
      isActive: false
    }
  ],
  tokenBudget: {
    facebookCaption: 500,
    tiktokCaption: 200,
    designBriefText: 800,
    imagePrompt: 400
  },
  smtp: {
    server: 'smtp.gmail.com',
    port: 587,
    senderEmail: 'marketing.notify@bulbtek.vn',
    appPassword: '••••••••••••••••',
    defaultApproverEmail: 'tuananh.lead@bulbtek.vn',
    monthlyReportEmail: 'philip.coo@bulbtek.vn'
  },
  repeatWarningThreshold: 3,
  historyRetentionMonths: 6,
  brandGuideline: {
    brandName: 'BULBTEK VIỆT NAM',
    slogan: 'An Toàn Hành Trình',
    message: 'Trợ Thủ Đắc Lực Cho Bác Tài Việt',
    coreValues: 'BỀN BỈ – BỀN VỮNG – BẢO VỆ',
    primaryColor: '#AF2024',
    darkColor: '#1A1A1A',
    whiteColor: '#FFFFFF',
    mascot: 'Robot BU',
    visualStyle: 'Dramatic automotive – ánh sáng nổi bật trên nền tối',
    visualRatio: 'Lý tính 70% / Cảm xúc 30%',
    fbHashtags: '#BulbtekVietNam #TăngSángÔTô #AnToanHanhTrinh',
    tiktokHashtags: '#bulbtek #đènôtô #tăngsáng #độxe',
    colorPalette: INITIAL_BRAND_COLORS,
    secondaryColors: INITIAL_SECONDARY_COLORS,
    philosophyTitle: 'An Toàn Hành Trình',
    philosophyDesc: 'Tại BULBTEK VIỆT NAM, chúng tôi tin rằng đèn ô tô không chỉ đơn thuần là phụ kiện trang trí làm đẹp xe, mà là hệ thống phòng vệ chủ động tối thượng bảo vệ tính mạng của người cầm lái và cả gia đình phía sau vô lăng.',
    philosophyPoints: INITIAL_PHILOSOPHY_POINTS,
    missionTitle: 'Trợ Thủ Đắc Lực Cho Bác Tài Việt',
    missionDesc: 'Bulbtek sinh ra để phụng sự cộng đồng bác tài Việt Nam — từ bác tài xe tải đường dài thức thâu đêm, anh em tài xế xe công nghệ mưu sinh mỗi ngày, đến các gia đình trên từng chuyến du lịch khám phá mọi miền Tổ quốc.',
    missionPoints: INITIAL_MISSION_POINTS,
    threeNoRules: INITIAL_THREE_NO_RULES,
    coreValuePillars: INITIAL_CORE_VALUES,
    typography: INITIAL_TYPOGRAPHY
  },
  complianceRules: DEFAULT_COMPLIANCE_RULES
};

export const INITIAL_EMAIL_LOGS: EmailLog[] = [
  {
    id: 'mail-1',
    timestamp: '2026-09-05 09:30:15',
    type: 'SUBMIT',
    recipient: 'tuananh.lead@bulbtek.vn',
    subject: '[BULBTEK Content] Cần duyệt: Bi Gầm RAY 2.0 Thách Thức Mưa Bão | Đăng 2026-09-08',
    body: 'Linh đã gửi duyệt bài content mới cho sản phẩm Bi Gầm RAY 2.0 (Kênh Facebook). Vui lòng kiểm tra và duyệt trên dashboard.',
    contentItemId: 'post-1',
    status: 'Thành công'
  },
  {
    id: 'mail-2',
    timestamp: '2026-09-05 14:12:00',
    type: 'APPROVE',
    recipient: 'linh.mkt@bulbtek.vn',
    subject: '[BULBTEK Content] ✅ Đã duyệt: Bi Gầm RAY 2.0 Thách Thức Mưa Bão | Đăng 2026-09-08',
    body: 'Bài viết đã được Tuấn Anh duyệt. Nhớ lên lịch đăng đúng khung giờ vàng 19:30 nhé!',
    contentItemId: 'post-1',
    status: 'Thành công'
  },
  {
    id: 'mail-3',
    timestamp: '2026-09-06 11:20:45',
    type: 'REJECT',
    recipient: 'linh.mkt@bulbtek.vn',
    subject: '[BULBTEK Content] Cần chỉnh sửa: Trợ sáng CYBER 2 BOLT - Phượt Đêm',
    body: 'Bài viết bị từ chối bởi Tuấn Anh. Lý do: Hashtag thiếu hoặc sai. Vui lòng thêm hashtag cố định TikTok #đènôtô và chỉnh lại CTA.',
    contentItemId: 'post-3',
    status: 'Thành công'
  }
];

export const INITIAL_CONTENTS: ContentItem[] = [
  {
    id: 'post-1',
    title: 'Bi Gầm RAY 2.0 - Phá Sương Xuyên Lũ',
    creativeHeadline: 'BI GẦM RAY 2.0 — Phá Sương Xuyên Lũ, Đổi 3 Màu Phá Tan Mưa Bão',
    date: '2026-09-08',
    channel: 'Facebook',
    productId: 'prod-ray2',
    productName: 'Bi Gầm RAY 2.0',
    productLine: 'Bi Gầm',
    categoryId: 'cat-product',
    assigneeId: 'user-linh',
    assigneeName: 'Linh',
    status: 'Approved',
    facebookCaption: `🌧️ MÙA MƯA BÃO ĐÃ ĐẾN — BÁC TÀI ĐÃ CÓ VŨ KHÍ PHÁ SƯƠNG ĐÚNG CHUẨN CHƯA?\n\nĐi đêm đèo sương, đường ngập nước mà đèn zin chóa vàng mờ căm thì nguy hiểm luôn rình rập sau từng khúc cua. BULBTEK mang đến câu trả lời dứt khoát: BI GẦM RAY 2.0 — Trợ thủ đắc lực bảo vệ mọi chặng hành trình!\n\n⚡ VÌ SAO RAY 2.0 LÀ ÔNG VUA PHÁ SƯƠNG BÁN CHẠY NHẤT?\n• 3 chế độ nhiệt màu đổi linh hoạt (3000K vàng đậm phá sương - 4300K vàng chanh đi mưa - 5500K trắng thời trang) chỉ bằng 1 thao tác bật tắt công tắc zin.\n• Công suất bứt phá Cos 45W - Pha 55W kết hợp chip LED CSP cao cấp cho luồng sáng gom mịn sát mặt đường.\n• Chuẩn chống nước IP68 tuyệt đối: Vô tư lội nước ngập, chịu bùn đất không lo hấp hơi nước.\n\n🛡️ An tâm với chính sách bảo hành 2 năm chính hãng 1 đổi 1 trên 300+ đại lý Bulbtek toàn quốc.\n\n👉 Trải nghiệm ánh sáng bám đường chuẩn mực ngay tại đại lý Bulbtek gần nhất!\n\n#BulbtekVietNam #TăngSángÔTô #AnToanHanhTrinh #BiGầmRAY20 #ĐộĐènÔTô`,
    tiktokCaption: `Mưa xối xả mù sương thế này mà bật Bi Gầm RAY 2.0 thì nét căng từng mét đường! Đổi ngay 3 màu chỉ 1 nốt nhạc. Bác nào chưa nâng cấp ghé ngay gara đại lý Bulbtek nhé! #bulbtek #đènôtô #tăngsáng #độxe #bi_gầm`,
    highlightSpecs: [
      '3 chế độ: 3000K (Vàng đậm) - 4300K (Vàng chanh) - 5500K (Trắng)',
      'Cos 45W - Pha 55W',
      'Chống nước ngâm chuẩn IP68 tuyệt đối',
      'Bảo hành 2 năm'
    ],
    angleUsed: 'Giải pháp mùa mưa bão, tính năng đổi 3 màu phá sương',
    aiModelUsed: 'Claude 3.7 Sonnet',
    createdAt: '2026-09-04T10:00:00Z',
    createdBy: 'Linh',
    approvedAt: '2026-09-05T14:12:00Z',
    approvedBy: 'Tuấn Anh'
  },
  {
    id: 'post-2',
    title: 'Câu Chuyện 300 Đại Lý & Tinh Thần Bền Bỉ',
    creativeHeadline: 'BULBTEK VIỆT NAM — Triết Lý Bền Bỉ, Bền Vững & Bảo Vệ',
    date: '2026-09-10',
    channel: 'Facebook',
    productId: 'prod-sunset',
    productName: 'Bi LED Sunset',
    productLine: 'Bi LED',
    categoryId: 'cat-branding',
    assigneeId: 'user-linh',
    assigneeName: 'Linh',
    status: 'Pending',
    facebookCaption: `TRÊN NHỮNG CUNG ĐƯỜNG ĐÊM THẲM — AI ĐANG THẮP SÁNG NIỀM TIN CÙNG BÁC TÀI?\n\nNgười tài xế Việt dành nửa cuộc đời nhìn qua kính chắn gió. Màn đêm bao la, sương mù giăng kín đèo dốc hiểm trở... Điều duy nhất mang lại cảm giác an tâm tuyệt đối chính là một luồng sáng đủ rộng, đủ xa và đủ ấm áp.\n\nTại BULBTEK VIỆT NAM, chúng tôi không đơn thuần sản xuất những bộ đèn ô tô. Chúng tôi cùng hơn 300 đại lý đối tác kiến tạo nên lời cam kết: BỀN BỈ – BỀN VỮNG – BẢO VỆ.\n\nMỗi bộ Bi LED Sunset xuất xưởng là thành quả của hàng ngàn giờ thử nghiệm nhiệt độ khắc nghiệt, thấu kính 5500K mô phỏng dải ánh sáng hoàng hôn êm dịu, bảo vệ đôi mắt người cầm lái sau 8 tiếng ôm vô lăng.\n\nCảm ơn hàng chục ngàn bác tài đã trao trọn niềm tin cho Bulbtek trên mọi chặng hành trình dài!\n\n#BulbtekVietNam #TăngSángÔTô #AnToanHanhTrinh #AnToanChoBan #TrợThủĐắcLực`,
    tiktokCaption: `Ánh sáng hoàng hôn trên chiếc xe của bạn. Bi LED Sunset - Bền bỉ thắp sáng từng hành trình đêm của bác tài Việt! #bulbtek #đènôtô #tăngsáng #độxe #biled`,
    highlightSpecs: [
      '5500K (Trắng ấm tự nhiên)',
      '12.000 Lux (Tâm pha cực gom)',
      'Bảo hành 3 năm (1 đổi 1 chính hãng)'
    ],
    angleUsed: 'Câu chuyện thương hiệu, sự thấu hiểu sự mệt mỏi của tài xế chạy đêm',
    aiModelUsed: 'Claude 3.7 Sonnet',
    createdAt: '2026-09-05T16:00:00Z',
    createdBy: 'Linh'
  },
  {
    id: 'post-3',
    title: 'CYBER 2 BOLT - Đèn Trợ Sáng Cho Anh Em Phượt',
    creativeHeadline: 'CYBER 2 BOLT — Nhỏ Gọn Uy Lực, Đèn Trợ Sáng Tour Đêm Bám Đường',
    date: '2026-09-12',
    channel: 'TikTok',
    productId: 'prod-cyber2bolt',
    productName: 'Trợ Sáng CYBER 2 BOLT',
    productLine: 'Trợ Sáng',
    categoryId: 'cat-product',
    assigneeId: 'user-linh',
    assigneeName: 'Linh',
    status: 'Rejected',
    facebookCaption: `Nhỏ bằng nắm tay nhưng sáng rực góc trời! Trợ sáng CYBER 2 BOLT trang bị chip Cree siêu mạnh, đường cắt cos sắc bén chống chói xe đối diện tuyệt đối. Trợ thủ đắc lực không thể thiếu cho anh em đi tour đêm!\n\n#BulbtekVietNam #TăngSángÔTô #AnToanHanhTrinh #Cyber2Bolt`,
    tiktokCaption: `Đèn trợ sáng nhỏ bằng nắm tay mà sáng quét sạch màn đêm? Xem ngay CYBER 2 BOLT test thực tế trên đèo! Cos vàng bám đường, Pha trắng chiếu cực xa không chói mắt ai. Anh em cắm xe máy hay ô tô đều chuẩn chỉ! #bulbtek #đènôtô #tăngsáng #độxe #cyber2bolt #phượt`,
    highlightSpecs: [
      'Cos Vàng 3500K - Pha Trắng 6000K',
      'Kích thước siêu mini chỉ bằng quả bóng golf'
    ],
    angleUsed: 'Đánh giá thực tế độ sáng nhỏ gọn của trợ sáng tour đêm',
    aiModelUsed: 'Claude 3.7 Sonnet',
    createdAt: '2026-09-06T08:30:00Z',
    createdBy: 'Linh',
    rejectedAt: '2026-09-06T11:20:45Z',
    rejectedBy: 'Tuấn Anh',
    rejectionReasons: ['Hashtag thiếu hoặc sai', 'CTA không rõ ràng'],
    rejectionComment: 'Cần bổ sung đúng hashtag cố định TikTok và thêm CTA kêu gọi anh em ghé đại lý Bulbtek thử ánh sáng trước khi mua.'
  },
  {
    id: 'post-4',
    title: 'Giải Pháp Cắm Zin Cho VinFast VF3',
    creativeHeadline: 'BI SQUARE 3.0 — Khắc Phục Hoàn Toàn Điểm Yếu VF3, Cắm Giắc Zin 100%',
    date: '2026-09-15',
    channel: 'Cross-post',
    productId: 'prod-bisquare-vf3',
    productName: 'Bi Square 3.0 (VinFast VF3)',
    productLine: 'Bi LED',
    categoryId: 'cat-product',
    assigneeId: 'user-duc',
    assigneeName: 'Đức',
    status: 'Draft',
    facebookCaption: `CHỦ XE VINFAST VF3 ĐÃ SẴN SÀNG LỘT XÁC ÁNH SÁNG MÀ VẪN GIỮ NGUYÊN BẢO HÀNH XE CHƯA?\n\nVF3 đang làm mưa làm gió thị trường xe điện, nhưng đèn halogen nguyên bản thường chưa đáp ứng đủ nhu cầu đi tối. BULBTEK chính thức ra mắt BI SQUARE 3.0:\n• Thiết kế chóa vuông độc quyền khớp từng milimet hốc đèn zin VF3.\n• Giắc cắm Plug & Play 100%, không cắt trích 1 sợi dây điện, giữ trọn bảo hành hãng.\n• Tăng sáng gấp 5 lần, ánh sáng 5500K gom mịn chống chói văn minh.\n\nTrải nghiệm ngay tại hệ thống đại lý Bulbtek ủy quyền trên toàn quốc!\n\n#BulbtekVietNam #TăngSángÔTô #AnToanHanhTrinh #VinFastVF3 #BiSquare30`,
    tiktokCaption: `Xe điện quốc dân VinFast VF3 độ đèn có mất bảo hành không? Giải pháp Bi Square 3.0 cắm giắc zin 100% từ Bulbtek, sáng gấp 5 lần! #bulbtek #đènôtô #tăngsáng #độxe #vinfastvf3`,
    highlightSpecs: [
      'Thiết kế chóa vuông nguyên bản khớp 100% mặt ca-lăng VF3',
      'Cắm giắc zin 100% không cắt trích dây giữ trọn bảo hành xe',
      'Cos 50W - Pha 60W (Tối ưu điện bình xe điện)'
    ],
    angleUsed: 'Bảo toàn bảo hành xe điện, khớp 100% form chóa vuông',
    aiModelUsed: 'Claude 3.5 Sonnet',
    createdAt: '2026-09-06T15:00:00Z',
    createdBy: 'Đức'
  },
  {
    id: 'post-5',
    title: 'Hỏi Bác Tài: Đi Đêm Sợ Nhất Điều Gì?',
    creativeHeadline: 'GÓC TÂM SỰ BÁC TÀI — Đi Đêm Đèo Núi Sợ Nhất Điều Gì?',
    date: '2026-09-18',
    channel: 'Facebook',
    productId: 'prod-vista',
    productName: 'Bi LED Vista',
    productLine: 'Bi LED',
    categoryId: 'cat-interaction',
    assigneeId: 'user-linh',
    assigneeName: 'Linh',
    status: 'Draft',
    facebookCaption: `GÓC TÂM SỰ BÁC TÀI: ĐI ĐÊM ĐÈO NÚI, CÁC BÁC SỢ NHẤT PHA NÀO?\n\n1. Xe ngược chiều độ đèn chóa lóa giương pha không hạ?\n2. Mưa như trút nước gặp sương mù, gạt mưa hết cỡ vẫn không thấy tim đường?\n3. Ổ gà, ổ voi xuất hiện bất thình lình ở khúc cua khuất sáng?\n\nComment ngay phương án của các bác kèm kinh nghiệm xử lý bên dưới, Robot BU của Bulbtek sẽ chọn ra 3 bác có câu trả lời tâm đắc nhất tặng voucher bảo dưỡng xe nhé!\n\n#BulbtekVietNam #TăngSángÔTô #AnToanHanhTrinh #GocBacTai #LáiXeAnToàn`,
    tiktokCaption: `Bác tài lái xe đêm sợ nhất điều gì? Đèn pha xe ngược chiều hay sương mù mưa bão? Chia sẻ ngay kinh nghiệm nhé các bác ơi! #bulbtek #đènôtô #tăngsáng #độxe`,
    highlightSpecs: ['Đường cắt cos phẳng mịn nét như kẻ chỉ'],
    angleUsed: 'Thăm dò ý kiến tương tác, giải tỏa tâm lý người lái xe ban đêm',
    aiModelUsed: 'Claude 3.5 Sonnet',
    createdAt: '2026-09-07T09:00:00Z',
    createdBy: 'Linh'
  },
  {
    id: 'post-6',
    title: 'Minigame: Chọn Đúng Nhiệt Màu Đi Mưa',
    creativeHeadline: 'QUIZ ĐỐ VUI — Chọn Đúng Nhiệt Màu Bám Đường Khi Mưa Bão',
    date: '2026-09-22',
    channel: 'Facebook',
    productId: 'prod-ray2',
    productName: 'Bi Gầm RAY 2.0',
    productLine: 'Bi Gầm',
    categoryId: 'cat-quiz',
    assigneeId: 'user-linh',
    assigneeName: 'Linh',
    status: 'Published',
    facebookCaption: `🎮 QUIZ KIẾN THỨC XE: NHIỆT MÀU NÀO BÁM ĐƯỜNG TỐT NHẤT TRONG MƯA BÃO?\n\nA. 3000K (Vàng đậm ấm áp)\nB. 5500K (Trắng tự nhiên)\nC. 6500K (Trắng xanh thời trang)\n\n👉 Comment đáp án đúng [A/B/C] + Tag 2 người bạn cùng chung đam mê xế cưng để nhận quà mini từ Bulbtek!\n\nBật mí: Bi Gầm RAY 2.0 sở hữu công nghệ đổi màu cả 3 dải sáng trên, giúp bác tài linh hoạt đối phó mọi dạng thời tiết.\n\n#BulbtekVietNam #TăngSángÔTô #AnToanHanhTrinh #MinigameXe #QuizBulbtek`,
    tiktokCaption: `Đố các bác biết đi mưa bão nên dùng đèn nhiệt màu nào bám đường tốt nhất? Comment xem ai là chuyên gia xe nhé! #bulbtek #đènôtô #tăngsáng #độxe #minigame`,
    highlightSpecs: [
      '3 chế độ: 3000K (Vàng đậm) - 4300K (Vàng chanh) - 5500K (Trắng)'
    ],
    angleUsed: 'Đố vui tương tác, giáo dục kiến thức nhiệt độ màu bám đường',
    aiModelUsed: 'Claude 3.5 Sonnet',
    createdAt: '2026-09-01T08:00:00Z',
    createdBy: 'Linh',
    approvedAt: '2026-09-01T14:00:00Z',
    approvedBy: 'Tuấn Anh',
    publishedAt: '2026-09-02T19:30:00Z'
  },
  {
    id: 'post-7',
    title: 'Gia Nhập Hệ Thống 300+ Đại Lý Bulbtek Toàn Quốc',
    creativeHeadline: 'HỢP TÁC B2B — Bứt Phá Doanh Số Cùng Hệ Thống 300+ Gara Bulbtek',
    date: '2026-09-25',
    channel: 'Facebook',
    productId: 'prod-sunset',
    productName: 'Bi LED Sunset',
    productLine: 'Bi LED',
    categoryId: 'cat-dealer',
    assigneeId: 'user-duc',
    assigneeName: 'Đức',
    status: 'Approved',
    facebookCaption: `BẮT TAY CÙNG BULBTEK — BỨT PHÁ DOANH SỐ ĐỘ ĐÈN MÙA CUỐI NĂM CHO GARA CỦA BẠN!\n\nThị trường tăng sáng ô tô đang bước vào giai đoạn bùng nổ nhu cầu. Các chủ gara đang tìm kiếm một thương hiệu đèn chất lượng ổn định, bảo hành chuẩn mực và chính sách bảo hộ khu vực an toàn?\n\nBULBTEK VIỆT NAM — Thương hiệu phân phối đèn tăng sáng ô tô uy tín với hơn 300 đối tác trên khắp 63 tỉnh thành:\n✓ Chiết khấu trực tiếp cạnh tranh, biên độ lợi nhuận bền vững.\n✓ Bảo hộ vùng kinh doanh rõ ràng, chống phá giá triệt để.\n✓ Bảo hành điện tử 1 đổi 1 nhanh chóng, hạn chế tối đa chi phí lưu kho gara.\n✓ Hỗ trợ trọn gói bộ nhận diện: Biển bảng LED, tủ trưng bày showroom cao cấp, đồng phục kỹ thuật viên.\n✓ Đào tạo kỹ thuật canh chỉnh đèn bằng máy đo chuyên dụng từ chuyên gia Bulbtek.\n\nLiên hệ ngay để trở thành đại lý Bulbtek khu vực của bạn hôm nay!\nHotline B2B: 0988.xxx.xxx\n\n#BulbtekVietNam #TăngSángÔTô #AnToanHanhTrinh #ĐạiLýBulbtek #HợpTácKinhDoanh #GaraAuto`,
    tiktokCaption: `Cơ hội hợp tác kinh doanh đèn tăng sáng Bulbtek cùng 300+ gara trên toàn quốc! Chính sách bảo hộ khu vực cực tốt, chiết khấu hấp dẫn. Liên hệ ngay! #bulbtek #đènôtô #tăngsáng #độxe #garaoto #daily`,
    highlightSpecs: ['Bảo hành 3 năm (1 đổi 1 chính hãng)'],
    angleUsed: 'Kêu gọi hợp tác B2B, chính sách bảo hộ vùng và hỗ trợ gara',
    aiModelUsed: 'Claude 3.5 Sonnet',
    createdAt: '2026-09-03T11:00:00Z',
    createdBy: 'Đức',
    approvedAt: '2026-09-04T10:00:00Z',
    approvedBy: 'Tuấn Anh'
  }
];
