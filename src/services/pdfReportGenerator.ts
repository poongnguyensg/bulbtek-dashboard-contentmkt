import { BrandGuideline, ContentItem } from '../types';
import { VietnameseHoliday } from '../data/vietnamHolidays';

/**
 * Trình tạo và xuất báo cáo PDF chuẩn khổ A4 dọc (Portrait)
 * Dùng để gửi lưu hành nội bộ, trình duyệt ban giám đốc hoặc in ấn vật lý.
 */

// Helper: mở cửa sổ in chuyên dụng hoặc fallback sang iframe nếu bị chặn popup
const triggerPrintDialog = (htmlContent: string, documentTitle: string) => {
  const printWindow = window.open('', '_blank', 'width=960,height=1080');
  
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.document.title = documentTitle;
    
    // Tự động kích hoạt hộp thoại in khi trang sẵn sàng
    printWindow.onload = () => {
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (e) {
          console.error('Print trigger error:', e);
        }
      }, 500);
    };
  } else {
    // Fallback: Tạo iframe ẩn nếu trình duyệt chặn cửa sổ popup
    let iframe = document.getElementById('pdf-print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'pdf-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }
    
    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      iframeDoc.title = documentTitle;
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 600);
    }
  }
};

// CSS chung chuẩn mực cho toàn bộ báo cáo PDF khổ A4 dọc
const getCommonPdfStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Montserrat:wght@600;700;800;900&display=swap');

  @page {
    size: A4 portrait;
    margin: 12mm 12mm 15mm 12mm;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1a1a1a;
    background-color: #ffffff;
    line-height: 1.5;
    margin: 0;
    padding: 0;
    font-size: 11.5px;
  }

  h1, h2, h3, h4, .font-heading {
    font-family: 'Montserrat', sans-serif;
  }

  .font-mono {
    font-family: 'JetBrains Mono', monospace;
  }

  /* Sticky Top Bar for Screen Viewing (Hidden in Print) */
  .screen-toolbar {
    position: sticky;
    top: 0;
    z-index: 9999;
    background: #121216;
    color: #ffffff;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    border-bottom: 2px solid #AF2024;
  }

  .screen-toolbar button {
    cursor: pointer;
    font-family: 'Be Vietnam Pro', sans-serif;
    font-size: 12px;
    font-weight: 700;
    padding: 8px 18px;
    border-radius: 8px;
    border: none;
    transition: all 0.2s;
  }

  .btn-print {
    background: #AF2024;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(175, 32, 36, 0.4);
  }

  .btn-print:hover {
    background: #8F171A;
  }

  .btn-close {
    background: #2a2a32;
    color: #e2e8f0;
    margin-left: 8px;
  }

  .btn-close:hover {
    background: #3f3f4e;
  }

  .report-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 16px 20px;
  }

  /* Header Section */
  .report-header {
    border-bottom: 2.5px solid #AF2024;
    padding-bottom: 14px;
    margin-bottom: 18px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .brand-logo-badge {
    display: inline-block;
    background: #AF2024;
    color: #ffffff;
    font-weight: 900;
    font-size: 16px;
    width: 34px;
    height: 34px;
    line-height: 34px;
    text-align: center;
    border-radius: 8px;
    margin-right: 10px;
    vertical-align: middle;
  }

  .badge-confidential {
    display: inline-block;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 4px;
    background: #FEF2F2;
    color: #991B1B;
    border: 1px solid #FCA5A5;
  }

  .section-box {
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 14px;
    background: #ffffff;
    page-break-inside: avoid;
  }

  .section-title {
    font-size: 13px;
    font-weight: 800;
    color: #AF2024;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 0;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #F1F5F9;
    padding-bottom: 6px;
  }

  /* Table styling */
  table.report-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    margin-top: 8px;
  }

  table.report-table th {
    background-color: #F8FAFC;
    color: #334155;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 10px;
    padding: 8px 10px;
    border: 1px solid #E2E8F0;
    text-align: left;
  }

  table.report-table td {
    padding: 8px 10px;
    border: 1px solid #E2E8F0;
    vertical-align: top;
  }

  table.report-table tr:nth-child(even) {
    background-color: #F8FAFC;
  }

  .tag {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
  }

  .tag-fb {
    background: #EFF6FF;
    color: #1D4ED8;
    border: 1px solid #BFDBFE;
  }

  .tag-tiktok {
    background: #F0FDFA;
    color: #0F766E;
    border: 1px solid #99F6E4;
  }

  .tag-approved {
    background: #ECFDF5;
    color: #047857;
    border: 1px solid #A7F3D0;
  }

  .tag-pending {
    background: #FFFBEB;
    color: #B45309;
    border: 1px solid #FDE68A;
  }

  .tag-draft {
    background: #F1F5F9;
    color: #475569;
    border: 1px solid #CBD5E1;
  }

  /* Color Swatches Grid */
  .color-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 8px;
  }

  .color-card {
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 8px 10px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    page-break-inside: avoid;
    background: #FAFAFA;
  }

  .color-swatch {
    width: 38px;
    height: 38px;
    border-radius: 6px;
    border: 1px solid #CBD5E1;
    flex-shrink: 0;
  }

  /* Signatures Box */
  .signatures-box {
    margin-top: 24px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    text-align: center;
    page-break-inside: avoid;
  }

  .signature-role {
    font-size: 11px;
    font-weight: 800;
    color: #1E293B;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .signature-note {
    font-size: 9.5px;
    color: #64748B;
    font-style: italic;
  }

  .signature-space {
    height: 55px;
  }

  .report-footer {
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px solid #E2E8F0;
    font-size: 9.5px;
    color: #64748B;
    display: flex;
    justify-content: space-between;
  }

  /* Print specific */
  @media print {
    .screen-toolbar {
      display: none !important;
    }
    .report-container {
      padding: 0 !important;
      max-width: 100% !important;
    }
    .page-break {
      page-break-before: always;
    }
  }
