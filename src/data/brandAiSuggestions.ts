import { getHolidaysForMonth, VietnameseHoliday } from './vietnamHolidays';

export interface BrandIdeaSuggestion {
  id: string;
  tag: string;
  title: string;
  content: string;
  angleHint: string;
}

// Ngân hàng ý tưởng chất lượng cao cho Tuyến 1: Branding Sản Phẩm & Triết Lý Thương Hiệu
export const BRANDING_AI_KNOWLEDGE_POOL: BrandIdeaSuggestion[] = [
  {
    id: 'br-1',
    tag: '#GiáTrịCốtLõi',
    title: '3 Giá trị cốt lõi: Bền Bỉ – Bền Vững – Bảo Vệ',
    content: '3 Giá trị cốt lõi BỀN BỈ – BỀN VỮNG – BẢO VỆ: Tuyên ngôn chất lượng từ nhà máy sản xuất đạt tiêu chuẩn quốc tế, kiểm soát từng milimet quang học.',
    angleHint: 'Khẳng định uy tín nhà máy & triết lý đồng hành lâu dài cùng tài xế Việt.'
  },
  {
    id: 'br-2',
    tag: '#ChínhSáchBảoHành',
    title: 'Bảo hành 1 đổi 1 trong 3 năm toàn quốc',
    content: 'Chính sách bảo hành 1 đổi 1 trong 2-3 năm tại 300+ đại lý ủy quyền toàn quốc — Cam kết đổi mới không sửa chữa, bảo vệ tối đa quyền lợi khách hàng.',
    angleHint: 'Tạo dựng lòng tin tuyệt đối về dịch vụ hậu mãi vượt trội.'
  },
  {
    id: 'br-3',
    tag: '#QuyChuẩnKỹThuật',
    title: 'Quy chuẩn cắm giắc zin 100% an toàn điện xe',
    content: 'Quy chuẩn cắm giắc zin 100%: Tuyệt đối không cắt trích dây điện, giữ trọn bảo hành hãng của xe hơi và đảm bảo an toàn phòng chống cháy nổ.',
    angleHint: 'Đánh trúng nỗi sợ cắt dây điện gây chập cháy của chủ xe đời mới.'
  },
  {
    id: 'br-4',
    tag: '#VănHóaTăngSáng',
    title: 'Văn hóa tăng sáng văn minh — Đường cắt cos phẳng mịn',
    content: 'Văn hóa tăng sáng văn minh: Đường cắt cos phẳng mịn nét như dao cạo, tập trung gom sáng xuống mặt đường, tuyệt đối không gây chói mắt xe ngược chiều.',
    angleHint: 'Định vị Bulbtek là thương hiệu tăng sáng có trách nhiệm với cộng đồng.'
  },
  {
    id: 'br-5',
    tag: '#AnToànThờiTiết',
    title: 'Thấu kính chống bám sương & mưa lũ nhiệt đới',
    content: 'Công nghệ thấu kính quang học chịu nhiệt và chống bám sương mù, nhiệt màu 3000K-4300K bám chặt mặt đường ướt trong giông bão nhiệt đới.',
    angleHint: 'Nhấn mạnh sự thấu hiểu sâu sắc điều kiện thời tiết khắc nghiệt tại Việt Nam.'
  },
  {
    id: 'br-6',
    tag: '#KiểmĐịnhThựcTế',
    title: 'Cam kết 100% số liệu đo quang học thực tế',
    content: 'Cam kết 100% số liệu kiểm định thực tế: Nói KHÔNG với công suất ảo, đo test minh bạch bằng máy đo quang thông chuyên dụng trước sự chứng kiến của khách hàng.',
    angleHint: 'Tạo sự khác biệt so với các dòng đèn trôi nổi chém gió công suất trên thị trường.'
  },
  {
    id: 'br-7',
    tag: '#TriếtLýGiaĐình',
    title: 'Phía sau tay lái là gia đình & lời cam kết Bulbtek',
    content: 'Triết lý "Phía sau tay lái là gia đình": Từng luồng sáng Bulbtek không chỉ chiếu rọi mặt đường mà còn bảo vệ an toàn trọn vẹn cho những người thân yêu.',
    angleHint: 'Chạm đến cảm xúc người lái xe gia đình, định vị giá trị nhân văn.'
  },
  {
    id: 'br-8',
    tag: '#CôngNghệTảnNhiệt',
    title: 'Hợp kim nhôm hàng không & Quạt turbo 10.000 RPM',
    content: 'Hệ thống tản nhiệt kép từ hợp kim nhôm hàng không và quạt gió tốc độ cao 10.000 vòng/phút, đảm bảo chip LED sáng liên tục 50.000 giờ không suy hao quang thông.',
    angleHint: 'Chứng minh độ bền bỉ vượt thời gian dưới góc nhìn kỹ thuật cao cấp.'
  },
  {
    id: 'br-9',
    tag: '#ĐộiNgũKỹThuật',
    title: '100% Kỹ thuật viên đạt chứng chỉ lắp đặt Bulbtek',
    content: 'Đội ngũ kỹ thuật viên được đào tạo bài bản và cấp chứng chỉ chuẩn hóa: Lắp đặt tỉ mỉ, căn chỉnh tâm sáng bằng máy laser, phục vụ tận tâm tại 63 tỉnh thành.',
    angleHint: 'Tôn vinh tay nghề người thợ và sự chuyên nghiệp của hệ sinh thái gara.'
  },
  {
    id: 'br-10',
    tag: '#TrángPhủAR',
    title: 'Thấu kính xanh AR Crystal chống phản xạ ngược',
    content: 'Lớp tráng phủ AR Crystal cao cấp giúp độ truyền sáng đạt 98%, triệt tiêu quang sai và ngăn phản xạ ngược, mang lại luồng sáng trong vắt không mỏi mắt.',
    angleHint: 'Nhấn mạnh trải nghiệm lái xe êm dịu, không gây lóa mắt và mỏi mắt khi chạy đêm.'
  },
  {
    id: 'br-11',
    tag: '#MạngLướiĐạiLý',
    title: 'Mạng lưới 300+ đại lý & Trạm bảo hành toàn quốc',
    content: 'Hệ sinh thái 300+ đại lý và trạm dịch vụ Bulbtek ủy quyền phủ sóng từ Bắc chí Nam — Dù ở bất kỳ cung đường nào, bạn luôn có Bulbtek đồng hành hỗ trợ.',
    angleHint: 'Đem lại sự an tâm tuyệt đối khi khách hàng đi phượt hoặc công tác xa.'
  },
  {
    id: 'br-12',
    tag: '#ChuẩnĐăngKiểm',
    title: 'Đạt chuẩn kiểm định đăng kiểm xe cơ giới Việt Nam',
    content: 'Hỗ trợ kiểm tra và cân chỉnh luồng sáng chuẩn theo quy chuẩn đăng kiểm hiện hành: Gom sáng đúng vạch cắt, không thay đổi kết cấu điện, pass đăng kiểm 100%.',
    angleHint: 'Giải tỏa triệt để băn khoăn về vấn đề đăng kiểm xe cơ giới.'
  },
  {
    id: 'br-13',
    tag: '#ĐộtPháHiệuSuất',
    title: 'Tối ưu điện năng xe — Sáng hơn 300% nhưng êm ái ắc quy',
    content: 'Công nghệ điều khiển dòng thông minh Driver IC: Tăng độ sáng lên 300-400% so với đèn halogen nguyên bản mà công suất tiêu thụ tối ưu, không nóng chóa.',
    angleHint: 'Lợi ích lý tính rõ ràng: Sáng vượt bậc nhưng bảo vệ ắc quy và hệ thống điện.'
  },
  {
    id: 'br-14',
    tag: '#ChốngHàngGiả',
    title: 'Tem bảo hành điện tử QR Code chống hàng trôi nổi',
    content: 'Mỗi sản phẩm Bulbtek đều có mã QR Code kích hoạt bảo hành điện tử chính hãng — Tra cứu nguồn gốc xuất xứ minh bạch, loại bỏ nguy cơ hàng giả kém chất lượng.',
    angleHint: 'Khẳng định đẳng cấp hàng chính hãng, minh bạch xuất xứ.'
  },
  {
    id: 'br-15',
    tag: '#ĐồngHànhXuyênViệt',
    title: 'Đồng hành cùng các đoàn Caravan xuyên Việt',
    content: 'Bulbtek tự hào là đối tác chiếu sáng tin cậy của hàng trăm đoàn Caravan xuyên Việt, thử thách qua những cung đường sương mù Tây Bắc và đèo dốc hiểm trở.',
    angleHint: 'Hình ảnh thực chiến oai phong cùng các cộng đồng đam mê xê dịch.'
  }
];

