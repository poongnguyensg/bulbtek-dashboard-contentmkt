import { ContentItem } from '../types';

/**
 * Tiện ích xuất bản Kế hoạch phân bổ nội dung thành tài liệu PDF chuẩn in A4 Landscape.
 * Không bị lỗi font tiếng Việt Unicode, tự động định dạng bảng biểu phân theo tuần,
 * có thanh công cụ lưu PDF / In tài liệu và tự động kích hoạt hộp thoại Lưu PDF của trình duyệt.
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

// Phân nhóm bài viết theo tuần (Tuần 1: 1-7, Tuần 2: 8-14, Tuần 3: 15-21, Tuần 4: 22-31)
function groupByWeek(items: ContentItem[]) {
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  const week1: ContentItem[] = [];
  const week2: ContentItem[] = [];
  const week3: ContentItem[] = [];
  const week4: ContentItem[] = [];

  sorted.forEach(item => {
    const day = parseInt(item.date.split('-')[2] || '1', 10);
    if (day <= 7) week1.push(item);
    else if (day <= 14) week2.push(item);
    else if (day <= 21) week3.push(item);
    else week4.push(item);
  });

  return [
    { label: 'TUẦN 1 (Ngày 01 – 07)', items: week1 },
    { label: 'TUẦN 2 (Ngày 08 – 14)', items: week2 },
    { label: 'TUẦN 3 (Ngày 15 – 21)', items: week3 },
    { label: 'TUẦN 4 (Ngày 22 – 31)', items: week4 },
  ];
}

// Hàm mở cửa sổ in / xuất PDF
function printHtmlDocument(title: string, htmlContent: string) {
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (!printWindow) {
    alert('Trình duyệt đang chặn cửa sổ mới (Popup). Vui lòng cho phép popup để xem và tải file PDF!');
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
      background: #e11d48;
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
      background: #be123c;
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
      .page-break {
        page-break-after: always;
        break-after: page;
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
      border-bottom: 2px solid #e11d48;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      color: #e11d48;
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
    .week-header {
      background: #1e293b;
      color: #fff;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-top: 14px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 10px;
    }
    th {
      background: #e2e8f0;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
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
    .badge-status {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 9px;
    }
    .status-approved { background: #dcfce7; color: #15803d; }
    .status-pending { background: #fef3c7; color: #b45309; }
    .status-ready { background: #e0e7ff; color: #4338ca; }
    .headline-box {
      font-weight: 700;
      color: #e11d48;
      margin-bottom: 2px;
    }
    .title-box {
      font-size: 9.5px;
      color: #64748b;
    }
    .angle-box {
      font-size: 9.5px;
      color: #334155;
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
      border-left: 3px solid #e11d48;
      background: #fff1f2;
      font-size: 9.5px;
      color: #9f1239;
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="font-weight:700; font-size:14px;">BULBTEK VIỆT NAM — XUẤT BẢN KẾ HOẠCH NỘI DUNG</span>
      <span style="font-size:12px; color:#94a3b8;">(Khổ in chuẩn: A4 Ngang / Landscape)</span>
    </div>
    <div style="display:flex; align-items:center; gap:10px;">
      <button class="no-print-btn" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
        Lưu Dưới Dạng PDF / In Kế Hoạch
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
 * Xuất bản kế hoạch Content Product Planning dạng PDF
 */
