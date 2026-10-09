import { Product, Category, ContentItem, TeamMember, SystemSettings, ContentMemoryEntry, UserRole } from '../types';

// API base URL tự động nhận diện môi trường (relative path hoạt động tốt cả ở local với Vite Proxy và production)
const API_BASE = '/api';

// Helper gọi fetch an toàn với xử lý lỗi
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    let errorDetail = `Lỗi HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.error) errorDetail = errJson.error;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return res.json();
}

// 1. TẢI ẢNH LÊN MÁY CHỦ (SERVER / UPLOADS)
export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    let errorDetail = `Không thể tải ảnh lên (HTTP ${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson?.error) errorDetail = errJson.error;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  const data = await res.json();
  return data.url; // Trả về url dạng: /uploads/bulbtek-123456.jpg
}

// 2. PRODUCTS API
export async function apiGetProducts(): Promise<Product[]> {
  return request<Product[]>('/products');
}

export async function apiSaveProduct(product: Product): Promise<Product> {
  return request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(product)
  });
}

export async function apiDeleteProduct(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/products/${id}`, {
    method: 'DELETE'
  });
}

export async function apiBulkAddProducts(products: Product[], overwriteExisting = true): Promise<{ added: number; updated: number; total: number }> {
  return request<{ added: number; updated: number; total: number }>('/products/bulk', {
    method: 'POST',
    body: JSON.stringify({ products, overwriteExisting })
  });
}

// 3. CATEGORIES API
export async function apiGetCategories(): Promise<Category[]> {
  return request<Category[]>('/categories');
}

export async function apiSaveCategory(category: Partial<Category>): Promise<Category> {
  return request<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(category)
  });
}

// 4. CONTENTS API
export async function apiGetContents(): Promise<ContentItem[]> {
  return request<ContentItem[]>('/contents');
}

export async function apiSaveContent(item: ContentItem): Promise<ContentItem> {
  return request<ContentItem>('/contents', {
    method: 'POST',
    body: JSON.stringify(item)
  });
}

export async function apiDeleteContent(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/contents/${id}`, {
    method: 'DELETE'
  });
}

export async function apiBulkAddContents(items: ContentItem[]): Promise<{ success: boolean; count: number }> {
  return request<{ success: boolean; count: number }>('/contents/bulk', {
    method: 'POST',
    body: JSON.stringify({ items })
  });
}

// 5. TEAM API
export async function apiGetTeam(): Promise<TeamMember[]> {
  return request<TeamMember[]>('/team');
}

export async function apiSaveTeamMember(member: Partial<TeamMember>): Promise<TeamMember> {
  return request<TeamMember>('/team', {
    method: 'POST',
    body: JSON.stringify(member)
  });
}

export async function apiUpdateUserRole(id: string, role: UserRole): Promise<TeamMember> {
  return request<TeamMember>(`/team/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });
}

// 6. SYSTEM SETTINGS API
export async function apiGetSettings(): Promise<SystemSettings | null> {
  return request<SystemSettings | null>('/settings');
}

export async function apiSaveSettings(settings: SystemSettings): Promise<SystemSettings> {
  return request<SystemSettings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  });
}

// 7. CONTENT MEMORY API
export async function apiGetMemory(productId?: string): Promise<ContentMemoryEntry[]> {
  const query = productId ? `?productId=${encodeURIComponent(productId)}` : '';
  return request<ContentMemoryEntry[]>(`/memory${query}`);
}

export async function apiAddMemory(entry: Omit<ContentMemoryEntry, 'id' | 'createdAt'>): Promise<ContentMemoryEntry> {
  return request<ContentMemoryEntry>('/memory', {
    method: 'POST',
    body: JSON.stringify(entry)
  });
}

export async function apiClearMemory(productId?: string): Promise<{ success: boolean }> {
  const query = productId ? `?productId=${encodeURIComponent(productId)}` : '';
  return request<{ success: boolean }>(`/memory${query}`, {
    method: 'DELETE'
  });
}