// Ngân hàng ý tưởng chất lượng cao cho Tuyến 2: Storytelling Linh Vật Robot BU
export const MASCOT_AI_KNOWLEDGE_POOL: BrandIdeaSuggestion[] = [
  {
    id: 'mc-1',
    tag: '#NhậtKýCabin',
    title: 'Nhật ký cabin BU: Vượt đèo đêm mưa lũ Tây Bắc',
    content: 'Nhật ký cabin cùng Robot BU: Bác tài ơi, mưa rừng mịt mù thì hạ ngay tầng cos bi gầm 3000K nhé! Luồng sáng bám chặt mặt đường, BU canh chừng từng góc cua khuất!',
    angleHint: 'Giọng điệu ấm áp, dí dỏm, biến Robot BU thành người bạn phụ lái tin cậy.'
  },
  {
    id: 'mc-2',
    tag: '#GócBácTàiHỏi',
    title: 'Bác Tài hỏi - Robot BU đáp: Đèn xe bị hấp hơi nước?',
    content: 'Góc Bác Tài hỏi - Robot BU đáp: "Xe em rửa xong bị mờ sương trong chóa có sao không BU?" — BU bật mí 3 nguyên nhân và cách xử lý thông hơi chuẩn không cần tháo đèn!',
    angleHint: 'Hỏi đáp tương tác cao, giải quyết thắc mắc đời thường của chủ xe.'
  },
  {
    id: 'mc-3',
    tag: '#PhòngLabQuangHọc',
    title: 'Đột nhập phòng lab cùng BU: Thử thách sốc nhiệt 105°C',
    content: 'Đột nhập phòng lab kiểm định cùng Robot BU: Hôm nay BU đưa các bác vào xem bài test tra tấn đèn Bulbtek — Rung lắc 1000 vòng/phút và nung nóng 105°C suốt 48 giờ liên tục!',
    angleHint: 'Khám phá hậu trường R&D sống động, tạo niềm tin về độ bền nồi đồng cối đá.'
  },
  {
    id: 'mc-4',
    tag: '#MẹoĐườngĐêm',
    title: 'Cẩm nang phượt đêm của BU: Quy tắc 150m nhận diện',
    content: 'Cẩm nang phượt đêm an toàn từ Robot BU: 3 quy tắc vàng giúp bác tài nhận diện biển báo và người đi bộ từ khoảng cách 150m trước khi quá muộn!',
    angleHint: 'Chia sẻ kiến thức bổ ích kết hợp vai trò của luồng sáng xa và rộng.'
  },
  {
    id: 'mc-5',
    tag: '#CảnhBáoNguyHiểm',
    title: 'BU cảnh báo: Sai lầm chết người khi câu dây rợ',
    content: 'BU giật mình cảnh báo: Thấy bác tài nào câu dây điện trần quấn băng dính đen là BU toát mồ hôi hột! Hãy dùng giắc cắm zin chuẩn để cabin luôn an toàn tuyệt đối!',
    angleHint: 'Cảnh báo chân thành, hài hước nhưng sâu sắc về văn hóa kỹ thuật an toàn.'
  },
  {
    id: 'mc-6',
    tag: '#VănHóaGiaoThông',
    title: 'BU nhắc nhở: Hạ pha khi gặp xe ngược chiều',
    content: 'Robot BU thì thầm bên tai: "Đèn mình sáng thật nhưng gặp bạn đường đi ngược chiều nhớ hạ cos ngay nha bác tài!" — Văn minh trên từng mét đường là phong cách Bulbtek!',
    angleHint: 'Lan tỏa văn hóa lái xe nhân văn, tôn trọng bạn đường.'
  },
  {
    id: 'mc-7',
    tag: '#ThửTháchDìmNước',
    title: 'Thử thách dìm nước chuẩn IP68 cùng BU',
    content: 'BU lặn xuống đáy bể cá cùng quả Bi Gầm Bulbtek: Sáng rực rỡ dưới nước suốt 72 giờ mà không một giọt nước lọt vào! Chuẩn kháng nước IP68 đỉnh chóp!',
    angleHint: 'Visual ấn tượng, chứng minh khả năng lội nước mùa mưa ngập đô thị.'
  },
  {
    id: 'mc-8',
    tag: '#ChọnNhiệtMàu',
    title: 'BU mách nước: Chọn nhiệt màu 3000K, 4300K hay 5500K?',
    content: 'Bác tài lăn tăn chọn màu đèn? Robot BU gợi ý ngay: Đi phố chọn 5500K trắng sang trọng; hay đi sương đèo chọn 3000K vàng chanh; đa dụng thì quất 4300K bám đường!',
    angleHint: 'Tư vấn thực dụng, giải quyết nhu cầu lựa chọn sản phẩm phù hợp.'
  },
  {
    id: 'mc-9',
    tag: '#ChuyệnTìnhCabin',
    title: 'Chuyến xe đêm muộn & ánh sáng đưa người thương về nhà',
    content: 'Tâm sự đêm muộn cùng BU: 2 giờ sáng qua cung đường vắng, ánh đèn gom sáng rõ từng ổ gà giúp bác tài về nhà sum vầy cùng vợ con bình an. Có BU, đường xa hóa gần!',
    angleHint: 'Chạm sâu cảm xúc đồng cảm của người đàn ông trụ cột gia đình.'
  },
  {
    id: 'mc-10',
    tag: '#BíKípĐăngKiểm',
    title: 'Robot BU hướng dẫn: Lắp đèn đi đăng kiểm thế nào?',
    content: 'Robot BU gỡ rối kiểm định: "Lắp bi thế nào để đăng kiểm không bị đuổi về?" — BU chỉ cần 2 tiêu chí: Đường cắt cos không lóa máy đo và giữ nguyên giắc zin!',
    angleHint: 'Đánh trúng chủ đề nóng mà mọi tài xế đều quan tâm.'
  },
  {
    id: 'mc-11',
    tag: '#GaraKýSự',
    title: 'BU vi hành thị sát gara: Soi từng mối hàn và giắc cắm',
    content: 'Hôm nay Robot BU đi vi hành trạm lắp đặt: Soi kính lúp xem anh em kỹ thuật viên bấm cos, bọc gen nhiệt chống cháy. Điểm 10 cho sự chuẩn chỉ của Gara Bulbtek!',
    angleHint: 'Quảng bá chất lượng dịch vụ của hệ thống đại lý ủy quyền.'
  },
  {
    id: 'mc-12',
    tag: '#BócPhốtCôngSuất',
    title: 'BU giải mã: Đèn ghi 120W trên mạng có thật không?',
    content: 'BU giải ngố cho các bác: Trên mạng rao bán đèn 120W-150W giá vài trăm nghìn? BU đo thực tế bằng máy chỉ được 35W lại còn nóng rực chóa! Đừng để bị lừa nhé các bác!',
    angleHint: 'Giọng điệu bóc trần sự thật, giúp khách hàng trở thành người tiêu dùng thông thái.'
  },
  {
    id: 'mc-13',
    tag: '#ChuyếnĐiMùaXuân',
    title: 'BU cùng gia đình về quê đón Tết an lành',
    content: 'Hành trình nghìn cây số về quê đón Tết: Xe chở đầy đào mai quà bánh, Robot BU ngồi góc táp-lô dẫn đường thắp sáng từng chặng cao tốc đêm, mang mùa xuân về trọn vẹn.',
    angleHint: 'Phù hợp các dịp lễ tết, kết nối tình cảm gia đình ấm cúng.'
  },
  {
    id: 'mc-14',
    tag: '#HỏiĐápÁpSuất',
    title: 'BU mách mẹo: Chăm sóc mặt đèn xe không bị ố vàng',
    content: 'Mặt mica đèn xe của bác bị mờ đục ố vàng do nắng mưa? BU hướng dẫn 2 bước bảo dưỡng bề mặt và cách phủ bóng chống tia UV cực đơn giản tại nhà!',
    angleHint: 'Nội dung chia sẻ giá trị hữu ích, tăng tương tác và chia sẻ từ cộng đồng.'
  },
  {
    id: 'mc-15',
    tag: '#TuyênNgônRobotBU',
    title: 'Tuyên ngôn Robot BU: Không chỉ là đèn, mà là người bạn',
    content: 'Robot BU không chỉ là một biểu tượng linh vật, BU là người bạn tri kỷ trong cabin, lắng nghe tiếng máy xe, nhắc bác tài nghỉ ngơi và soi đường bình an mọi dặm bay!',
    angleHint: 'Khắc sâu hình ảnh định vị linh vật BU vào tâm trí khách hàng.'
  }
];