export function exportProductPlanPdf(
  month: number,
  year: number,
  items: ContentItem[],
  categoriesMap: Record<string, string>
) {
  const fbCount = items.filter(i => i.channel === 'Facebook').length;
  const tiktokCount = items.filter(i => i.channel === 'TikTok').length;
  const aiReadyCount = items.filter(i => i.facebookCaption || i.tiktokCaption).length;
  const approvedCount = items.filter(i => i.status === 'Approved').length;
  const weeks = groupByWeek(items);

  let weeksHtml = '';
  let globalIndex = 1;

  weeks.forEach(w => {
    if (w.items.length === 0) return;

    let rowsHtml = '';
    w.items.forEach(item => {
      const channelBadge = item.channel === 'Facebook'
        ? `<span class="badge-channel-fb">FB</span>`
        : `<span class="badge-channel-tt">TikTok</span>`;

      const statusBadge = item.status === 'Approved'
        ? `<span class="badge-status status-approved">Đã Duyệt</span>`
        : (item.facebookCaption || item.tiktokCaption)
          ? `<span class="badge-status status-ready">Sẵn Sàng</span>`
          : `<span class="badge-status status-pending">Chờ Viết</span>`;

      const catName = categoriesMap[item.categoryId] || item.categoryId || 'Sản phẩm';
      const headline = item.creativeHeadline || item.title;
      const angle = item.angleUsed || 'Tăng sáng an toàn, bám đường mưa đêm chuẩn Bulbtek';

      rowsHtml += `
        <tr>
          <td style="text-align:center; font-weight:700;">${globalIndex++}</td>
          <td style="font-weight:700; white-space:nowrap;">${formatDateDisplay(item.date)}</td>
          <td style="text-align:center;">${channelBadge}</td>
          <td>
            <div style="font-weight:800; color:#0f172a;">${item.productName}</div>
            <div style="font-size:9px; color:#64748b;">${item.productLine || ''}</div>
          </td>
          <td style="font-weight:600; color:#475569;">${catName}</td>
          <td>
            <div class="headline-box">“${headline}”</div>
            <div class="title-box">${item.title}</div>
          </td>
          <td>
            <div class="angle-box">${angle}</div>
          </td>
          <td style="font-weight:600; color:#334155;">${item.assigneeName || 'Linh'}</td>
          <td style="text-align:center;">${statusBadge}</td>
        </tr>
      `;
    });

    weeksHtml += `
      <div class="week-header">
        <span>📅 ${w.label}</span>
        <span style="font-size:10px; font-weight:600;">Tổng: ${w.items.length} bài đăng</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px; text-align:center;">STT</th>
            <th style="width:70px;">Ngày</th>
            <th style="width:45px; text-align:center;">Kênh</th>
            <th style="width:130px;">Sản Phẩm & Dòng</th>
            <th style="width:110px;">Danh Mục</th>
            <th style="width:260px;">Headline Sáng Tạo & Tiêu Đề</th>
            <th>Góc Tiếp Cận (Angle / Hook)</th>
            <th style="width:70px;">Phụ Trách</th>
            <th style="width:65px; text-align:center;">Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  });

  const fullHtml = `
    <div class="brand-header">
      <div>
        <h1 class="brand-title">BULBTEK VIỆT NAM — KẾ HOẠCH NỘI DUNG SẢN PHẨM</h1>
        <div class="brand-subtitle">CONTENT PRODUCT PLANNING • THÁNG ${month}/${year} • TĂNG SÁNG VĂN MINH</div>
      </div>
      <div class="meta-box">
        <div><strong>Ngày xuất bản:</strong> ${new Date().toLocaleDateString('vi-VN')}</div>
        <div><strong>Đơn vị:</strong> Phòng Marketing Bulbtek Việt Nam</div>
        <div><strong>Công cụ:</strong> AI Content Dashboard (React/Vite)</div>
      </div>
    </div>

    <div class="kpi-summary">
      <div class="kpi-card">
        <div class="kpi-label">Tổng Số Bài Lên Lịch</div>
        <div class="kpi-val" style="color:#e11d48;">${items.length} bài</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Phân Bổ Kênh</div>
        <div class="kpi-val">${fbCount} Facebook / ${tiktokCount} TikTok</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Tiến Độ AI Content</div>
        <div class="kpi-val" style="color:#2563eb;">${aiReadyCount} / ${items.length} bài sẵn sàng</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Đã Phê Duyệt</div>
        <div class="kpi-val" style="color:#16a34a;">${approvedCount} bài (${items.length > 0 ? Math.round(approvedCount / items.length * 100) : 0}%)</div>
      </div>
    </div>

    ${weeksHtml}

    <div class="compliance-box">
      <strong>⚠️ 3 NGUYÊN TẮC THƯƠNG HIỆU BULBTEK BẮT BUỘC TUÂN THỦ KHI TRIỂN KHAI BÀI VIẾT:</strong><br/>
      1. <strong>KHÔNG Chém Gió Ảo</strong>: 100% thông số đo kiểm quang học thực tế (Lux/Lumen), không dùng từ tuyệt đối phi khoa học.<br/>
      2. <strong>KHÔNG Cắt Trích Dây Điện</strong>: Luôn cam kết quy chuẩn cắm jack zin 100%, an toàn hệ thống điện xe và giữ trọn bảo hành hãng.<br/>
      3. <strong>KHÔNG Gây Chói Lóa</strong>: Đường cắt ánh sáng rõ nét, văn minh, bảo vệ phương tiện ngược chiều và an toàn giao thông.
    </div>

    <div class="footer-sign">
      <div>
        <div class="sign-role">Người Lập Kế Hoạch</div>
        <div class="sign-name">Content Creator</div>
      </div>
      <div>
        <div class="sign-role">Người Phê Duyệt</div>
        <div class="sign-name">Marketing Lead</div>
      </div>
      <div>
        <div class="sign-role">Xác Nhận Ban Giám Đốc</div>
        <div class="sign-name">COO / Giám Đốc Vận Hành</div>
      </div>
    </div>
  `;

  printHtmlDocument(`Ke_Hoach_Content_San_Pham_Thang_${month}_${year}_Bulbtek`, fullHtml);
}

/**
 * Xuất bản kế hoạch Content Branding Planning dạng PDF
 */
export function exportBrandingPlanPdf(
  month: number,
  year: number,
  items: ContentItem[],
  categoriesMap: Record<string, string>,
  channelRatios?: { fb: number; tiktok: number }
) {
  const fbCount = items.filter(i => i.channel === 'Facebook').length;
  const tiktokCount = items.filter(i => i.channel === 'TikTok').length;
  const brandPosts = items.filter(i => i.productLine !== 'Linh Vật Robot BU').length;
  const mascotPosts = items.filter(i => i.productLine === 'Linh Vật Robot BU').length;
  const readyCount = items.filter(i => i.facebookCaption || i.tiktokCaption).length;
  const weeks = groupByWeek(items);

  let weeksHtml = '';
  let globalIndex = 1;

  weeks.forEach(w => {
    if (w.items.length === 0) return;

    let rowsHtml = '';
    w.items.forEach(item => {
      const channelBadge = item.channel === 'Facebook'
        ? `<span class="badge-channel-fb">FB</span>`
        : `<span class="badge-channel-tt">TikTok</span>`;

      const isMascot = item.productLine === 'Linh Vật Robot BU';
      const lineBadge = isMascot
        ? `<span style="background:#fef3c7; color:#d97706; font-weight:800; padding:2px 6px; border-radius:4px; font-size:9px;">🤖 ROBOT BU</span>`
        : `<span style="background:#fee2e2; color:#dc2626; font-weight:800; padding:2px 6px; border-radius:4px; font-size:9px;">🛡️ BRANDING</span>`;

      const statusBadge = item.status === 'Approved'
        ? `<span class="badge-status status-approved">Đã Duyệt</span>`
        : (item.facebookCaption || item.tiktokCaption)
          ? `<span class="badge-status status-ready">Sẵn Sàng</span>`
          : `<span class="badge-status status-pending">Chờ Viết</span>`;

      const catName = categoriesMap[item.categoryId] || (isMascot ? 'Storytelling Linh Vật' : 'Triết Lý Thương Hiệu');
      const headline = item.creativeHeadline || item.title;
      const angle = item.angleUsed || (isMascot ? 'Kể chuyện cabin, hướng dẫn chỉnh đèn an toàn qua đèo' : 'Cam kết Bền Bỉ - Bền Vững - Bảo Vệ cùng Bulbtek');

      rowsHtml += `
        <tr>
          <td style="text-align:center; font-weight:700;">${globalIndex++}</td>
          <td style="font-weight:700; white-space:nowrap;">${formatDateDisplay(item.date)}</td>
          <td style="text-align:center;">${channelBadge}</td>
          <td style="text-align:center;">${lineBadge}</td>
          <td style="font-weight:600; color:#475569;">${catName}</td>
          <td>
            <div class="headline-box">“${headline}”</div>
            <div class="title-box">${item.title}</div>
          </td>
          <td>
            <div class="angle-box">${angle}</div>
          </td>
          <td style="font-weight:600; color:#334155;">${item.assigneeName || 'Linh'}</td>
          <td style="text-align:center;">${statusBadge}</td>
        </tr>
      `;
    });

    weeksHtml += `
      <div class="week-header" style="background:#d97706;">
        <span>📅 ${w.label}</span>
        <span style="font-size:10px; font-weight:600;">Tổng: ${w.items.length} bài thương hiệu</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px; text-align:center;">STT</th>
            <th style="width:70px;">Ngày</th>
            <th style="width:45px; text-align:center;">Kênh</th>
            <th style="width:85px; text-align:center;">Tuyến Bài</th>
            <th style="width:120px;">Danh Mục</th>
            <th style="width:270px;">Headline Thương Hiệu & Tiêu Đề</th>
            <th>Storyline / Angle Truyền Thông</th>
            <th style="width:70px;">Phụ Trách</th>
            <th style="width:65px; text-align:center;">Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  });

  const fbRatioText = channelRatios ? `${channelRatios.fb}% FB / ${channelRatios.tiktok}% TT` : `${fbCount} FB / ${tiktokCount} TT`;

  const fullHtml = `
    <div class="brand-header" style="border-bottom-color:#d97706;">
      <div>
        <h1 class="brand-title" style="color:#d97706;">BULBTEK VIỆT NAM — KẾ HOẠCH NỘI DUNG THƯƠNG HIỆU & ROBOT BU</h1>
        <div class="brand-subtitle">CONTENT BRANDING PLANNING • THÁNG ${month}/${year} • TRIẾT LÝ AN TOÀN & LINH VẬT ĐỒNG HÀNH</div>
      </div>
      <div class="meta-box">
        <div><strong>Ngày xuất bản:</strong> ${new Date().toLocaleDateString('vi-VN')}</div>
        <div><strong>Đơn vị:</strong> Phòng Marketing Bulbtek Việt Nam</div>
        <div><strong>Tỷ trọng phân bổ:</strong> ${fbRatioText}</div>
      </div>
    </div>

    <div class="kpi-summary">
      <div class="kpi-card">
        <div class="kpi-label">Tổng Số Bài Thương Hiệu</div>
        <div class="kpi-val" style="color:#d97706;">${items.length} bài</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Phân Bổ Tuyến Bài</div>
        <div class="kpi-val">${brandPosts} Branding / ${mascotPosts} Robot BU</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Kênh Xuất Bản</div>
        <div class="kpi-val">${fbCount} Facebook / ${tiktokCount} TikTok</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Tiến Độ AI Content</div>
        <div class="kpi-val" style="color:#16a34a;">${readyCount} / ${items.length} bài sẵn sàng</div>
      </div>
    </div>

    ${weeksHtml}

    <div class="compliance-box" style="border-left-color:#d97706; background:#fffbeb; color:#92400e;">
      <strong>🤖 TRIẾT LÝ & TONE GIỌNG THƯƠNG HIỆU BULBTEK & LINH VẬT ROBOT BU:</strong><br/>
      • <strong>Tuyến Branding</strong>: Tôn vinh "3 Giá Trị Cốt Lõi: Bền Bỉ – Bền Vững – Bảo Vệ", văn hóa lái xe an toàn, bảo chứng phòng Lab và bảo hành 3 năm đổi mới.<br/>
      • <strong>Tuyến Robot BU</strong>: Trợ thủ táp-lô thông minh, người bạn tin cậy của tài xế đường đêm. Giọng điệu ấm áp, ân cần, hóm hỉnh và am hiểu kỹ thuật xe cộ.
    </div>

    <div class="footer-sign">
      <div>
        <div class="sign-role">Người Lập Kế Hoạch</div>
        <div class="sign-name">Brand Content Specialist</div>
      </div>
      <div>
        <div class="sign-role">Người Phê Duyệt</div>
        <div class="sign-name">Marketing Lead</div>
      </div>
      <div>
        <div class="sign-role">Xác Nhận Ban Giám Đốc</div>
        <div class="sign-name">COO / Giám Đốc Vận Hành</div>
      </div>
    </div>
  `;

  printHtmlDocument(`Ke_Hoach_Content_Branding_Thang_${month}_${year}_Bulbtek`, fullHtml);
}