`;

/**
 * 1. XUẤT BÁO CÁO QUY CHUẨN THƯƠNG HIỆU BULBTEK VIỆT NAM (DẠNG DỌC A4)
 */
export const exportBrandIdentityPdf = (guideline: BrandGuideline) => {
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const primaryColors = guideline.colorPalette && guideline.colorPalette.length > 0 
    ? guideline.colorPalette 
    : [
        { id: 'p1', name: 'Đỏ BULBTEK', hex: '#AF2024', role: 'Primary Color', description: 'Màu nhận diện thương hiệu chủ đạo' },
        { id: 'p2', name: 'Đen Titan', hex: '#1A1A1A', role: 'Dark Cockpit', description: 'Nền buồng lái ban đêm huyền bí' },
        { id: 'p3', name: 'Trắng Tinh Khiết', hex: '#FFFFFF', role: 'White Contrast', description: 'Luồng ánh sáng thuần khiết' }
      ];

  const secondaryColors = guideline.secondaryColors && guideline.secondaryColors.length > 0
    ? guideline.secondaryColors
    : [
        { id: 's1', name: 'Vàng Phá Sương 3000K', hex: '#F59E0B', role: 'Bi Gầm / Phá Sương', description: 'Xuyên mưa bão, sương mù đèo dốc', opticalAnalysis: 'Bước sóng dài 580–590nm bám mặt đường gấp 3 lần dải sáng trắng.' },
        { id: 's2', name: 'Xanh Cyan BU Bot & Laser', hex: '#06B6D4', role: 'Mascot & High-Tech', description: 'Mắt LED Robot BU, tâm pha laser gom sáng', opticalAnalysis: 'Tương phản bổ trợ rực rỡ với Đỏ #AF2024.' },
        { id: 's3', name: 'Xám Titan Hợp Kim', hex: '#475569', role: 'Hardware Material', description: 'Vỏ nhôm tản nhiệt nguyên khối CNC, ống đồng kép', opticalAnalysis: 'Màu trung tính mô phỏng nhôm tản nhiệt ADC12.' },
        { id: 's4', name: 'Xanh Emerald Bảo Vệ', hex: '#10B981', role: 'Safe Driving / Warranty', description: 'Biểu tượng giá trị BẢO VỆ, bảo hành 3 năm', opticalAnalysis: 'Dải màu 520–550nm mang lại cảm giác bình tâm cho tài xế.' }
      ];

  const typography = guideline.typography;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Bao_Cao_Thuong_Hieu_Bulbtek_${currentDate.replace(/\//g, '_')}</title>
      <style>
        ${getCommonPdfStyles()}
      </style>
    </head>
    <body>
      <!-- Screen viewing floating bar -->
      <div class="screen-toolbar">
        <div>
          <strong style="font-size: 13px; font-family: 'Montserrat', sans-serif; letter-spacing: 0.5px;">
            BULBTEK VIỆT NAM • XUẤT BÁO CÁO THƯƠNG HIỆU KHỔ DỌC A4
          </strong>
          <div style="font-size: 10.5px; opacity: 0.8; margin-top: 2px;">
            Tài liệu quy chuẩn thương hiệu sẵn sàng lưu thành file PDF hoặc in ra giấy A4.
          </div>
        </div>
        <div>
          <button class="btn-print" onclick="window.print()">🖨️ Lưu Thành File PDF / In Ngay (A4 Dọc)</button>
          <button class="btn-close" onclick="window.close()">✖ Đóng Cửa Sổ</button>
        </div>
      </div>

      <div class="report-container">
        
        <!-- HEADER -->
        <div class="report-header">
          <div style="display: flex; align-items: center;">
            <div class="brand-logo-badge">B</div>
            <div>
              <div style="font-family: 'Montserrat', sans-serif; font-size: 17px; font-weight: 900; letter-spacing: -0.5px; color: #1a1a1a;">
                BULBTEK <span style="color: #AF2024;">VIỆT NAM</span>
              </div>
              <div style="font-size: 10.5px; color: #64748B; font-weight: 600;">
                Slogan: <strong style="color: #AF2024;">"An Toàn Hành Trình"</strong> • Trợ Thủ Đắc Lực Cho Bác Tài Việt
              </div>
            </div>
          </div>

          <div style="text-align: right;">
            <span class="badge-confidential">Lưu Hành Nội Bộ</span>
            <div style="font-size: 10px; color: #64748B; margin-top: 4px;">
              Ngày xuất: <strong>${currentDate}</strong> • Phiên bản v2.6
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 18px;">
          <h1 style="font-size: 18px; font-weight: 900; color: #1E293B; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Báo Cáo Quy Chuẩn Thương Hiệu & Hệ Thống Nhận Diện
          </h1>
          <p style="font-size: 11px; color: #64748B; margin: 4px 0 0 0;">
            Hệ thống triết lý cốt lõi, 3 giá trị, linh vật Robot BU, bảng màu quang học và brand typography guidelines.
          </p>
        </div>

        <!-- 1. TRIẾT LÝ & SỨ MỆNH -->
        <div class="section-box">
          <div class="section-title">
            1. Triết Lý "${guideline.philosophyTitle || 'An Toàn Hành Trình'}" & Sứ Mệnh Thương Hiệu
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div style="background: #FFF5F5; border: 1px solid #FED7D7; padding: 10px 12px; border-radius: 8px;">
              <strong style="color: #AF2024; font-size: 11px; display: block; margin-bottom: 4px;">
                🛡️ Triết Lý: "${guideline.philosophyTitle || 'An Toàn Hành Trình'}"
              </strong>
              <p style="font-size: 10.5px; margin: 0 0 6px 0; color: #4A5568;">
                ${guideline.philosophyDesc || 'Đèn ô tô không chỉ là phụ kiện trang trí mà là hệ thống phòng vệ chủ động bảo vệ tính mạng người cầm lái.'}
              </p>
              ${guideline.philosophyPoints?.map(p => `
                <div style="font-size: 10px; margin-top: 4px; color: #2D3748;">
                  • <strong>${p.title}:</strong> ${p.desc}
                </div>
              `).join('') || ''}
            </div>

            <div style="background: #F0F9FF; border: 1px solid #BAE6FD; padding: 10px 12px; border-radius: 8px;">
              <strong style="color: #0284C7; font-size: 11px; display: block; margin-bottom: 4px;">
                🤝 Sứ Mệnh: "${guideline.missionTitle || 'Trợ Thủ Đắc Lực Cho Bác Tài Việt'}"
              </strong>
              <p style="font-size: 10.5px; margin: 0 0 6px 0; color: #4A5568;">
                ${guideline.missionDesc || 'Phụng sự cộng đồng bác tài Việt Nam — tài xế xe tải đường dài, xe công nghệ, đến các gia đình trên vạn dặm.'}
              </p>
              ${guideline.missionPoints?.map(m => `
                <div style="font-size: 10px; margin-top: 4px; color: #2D3748;">
                  • <strong>${m.title}:</strong> ${m.desc}
                </div>
              `).join('') || ''}
            </div>
          </div>

          <!-- Nguyên tắc 3 KHÔNG -->
          <div style="margin-top: 10px; background: #FEF2F2; border: 1px solid #FECACA; padding: 8px 12px; border-radius: 8px;">
            <strong style="font-size: 10.5px; color: #991B1B; display: block; margin-bottom: 4px;">
              ⚠️ Quy Tắc Bắt Buộc (${guideline.threeNoRules?.length || 3} Điều Tuân Thủ):
            </strong>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 10px;">
              ${guideline.threeNoRules?.map(r => `
                <div>
                  <strong style="color: #AF2024;">${r.title}</strong>: ${r.desc}
                </div>
              `).join('') || ''}
            </div>
          </div>
        </div>

        <!-- 2. 3 GIÁ TRỊ CỐT LÕI -->
        <div class="section-box">
          <div class="section-title">
            2. ${guideline.coreValuePillars?.length || 3} Giá Trị Cốt Lõi: ${guideline.coreValuePillars?.map(v => v.title).join(' – ') || 'BỀN BỈ – BỀN VỮNG – BẢO VỆ'}
          </div>
          <div style="display: grid; grid-template-columns: repeat(${Math.min(guideline.coreValuePillars?.length || 3, 3)}, 1fr); gap: 10px;">
            ${guideline.coreValuePillars?.map((val, idx) => `
              <div style="border: 1px solid #E2E8F0; padding: 10px; border-radius: 8px; background: ${idx === 0 ? '#FFF5F5' : idx === 1 ? '#FFFBEB' : '#F0FDF4'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-size: 16px;">${val.icon}</span>
                  <span style="font-size: 9px; font-weight: 800; background: ${idx === 0 ? '#AF2024' : idx === 1 ? '#D97706' : '#059669'}; color: #fff; padding: 1px 5px; border-radius: 3px;">
                    ${val.subtitle || `Trụ cột ${idx + 1}`}
                  </span>
                </div>
                <strong style="font-size: 12px; font-family: 'Montserrat', sans-serif; display: block; color: #1E293B;">
                  ${val.title}
                </strong>
                <p style="font-size: 10px; color: #475569; margin: 4px 0 6px 0;">
                  ${val.desc}
                </p>
                <div style="border-top: 1px solid rgba(0,0,0,0.06); padding-top: 4px; font-size: 9.5px; color: #334155;">
                  ${val.bullets.map(b => `<div style="margin-top: 2px;">✓ ${b}</div>`).join('')}
                </div>
              </div>
            `).join('') || ''}
          </div>
        </div>

        <!-- 3. LINH VẬT ROBOT BU -->
        <div class="section-box">
          <div class="section-title">
            3. Linh Vật Robot BU — Đại Sứ Tăng Sáng Của Bác Tài
          </div>
          <div style="display: grid; grid-template-columns: 220px 1fr; gap: 14px; align-items: center;">
            <div style="text-align: center; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; background: #F8FAFC;">
              ${guideline.mascotImage ? `
                <img src="${guideline.mascotImage}" alt="Robot BU" style="max-height: 100px; max-width: 100%; object-fit: contain; border-radius: 6px;" />
              ` : `
                <div style="width: 70px; height: 70px; margin: 0 auto; background: #121216; border: 2px solid #06B6D4; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #06B6D4; font-size: 28px;">
                  🤖
                </div>
              `}
              <div style="font-family: 'Montserrat', sans-serif; font-weight: 900; font-size: 13px; margin-top: 6px; color: #1E293B;">
                ROBOT BU
              </div>
              <div style="font-size: 9.5px; color: #AF2024; font-weight: 700;">
                Đại Sứ Tăng Sáng Chính Thức
              </div>
            </div>

            <div style="font-size: 10.5px; line-height: 1.6;">
              <div>• <strong>Tính cách:</strong> Chân thành, hóm hỉnh, am hiểu sâu về ô tô và đèn tăng sáng.</div>
              <div>• <strong>Giọng điệu (Tone):</strong> Gần gũi cánh tài xế Việt ("Bác tài", "Xế cưng", "Ôm vô lăng", "Vạn dặm bình an").</div>
              <div>• <strong>Tỷ lệ phân bổ vàng:</strong> <span style="color: #AF2024; font-weight: 700;">70% Lý tính</span> (thông số, bám đường, kỹ thuật) + <span style="color: #0284C7; font-weight: 700;">30% Cảm xúc</span> (hành trình, gia đình, tâm sự).</div>
              <div>• <strong>4 Tuyến bài:</strong> Nhật ký mưa bão • Đột nhập phòng Lab R&D • Góc Bác tài hỏi - BU trả lời • Chúc vạn dặm bình an.</div>
            </div>
          </div>
        </div>

        <!-- PAGE BREAK CHO TRANG 2 NẾU IN ẤN -->
        <div class="page-break"></div>

        <!-- 4. BỘ QUY CHUẨN MÀU SẮC & TRUYỀN THÔNG -->
        <div class="section-box">
          <div class="section-title">
            4. Bộ Quy Chuẩn Nhận Diện Màu Sắc & Kênh Truyền Thông
          </div>
          
          <!-- 4.1 Bảng Màu Nhận Diện Chính -->
          <strong style="font-size: 11px; color: #1E293B; display: block; margin-bottom: 6px;">
            4.1. Bảng Màu Nhận Diện Chính (Primary Palette):
          </strong>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
            ${primaryColors.map(c => `
              <div style="border: 1px solid #E2E8F0; padding: 8px; border-radius: 6px; display: flex; align-items: center; gap: 8px; background: #fff;">
                <div style="width: 32px; height: 32px; border-radius: 6px; background-color: ${c.hex}; border: 1px solid #CBD5E1; flex-shrink: 0;"></div>
                <div style="font-size: 10px; overflow: hidden;">
                  <strong style="display: block; color: #1E293B;">${c.name}</strong>
                  <span class="font-mono" style="font-size: 9.5px; font-weight: 700; color: #AF2024;">${c.hex}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- 4.2 Bảng Màu Phụ Phối Hợp & Quang Học -->
          <strong style="font-size: 11px; color: #1E293B; display: block; margin-bottom: 6px;">
            4.2. Bảng Màu Phụ Phối Hợp Dựa Trên Màu Chính (Secondary Palette & Optical Analysis):
          </strong>
          <div class="color-grid">
            ${secondaryColors.map(c => `
              <div class="color-card">
                <div class="color-swatch" style="background-color: ${c.hex};"></div>
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 11px; color: #1E293B;">${c.name}</strong>
                    <span class="font-mono" style="font-size: 9.5px; font-weight: 700;">${c.hex}</span>
                  </div>
                  <div style="font-size: 9.5px; color: #64748B; margin: 1px 0;">Vai trò: ${c.role}</div>
                  <div style="font-size: 9px; color: #334155; line-height: 1.4;">${c.description}</div>
                  ${c.opticalAnalysis ? `
                    <div style="font-size: 8.5px; color: #AF2024; margin-top: 3px; font-style: italic;">
                      🔬 Quang học: ${c.opticalAnalysis}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Kênh truyền thông & Hashtags -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; padding-top: 10px; border-top: 1px dashed #E2E8F0;">
            <div style="font-size: 10px;">
              <strong style="color: #1D4ED8;">Facebook (16 bài / tháng - T2, T4, T6, T7):</strong>
              <div class="font-mono" style="font-size: 9px; color: #AF2024; font-weight: 700; margin-top: 2px;">
                ${guideline.fbHashtags}
              </div>
            </div>
            <div style="font-size: 10px;">
              <strong style="color: #0F766E;">TikTok (10 bài / tháng - T3, T5, CN):</strong>
              <div class="font-mono" style="font-size: 9px; color: #0F766E; font-weight: 700; margin-top: 2px;">
                ${guideline.tiktokHashtags}
              </div>
            </div>
          </div>
        </div>

        <!-- 5. BRAND TYPOGRAPHY GUIDELINES -->
        <div class="section-box">
          <div class="section-title">
            5. Brand Typography Guidelines (Quy Chuẩn Kiểu Chữ Bulbtek)
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 10px;">
            <div style="border: 1px solid #E2E8F0; padding: 8px 10px; border-radius: 6px;">
              <span style="font-size: 8.5px; font-weight: 800; background: #AF2024; color: #fff; padding: 1px 4px; border-radius: 3px;">
                HEADLINE
              </span>
              <h4 style="font-size: 14px; font-weight: 900; margin: 4px 0 2px 0; font-family: 'Montserrat', sans-serif;">
                ${typography?.headlineFont || 'Montserrat'}
              </h4>
              <div style="font-size: 9px; color: #64748B;">Weights: 700, 800, 900</div>
              <div style="font-size: 9px; color: #334155; margin-top: 3px;">Tiêu đề banner, slogan, tên sản phẩm.</div>
            </div>

            <div style="border: 1px solid #E2E8F0; padding: 8px 10px; border-radius: 6px;">
              <span style="font-size: 8.5px; font-weight: 800; background: #1D4ED8; color: #fff; padding: 1px 4px; border-radius: 3px;">
                BODY TEXT
              </span>
              <h4 style="font-size: 14px; font-weight: 700; margin: 4px 0 2px 0;">
                ${typography?.bodyFont || 'Be Vietnam Pro'}
              </h4>
              <div style="font-size: 9px; color: #64748B;">Weights: 400, 500, 600</div>
              <div style="font-size: 9px; color: #334155; margin-top: 3px;">Nội dung bài viết Facebook, kịch bản video.</div>
            </div>

            <div style="border: 1px solid #E2E8F0; padding: 8px 10px; border-radius: 6px;">
              <span style="font-size: 8.5px; font-weight: 800; background: #059669; color: #fff; padding: 1px 4px; border-radius: 3px;">
                SPECS / MONO
              </span>
              <h4 class="font-mono" style="font-size: 14px; font-weight: 700; margin: 4px 0 2px 0;">
                ${typography?.codeFont || 'JetBrains Mono'}
              </h4>
              <div style="font-size: 9px; color: #64748B;">Weights: 500, 700</div>
              <div style="font-size: 9px; color: #334155; margin-top: 3px;">Thông số quang học: Lux, Lumens, Watt, Kelvin.</div>
            </div>
          </div>

          <!-- Hierarchy Table -->
          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 25%;">Cấp bậc</th>
                <th style="width: 20%;">Kích cỡ</th>
                <th style="width: 20%;">Phông & Trọng số</th>
                <th style="width: 35%;">Áp dụng thực tế</th>
              </tr>
            </thead>
            <tbody>
              ${typography?.fontHierarchy?.map(tier => `
                <tr>
                  <td><strong>${tier.level}</strong></td>
                  <td class="font-mono">${tier.size}</td>
                  <td>${tier.fontFamily} (${tier.weight})</td>
                  <td style="color: #475569;">${tier.example}</td>
                </tr>
              `).join('') || `
                <tr><td>H1 Hero Title</td><td class="font-mono">32px – 48px</td><td>Montserrat (Black 900)</td><td>AN TOÀN HÀNH TRÌNH</td></tr>
                <tr><td>H2 Section</td><td class="font-mono">20px – 28px</td><td>Montserrat (Bold 700)</td><td>BI LED MONSTER & ULTRA LASER</td></tr>
                <tr><td>Body Text</td><td class="font-mono">14px – 15px</td><td>Be Vietnam Pro (Regular 400)</td><td>Trợ thủ đắc lực cùng bác tài ôm vô lăng xuyên màn đêm.</td></tr>
                <tr><td>Specs Badge</td><td class="font-mono">11px – 13px</td><td>JetBrains Mono (Bold 700)</td><td>65W • 12,000 LM • 5500K</td></tr>
              `}
            </tbody>
          </table>
        </div>

        <!-- CHỮ KÝ PHÊ DUYỆT NỘI BỘ -->
        <div class="signatures-box">
          <div>
            <div class="signature-role">Người Lập Báo Cáo</div>
            <div class="signature-note">Marketing Executive / Creator</div>
            <div class="signature-space"></div>
            <div style="border-top: 1px solid #CBD5E1; padding-top: 4px; font-weight: 700;">
              Linh (Content Creator)
            </div>
          </div>

          <div>
            <div class="signature-role">Kiểm Duyệt Nội Dung</div>
            <div class="signature-note">Marketing Team Lead / Approver</div>
            <div class="signature-space"></div>
            <div style="border-top: 1px solid #CBD5E1; padding-top: 4px; font-weight: 700;">
              Tuấn Anh (Team Lead)
            </div>
          </div>

          <div>
            <div class="signature-role">Ban Giám Đốc Phê Duyệt</div>
            <div class="signature-note">Chief Operating Officer / Admin</div>
            <div class="signature-space"></div>
            <div style="border-top: 1px solid #CBD5E1; padding-top: 4px; font-weight: 700; color: #AF2024;">
              Philip (COO)
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="report-footer">
          <span>BULBTEK VIỆT NAM — Dashboard Content Marketing System</span>
          <span>Tài liệu mật lưu hành nội bộ • Trang 1/2</span>
          <span>In ngày: ${currentDate}</span>
        </div>

      </div>
    </body>
    </html>
  `;

  triggerPrintDialog(htmlContent, `Bao_Cao_Thuong_Hieu_Bulbtek_${currentDate.replace(/\//g, '_')}`);
};

/**
 * 2. XUẤT BÁO CÁO LỊCH CONTENT THÁNG (DẠNG DỌC A4)
 */
export interface CalendarReportParams {
  month: number;
  year: number;
  contents: ContentItem[];
  holidays?: VietnameseHoliday[];
  targetMonthlyGoal?: number;
}

export const exportContentCalendarPdf = (params: CalendarReportParams) => {
  const { month, year, contents, holidays = [], targetMonthlyGoal = 26 } = params;

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Lọc bài viết thuộc tháng và năm được chọn
  const monthString = String(month).padStart(2, '0');
  const monthPrefix = `${year}-${monthString}`;
  const monthContents = contents
    .filter(c => c.date && c.date.startsWith(monthPrefix))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Thống kê metrics
  const totalPosts = monthContents.length;
  const fbPosts = monthContents.filter(c => c.channel === 'Facebook' || c.channel === 'Cross-post').length;
  const tiktokPosts = monthContents.filter(c => c.channel === 'TikTok' || c.channel === 'Cross-post').length;
  const approvedPosts = monthContents.filter(c => c.status === 'Approved' || c.status === 'Published').length;
  const pendingPosts = monthContents.filter(c => c.status === 'Pending').length;
  const draftPosts = monthContents.filter(c => c.status === 'Draft').length;

  const completionRate = targetMonthlyGoal > 0 
    ? Math.min(100, Math.round((approvedPosts / targetMonthlyGoal) * 100))
    : 0;

  // Lấy các ngày lễ trong tháng
  const monthHolidays = holidays.filter(h => h.month === month);

  // Helper format thứ trong tuần
  const getDayOfWeekStr = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[d.getDay()];
    } catch {
      return '';
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Bao_Cao_Lich_Content_Thang_${month}_${year}_Bulbtek</title>
      <style>
        ${getCommonPdfStyles()}
      </style>
    </head>
    <body>
      <!-- Screen viewing toolbar -->
      <div class="screen-toolbar">
        <div>
          <strong style="font-size: 13px; font-family: 'Montserrat', sans-serif; letter-spacing: 0.5px;">
            BULBTEK VIỆT NAM • XUẤT BÁO CÁO LỊCH CONTENT THÁNG ${month}/${year} (KHỔ DỌC A4)
          </strong>
          <div style="font-size: 10.5px; opacity: 0.8; margin-top: 2px;">
            Bảng kế hoạch bài viết chi tiết để trình duyệt nội bộ hoặc gửi đại lý đối tác.
          </div>
        </div>
        <div>
          <button class="btn-print" onclick="window.print()">🖨️ Lưu Thành File PDF / In Ngay (A4 Dọc)</button>
          <button class="btn-close" onclick="window.close()">✖ Đóng Cửa Sổ</button>
        </div>
      </div>

      <div class="report-container">
        
        <!-- HEADER -->
        <div class="report-header">
          <div style="display: flex; align-items: center;">
            <div class="brand-logo-badge">B</div>
            <div>
              <div style="font-family: 'Montserrat', sans-serif; font-size: 17px; font-weight: 900; letter-spacing: -0.5px; color: #1a1a1a;">
                BULBTEK <span style="color: #AF2024;">VIỆT NAM</span>
              </div>
              <div style="font-size: 10.5px; color: #64748B; font-weight: 600;">
                Kế Hoạch Truyền Thông & Tiếp Thị Số • An Toàn Hành Trình
              </div>
            </div>
          </div>

          <div style="text-align: right;">
            <span class="badge-confidential">Lưu Hành Nội Bộ</span>
            <div style="font-size: 10px; color: #64748B; margin-top: 4px;">
              Kỳ báo cáo: <strong>Tháng ${month}/${year}</strong> • In ngày: ${currentDate}
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 16px;">
          <h1 style="font-size: 18px; font-weight: 900; color: #1E293B; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Báo Cáo Kế Hoạch Lịch Biên Tập Content — Tháng ${month}/${year}
          </h1>
          <p style="font-size: 11px; color: #64748B; margin: 4px 0 0 0;">
            Kế hoạch phân bổ bài đăng đa kênh Facebook & TikTok bám sát mục tiêu thương hiệu và sự kiện lễ tết.
          </p>
        </div>

        <!-- 1. TỔNG QUAN CHỈ SỐ TIẾN ĐỘ KPI -->
        <div class="section-box" style="padding: 12px 14px;">
          <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; text-align: center;">
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 8px; border-radius: 6px;">
              <span style="font-size: 9.5px; color: #64748B; text-transform: uppercase; font-weight: 700; display: block;">Tổng số bài</span>
              <strong style="font-size: 18px; color: #1E293B; font-family: 'Montserrat', sans-serif;">${totalPosts}</strong>
            </div>
            <div style="background: #EFF6FF; border: 1px solid #BFDBFE; padding: 8px; border-radius: 6px;">
              <span style="font-size: 9.5px; color: #1D4ED8; text-transform: uppercase; font-weight: 700; display: block;">Facebook</span>
              <strong style="font-size: 18px; color: #1D4ED8; font-family: 'Montserrat', sans-serif;">${fbPosts}</strong>
            </div>
            <div style="background: #F0FDFA; border: 1px solid #99F6E4; padding: 8px; border-radius: 6px;">
              <span style="font-size: 9.5px; color: #0F766E; text-transform: uppercase; font-weight: 700; display: block;">TikTok</span>
              <strong style="font-size: 18px; color: #0F766E; font-family: 'Montserrat', sans-serif;">${tiktokPosts}</strong>
            </div>
            <div style="background: #ECFDF5; border: 1px solid #A7F3D0; padding: 8px; border-radius: 6px;">
              <span style="font-size: 9.5px; color: #047857; text-transform: uppercase; font-weight: 700; display: block;">Đã duyệt</span>
              <strong style="font-size: 18px; color: #047857; font-family: 'Montserrat', sans-serif;">${approvedPosts}</strong>
            </div>
            <div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 8px; border-radius: 6px;">
              <span style="font-size: 9.5px; color: #B45309; text-transform: uppercase; font-weight: 700; display: block;">Chờ duyệt</span>
              <strong style="font-size: 18px; color: #B45309; font-family: 'Montserrat', sans-serif;">${pendingPosts}</strong>
            </div>
            <div style="background: #FFF5F5; border: 1px solid #FECACA; padding: 8px; border-radius: 6px;">
              <span style="font-size: 9.5px; color: #AF2024; text-transform: uppercase; font-weight: 700; display: block;">Tiến độ KPI</span>
              <strong style="font-size: 18px; color: #AF2024; font-family: 'Montserrat', sans-serif;">${completionRate}%</strong>
            </div>
          </div>
        </div>

        <!-- 2. SỰ KIỆN & NGÀY LỄ TRỌNG ĐIỂM -->
        ${monthHolidays.length > 0 ? `
          <div class="section-box" style="padding: 10px 14px; background: #FFFBEB; border-color: #FDE68A;">
            <div style="font-size: 11px; font-weight: 800; color: #B45309; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span>🎉</span>
              <span>Sự Kiện & Ngày Lễ Việt Nam Cần Bắt Nhịp Trong Tháng ${month}:</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 10.5px;">
              ${monthHolidays.map(h => `
                <div style="background: #fff; border: 1px solid #FCD34D; padding: 3px 8px; border-radius: 4px;">
                  <strong>${h.shortLabel}:</strong> <span style="color: #4B5563;">${h.suggestedAngle}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 3. BẢNG CHI TIẾT LỊCH CONTENT (KHỔ DỌC A4) -->
        <div class="section-box">
          <div class="section-title">
            Danh Sách Bài Viết Đã Lên Kế Hoạch (${monthContents.length} Bài)
          </div>

          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 12%;">Ngày</th>
                <th style="width: 11%;">Kênh</th>
                <th style="width: 42%;">Tiêu đề bài viết / Góc nội dung</th>
                <th style="width: 18%;">Sản phẩm / Tuyến</th>
                <th style="width: 17%;">Phụ trách & Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              ${monthContents.map(item => {
                const dayOfWeek = getDayOfWeekStr(item.date);
                const dayDisplay = item.date.split('-').slice(1).reverse().join('/');
                
                let statusBadge = `<span class="tag tag-draft">Bản nháp</span>`;
                if (item.status === 'Approved' || item.status === 'Published') {
                  statusBadge = `<span class="tag tag-approved">✓ Đã duyệt</span>`;
                } else if (item.status === 'Pending') {
                  statusBadge = `<span class="tag tag-pending">⏳ Chờ duyệt</span>`;
                } else if (item.status === 'Rejected') {
                  statusBadge = `<span class="tag" style="background:#FEF2F2; color:#DC2626; border:1px solid #FCA5A5;">✕ Từ chối</span>`;
                }

                let channelBadge = `<span class="tag tag-fb">Facebook</span>`;
                if (item.channel === 'TikTok') {
                  channelBadge = `<span class="tag tag-tiktok">TikTok</span>`;
                } else if (item.channel === 'Cross-post') {
                  channelBadge = `<span class="tag tag-fb">FB</span> <span class="tag tag-tiktok">TikTok</span>`;
                }

                return `
                  <tr style="page-break-inside: avoid;">
                    <td>
                      <strong style="color: #1E293B;">${dayDisplay}</strong>
                      <span style="display: block; font-size: 9.5px; color: #AF2024; font-weight: 700;">(${dayOfWeek})</span>
                    </td>
                    <td>
                      ${channelBadge}
                    </td>
                    <td>
                      <strong style="color: #0F172A; font-size: 11.5px; display: block; line-height: 1.35;">${item.title}</strong>
                      ${item.angleUsed ? `
                        <span style="font-size: 9.5px; color: #64748B; font-style: italic; display: block; margin-top: 2px;">
                          Góc bài: "${item.angleUsed}"
                        </span>
                      ` : ''}
                      ${item.highlightSpecs && item.highlightSpecs.length > 0 ? `
                        <div style="font-size: 9px; color: #0284C7; margin-top: 2px;">
                          Điểm nhấn: ${item.highlightSpecs.slice(0, 2).join(' • ')}
                        </div>
                      ` : ''}
                    </td>
                    <td>
                      <div style="font-weight: 700; color: #334155;">${item.productName}</div>
                      <span style="font-size: 9.5px; color: #64748B;">${item.productLine || ''}</span>
                    </td>
                    <td>
                      <div style="font-weight: 600; color: #1E293B; margin-bottom: 3px;">
                        ${item.assigneeName || 'Linh'}
                      </div>
                      ${statusBadge}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          ${monthContents.length === 0 ? `
            <div style="text-align: center; padding: 20px; color: #64748B; font-style: italic;">
              Chưa có bài viết nào được lên lịch cho tháng ${month}/${year}. Hãy thêm bài viết tại tab "Lịch Content".
            </div>
          ` : ''}
        </div>

        <!-- 4. CHỮ KÝ PHÊ DUYỆT BÁO CÁO -->
        <div class="signatures-box">
          <div>
            <div class="signature-role">Người Lập Kế Hoạch</div>
            <div class="signature-note">Marketing Executive / Creator</div>
            <div class="signature-space"></div>
            <div style="border-top: 1px solid #CBD5E1; padding-top: 4px; font-weight: 700;">
              Linh (Content Creator)
            </div>
          </div>

          <div>
            <div class="signature-role">Người Kiểm Duyệt</div>
            <div class="signature-note">Marketing Team Lead / Approver</div>
            <div class="signature-space"></div>
            <div style="border-top: 1px solid #CBD5E1; padding-top: 4px; font-weight: 700;">
              Tuấn Anh (Team Lead)
            </div>
          </div>

          <div>
            <div class="signature-role">Ban Giám Đốc Phê Duyệt</div>
            <div class="signature-note">Chief Operating Officer / Admin</div>
            <div class="signature-space"></div>
            <div style="border-top: 1px solid #CBD5E1; padding-top: 4px; font-weight: 700; color: #AF2024;">
              Philip (COO)
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="report-footer">
          <span>BULBTEK VIỆT NAM — Hệ thống Dashboard Content Marketing</span>
          <span>Kế hoạch truyền thông lưu hành nội bộ • Tháng ${month}/${year}</span>
          <span>In ngày: ${currentDate}</span>
        </div>

      </div>
    </body>
    </html>
  `;

  triggerPrintDialog(htmlContent, `Bao_Cao_Lich_Content_Thang_${month}_${year}_Bulbtek`);
};
