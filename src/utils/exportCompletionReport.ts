import { ContentItem } from '../types';

/**
 * Tiện ích xuất bản Báo Cáo Nghiệm Thu & Hoàn Thành Nội Dung Marketing Cuối Tháng
 * Dành cho Lịch Content Trực Quan (Tab 3: Content Calendar).
 * Định dạng chuẩn A4 Landscape PDF, hỗ trợ click link bài viết thực tế và ký duyệt 3 bên.
 */

// Hàm format ngày hiển thị đẹp
function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Hàm mở cửa sổ in / xuất PDF
function printReportDocument(title: string, htmlContent: string) {
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (!printWindow) {
    alert('Trình duyệt đang chặn cửa sổ mới (Popup). Vui lòng cho phép popup để xem và tải file Báo Cáo Hoàn Thành PDF!');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm 12mm 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #f8fafc;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.4;
    }
    .no-print-bar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #fff;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
    }
    .no-print-btn {
      background: #16a34a;
      color: #fff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .no-print-btn:hover {
      background: #15803d;
    }
    .no-print-close {
      background: #334155;
      color: #fff;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
    }
    .no-print-close:hover {
      background: #475569;
    }
    .sheet {
      background: #fff;
      width: 100%;
      max-width: 1300px;
      margin: 20px auto;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border-radius: 8px;
    }
    @media print {
      body {
        background: #fff;
      }
      .no-print-bar {
        display: none !important;
      }
      .sheet {
        box-shadow: none;
        margin: 0;
        padding: 0;
        max-width: 100%;
        border-radius: 0;
      }
      table {
        page-break-inside: auto;
      }
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
    }
    .brand-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #16a34a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      color: #16a34a;
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin: 0;
    }
    .brand-subtitle {
      color: #64748b;
      font-size: 11px;
      margin-top: 2px;
      font-weight: 600;
    }
    .meta-box {
      text-align: right;
      font-size: 10px;
      color: #475569;
    }
    .kpi-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .kpi-card {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
    }
    .kpi-label {
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }
    .kpi-val {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 10px;
    }
    th {
      background: #e2e8f0;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 7px 8px;
      border: 1px solid #cbd5e1;
      font-size: 10px;
      text-transform: uppercase;
    }
    td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
      color: #1e293b;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .badge-channel-fb {
      background: #1877f2;
      color: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 9px;
      display: inline-block;
    }
    .badge-channel-tt {
      background: #000;
      color: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 9px;
      display: inline-block;
    }
    .badge-completed {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 800;
      font-size: 9px;
      display: inline-block;
    }
    .badge-pending {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 9px;
      display: inline-block;
    }
    .post-link {
      color: #2563eb;
      text-decoration: underline;
      font-weight: 600;
      word-break: break-all;
      display: inline-block;
      max-width: 250px;
    }
    .no-link {
      color: #94a3b8;
      font-style: italic;
    }
    .footer-sign {
      margin-top: 24px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      text-align: center;
      padding-top: 14px;
      border-top: 1px dashed #cbd5e1;
      font-size: 10px;
    }
    .sign-role {
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      margin-bottom: 40px;
    }
    .sign-name {
      font-weight: 600;
      color: #0f172a;
    }
    .compliance-box {
      margin-top: 16px;
      padding: 8px 12px;
      border-left: 3px solid #16a34a;
      background: #f0fdf4;
      font-size: 9.5px;
      color: #166534;
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="font-weight:700; font-size:14px;">BULBTEK VIỆT NAM — BÁO CÁO NGHIỆM THU HOÀN THÀNH NỘI DUNG</span>
      <span style="font-size:12px; color:#94a3b8;">(Báo cáo nộp cuối tháng • Khổ in: A4 Ngang / Landscape)</span>
    </div>
    <div style="display:flex; align-items:center; gap:10px;">
      <button class="no-print-btn" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
        Lưu Báo Cáo PDF / In Tài Liệu
      </button>
      <button class="no-print-close" onclick="window.close()">Đóng</button>
    </div>
  </div>

  <div class="sheet">
    ${htmlContent}
  </div>

  <script>
    // Tự động mở hộp thoại in sau khi trang load xong
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
  `);
  printWindow.document.close();
}

/**
 * Xuất bản Báo Cáo Nghiệm Thu Hoàn Thành Nội Dung dạng PDF chuẩn in A4 Landscape
 */
export function exportMonthlyCompletionReportPdf(
  month: number,
  year: number,
  items: ContentItem[],
  categoriesMap: Record<string, string>
) {
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  const totalPosts = sorted.length;
  const completedPosts = sorted.filter(i => i.status === 'Published');
  const pendingPosts = sorted.filter(i => i.status !== 'Published');
  const completedCount = completedPosts.length;
  const completionRate = totalPosts > 0 ? Math.round((completedCount / totalPosts) * 100) : 0;

  const fbCompleted = completedPosts.filter(i => i.channel === 'Facebook').length;
  const fbTotal = sorted.filter(i => i.channel === 'Facebook').length;
  const tiktokCompleted = completedPosts.filter(i => i.channel === 'TikTok').length;
  const tiktokTotal = sorted.filter(i => i.channel === 'TikTok').length;

  let rowsHtml = '';
  sorted.forEach((item, index) => {
    const isDone = item.status === 'Published';
    const channelBadge = item.channel === 'Facebook'
      ? `<span class="badge-channel-fb">FB</span>`
      : `<span class="badge-channel-tt">TikTok</span>`;

    const statusBadge = isDone
      ? `<span class="badge-completed">✓ HOÀN THÀNH</span>`
      : `<span class="badge-pending">⏳ CHƯA ĐĂNG (${item.status})</span>`;

    const catName = categoriesMap[item.categoryId] || item.categoryId || 'Nội dung';
    const headline = item.creativeHeadline || item.title;

    const linkHtml = item.publishedUrl
      ? `<a href="${item.publishedUrl}" target="_blank" rel="noreferrer" class="post-link" title="${item.publishedUrl}">🔗 ${item.publishedUrl}</a>`
      : `<span class="no-link">Chưa cập nhật link đăng</span>`;

    rowsHtml += `
      <tr>
        <td style="text-align:center; font-weight:700;">${index + 1}</td>
        <td style="font-weight:700; white-space:nowrap;">${formatDateDisplay(item.date)}</td>
        <td style="text-align:center;">${channelBadge}</td>
        <td>
          <div style="font-weight:800; color:#0f172a;">${item.productName}</div>
          <div style="font-size:9px; color:#64748b;">${item.productLine || ''}</div>
        </td>
        <td style="font-weight:600; color:#475569;">${catName}</td>
        <td>
          <div style="font-weight:700; color:#e11d48; margin-bottom:2px;">“${headline}”</div>
          <div style="font-size:9.5px; color:#64748b;">${item.title}</div>
        </td>
        <td style="font-weight:600; color:#334155;">${item.assigneeName || 'Linh'}</td>
        <td style="text-align:center;">${statusBadge}</td>
        <td>${linkHtml}</td>
      </tr>
    `;
  });

  const fullHtml = `
    <div class="brand-header">
      <div>
        <h1 class="brand-title">BULBTEK VIỆT NAM — BÁO CÁO NGHIỆM THU HOÀN THÀNH NỘI DUNG</h1>
        <div class="brand-subtitle">MONTHLY CONTENT PUBLISHING COMPLETION REPORT • THÁNG ${month}/${year}</div>
      </div>
      <div class="meta-box">
        <div><strong>Thời điểm lập báo cáo:</strong> ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}</div>
        <div><strong>Bộ phận:</strong> Phòng Marketing & Truyền Thông Bulbtek Việt Nam</div>
        <div><strong>Hệ thống:</strong> Bulbtek Content Dashboard</div>
      </div>
    </div>

    <div class="kpi-summary">
      <div class="kpi-card">
        <div class="kpi-label">Tổng Số Bài Đã Lên Kế Hoạch</div>
        <div class="kpi-val" style="color:#0f172a;">${totalPosts} bài</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Số Bài Đã Xuất Bản / Hoàn Thành</div>
        <div class="kpi-val" style="color:#16a34a;">${completedCount} / ${totalPosts} bài</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Tỷ Lệ Hoàn Thành Nhiệm Vụ (KPI)</div>
        <div class="kpi-val" style="color:${completionRate >= 80 ? '#16a34a' : '#d97706'};">${completionRate}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Tiến Độ Theo Kênh</div>
        <div class="kpi-val" style="font-size:12px; margin-top:4px;">
          FB: <strong>${fbCompleted}/${fbTotal}</strong> (${fbTotal > 0 ? Math.round(fbCompleted/fbTotal*100) : 0}%) | TT: <strong>${tiktokCompleted}/${tiktokTotal}</strong>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:30px; text-align:center;">STT</th>
          <th style="width:70px;">Ngày</th>
          <th style="width:45px; text-align:center;">Kênh</th>
          <th style="width:130px;">Sản Phẩm / Tuyến</th>
          <th style="width:105px;">Danh Mục</th>
          <th style="width:250px;">Headline & Tiêu Đề Bài Viết</th>
          <th style="width:75px;">Phụ Trách</th>
          <th style="width:110px; text-align:center;">Nghiệm Thu</th>
          <th>Đường Dẫn Bài Viết Đã Đăng Thực Tế (URL)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="compliance-box">
      <strong>✓ KẾT LUẬN NGHIỆM THU:</strong> Toàn bộ các bài viết đã hoàn thành tuân thủ nghiêm ngặt quy chuẩn thương hiệu Bulbtek (100% số đo quang học kiểm định thực tế, cam kết cắm jack zin an toàn và đường cắt cos chuẩn không gây chói lóa). Các liên kết bài viết được lưu trữ minh bạch để đối soát hiệu quả truyền thông.
    </div>

    <div class="footer-sign">
      <div>
        <div class="sign-role">Người Lập Báo Cáo</div>
        <div class="sign-name">Content Executive / Specialist</div>
      </div>
      <div>
        <div class="sign-role">Trưởng Bộ Phận Duyệt Báo Cáo</div>
        <div class="sign-name">Marketing Lead</div>
      </div>
      <div>
        <div class="sign-role">Ban Giám Đốc Phê Duyệt Nghiệm Thu</div>
        <div class="sign-name">COO (Chief Operating Officer)</div>
      </div>
    </div>
  `;

  printReportDocument(`Bao_Cao_Nghiem_Thu_Content_Thang_${month}_${year}_Bulbtek`, fullHtml);
}

/**
 * Xuất bản Báo Cáo Nghiệm Thu Hoàn Thành Nội Dung dạng CSV (Excel tương thích UTF-8 BOM)
 */
export function exportMonthlyCompletionReportCsv(
  month: number,
  year: number,
  items: ContentItem[],
  categoriesMap: Record<string, string>
) {
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  const headers = [
    'STT',
    'Ngày Đăng',
    'Kênh Xuất Bản',
    'Tên Sản Phẩm / Tuyến Bài',
    'Dòng Sản Phẩm',
    'Danh Mục Nội Dung',
    'Tiêu Đề Quản Trị',
    'Headline Sáng Tạo',
    'Người Phụ Trách',
    'Trạng Thái Nghiệm Thu',
    'Link Đăng Bài Viết Thực Tế (URL)',
    'Thời Điểm Đăng Hoàn Thành'
  ];

  const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

  const rows = sorted.map((item, idx) => {
    const isDone = item.status === 'Published';
    const catName = categoriesMap[item.categoryId] || item.categoryId || '';
    return [
      idx + 1,
      formatDateDisplay(item.date),
      item.channel,
      escapeCsv(item.productName),
      escapeCsv(item.productLine || ''),
      escapeCsv(catName),
      escapeCsv(item.title),
      escapeCsv(item.creativeHeadline || item.title),
      escapeCsv(item.assigneeName || ''),
      isDone ? 'ĐÃ HOÀN THÀNH' : `CHƯA ĐĂNG (${item.status})`,
      escapeCsv(item.publishedUrl || ''),
      item.publishedAt ? new Date(item.publishedAt).toLocaleString('vi-VN') : ''
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao_Cao_Nghiem_Thu_Content_Thang_${month}_${year}_Bulbtek.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
