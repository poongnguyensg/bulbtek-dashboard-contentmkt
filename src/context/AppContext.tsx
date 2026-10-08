import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Category, 
  ContentItem, 
  TeamMember, 
  EmailLog, 
  SystemSettings, 
  UserRole,
  Channel,
  ContentStatus,
  ContentMemoryEntry,
  PlanningSubTab
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_CONTENTS, 
  INITIAL_TEAM, 
  INITIAL_EMAIL_LOGS, 
  INITIAL_SETTINGS 
} from '../data/initialData';

interface AppContextType {
  // Navigation & Role & Theme
  activeTab: number; // 1 to 5, or 6 for Settings
  setActiveTab: (tab: number) => void;
  planningSubTab: PlanningSubTab;
  setPlanningSubTab: (subTab: PlanningSubTab) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentUser: TeamMember;
  setCurrentUser: (user: TeamMember) => void;
  users: TeamMember[];
  addUser: (member: Omit<TeamMember, 'id' | 'addedDate'>) => void;
  updateUserRole: (id: string, role: UserRole) => void;

  // Products (Tab 1)
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  saveProduct: (product: Product) => void;
  bulkAddProducts: (newProducts: Product[], overwriteExisting?: boolean) => { added: number; updated: number; total: number };
  deleteProduct: (id: string) => void;

  // Categories (Tab 2)
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;

  // Contents (Tab 2 & Tab 3)
  contents: ContentItem[];
  saveContentItem: (item: ContentItem) => void;
  deleteContentItem: (id: string) => void;
  autoGenerateMonthPlan: (
    month: number, 
    year: number, 
    selectedProductIds: string[], 
    fbTarget?: number, 
    tiktokTarget?: number,
    brandingConfig?: { enabled: boolean; promptInfo: string; ideas?: string[] },
    mascotConfig?: { enabled: boolean; promptInfo: string; ideas?: string[] },
    selectedCategoryIds?: string[]
  ) => void;
  
  // Workflow & Approvals (Tab 5 & Tab 3)
  submitContentForApproval: (contentId: string) => void;
  approveContent: (contentId: string) => void;
  rejectContent: (contentId: string, reasons: string[], comment: string) => boolean;
  publishContent: (contentId: string, publishedUrl?: string) => void;

  // Email logs & Invites
  emailLogs: EmailLog[];
  sendTestEmail: (recipient: string) => void;
  sendInviteEmail: (member: { name: string; email: string; role: UserRole; roleTitle: string }) => { subject: string; body: string; mailtoUrl: string };

  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;

  // Pre-fill for Design Brief (Tab 4)
  briefPrefillItem: ContentItem | null;
  setBriefPrefillItem: (item: ContentItem | null) => void;

  // Pre-fill for Content Planning (Tab 2)
  planningPrefillItem: ContentItem | null;
  setPlanningPrefillItem: (item: ContentItem | null) => void;