// Helper chuẩn hóa text để so sánh chống trùng lặp chính xác
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Kiểm tra xem một ý tưởng có bị trùng lặp với danh sách đang có hoặc lịch sử đã chọn không
export function isIdeaDuplicate(
  candidateText: string,
  existingIdeas: string[],
  usedHistory: string[]
): boolean {
  const normCandidate = normalizeText(candidateText);
  if (!normCandidate) return false;

  const allChecks = [...existingIdeas, ...usedHistory];
  for (const existing of allChecks) {
    const normExisting = normalizeText(existing);
    if (!normExisting) continue;

    // Trùng khớp hoàn toàn hoặc trùng > 60% ký tự cốt lõi
    if (normCandidate === normExisting) return true;
    if (normCandidate.includes(normExisting) || normExisting.includes(normCandidate)) {
      if (Math.min(normCandidate.length, normExisting.length) > 25) {
        return true;
      }
    }
  }
  return false;
}

// Hàm sinh danh sách gợi ý AI KHÔNG TRÙNG LẶP cho Tuyến 1 (Branding)
export function getUniqueBrandAiSuggestions(
  currentIdeas: string[],
  usedHistory: string[],
  requestedCount: number = 3
): BrandIdeaSuggestion[] {
  // 1. Lọc pool theo điều kiện không trùng
  const available = BRANDING_AI_KNOWLEDGE_POOL.filter(item => {
    return !isIdeaDuplicate(item.content, currentIdeas, usedHistory) &&
           !isIdeaDuplicate(item.title, currentIdeas, usedHistory);
  });

  // 2. Nếu còn đủ trong pool, shuffle và lấy requestedCount
  if (available.length >= requestedCount) {
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, requestedCount);
  }

  // 3. Nếu pool sắp hết (đã dùng gần hết), tự động sinh biến thể động mới lạ không trùng
  const results = [...available];
  const dynamicThemes = [
    { tag: '#CaravanXuyênViệt', title: 'Hành trình 3.000km thử thách ánh sáng qua 12 đèo hiểm trở', content: 'Thử thách độ bền luồng sáng Bulbtek cùng đoàn Caravan xuyên Việt qua 12 con đèo khắc nghiệt nhất: Mù Cang Chải, Ô Quy Hồ, Mã Pí Lèng, Hải Vân.', hint: 'Visual hùng vĩ, chứng minh độ bám đường thực chiến.' },
    { tag: '#CôngNghệXanh', title: 'Tiêu chuẩn tiêu thụ điện thông minh trên các dòng xe Hybrid & EV', content: 'Tối ưu dòng tải Driver IC thế hệ mới: Đảm bảo luồng sáng cực đại nhưng không gây sụt áp ắc quy, tương thích hoàn hảo với các dòng xe đời mới và xe Hybrid.', hint: 'Tiên phong xu hướng công nghệ xanh và xe hiện đại.' },
    { tag: '#CộngĐồngBácTài', title: 'Chương trình Ngày Hội Ánh Sáng Bulbtek: Cân chỉnh đèn miễn phí', content: 'Ngày hội kiểm tra và cân chỉnh luồng sáng miễn phí cho 1.000 xe tại các trung tâm dịch vụ Bulbtek ủy quyền, nâng cao ý thức văn hóa chiếu sáng giao thông.', hint: 'Hoạt động CSR vì cộng đồng, gia tăng độ thiện cảm thương hiệu.' },
    { tag: '#KỹThuậtViênTâmHuyết', title: 'Câu chuyện người thợ đèn: 10 năm gắn bó và sự tỉ mỉ từng mối dây', content: 'Gặp gỡ kỹ thuật viên trưởng hệ thống Bulbtek: "Với tôi, mỗi bộ đèn lắp lên xe khách hàng là cả tính mạng của một gia đình. Không cho phép bất kỳ sai số nào!"', hint: 'Góc nhìn con người chân thực, tạo dựng sự tin cậy sâu sắc.' }
  ];

  for (const dyn of dynamicThemes) {
    if (results.length >= requestedCount) break;
    if (!isIdeaDuplicate(dyn.content, currentIdeas, usedHistory)) {
      results.push({
        id: `dyn-br-${Date.now()}-${results.length}`,
        tag: dyn.tag,
        title: dyn.title,
        content: dyn.content,
        angleHint: dyn.hint
      });
    }
  }

  return results.slice(0, requestedCount);
}

