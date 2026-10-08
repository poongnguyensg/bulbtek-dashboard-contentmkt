export type BrandPrinciple = 
  | 'KHÔNG Chém Gió Ảo'
  | 'KHÔNG Cắt Dây Điện'
  | 'KHÔNG Gây Chói Lóa';

export interface ComplianceRule {
  id: string;
  keyword: string;
  principle: BrandPrinciple;
  severity: 'warning' | 'danger';
  suggestion: string;
}

export const DEFAULT_COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: 'comp-1',
    keyword: 'sáng nhất',
    principle: 'KHÔNG Chém Gió Ảo',
    severity: 'warning',
    suggestion: 'Thay bằng "tăng sáng vượt trội" hoặc dẫn chứng thông số Lux/Lumen kiểm định thực tế.'
  },
  {
    id: 'comp-2',
    keyword: 'mạnh nhất',
    principle: 'KHÔNG Chém Gió Ảo',
    severity: 'warning',
    suggestion: 'Thay bằng "công suất tối ưu Cos 65W - Pha 75W" theo số đo phòng Lab.'
  },
  {
    id: 'comp-3',
    keyword: 'tuyệt đối không bao giờ hỏng',
    principle: 'KHÔNG Chém Gió Ảo',
    severity: 'warning',
    suggestion: 'Thay bằng "tuổi thọ 50.000 giờ, cam kết bảo hành chính hãng 1 đổi 1 trong 2-3 năm".'
  },
  {
    id: 'comp-4',
    keyword: 'cắt dây',
    principle: 'KHÔNG Cắt Dây Điện',
    severity: 'danger',
    suggestion: 'Bulbtek tuyệt đối cam kết giải pháp "Cắm giắc zin 100%, giữ trọn bảo hành xe".'
  },
  {
    id: 'comp-5',
    keyword: 'cắt trích',
    principle: 'KHÔNG Cắt Dây Điện',
    severity: 'danger',
    suggestion: 'Thay bằng "giắc cắm Plug & Play 100%, không cắt trích dây nguyên bản".'
  },
  {
    id: 'comp-6',
    keyword: 'đấu tắt',
    principle: 'KHÔNG Cắt Dây Điện',
    severity: 'danger',
    suggestion: 'Nhấn mạnh "mạch Driver ổn định dòng và an toàn phòng chống cháy nổ ô tô".'
  },
  {
    id: 'comp-7',
    keyword: 'chói mắt',
    principle: 'KHÔNG Gây Chói Lóa',
    severity: 'warning',
    suggestion: 'Nhấn mạnh "đường cắt Cos phẳng mịn văn minh, tuyệt đối không gây chói mắt xe đối diện".'
  },
  {
    id: 'comp-8',
    keyword: 'bắn pha mù mắt',
    principle: 'KHÔNG Gây Chói Lóa',
    severity: 'danger',
    suggestion: 'Thay bằng "tâm pha gom xa an toàn, hỗ trợ quan sát chướng ngại vật từ xa".'
  },
  {
    id: 'comp-9',
    keyword: 'số 1 thị trường',
    principle: 'KHÔNG Chém Gió Ảo',
    severity: 'warning',
    suggestion: 'Không dùng từ ngữ tuyệt đối hóa nếu không có kiểm định độc lập.'
  },
  {
    id: 'comp-10',
    keyword: 'vô địch',
    principle: 'KHÔNG Chém Gió Ảo',
    severity: 'warning',
    suggestion: 'Thay bằng dẫn chứng về độ bền bỉ phần cứng và tỷ lệ bảo hành thực tế < 0.2%.'
  }
];

export interface ComplianceViolation {
  keyword: string;
  principle: BrandPrinciple;
  suggestion: string;
  severity: 'warning' | 'danger';
}

/**
 * Quét nội dung văn bản theo danh sách quy tắc tuân thủ thương hiệu Bulbtek
 */
export function checkBrandCompliance(
  text: string, 
  customRules: ComplianceRule[] = DEFAULT_COMPLIANCE_RULES
): { isViolated: boolean; violations: ComplianceViolation[] } {
  if (!text || text.trim() === '') {
    return { isViolated: false, violations: [] };
  }

  const violations: ComplianceViolation[] = [];
  const lower = text.toLowerCase();

  for (const rule of customRules) {
    if (lower.includes(rule.keyword.toLowerCase())) {
      // Tránh trùng lặp cùng 1 rule
      if (!violations.some(v => v.keyword.toLowerCase() === rule.keyword.toLowerCase())) {
        violations.push({
          keyword: rule.keyword,
          principle: rule.principle,
          suggestion: rule.suggestion,
          severity: rule.severity
        });
      }
    }
  }

  return {
    isViolated: violations.length > 0,
    violations
  };
}