  // Content Memory (Anti-Duplication Engine)
  contentMemory: ContentMemoryEntry[];
  addContentMemory: (entry: Omit<ContentMemoryEntry, 'id' | 'createdAt'>) => ContentMemoryEntry;
  clearContentMemory: (productId?: string) => void;
  getMemoryForProduct: (productId: string) => ContentMemoryEntry[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<number>(1);
  const [planningSubTab, setPlanningSubTab] = useState<PlanningSubTab>('GOALS');

  // Theme (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('btk_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('btk_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('btk_products');
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(p => p.id));
        const missing = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
        return [...parsed, ...missing];
      } catch (err) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('btk_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Team
  const [users, setUsers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('btk_team');
    return saved ? JSON.parse(saved) : INITIAL_TEAM;
  });
  const [currentUser, setCurrentUser] = useState<TeamMember>(users[0] || INITIAL_TEAM[0]);

  // Contents
  const [contents, setContents] = useState<ContentItem[]>(() => {
    const saved = localStorage.getItem('btk_contents');
    return saved ? JSON.parse(saved) : INITIAL_CONTENTS;
  });

  // Email logs
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('btk_email_logs');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_LOGS;
  });

  // Settings
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('btk_settings');
    if (saved) {
      try {
        const parsed: SystemSettings = JSON.parse(saved);
        // Tự động nâng cấp thông tin model lên phiên bản mới nhất trong khi bảo toàn apiKey người dùng đã nhập
        const updatedModels = INITIAL_SETTINGS.models.map(defaultM => {
          const userM = parsed.models?.find(m => m.id === defaultM.id);
          return userM ? {
            ...defaultM,
            apiKey: userM.apiKey || defaultM.apiKey,
            isActive: userM.isActive ?? defaultM.isActive
          } : defaultM;
        });
        return {
          ...parsed,
          models: updatedModels
        };
      } catch (e) {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  // Brief prefill
  const [briefPrefillItem, setBriefPrefillItem] = useState<ContentItem | null>(null);

  // Planning prefill (Mục 6: tạo nhanh bài từ ngày lễ)
  const [planningPrefillItem, setPlanningPrefillItem] = useState<ContentItem | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('btk_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('btk_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('btk_team', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('btk_contents', JSON.stringify(contents));
  }, [contents]);

  useEffect(() => {
    localStorage.setItem('btk_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  useEffect(() => {
    localStorage.setItem('btk_settings', JSON.stringify(settings));
  }, [settings]);

  // Content Memory (Anti-Duplication Engine)
  const [contentMemory, setContentMemory] = useState<ContentMemoryEntry[]>(() => {
    const saved = localStorage.getItem('btk_content_memory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('btk_content_memory', JSON.stringify(contentMemory));
  }, [contentMemory]);

  const addContentMemory = (entry: Omit<ContentMemoryEntry, 'id' | 'createdAt'>): ContentMemoryEntry => {
    const newEntry: ContentMemoryEntry = {
      ...entry,
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString()
    };
    setContentMemory(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const clearContentMemory = (productId?: string) => {
    if (productId) {
      setContentMemory(prev => prev.filter(m => m.productId !== productId));
    } else {
      setContentMemory([]);
    }
  };

  const getMemoryForProduct = (productId: string): ContentMemoryEntry[] => {
    return contentMemory.filter(m => m.productId === productId);
  };

  // Actions
  const saveProduct = (product: Product) => {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...product, updatedAt: new Date().toISOString() };
        return copy;
      }
      return [...prev, { ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    });
    setSelectedProduct(product);
  };

  const bulkAddProducts = (newProducts: Product[], overwriteExisting: boolean = true): { added: number; updated: number; total: number } => {
    let addedCount = 0;
    let updatedCount = 0;

    setProducts(prev => {
      const currentList = [...prev];
      newProducts.forEach(newP => {
        const existingIdx = currentList.findIndex(p => {
          const matchSku = Boolean(newP.sku && p.sku && p.sku.trim().toLowerCase() === newP.sku.trim().toLowerCase());
          const matchName = p.name.trim().toLowerCase() === newP.name.trim().toLowerCase();
          return matchSku || matchName;
        });

        if (existingIdx >= 0) {
          if (overwriteExisting) {
            currentList[existingIdx] = {
              ...newP,
              id: currentList[existingIdx].id,
              createdAt: currentList[existingIdx].createdAt,
              updatedAt: new Date().toISOString()
            };
            updatedCount++;
          }
        } else {
          currentList.push({
            ...newP,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          addedCount++;
        }
      });
      return currentList;
    });

    return { added: addedCount, updated: updatedCount, total: newProducts.length };
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
    }
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`
    };
    setCategories(prev => [...prev, newCat]);
  };

  const saveContentItem = (item: ContentItem) => {
    setContents(prev => {
      const idx = prev.findIndex(c => c.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [...prev, item];
    });
  };

  const deleteContentItem = (id: string) => {
    const item = contents.find(c => c.id === id);
    if (item?.isRecurring) {
      const confirmDelete = window.confirm('Đây là nội dung lặp định kỳ (Recurring). Bạn có chắc chắn muốn xóa bài này?');
      if (!confirmDelete) return;
    }
    setContents(prev => prev.filter(c => c.id !== id));
  };

  const addUser = (member: Omit<TeamMember, 'id' | 'addedDate'>) => {
    const newMember: TeamMember = {
      ...member,
      id: `user-${Date.now()}`,
      addedDate: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newMember]);
  };

  const updateUserRole = (id: string, role: UserRole) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  };

  // Workflow logic
  const submitContentForApproval = (contentId: string) => {
    const item = contents.find(c => c.id === contentId);
    if (!item) return;

    const updatedItem: ContentItem = {
      ...item,
      status: 'Pending'
    };

    saveContentItem(updatedItem);

    // Create email notification to Approver
    const approver = users.find(u => u.role === 'APPROVER') || users[1];
    const previewCaption = (item.facebookCaption || item.tiktokCaption || '').slice(0, 120);
    const newMail: EmailLog = {
      id: `mail-${Date.now()}`,
      timestamp: new Date().toLocaleString('sv-SE'),
      type: 'SUBMIT',
      recipient: approver.email,
      subject: `[BULBTEK Content] Cần duyệt: ${item.title} | Đăng ${item.date}`,
      body: `${currentUser.name} đã gửi duyệt bài: "${item.title}".\nKênh: ${item.channel}\nSản phẩm: ${item.productName}\nXem trước: "${previewCaption}..."\nVui lòng đăng nhập hệ thống để duyệt.`,
      contentItemId: item.id,
      status: 'Thành công'
    };
    setEmailLogs(prev => [newMail, ...prev]);
  };

  const approveContent = (contentId: string) => {
    const item = contents.find(c => c.id === contentId);
    if (!item) return;

    const updatedItem: ContentItem = {
      ...item,
      status: 'Approved',
      approvedAt: new Date().toISOString(),
      approvedBy: currentUser.name
    };

    saveContentItem(updatedItem);

    // Notify Creator
    const creator = users.find(u => u.name === item.createdBy) || users.find(u => u.id === item.assigneeId) || users[2];
    const newMail: EmailLog = {
      id: `mail-${Date.now()}`,
      timestamp: new Date().toLocaleString('sv-SE'),
      type: 'APPROVE',
      recipient: creator.email,
      subject: `[BULBTEK Content] ✅ Đã duyệt: ${item.title} | Đăng ${item.date}`,
      body: `Bài viết "${item.title}" của bạn đã được ${currentUser.name} phê duyệt thành công.\nHãy chuẩn bị media và đăng đúng khung giờ nhé!`,
      contentItemId: item.id,
      status: 'Thành công'
    };
    setEmailLogs(prev => [newMail, ...prev]);
  };

  const rejectContent = (contentId: string, reasons: string[], comment: string): boolean => {
    if (!comment || comment.trim().length < 20) {
      alert('Lý do từ chối bắt buộc phải có ít nhất 20 ký tự!');
      return false;
    }
    if (reasons.length === 0) {
      alert('Vui lòng chọn ít nhất 1 lý do nhanh!');
      return false;
    }

    const item = contents.find(c => c.id === contentId);
    if (!item) return false;

    const updatedItem: ContentItem = {
      ...item,
      status: 'Rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: currentUser.name,
      rejectionReasons: reasons,
      rejectionComment: comment
    };

    saveContentItem(updatedItem);

    // Notify Creator
    const creator = users.find(u => u.name === item.createdBy) || users.find(u => u.id === item.assigneeId) || users[2];
    const newMail: EmailLog = {
      id: `mail-${Date.now()}`,
      timestamp: new Date().toLocaleString('sv-SE'),
      type: 'REJECT',
      recipient: creator.email,
      subject: `[BULBTEK Content] Cần chỉnh sửa: ${item.title}`,
      body: `Bài viết "${item.title}" bị từ chối bởi ${currentUser.name}.\nLý do: ${reasons.join(', ')}\nÝ kiến phản hồi: "${comment}"\nVui lòng chỉnh sửa lại theo hướng dẫn và submit duyệt lại.`,
      contentItemId: item.id,
      status: 'Thành công'
    };
    setEmailLogs(prev => [newMail, ...prev]);
    return true;
  };

  const publishContent = (contentId: string, publishedUrl?: string) => {
    const item = contents.find(c => c.id === contentId);
    if (!item) return;

    const updatedItem: ContentItem = {
      ...item,
      status: 'Published',
      publishedUrl: publishedUrl !== undefined ? publishedUrl : item.publishedUrl,
      publishedAt: new Date().toISOString()
    };

    saveContentItem(updatedItem);
  };

  const sendTestEmail = (recipient: string) => {
    const newMail: EmailLog = {
      id: `mail-${Date.now()}`,
      timestamp: new Date().toLocaleString('sv-SE'),
      type: 'TEST',
      recipient: recipient || settings.smtp.senderEmail,
      subject: `[BULBTEK System] Kiểm tra kết nối SMTP gửi email`,
      body: `Kết nối SMTP tới máy chủ ${settings.smtp.server}:${settings.smtp.port} thành công. Hệ thống gửi thông báo tự động hoạt động bình thường.`,
      status: 'Thành công'
    };
    setEmailLogs(prev => [newMail, ...prev]);
  };

  const sendInviteEmail = (member: { name: string; email: string; role: UserRole; roleTitle: string }): { subject: string; body: string; mailtoUrl: string } => {
    const roleMap: Record<UserRole, string> = {
      ADMIN: 'Quản trị viên (COO / Quản lý cấp cao)',
      APPROVER: 'Người duyệt bài (Team Lead / Content Lead)',
      CREATOR: 'Người sáng tạo nội dung (Content Creator / MKT Executive)'
    };

    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:5173';
    const roleDescription = roleMap[member.role] || member.role;

    const subject = `[BULBTEK VIỆT NAM] Thư Mời Tham Gia Content Marketing Dashboard - ${member.name}`;
    const body = `Kính gửi ${member.name},

Ban Quản Trị BULBTEK VIỆT NAM trân trọng mời bạn tham gia hệ thống Quản Lý & Sản Xuất Nội Dung Tiếp Thị (Bulbtek Content Marketing Dashboard).

Thông tin tài khoản được cấp quyền:
• Họ và tên: ${member.name}
• Email truy cập: ${member.email}
• Vai trò hệ thống: ${member.role} (${roleDescription})
• Chức danh chuyên trách: ${member.roleTitle || 'Thành viên'}
• Đường dẫn truy cập hệ thống: ${origin}/

Tại hệ thống này, bạn có thể:
1. Tra cứu kho dữ liệu sản phẩm & triết lý nhận diện thương hiệu Bulbtek Việt Nam.
2. Lập kế hoạch nội dung tự động đa kênh (Facebook, TikTok) tối ưu chống trùng lặp bởi AI.
3. Tạo Brief thiết kế đồ họa & video chuẩn nhận diện thương hiệu.
4. Tham gia quy trình phê duyệt & quản lý tiến độ nội dung tiếp thị chuẩn mực.

Mọi thắc mắc trong quá trình đăng nhập và làm việc, vui lòng liên hệ Ban Quản Trị qua email hoặc nhóm nội bộ.

Trân trọng,
BAN QUẢN TRỊ NỘI DUNG BULBTEK VIỆT NAM
Slogan: An Toàn Hành Trình - Trợ Thủ Đắc Lực Cho Bác Tài Việt`;

    const mailtoUrl = `mailto:${encodeURIComponent(member.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const newMail: EmailLog = {
      id: `mail-${Date.now()}`,
      timestamp: new Date().toLocaleString('sv-SE'),
      type: 'INVITE',
      recipient: member.email,
      subject,
      body,
      status: 'Thành công'
    };

    setEmailLogs(prev => [newMail, ...prev]);

    return { subject, body, mailtoUrl };
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Monthly planner auto-generation logic
  const autoGenerateMonthPlan = (
    month: number,
    year: number,
    selectedProductIds: string[],
    fbTarget: number = 16,
    tiktokTarget: number = 0,
    brandingConfig?: { enabled: boolean; promptInfo: string; ideas?: string[] },
    mascotConfig?: { enabled: boolean; promptInfo: string; ideas?: string[] },
    selectedCategoryIds?: string[]
  ) => {
    const daysInMonth = new Date(year, month, 0).getDate();

    // Lọc danh mục cho phép phân bổ theo lựa chọn của người dùng ở Bước 2
    const allowedCategories = (selectedCategoryIds && selectedCategoryIds.length > 0)
      ? categories.filter(c => selectedCategoryIds.includes(c.id))
      : categories;
    const activeCategories = allowedCategories.length > 0 ? allowedCategories : categories;

    // Hardware products selected
    const hardwareCandidates = products.filter(
      p => selectedProductIds.includes(p.id) &&
           p.productLine !== 'Branding Sản Phẩm' &&
           p.productLine !== 'Linh Vật Robot BU'
    );
    const activeHardware = hardwareCandidates.length > 0 
      ? hardwareCandidates 
      : products.filter(p => p.productLine !== 'Branding Sản Phẩm' && p.productLine !== 'Linh Vật Robot BU');

    // Branding & Mascot configurations
    const isBrandingEnabled = brandingConfig !== undefined ? brandingConfig.enabled : true;
    const isMascotEnabled = mascotConfig !== undefined ? mascotConfig.enabled : true;

    const brandingIdeas = (brandingConfig?.ideas && brandingConfig.ideas.filter(i => i.trim().length > 0).length > 0)
      ? brandingConfig.ideas.filter(i => i.trim().length > 0)
      : (brandingConfig?.promptInfo?.trim() ? [brandingConfig.promptInfo.trim()] : [
          '3 Giá trị cốt lõi: Bền Bỉ – Bền Vững – Bảo Vệ, định vị An Toàn Hành Trình và mạng lưới 300+ đại lý'
        ]);

    const mascotIdeas = (mascotConfig?.ideas && mascotConfig.ideas.filter(i => i.trim().length > 0).length > 0)
      ? mascotConfig.ideas.filter(i => i.trim().length > 0)
      : (mascotConfig?.promptInfo?.trim() ? [mascotConfig.promptInfo.trim()] : [
          'Nhật ký cabin cùng Robot BU: Hướng dẫn bác tài chỉnh đèn phá sương khi vượt đèo đêm mưa lũ'
        ]);

    const baseBrandingProd = products.find(p => p.productLine === 'Branding Sản Phẩm') || products[0];
    const baseMascotProd = products.find(p => p.productLine === 'Linh Vật Robot BU') || products[0];

    // Filter existing recurring items to preserve them
    const recurringItems = contents.filter(c => c.isRecurring);

    const newGeneratedItems: ContentItem[] = [];
    const totalSlots = fbTarget + (tiktokTarget || 0);
    
    // Pick creators for round-robin assignment (Mục 7: phân bổ đều cho các Creator active)
    const activeCreators = users.filter(u => u.status === 'Active' && u.role === 'CREATOR');
    const availableAssignees = activeCreators.length > 0 
      ? activeCreators 
      : users.filter(u => u.status === 'Active');

    // Find key categories strictly within activeCategories
    const catBranding = activeCategories.find(c => c.id === 'cat-branding') || activeCategories[0];
    const catDealer = activeCategories.find(c => c.id === 'cat-dealer') || activeCategories[0];
    const catInteraction = activeCategories.find(c => c.id === 'cat-interaction') || activeCategories[0];
    const catQuiz = activeCategories.find(c => c.id === 'cat-quiz') || activeCategories[0];
    const catProduct = activeCategories.find(c => c.id === 'cat-product') || activeCategories[0];

    // Distribute slots across days (spread throughout the month)
    const step = daysInMonth / (totalSlots || 1);
    let hardwareIdx = 0;
    let brandingIdx = 0;
    let mascotIdx = 0;
    let lastCatId = '';

    for (let i = 0; i < totalSlots; i++) {
      const dayNum = Math.min(daysInMonth, Math.max(1, Math.round((i + 0.5) * step)));
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month - 1, dayNum).getDay(); // 0: Sun, 5: Fri, 6: Sat

      const isFb = i < fbTarget;
      const channel: Channel = isFb ? 'Facebook' : 'TikTok';

      // Skip if a recurring post exists on this exact date and channel
      const existingRecurring = recurringItems.find(r => r.date === dateStr && r.channel === channel);
      if (existingRecurring) {
        continue;
      }

      // Golden balanced rotation in a 5-step cycle:
      // 0: Hardware
      // 1: Robot BU (if enabled) else Hardware
      // 2: Hardware
      // 3: Branding (if enabled) else Hardware
      // 4: Hardware
      let chosenProduct: Product;
      let chosenCat: Category;
      let itemTitle = '';
      let creativeHeadline = '';
      let highlightSpecs: string[] = [];

      const cyclePos = i % 5;
      const shouldPickMascot = cyclePos === 1 && isMascotEnabled;
      const shouldPickBranding = cyclePos === 3 && isBrandingEnabled;

      if (shouldPickMascot) {
        const activeMascotIdea = mascotIdeas[mascotIdx % mascotIdeas.length];
        mascotIdx++;
        chosenProduct = {
          ...baseMascotProd,
          name: 'Linh Vật Robot BU',
          productLine: 'Linh Vật Robot BU',
          coreBenefit: activeMascotIdea
        };
        chosenCat = (mascotIdx % 2 === 0 && lastCatId !== catQuiz.id) ? catQuiz : catInteraction;
        const shortPrompt = activeMascotIdea.length > 55 ? activeMascotIdea.slice(0, 55) + '...' : activeMascotIdea;
        itemTitle = `🤖 [Robot BU] ${shortPrompt} - Ngày ${dayNum}/${month}`;
        creativeHeadline = `Robot BU Đồng Hành — ${shortPrompt}`;
        highlightSpecs = [
          activeMascotIdea,
          'Trợ thủ đắc lực cho bác tài cabin ô tô',
          'Tăng sáng an toàn, văn minh không chói mắt'
        ];
      } else if (shouldPickBranding) {
        const activeBrandingIdea = brandingIdeas[brandingIdx % brandingIdeas.length];
        brandingIdx++;
        chosenProduct = {
          ...baseBrandingProd,
          name: 'Bulbtek Việt Nam — Branding',
          productLine: 'Branding Sản Phẩm',
          coreBenefit: activeBrandingIdea
        };
        const isB2BDealer = activeBrandingIdea.toLowerCase().includes('đại lý') || activeBrandingIdea.toLowerCase().includes('gara');
        chosenCat = isB2BDealer ? catDealer : catBranding;
        const shortPrompt = activeBrandingIdea.length > 55 ? activeBrandingIdea.slice(0, 55) + '...' : activeBrandingIdea;
        itemTitle = `🛡️ [Branding] ${shortPrompt} - Ngày ${dayNum}/${month}`;
        creativeHeadline = `BULBTEK VIỆT NAM — ${shortPrompt}`;
        highlightSpecs = [
          activeBrandingIdea,
          'Sứ mệnh "An Toàn Hành Trình"',
          '3 Giá trị cốt lõi: Bền Bỉ – Bền Vững – Bảo Vệ',
          'Mạng lưới 300+ đại lý ủy quyền toàn quốc'
        ];
      } else if (activeHardware.length > 0) {
        // Hardware product: Hero prioritized on Fri/Sat or days 1-7
        const heroHardware = activeHardware.filter(p => p.status === 'Hero Product');
        if ((dayNum <= 7 || dayOfWeek === 5 || dayOfWeek === 6) && heroHardware.length > 0) {
          chosenProduct = heroHardware[hardwareIdx % heroHardware.length];
        } else {
          chosenProduct = activeHardware[hardwareIdx % activeHardware.length];
        }
        hardwareIdx++;

        const candidateHardwareCats = [catProduct, catProduct, catQuiz, catDealer].filter(c => activeCategories.some(ac => ac.id === c.id));
        const filteredHardwareCats = candidateHardwareCats.filter(c => c.id !== lastCatId);
        const availableHardwareCats = filteredHardwareCats.length > 0 ? filteredHardwareCats : (candidateHardwareCats.length > 0 ? candidateHardwareCats : activeCategories);
        chosenCat = availableHardwareCats[hardwareIdx % availableHardwareCats.length] || activeCategories[0];
        itemTitle = `${chosenCat.name}: ${chosenProduct.name} - Ngày ${dayNum}/${month}`;
        const benefitShort = (chosenProduct.coreBenefit || 'Tăng sáng an toàn bám đường').split(/[,.–-]/)[0].trim();
        creativeHeadline = `${chosenProduct.name.toUpperCase()} — ${benefitShort}`;

        const specVals = Object.values(chosenProduct.specs || {}).filter(Boolean) as string[];
        highlightSpecs = specVals.length > 0 ? specVals.slice(0, 3) : [chosenProduct.coreBenefit];
      } else {
        chosenProduct = products[i % products.length];
        chosenCat = activeCategories[(i + 1) % activeCategories.length] || activeCategories[0];
        itemTitle = `${chosenCat.name}: ${chosenProduct.name} - Ngày ${dayNum}/${month}`;
        const benefitShort = (chosenProduct.coreBenefit || 'Tăng sáng an toàn bám đường').split(/[,.–-]/)[0].trim();
        creativeHeadline = `${chosenProduct.name.toUpperCase()} — ${benefitShort}`;
        highlightSpecs = Object.values(chosenProduct.specs || {}).filter(Boolean).slice(0, 3) as string[];
      }

      lastCatId = chosenCat.id;

      // Round-robin phân bổ tác giả luân phiên giữa các Creator
      const assignedCreator = availableAssignees[i % availableAssignees.length] || users[0];

      // Làm sạch highlightSpecs không để chữ 'N/A' lẫn vào
      const cleanedSpecs = highlightSpecs.map(s => {
        if (typeof s === 'string' && /\bN\/A\b/i.test(s)) {
          return s.replace(/\bN\/A\s*(\([^)]*\))?/gi, 'Chưa cập nhật thông số').trim();
        }
        return s;
      });

      const newItem: ContentItem = {
        id: `gen-${year}${month}-${i + 1}-${Date.now()}`,
        title: itemTitle,
        creativeHeadline,
        date: dateStr,
        channel,
        productId: chosenProduct.id,
        productName: chosenProduct.name,
        productLine: chosenProduct.productLine,
        categoryId: chosenCat.id,
        assigneeId: assignedCreator.id,
        assigneeName: assignedCreator.name,
        status: 'Draft',
        highlightSpecs: cleanedSpecs,
        angleUsed: (shouldPickBranding || shouldPickMascot) ? cleanedSpecs[0] : undefined,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name
      };

      newGeneratedItems.push(newItem);
    }

    // Merge: keep preserved recurring + existing other months + brand items from TabBrandPlanning + new items
    setContents(prev => {
      const otherMonthsOrPreserved = prev.filter(c => 
        !c.date.startsWith(`${year}-${String(month).padStart(2, '0')}`) || 
        c.isRecurring ||
        c.id.startsWith('content-brand-')
      );
      return [...otherMonthsOrPreserved, ...newGeneratedItems];
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        planningSubTab,
        setPlanningSubTab,
        theme,
        toggleTheme,
        currentUser,
        setCurrentUser,
        users,
        addUser,
        updateUserRole,
        products,
        selectedProduct,
        setSelectedProduct,
        saveProduct,
        bulkAddProducts,
        deleteProduct,
        categories,
        addCategory,
        contents,
        saveContentItem,
        deleteContentItem,
        autoGenerateMonthPlan,
        submitContentForApproval,
        approveContent,
        rejectContent,
        publishContent,
        emailLogs,
        sendTestEmail,
        sendInviteEmail,
        settings,
        updateSettings,
        briefPrefillItem,
        setBriefPrefillItem,
        planningPrefillItem,
        setPlanningPrefillItem,
        contentMemory,
        addContentMemory,
        clearContentMemory,
        getMemoryForProduct
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
