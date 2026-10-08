export type ProductLine = 
  | 'Bi LED'
  | 'Bi Gầm'
  | 'Bóng LED'
  | 'Bi LED Mini'
  | 'Trợ Sáng'
  | 'Branding Sản Phẩm'
  | 'Linh Vật Robot BU';

export type ProductStatus = 'Hero Product' | 'Sản phẩm hiện hữu' | 'Sản phẩm mới' | 'Clearance';
export type TargetAudience = 'B2B Dealer' | 'B2C Người dùng cuối' | 'Cả hai';
export type SuitableVehicle = 'Xe ô tô' | 'Xe máy/mô tô' | 'Cả Hai';
export type ProductSegment = 'Entry' | 'Mid' | 'Premium';
export type ProductStage = 'Launch' | 'Growth' | 'Maintain' | 'Clearance';

export interface ProductSpecs {
  chipLed?: string;
  colorTemp?: string; // e.g., 5500K, 4500K, 3000K-4300K-6000K
  brightness?: string; // Lux/Lumen
  power?: string; // Watt (e.g., Cos 55W - Pha 65W)
  voltage?: string; // 12V - 24V
  lifespan?: string; // e.g., 50.000 giờ
  warranty?: string; // e.g., 3 năm đổi mới
  compatibility?: string; // e.g., Chân xoáy đa năng, tương thích 95% dòng xe
  specialFeatures?: string;
  sizeInch?: string; // Kích thước Lens (inch), VD: 3.0 inch, 2.0 inch, 1.8 inch, 1.5 inch
  waterproof?: string; // Chuẩn kháng nước, VD: IP68, IP65, IP67
}

export interface Product {
  id: string;
  name: string;
  productLine: ProductLine;
  sku: string;
  status: ProductStatus;
  retailPrice: string;
  targetAudience?: TargetAudience;
  suitableFor?: SuitableVehicle; // 'Xe ô tô' | 'Xe máy/mô tô' | 'Cả Hai'
  segment: ProductSegment;
  specs: ProductSpecs;
  coreBenefit: string;
  stage: ProductStage;
  internalNotes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  tone: string;
  color: string;
  exampleAngle?: string;
  icon?: string;
}

export type Channel = 'Facebook' | 'TikTok' | 'Cross-post';
export type ContentStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Published';

export interface ContentItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  channel: Channel;
  productId: string;
  productName: string;
  productLine: ProductLine;
  categoryId: string;
  assigneeId: string;
  assigneeName: string;
  status: ContentStatus;
  
  // Content copy
  creativeHeadline?: string;
  facebookCaption?: string;
  tiktokCaption?: string;
  highlightSpecs: string[];
  angleUsed?: string;
  
  // Recurring
  isRecurring?: boolean;
  recurringPattern?: 'Hàng tuần' | 'Hàng tháng';
  recurringDetail?: string;

  // Metadata & Audit
  aiModelUsed?: string;
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReasons?: string[];
  rejectionComment?: string;
  publishedAt?: string;
  publishedUrl?: string; // Link bài viết thực tế đã đăng (Facebook/TikTok post URL)
}

export type UserRole = 'ADMIN' | 'APPROVER' | 'CREATOR';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  status: 'Active' | 'Inactive';
  addedDate: string;
  avatar: string;
}

export interface EmailLog {
  id: string;
  timestamp: string;
  type: 'SUBMIT' | 'REJECT' | 'APPROVE' | 'TEST' | 'INVITE';
  recipient: string;
  subject: string;
  body: string;
  contentItemId?: string;
  status: 'Thành công' | 'Thất bại';
}

export interface AIModelConfig {
  id: 'CLAUDE' | 'GEMINI' | 'GPT4';
  name: string;
  modelCode: string;
  endpoint: string;
  description: string;
  apiKey: string;
  isActive: boolean;
}

export interface TokenBudget {
  facebookCaption: number;
  tiktokCaption: number;
  designBriefText: number;
  imagePrompt: number;
}

