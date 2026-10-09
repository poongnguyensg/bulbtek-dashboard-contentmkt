export interface VietnameseHoliday {
  id: string;
  name: string;
  shortLabel: string;
  month: number; // 1-12
  day?: number; // 1-31 (if fixed Solar calendar)
  exactDates?: string[]; // YYYY-MM-DD for specific lunar/solar years
  type: 'National' | 'Traditional' | 'Commemorative';
  icon: string;
  suggestedAngle: string;
}

export const VIETNAMESE_HOLIDAYS: VietnameseHoliday[] = [
  {
    id: 'tet-duong-lich',
    name: 'Tết Dương Lịch (Năm Mới)',
    shortLabel: '🎆 Tết Dương Lịch',
    month: 1,
    day: 1,
    type: 'National',
    icon: '🎆',
    suggestedAngle: 'Khai xuân hanh thông, nâng cấp ánh sáng đón chào năm mới rực rỡ và may mắn'
  },
  {
    id: 'tet-nguyen-dan',
    name: 'Tết Nguyên Đán (Tết Cổ Truyền)',
    shortLabel: '🏮 Tết Nguyên Đán',
    month: 2,
    exactDates: ['2025-01-29', '2025-01-30', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21'],
    type: 'Traditional',
    icon: '🏮',
    suggestedAngle: 'Trợ thủ đắc lực đưa bác tài về quê đón Tết sum vầy an toàn, không lo sương mù'
  },
  {
    id: 'valentine',
    name: 'Lễ Tình Nhân (Valentine)',
    shortLabel: '❤️ Valentine',
    month: 2,
    day: 14,
    type: 'Commemorative',
    icon: '❤️',
    suggestedAngle: 'Chăm sóc xế cưng, đồng hành cùng người thương trên mọi cung đường lãng mạn'
  },
  {
    id: 'thay-thuoc-vn',
    name: 'Ngày Thầy Thuốc Việt Nam',
    shortLabel: '🩺 Thầy Thuốc VN',
    month: 2,
    day: 27,
    type: 'Commemorative',
    icon: '🩺',
    suggestedAngle: 'Tri ân đội ngũ y bác sĩ trực cấp cứu xuyên đêm, an toàn từng chuyến xe cứu thương'
  },
  {
    id: 'quoc-te-phu-nu',
    name: 'Quốc Tế Phụ Nữ',
    shortLabel: '💐 8/3 Phụ Nữ',
    month: 3,
    day: 8,
    type: 'Commemorative',
    icon: '💐',
    suggestedAngle: 'Tôn vinh các bóng hồng cầm lái tự tin, an toàn trên từng cung đường'
  },
  {
    id: 'gio-to-hung-vuong',
    name: 'Giỗ Tổ Hùng Vương (10/3 Âm Lịch)',
    shortLabel: '👑 Giỗ Tổ 10/3',
    month: 4,
    exactDates: ['2025-04-07', '2026-04-26', '2027-04-16'],
    type: 'National',
    icon: '👑',
    suggestedAngle: 'Hành trình về nguồn cội, phượt đất Tổ an tâm vững lái'
  },
  {
    id: 'giai-phong-30-4',
    name: 'Ngày Giải Phóng Miền Nam',
    shortLabel: '⭐ 30/4 Giải Phóng',
    month: 4,
    day: 30,
    type: 'National',
    icon: '⭐',
    suggestedAngle: 'Đại lễ thống nhất non sông, chuẩn bị đèn tăng sáng vi vu tour xuyên Việt'
  },
  {
    id: 'quoc-te-lao-dong',
    name: 'Quốc Tế Lao Động',
    shortLabel: '🛠️ 1/5 Lao Động',
    month: 5,
    day: 1,
    type: 'National',
    icon: '🛠️',
    suggestedAngle: 'Tri ân bác tài Việt dãi dầu mưa nắng, người lao động cần mẫn trên mọi nẻo đường'
  },
  {
    id: 'quoc-te-thieu-nhi',
    name: 'Quốc Tế Thiếu Nhi',
    shortLabel: '🎈 1/6 Thiếu Nhi',
    month: 6,
    day: 1,
    type: 'Commemorative',
    icon: '🎈',
    suggestedAngle: 'Chuyến xe gia đình đưa con trẻ đi chơi hè an toàn tuyệt đối'
  },
  {
    id: 'thuong-binh-liet-si',
    name: 'Ngày Thương Binh Liệt Sĩ',
    shortLabel: '🕯️ 27/7 Tri Ân',
    month: 7,
    day: 27,
    type: 'Commemorative',
    icon: '🕯️',
    suggestedAngle: 'Uống nước nhớ nguồn, hành trình thắp nến tri ân người có công'
  },
  {
    id: 'quoc-khanh-2-9',
    name: 'Quốc Khánh Nước CHXHCN Việt Nam',
    shortLabel: '🇻🇳 Quốc Khánh 2/9',
    month: 9,
    day: 2,
    type: 'National',
    icon: '🇻🇳',
    suggestedAngle: 'Mừng Quốc Khánh 2/9, tự hào thương hiệu Việt thắp sáng muôn nẻo đường tổ quốc'
  },
  {
    id: 'tet-trung-thu',
    name: 'Tết Trung Thu (Rằm Tháng 8)',
    shortLabel: '🌕 Tết Trung Thu',
    month: 9,
    exactDates: ['2025-10-06', '2026-09-25', '2027-09-15'],
    type: 'Traditional',
    icon: '🌕',
    suggestedAngle: 'Ánh sáng trăng rằm, trọn vẹn niềm vui rước đèn đoàn viên cùng xế yêu'
  },
  {
    id: 'giai-phong-thu-do',
    name: 'Ngày Giải Phóng Thủ Đô',
    shortLabel: '⭐ 10/10 Giải Phóng Thủ Đô',
    month: 10,
    day: 10,
    type: 'National',
    icon: '⭐',
    suggestedAngle: 'Hào khí Thăng Long 70 năm rạng rỡ, Bulbtek tự hào thắp sáng cờ hoa muôn nẻo đường Thủ Đô'
  },
  {
    id: 'doanh-nhan-vn',
    name: 'Ngày Doanh Nhân Việt Nam',
    shortLabel: '💼 Doanh Nhân VN',
    month: 10,
    day: 13,
    type: 'Commemorative',
    icon: '💼',
    suggestedAngle: 'Tri ân hơn 300 chủ gara, đối tác đại lý doanh nhân năng động của Bulbtek trên toàn quốc'
  },
  {
    id: 'phu-nu-vn-20-10',
    name: 'Ngày Phụ Nữ Việt Nam',
    shortLabel: '🌸 20/10 Phụ Nữ VN',
    month: 10,
    day: 20,
    type: 'Commemorative',
    icon: '🌸',
    suggestedAngle: 'Món quà an toàn cho người phụ nữ yêu thương trên từng chuyến đi làm về tối'
  },
  {
    id: 'halloween',
    name: 'Lễ Hội Halloween',
    shortLabel: '🎃 Halloween',
    month: 10,
    day: 31,
    type: 'Commemorative',
    icon: '🎃',
    suggestedAngle: 'Xua tan bóng tối đêm Halloween: Bật sáng đèn Bulbtek, vững tay lái không lo điểm mù góc khuất'
  },
  {
    id: 'nha-giao-vn-20-11',
    name: 'Ngày Nhà Giáo Việt Nam',
    shortLabel: '📚 20/11 Nhà Giáo',
    month: 11,
    day: 20,
    type: 'Commemorative',
    icon: '📚',
    suggestedAngle: 'Tri ân người lái đò thầm lặng đưa bao thế hệ cập bến tri thức'
  },
  {
    id: 'quan-doi-ndvn',
    name: 'Ngày Thành Lập QĐND Việt Nam',
    shortLabel: '🎖️ 22/12 QĐND Việt Nam',
    month: 12,
    day: 22,
    type: 'National',
    icon: '🎖️',
    suggestedAngle: 'Tri ân người lính Cụ Hồ can trường, phẩm chất bền bỉ vượt mọi gian khó như đèn Bulbtek'
  },
  {
    id: 'giang-sinh-noel',
    name: 'Lễ Giáng Sinh (Noel)',
    shortLabel: '🎄 Giáng Sinh Noel',
    month: 12,
    day: 24,
    type: 'Commemorative',
    icon: '🎄',
    suggestedAngle: 'Ánh sáng lung linh ấm áp xua tan sương giá đêm đông, đón mùa an lành'
  },
  {
    id: 'giao-thua-nam-moi',
    name: 'Đêm Giao Thừa Năm Mới',
    shortLabel: '⏳ Đêm Giao Thừa',
    month: 12,
    day: 31,
    type: 'Commemorative',
    icon: '⏳',
    suggestedAngle: 'Đếm ngược đón năm mới, nhìn lại chặng đường bền bỉ bảo vệ an toàn cùng Bulbtek'
  }
];

export function getHolidayForDate(dateStr: string): VietnameseHoliday | undefined {
  if (!dateStr) return undefined;
  const parts = dateStr.split('-');
  if (parts.length < 3) return undefined;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Exact date match (lunar holiday conversions)
  const exactMatch = VIETNAMESE_HOLIDAYS.find(h => h.exactDates && h.exactDates.includes(dateStr));
  if (exactMatch) return exactMatch;

  // Fixed solar match
  return VIETNAMESE_HOLIDAYS.find(h => h.month === month && h.day === day);
}

export function getHolidaysForMonth(year: number, month: number): { day: number; dateStr: string; holiday: VietnameseHoliday }[] {
  const results: { day: number; dateStr: string; holiday: VietnameseHoliday }[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hol = getHolidayForDate(dStr);
    if (hol && !results.some(r => r.holiday.id === hol.id)) {
      results.push({ day: d, dateStr: dStr, holiday: hol });
    }
  }

  // Bổ sung các ngày lễ cố định theo tháng nếu chưa được quét
  const monthHolidays = VIETNAMESE_HOLIDAYS.filter(h => h.month === month);
  for (const h of monthHolidays) {
    if (!results.some(r => r.holiday.id === h.id)) {
      const d = h.day || 15;
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      results.push({ day: d, dateStr: dStr, holiday: h });
    }
  }

  return results.sort((a, b) => a.day - b.day);
}
