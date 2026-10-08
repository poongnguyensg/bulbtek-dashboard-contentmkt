import { ContentItem } from '../types';

/**
 * Tải file CSV UTF-8 (có BOM) tương thích 100% Microsoft Excel & Google Sheets tiếng Việt
 */
export function downloadCsvFile(filename: string, headers: string[], rows: (string | number)[][]) {
  const processCell = (cell: any) => {
    const str = String(cell ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = '\uFEFF' + [
    headers.map(processCell).join(','),
    ...rows.map(row => row.map(processCell).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Xuất kế hoạch Content Product Planning (Bước 3) ra file CSV
 */
export function exportProductPlanCsv(
  month: number,
  year: number,
  items: ContentItem[],
  categoriesMap: Record<string, string>
) {
  const headers = [
    'STT',
    'Ngày đăng',
    'Kênh xuất bản',
    'Sản phẩm / SKU',
    'Dòng sản phẩm',
    'Danh mục nội dung',
    'Tiêu đề bài viết (Internal Title)',
    'Headline sáng tạo (Creative Headline)',
    'Góc tiếp cận (Angle / Hook)',
    'Trạng thái AI Caption',
    'Nhân sự triển khai (Assignee)',
    'Trạng thái phê duyệt',
    'Nội dung Facebook Caption',
    'Kịch bản TikTok Caption'
  ];

  const sortedItems = [...items].sort((a, b) => a.date.localeCompare(b.date));

  const rows = sortedItems.map((item, index) => {
    const catName = categoriesMap[item.categoryId] || item.categoryId;
    const hasCaption = Boolean(item.facebookCaption || item.tiktokCaption);
    const statusAi = hasCaption ? 'Đã hoàn thiện AI' : 'Chưa có caption';

    return [
      index + 1,
      item.date,
      item.channel,
      item.productName,
      item.productLine || 'Phần cứng',
      catName,
      item.title,
      item.creativeHeadline || item.title,
      item.angleUsed || (item.highlightSpecs || []).join('; ') || '',
      statusAi,
      item.assigneeName || item.createdBy || 'Chưa phân công',
      item.status,
      item.facebookCaption || '',
      item.tiktokCaption || ''
    ];
  });

  const filename = `Ke_Hoach_Content_Product_Bulbtek_Thang_${String(month).padStart(2, '0')}_${year}.csv`;
  downloadCsvFile(filename, headers, rows);
}

/**
 * Xuất kế hoạch Content Branding Planning ra file CSV
 */
export function exportBrandingPlanCsv(
  month: number,
  year: number,
  items: ContentItem[],
  categoriesMap: Record<string, string>
) {
  const headers = [
    'STT',
    'Ngày đăng',
    'Kênh xuất bản',
    'Tuyến nội dung',
    'Danh mục & Tone giọng',
    'Tiêu đề bài viết',
    'Headline sáng tạo (Creative Headline)',
    'Ý tưởng cốt lõi & Storyline',
    'Trạng thái AI Caption',
    'Người phụ trách triển khai',
    'Trạng thái phê duyệt',
    'Nội dung Facebook Caption',
    'Kịch bản TikTok Caption'
  ];

  const sortedItems = [...items].sort((a, b) => a.date.localeCompare(b.date));

  const rows = sortedItems.map((item, index) => {
    const catName = categoriesMap[item.categoryId] || item.categoryId;
    const hasCaption = Boolean(item.facebookCaption || item.tiktokCaption);
    const statusAi = hasCaption ? 'Đã hoàn thiện AI' : 'Chưa có caption';
    const tuyếnName = item.productLine === 'Linh Vật Robot BU' ? 'Storytelling Linh Vật Robot BU' : 'Branding & Triết Lý Thương Hiệu';

    return [
      index + 1,
      item.date,
      item.channel,
      tuyếnName,
      catName,
      item.title,
      item.creativeHeadline || item.title,
      item.angleUsed || (item.highlightSpecs || []).join('; ') || '',
      statusAi,
      item.assigneeName || item.createdBy || 'Chưa phân công',
      item.status,
      item.facebookCaption || '',
      item.tiktokCaption || ''
    ];
  });

  const filename = `Ke_Hoach_Content_Branding_Bulbtek_Thang_${String(month).padStart(2, '0')}_${year}.csv`;
  downloadCsvFile(filename, headers, rows);
}
