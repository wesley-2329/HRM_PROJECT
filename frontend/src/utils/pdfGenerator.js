/**
 * PDF 1.4 Binary Generator
 * Produces genuine, compliant PDF 1.4 binary files that open cleanly in Adobe Acrobat,
 * macOS Preview, and browser viewers without format corruption.
 */

function escapePdfText(str) {
  if (!str) return '';
  return String(str)
    .replace(/₹/g, 'Rs. ')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

export function generatePdfDocument({
  title = 'HR O Official Document',
  subtitle = 'Human Resources Management System',
  docNumber = '',
  date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
  recipient = '',
  metadata = [],
  sections = [],
  footer = 'HR O Enterprise Systems - Confirmed & Digitally Verified'
}) {
  const streamCommands = [];

  // Helper to add text
  let currentY = 790;
  const leftMargin = 50;

  // Header Banner Rectangle
  streamCommands.push('0.95 0.96 0.98 rg');
  streamCommands.push(`40 730 515 80 re f`);
  streamCommands.push('0.39 0.40 0.95 RG');
  streamCommands.push('2 w');
  streamCommands.push(`40 730 515 80 re S`);

  // Title
  streamCommands.push('BT');
  streamCommands.push('/F2 18 Tf');
  streamCommands.push('0.15 0.18 0.25 rg');
  streamCommands.push(`${leftMargin + 10} 775 Td`);
  streamCommands.push(`(${escapePdfText(title)}) Tj`);
  streamCommands.push('ET');

  // Subtitle
  streamCommands.push('BT');
  streamCommands.push('/F1 10 Tf');
  streamCommands.push('0.40 0.45 0.55 rg');
  streamCommands.push(`${leftMargin + 10} 755 Td`);
  streamCommands.push(`(${escapePdfText(subtitle)}) Tj`);
  streamCommands.push('ET');

  // Doc Number & Date
  streamCommands.push('BT');
  streamCommands.push('/F1 9 Tf');
  streamCommands.push('0.40 0.45 0.55 rg');
  if (docNumber) {
    streamCommands.push(`${leftMargin + 10} 738 Td`);
    streamCommands.push(`(Doc Ref: ${escapePdfText(docNumber)}  |  Date: ${escapePdfText(date)}) Tj`);
  } else {
    streamCommands.push(`${leftMargin + 10} 738 Td`);
    streamCommands.push(`(Date: ${escapePdfText(date)}) Tj`);
  }
  streamCommands.push('ET');

  currentY = 700;

  // Recipient if present
  if (recipient) {
    streamCommands.push('BT');
    streamCommands.push('/F2 11 Tf');
    streamCommands.push('0.15 0.18 0.25 rg');
    streamCommands.push(`${leftMargin} ${currentY} Td`);
    streamCommands.push(`(Issued To: ${escapePdfText(recipient)}) Tj`);
    streamCommands.push('ET');
    currentY -= 20;
  }

  // Metadata Grid
  if (metadata && metadata.length > 0) {
    streamCommands.push('0.98 0.98 0.99 rg');
    const metaHeight = Math.ceil(metadata.length / 2) * 18 + 12;
    streamCommands.push(`${leftMargin} ${currentY - metaHeight + 10} 495 ${metaHeight} re f`);
    streamCommands.push('0.85 0.88 0.92 RG');
    streamCommands.push('0.75 w');
    streamCommands.push(`${leftMargin} ${currentY - metaHeight + 10} 495 ${metaHeight} re S`);

    let metaY = currentY - 5;
    metadata.forEach((item, idx) => {
      const isLeft = (idx % 2 === 0);
      const posX = isLeft ? leftMargin + 10 : leftMargin + 250;
      streamCommands.push('BT');
      streamCommands.push('/F2 9 Tf');
      streamCommands.push('0.20 0.25 0.35 rg');
      streamCommands.push(`${posX} ${metaY} Td`);
      streamCommands.push(`(${escapePdfText(item.label)}: ) Tj`);
      streamCommands.push('/F1 9 Tf');
      streamCommands.push(`(${escapePdfText(item.value)}) Tj`);
      streamCommands.push('ET');
      if (!isLeft || idx === metadata.length - 1) {
        metaY -= 18;
      }
    });

    currentY -= (metaHeight + 15);
  }

  // Content Sections
  sections.forEach((sec) => {
    if (currentY < 120) return; // single page safety boundary

    if (sec.heading) {
      streamCommands.push('BT');
      streamCommands.push('/F2 12 Tf');
      streamCommands.push('0.18 0.22 0.35 rg');
      streamCommands.push(`${leftMargin} ${currentY} Td`);
      streamCommands.push(`(${escapePdfText(sec.heading)}) Tj`);
      streamCommands.push('ET');
      currentY -= 16;
    }

    if (sec.paragraphs) {
      sec.paragraphs.forEach((p) => {
        streamCommands.push('BT');
        streamCommands.push('/F1 9.5 Tf');
        streamCommands.push('0.25 0.28 0.35 rg');
        streamCommands.push(`${leftMargin} ${currentY} Td`);
        streamCommands.push(`(${escapePdfText(p)}) Tj`);
        streamCommands.push('ET');
        currentY -= 15;
      });
    }

    if (sec.table && sec.table.rows && sec.table.rows.length > 0) {
      const colWidths = sec.table.colWidths || [160, 160, 175];
      // Table Header
      streamCommands.push('0.92 0.94 0.98 rg');
      streamCommands.push(`${leftMargin} ${currentY - 14} 495 18 re f`);
      let colX = leftMargin + 6;
      sec.table.headers.forEach((h, hIdx) => {
        streamCommands.push('BT');
        streamCommands.push('/F2 8.5 Tf');
        streamCommands.push('0.20 0.25 0.35 rg');
        streamCommands.push(`${colX} ${currentY - 10} Td`);
        streamCommands.push(`(${escapePdfText(h)}) Tj`);
        streamCommands.push('ET');
        colX += (colWidths[hIdx] || 100);
      });
      currentY -= 18;

      // Table Rows
      sec.table.rows.forEach((row, rIdx) => {
        if (rIdx % 2 === 1) {
          streamCommands.push('0.98 0.98 0.99 rg');
          streamCommands.push(`${leftMargin} ${currentY - 12} 495 16 re f`);
        }
        let rX = leftMargin + 6;
        row.forEach((cell, cIdx) => {
          streamCommands.push('BT');
          streamCommands.push('/F1 8.5 Tf');
          streamCommands.push('0.25 0.28 0.35 rg');
          streamCommands.push(`${rX} ${currentY - 9} Td`);
          streamCommands.push(`(${escapePdfText(cell)}) Tj`);
          streamCommands.push('ET');
          rX += (colWidths[cIdx] || 100);
        });
        currentY -= 16;
      });
      currentY -= 10;
    }

    currentY -= 10;
  });

  // Footer Rule & Text
  streamCommands.push('0.85 0.88 0.92 RG');
  streamCommands.push('0.5 w');
  streamCommands.push(`50 60 495 0 re S`);
  streamCommands.push('BT');
  streamCommands.push('/F1 8 Tf');
  streamCommands.push('0.55 0.60 0.70 rg');
  streamCommands.push(`50 45 Td`);
  streamCommands.push(`(${escapePdfText(footer)}) Tj`);
  streamCommands.push('ET');

  const streamContent = streamCommands.join('\n');
  const streamLength = streamContent.length;

  const objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /MediaBox [0 0 595.28 841.89] /Contents 6 0 R >>\nendobj');
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');
  objects.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`);

  let offset = 0;
  let pdfString = '%PDF-1.4\n';
  offset = pdfString.length;

  const xref = ['xref', '0 7', '0000000000 65535 f '];
  objects.forEach((obj, idx) => {
    xref.push(String(offset).padStart(10, '0') + ' 00000 n ');
    pdfString += obj + '\n';
    offset = pdfString.length;
  });

  const xrefOffset = offset;
  pdfString += xref.join('\n') + '\n';
  pdfString += 'trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';

  return pdfString;
}

export function createPdfBlobUrl(params) {
  try {
    const pdfString = generatePdfDocument(params);
    const buffer = new Uint8Array(pdfString.length);
    for (let i = 0; i < pdfString.length; i++) {
      buffer[i] = pdfString.charCodeAt(i) & 0xff;
    }
    const blob = new Blob([buffer], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Failed to create PDF blob URL:', err);
    return null;
  }
}

export function openPdfDocumentInNewTab(params) {
  try {
    const url = createPdfBlobUrl(params);
    if (!url) return false;
    const win = window.open(url, '_blank');
    if (!win) {
      console.warn('Pop-up blocker intercepted PDF preview');
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return true;
  } catch (err) {
    console.error('Failed to open PDF in new tab:', err);
    return false;
  }
}

export function downloadPdfDocument(params, filename = 'document.pdf') {
  try {
    const pdfString = generatePdfDocument(params);
    const buffer = new Uint8Array(pdfString.length);
    for (let i = 0; i < pdfString.length; i++) {
      buffer[i] = pdfString.charCodeAt(i) & 0xff;
    }
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 2500);
    return true;
  } catch (err) {
    console.error('Failed to generate or download PDF:', err);
    return false;
  }
}