// Hàm sinh danh sách gợi ý AI KHÔNG TRÙNG LẶP cho Tuyến 2 (Robot BU Mascot)
export function getUniqueMascotAiSuggestions(
  currentIdeas: string[],
  usedHistory: string[],
  requestedCount: number = 3
): BrandIdeaSuggestion[] {
  // 1. Lọc pool theo điều kiện không trùng
  const available = MASCOT_AI_KNOWLEDGE_POOL.filter(item => {
    return !isIdeaDuplicate(item.content, currentIdeas, usedHistory) &&
           !isIdeaDuplicate(item.title, currentIdeas, usedHistory);
  });

  // 2. Nếu còn đủ trong pool, shuffle và lấy requestedCount
  if (available.length >= requestedCount) {
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, requestedCount);
  }

  // 3. Nếu pool sắp hết, sinh biến thể động mới lạ không trùng
  const results = [...available];
  const dynamicThemes = [
    { tag: '#ChuyệnĐờiTàiXế', title: 'BU lắng nghe tâm sự: Chuyến xe chạy xuyên đêm vì con gái nhỏ', content: 'Robot BU bên góc vô lăng chia sẻ: "Đêm nay bác tài chở hàng về để kịp lễ khai giảng của con. Luồng sáng bám chắc mặt đường, BU giúp bác tài về kịp giờ ôm con vào lòng!"', hint: 'Cảm xúc gia đình lắng đọng, BU là người bạn tâm tình.' },
    { tag: '#MẹoVặtÔTô', title: 'Robot BU bật mí mẹo: 3 bước kiểm tra góc chiếu đèn tại nhà', content: 'Chỉ cần một bức tường phẳng và một cuộn băng dính, Robot BU hướng dẫn các bác tự đo vạch cos đèn xe tại nhà chuẩn xác từng centimet trước chuyến đi dài!', hint: 'Tips hữu ích tương tác cực cao trên mạng xã hội.' },
    { tag: '#HàiHướcCabin', title: 'Khi bác tài quên hạ pha và bị BU "nhắc nhở đáng yêu"', content: 'BU hú còi chớp mắt: "Bác tài ơi, anh xe ngược chiều đang nháy pha xin đường kìa, hạ cos xuống một nấc thôi là cả hai ta cùng vui vẻ vượt đèo an toàn!"', hint: 'Hài hước, gần gũi, nhắc nhở văn hóa giao thông một cách dễ thương.' },
    { tag: '#KhámPháLab', title: 'BU trải nghiệm bài test rơi tự do 1.5m của bi gầm', content: 'Robot BU hồi hộp chứng kiến quả bi gầm Bulbtek rơi từ độ cao 1.5 mét xuống nền bê tông trong phòng thí nghiệm: Thấu kính vẫn nguyên vẹn và bật sáng ngay lập tức!', hint: 'Minh chứng trực quan sống động về độ bền chống va đập.' }
  ];

  for (const dyn of dynamicThemes) {
    if (results.length >= requestedCount) break;
    if (!isIdeaDuplicate(dyn.content, currentIdeas, usedHistory)) {
      results.push({
        id: `dyn-mc-${Date.now()}-${results.length}`,
        tag: dyn.tag,
        title: dyn.title,
        content: dyn.content,
        angleHint: dyn.hint
      });
    }
  }

  return results.slice(0, requestedCount);
}