export interface SmtpConfig {
  server: string;
  port: number;
  senderEmail: string;
  appPassword: string;
  defaultApproverEmail: string;
  monthlyReportEmail: string;
}

export interface BrandColorItem {
  id: string;
  name: string;
  hex: string;
  role: string;
  description: string;
  opticalAnalysis?: string;
  isCustom?: boolean;
}

export interface PhilosophyPoint {
  id: string;
  title: string;
  desc: string;
}

export interface ThreeNoRule {
  id: string;
  number: number;
  title: string;
  desc: string;
}

export interface CoreValueItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  desc: string;
  bullets: string[];
}

export interface TypeHierarchyItem {
  level: string;
  size: string;
  weight: string;
  fontFamily: string;
  example: string;
}

export interface BrandTypography {
  headlineFont: string;
  headlineWeights: string[];
  headlineUsage: string;
  bodyFont: string;
  bodyWeights: string[];
  bodyUsage: string;
  codeFont: string;
  codeWeights: string[];
  codeUsage: string;
  fontHierarchy: TypeHierarchyItem[];
  hierarchyNotes?: string;
  primaryFont?: string;
  primaryUsage?: string;
  monoFont?: string;
  monoUsage?: string;
}

export interface BrandGuideline {
  brandName: string;
  slogan: string;
  message: string;
  coreValues: string;
  primaryColor: string;
  darkColor: string;
  whiteColor: string;
  mascot: string;
  visualStyle: string;
  visualRatio: string;
  fbHashtags: string;
  tiktokHashtags: string;
  colorPalette?: BrandColorItem[];
  secondaryColors?: BrandColorItem[];
  philosophyTitle?: string;
  philosophyDesc?: string;
  philosophyPoints?: PhilosophyPoint[];
  missionTitle?: string;
  missionDesc?: string;
  missionPoints?: PhilosophyPoint[];
  threeNoRules?: ThreeNoRule[];
  coreValuePillars?: CoreValueItem[];
  mascotImage?: string;
  typography?: BrandTypography;
}

export interface ComplianceRule {
  id: string;
  keyword: string;
  principle: 'KHÔNG Chém Gió Ảo' | 'KHÔNG Cắt Dây Điện' | 'KHÔNG Gây Chói Lóa';
  severity: 'warning' | 'danger';
  suggestion: string;
}

export interface SystemSettings {
  activeModel: 'CLAUDE' | 'GEMINI' | 'GPT4';
  models: AIModelConfig[];
  tokenBudget: TokenBudget;
  smtp: SmtpConfig;
  repeatWarningThreshold: number;
  historyRetentionMonths: number;
  brandGuideline: BrandGuideline;
  complianceRules?: ComplianceRule[];
}

export interface DesignBrief {
  id: string;
  contentItemId?: string;
  title: string;
  channel: Channel;
  formats: string[]; // e.g. ['Facebook post (1080x1080px)', ...]
  deadline: string;
  productName: string;
  highlightSpecs: string[];
  designerNotes?: string;
  refImage?: string;
  visualRequirements: {
    background: string;
    accentColor: string;
    composition: string;
    lighting: string;
    effects: string;
  };
  textOverlay: {
    headline: string;
    subHeadline: string;
    logoPosition: string;
    hasCtaOrHashtag: boolean;
  };
  brandConstants: {
    colors: string;
    font: string;
    style: string;
  };
  imagenPrompt: string;
  midjourneyPrompt: string;
  createdAt: string;
}

export interface ContentMemoryEntry {
  id: string;
  productId: string;
  productName: string;
  categoryId: string;
  categoryName?: string;
  channel?: Channel;
  date?: string;
  angleUsed: string;
  hookFb: string;
  hookTiktok: string;
  coreTheme?: string;
  variationIndex: number;
  facebookCaption: string;
  tiktokCaption: string;
  createdAt: string;
}

export type PlanningSubTab = 'GOALS' | 'BRAND_CREATIVE' | 'CATEGORIES' | 'SCHEDULE';