// ==========================================
// TUYẾN 3: NỘI DUNG SỰ KIỆN & LỄ TẾT TRONG THÁNG
// ==========================================
export function getUniqueEventHolidayAiSuggestions(
  month: number,
  year: number,
  currentIdeas: string[],
  usedHistory: string[],
  requestedCount: number = 3
): BrandIdeaSuggestion[] {
  const holidays = getHolidaysForMonth(year, month);
  const candidates: BrandIdeaSuggestion[] = [];

  // 1. Sinh các ý tưởng góc nhìn Branding gắn liền với từng ngày lễ trong tháng
  holidays.forEach((item, idx) => {
    const h = item.holiday;
    const dayStr = item.day ? ` (Ngày ${item.day}/${month})` : '';
    
    // Góc tiếp cận 1: Góc Cảm xúc & Lan tỏa giá trị An toàn thương hiệu
    candidates.push({
      id: `hol-${h.id}-1`,
      tag: `#${h.name.replace(/[\s\(\)\/\-]/g, '')}`,
      title: `${h.icon} ${h.name}${dayStr}: ${h.suggestedAngle.slice(0, 48)}...`,
      content: `${h.name}${dayStr} — ${h.suggestedAngle}. Cam kết 3 giá trị cốt lõi Bền Bỉ – Bền Vững – Bảo Vệ, đồng hành bảo bọc từng khoảnh khắc sum vầy trọn vẹn.`,
      angleHint: `Góc cảm xúc & trách nhiệm gia đình, gắn kết triết lý An Toàn Hành Trình của Bulbtek.`
    });

    // Góc tiếp cận 2: Góc Tri ân / Ưu đãi / Chăm sóc xế cưng mùa lễ
    candidates.push({
      id: `hol-${h.id}-2`,
      tag: `#TriÂnMùaLễ_${month}`,
      title: `🛡️ Chuyến đi an toàn dịp ${h.name}: Quy chuẩn cắm giắc zin sẵn sàng lăn bánh`,
      content: `Dịp ${h.name}: "Trước mỗi chuyến đi xa đoàn viên hay du xuân, đừng quên kiểm tra mắt sáng xế cưng!" Ghé 300+ gara đối tác Bulbtek cân chỉnh luồng sáng chuẩn vạch cắt đăng kiểm, bảo vệ an toàn cho cả nhà.`,
      angleHint: `Kêu gọi chủ xe ghé mạng lưới 300+ đại lý kiểm tra đèn trước dịp nghỉ lễ.`
    });
  });

  // 2. Góc thời tiết & mùa đặc thù của tháng (bổ trợ nếu tháng ít ngày lễ lớn)
  const seasonalAngles: Record<number, { tag: string; title: string; content: string; hint: string }[]> = {
    1: [
      { tag: '#KhaiXuânHanhThông', title: '🎆 Khai xuân rực rỡ — Vạn dặm bình an cùng luồng sáng mới', content: 'Khai xuân hanh thông đón tài lộc: Nâng cấp ánh sáng Bulbtek như một khởi đầu tươi sáng cho xế yêu, hanh thông cả năm trên mọi cung đường công danh sự nghiệp.', hint: 'May mắn đầu năm, tài lộc và an tâm xuất hành.' },
      { tag: '#DuXuânAnToàn', title: '🚗 Chuyến xe du xuân trẩy hội — Không ngại mưa phùn sương giá', content: 'Mùa lễ hội đầu năm với những chuyến xuất hành về miền tâm linh: Nhiệt màu 4300K-5500K của Bulbtek bám chắc mặt đường ướt, phá sương mù vùng cao.', hint: 'Bám đường, phá sương trong thời tiết xuân ẩm ướt.' }
    ],
    2: [
      { tag: '#DuXuânMiềnBắc', title: '🌸 Hành trình trẩy hội đầu năm qua các cung đèo Tây Bắc', content: 'Thử thách sương mù dày đặc vùng cao Tây Bắc dịp đầu xuân: Bi gầm Bulbtek nhiệt màu vàng nắng 3000K soi rõ từng mép vực, giúp bác tài vững tay lái khám phá vẻ đẹp tổ quốc.', hint: 'Du lịch trải nghiệm, khám phá danh lam thắng cảnh an toàn.' }
    ],
    3: [
      { tag: '#TônVinhPháiĐẹp', title: '💐 Tháng của nàng — Món quà thấu hiểu cho các bóng hồng sau vô lăng', content: 'Tháng 3 tri ân một nửa thế giới: Nâng cấp ánh sáng không chói, góc chiếu cos rộng bao quát làn đường giúp chị em tự tin làm chủ tay lái trên những cung đường về khuya vắng vẻ.', hint: 'Sự quan tâm chu đáo của người thân đối với phụ nữ cầm lái.' }
    ],
    4: [
      { tag: '#TourXuyênViệt30_4', title: '⭐ Chuẩn bị xế cưng cho kỳ nghỉ lễ vàng 30/4 & 1/5 xuyên Việt', content: 'Kỳ nghỉ lễ 30/4 dài ngày: Kiểm tra góc chiếu sáng và hệ thống tản nhiệt đèn xe tại đại lý Bulbtek toàn quốc, chuẩn bị hành trang hoàn hảo chinh phục dải đất hình chữ S.', hint: 'Chuẩn bị kỹ thuật xe trước tour dài ngày cùng gia đình.' }
    ],
    5: [
      { tag: '#ChàoHèRựcRỡ', title: '☀️ Khởi động mùa hè: An tâm vi vu khám phá biển xanh', content: 'Chào hè rực rỡ với những chuyến caravan dã ngoại ven biển: Đèn Bulbtek chịu nhiệt độ cao trong khoang máy ngày hè, chuẩn chống nước IP68 tự tin vượt qua vùng triều cường ven biển.', hint: 'Độ bền chịu nhiệt cực hạn và chuẩn kháng nước IP68.' }
    ],
    6: [
      { tag: '#GiaĐìnhLàSố1', title: '🎈 Chuyến xe tuổi thơ: Đưa con trẻ khám phá thế giới an toàn', content: 'Mùa hè và Tháng Gia Đình Việt Nam: Đằng sau tay lái là tiếng cười con trẻ, đằng trước là luồng sáng bám đường chở che. Bulbtek đồng hành kiến tạo kỷ niệm mùa hè rực rỡ và an toàn.', hint: 'Giá trị gia đình, bảo vệ con trẻ trên từng chuyến đi chơi xa.' }
    ],
    7: [
      { tag: '#MùaMưaBãoNhiệtĐới', title: '🌧️ Mùa giông bão tháng 7: Bí quyết lái xe đêm mưa trắng trời', content: 'Mùa mưa bão nhiệt đới: Khi mưa rào như trút nước và mặt đường phản chiếu ánh sáng nguy hiểm, thấu kính AR Crystal của Bulbtek gom luồng sáng bám chặt mặt đường, triệt tiêu ảo giác.', hint: 'Kỹ năng lái xe an toàn mùa mưa bão lớn, chứng minh công nghệ thấu kính.' }
    ],
    8: [
      { tag: '#HàoKhíMùaThu', title: '🇻🇳 Tự hào tháng 8 lịch sử: Sải bước vươn tầm công nghệ Việt', content: 'Kỷ niệm Cách Mạng Tháng 8: Tự hào tinh thần tự lực tự cường của người Việt. Bulbtek kiên định đầu tư R&D chuẩn hóa quy trình kỹ thuật, mang chuẩn mực quốc tế về phục vụ tài xế Việt.', hint: 'Tự hào dân tộc và sứ mệnh nâng tầm công nghệ chiếu sáng tại Việt Nam.' }
    ],
    9: [
      { tag: '#TựHàoQuốcKhánh', title: '🇻🇳 Rực rỡ cờ hoa Tết Độc Lập 2/9: Vạn dặm non sông sáng ngời', content: 'Đại lễ Quốc Khánh 2/9: Tự hào ngắm nhìn dải đất Việt Nam thắp sáng cờ hoa rực rỡ. Bulbtek tri ân hàng triệu khách hàng đã tin tưởng chọn luồng sáng văn minh trên khắp 63 tỉnh thành.', hint: 'Tự hào đất nước, gắn kết thương hiệu với ngày lễ trọng đại của dân tộc.' },
      { tag: '#MùaTrăngĐoànViên', title: '🌕 Rằm Trung Thu sum vầy: Ánh sáng bình yên trên mọi góc phố', content: 'Đêm rằm Trung Thu: Luồng sáng cos mặt phẳng Bulbtek chiếu rõ từng bước chân trẻ thơ rước đèn, giữ trọn vẹn niềm vui đoàn viên dưới ánh trăng rằm.', hint: 'Ấm áp, đoàn viên gia đình.' }
    ],
    10: [
      { tag: '#ThủĐô70Năm', title: '⭐ Khúc tráng ca Hà Nội 10/10: Ánh sáng văn minh nơi phố cổ', content: 'Chào mừng ngày Giải Phóng Thủ Đô 10/10: Nét cắt cos phẳng mịn của Bulbtek hòa vào nhịp sống văn minh Hà thành — Chiếu sáng rạng rỡ mặt đường mà tuyệt đối không chói mắt người đối diện.', hint: 'Văn hóa chiếu sáng văn minh, tôn vinh nét đẹp thanh lịch thủ đô.' },
      { tag: '#TônVinhDoanhNhân', title: '💼 Ngày Doanh Nhân 13/10: Đồng hành cùng 300+ chủ Gara bản lĩnh', content: 'Tri ân hơn 300 chủ gara, xưởng độ xe trên toàn quốc: Tinh thần dám nghĩ dám làm của các doanh nhân đã đưa chuẩn mực an toàn chiếu sáng đến mọi miền tổ quốc. Bulbtek cam kết đồng hành bền vững.', hint: 'Khẳng định quan hệ đối tác B2B keo sơn, bền vững.' },
      { tag: '#YêuThương20_10', title: '🌸 Ngày Phụ Nữ Việt Nam 20/10: Sự chở che dịu dàng sau vô lăng', content: 'Ngày 20/10: "Món quà tuyệt vời nhất cho người phụ nữ yêu thương là sự an tâm mỗi khi tan làm về muộn." Đèn Bulbtek soi sáng mọi ngõ ngách, xua tan nỗi sợ lái xe đêm.', hint: 'Chạm đến trái tim phụ nữ và người đàn ông trụ cột gia đình.' }
    ],
    11: [
      { tag: '#TriÂnThầyCô20_11', title: '📚 Tri ân Ngày Nhà Giáo 20/11: Ánh sáng tri thức dẫn lối tương lai', content: 'Ngày Nhà Giáo Việt Nam 20/11: Như ngọn đèn tri thức soi đường cho bao thế hệ học trò cập bến vinh quang, Bulbtek kính chúc quý thầy cô vạn dặm bình an và luôn giữ trọn ngọn lửa nhiệt huyết.', hint: 'Tri ân người thầy, gắn kết hình ảnh ngọn đèn tri thức soi sáng tương lai.' },
      { tag: '#MùaSănMâyĐông', title: '🏔️ Mùa săn mây chớm đông: Chinh phục Tà Xùa, Sa Pa kỳ vĩ', content: 'Mùa đông chớm lạnh và những chuyến phượt đèo săn mây: Đèn trợ sáng và bi gầm Bulbtek nhiệt màu 3000K là chìa khóa vàng giúp tài xế xuyên qua biển sương mù dày đặc vùng cao.', hint: 'Phong cách sống dã ngoại, phượt mạo hiểm và thể hiện công năng phá sương.' }
    ],
    12: [
      { tag: '#TriÂnBộĐộiCụHồ', title: '🎖️ Ngày Thành Lập QĐND 22/12: Phẩm chất kiên trung, bền bỉ vượt bão', content: 'Kỷ niệm ngày Quân Đội Nhân Dân Việt Nam 22/12: Tôn vinh phẩm chất kiên cường của người lính. Tinh thần thép ấy cũng là tiêu chuẩn khắt khe để Bulbtek tôi luyện từng bộ đèn bền bỉ qua năm tháng.', hint: 'Tôn vinh sự kiên cường và phẩm chất bền bỉ vượt thời gian.' },
      { tag: '#GiángSinhAnLành', title: '🎄 Mùa Giáng Sinh an lành: Ngọn lửa ấm áp sưởi ấm đêm đông', content: 'Đêm Noel 24/12: Giữa tiết trời mùa đông sương lạnh, dải nhiệt màu ấm áp của Bulbtek xua tan băng giá, đưa xế yêu cùng cả gia đình cập bến an lành ngập tràn tiếng cười.', hint: 'Ấm áp, đoàn tụ và lan tỏa năng lượng tích cực mùa lễ hội.' },
      { tag: '#KhépLạiNămCũ', title: '⏳ Đêm Giao Thừa 31/12: Nhìn lại một năm vạn dặm bình an cùng bác tài', content: 'Đếm ngược sang năm mới: Hàng triệu km đường đêm đã qua, Bulbtek tự hào là người bạn bảo vệ tin cậy cho mỗi chuyến đi. Cảm ơn quý khách hàng và các đối tác đã luôn đồng hành vững bước!', hint: 'Tổng kết cuối năm, lòng biết ơn sâu sắc và lời chúc năm mới khởi sắc.' }
    ]
  };

  const monthSeasonal = seasonalAngles[month] || [];
  monthSeasonal.forEach((item, idx) => {
    candidates.push({
      id: `season-${month}-${idx}`,
      tag: item.tag,
      title: item.title,
      content: item.content,
      angleHint: item.hint
    });
  });

  // 3. Lọc trừ các ý tưởng trùng lặp với danh sách hiện có và lịch sử đã dùng
  const available = candidates.filter(item => {
    return !isIdeaDuplicate(item.content, currentIdeas, usedHistory) &&
           !isIdeaDuplicate(item.title, currentIdeas, usedHistory);
  });

  if (available.length >= requestedCount) {
    // Shuffle nhẹ để mỗi lần bấm "Lấy Gợi Ý Mới" sẽ ra các góc tiếp cận phong phú
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, requestedCount);
  }

  // Nếu còn ít, bổ sung thêm biến thể động theo tháng
  const results = [...available];
  const dynamicHolidayThemes = [
    { tag: `#SựKiệnTháng${month}`, title: `🎉 Chiến dịch truyền thông Tháng ${month}: Lan tỏa thông điệp an toàn giao thông`, content: `Chiến dịch thương hiệu Tháng ${month}: Bulbtek phát động phong trào "Bật đèn đúng lúc - Hạ cos văn minh" nhân dịp các sự kiện trọng tâm trong tháng, kêu gọi cộng đồng chung tay xây dựng văn hóa giao thông đẹp.`, hint: `Hoạt động CSR vì cộng đồng mùa sự kiện trong tháng.` },
    { tag: `#ĐồngHànhCùngBácTài`, title: `🛠️ Trạm kiểm tra ánh sáng miễn phí tháng ${month} tại 300+ đại lý`, content: `Nhân các dịp lễ đặc biệt trong tháng ${month}, ghé bất kỳ trung tâm ủy quyền Bulbtek để nhận dịch vụ cân chỉnh góc chiếu đèn xe miễn phí 100%, tự tin vi vu mọi cung đường an toàn!`, hint: `Kêu gọi hành động thực tế, gia tăng lượng ghé thăm gara đại lý.` }
  ];

  for (const dyn of dynamicHolidayThemes) {
    if (results.length >= requestedCount) break;
    if (!isIdeaDuplicate(dyn.content, currentIdeas, usedHistory)) {
      results.push({
        id: `dyn-hol-${Date.now()}-${results.length}`,
        tag: dyn.tag,
        title: dyn.title,
        content: dyn.content,
        angleHint: dyn.hint
      });
    }
  }

  return results.slice(0, requestedCount);
}
