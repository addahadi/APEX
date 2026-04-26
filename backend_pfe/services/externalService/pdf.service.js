import PDFDocument from 'pdfkit';

/* ═══════════════════════════════════════════════════════════════════════════════
   PDF Generation Service — Professional Estimation Report
   ═══════════════════════════════════════════════════════════════════════════════ */

const MARGIN = 48;
const COLORS = {
  headerBg:    '#0f172a',
  primary:     '#2563eb',
  primaryDark: '#1e40af',
  text:        '#1e293b',
  muted:       '#64748b',
  light:       '#94a3b8',
  border:      '#cbd5db',
  panelBg:     '#f8fafc',
  tableHead:   '#e2e8f0',
  rowAlt:      '#f1f5f9',
  success:     '#059669',
  danger:      '#dc2626',
  white:       '#ffffff',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function ensureSpace(doc, needed = 30) {
  const bottom = doc.page.height - doc.page.margins.bottom - 30; // reserve footer
  if (doc.y + needed > bottom) doc.addPage();
}

function n(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function fmt(value, decimals = 2) {
  return n(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatMoney(value) {
  return `${fmt(value)} DZD`;
}

function asText(value) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(asText).join(', ');
  try { return JSON.stringify(value); } catch { return String(value); }
}

function pickName(obj, enKey = 'material_name_en', arKey = 'material_name_ar', fallbackKey = 'material_name') {
  if (!obj) return '-';
  return obj[enKey] || obj[arKey] || obj[fallbackKey] || '-';
}

function parseJsonSafe(value) {
  if (value == null) return {};
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return { raw: value }; }
  }
  if (typeof value === 'object') return value;
  return { value };
}

// ── Page Footer (page numbers) ──────────────────────────────────────────────

function addFooter(doc) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const pageW = doc.page.width;
    const y = doc.page.height - doc.page.margins.bottom - 10;
    doc.save();
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.light)
      .text(`Page ${i + 1} of ${range.count}`, 0, y, { width: pageW, align: 'center' });
    // Divider line above footer
    doc.moveTo(MARGIN, y - 6).lineTo(pageW - MARGIN, y - 6)
      .strokeColor(COLORS.border).lineWidth(0.5).stroke();
    doc.restore();
  }
}

// ── Drawing Primitives ──────────────────────────────────────────────────────

function drawReportHeader(doc, data) {
  const w = doc.page.width - MARGIN * 2;
  const startY = doc.y;

  // Dark banner
  doc.save();
  doc.roundedRect(MARGIN, startY, w, 80, 8).fill(COLORS.headerBg);
  doc.restore();

  // Title
  doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(22)
    .text('Estimation Report', MARGIN + 20, startY + 16, { width: w - 40 });

  // Subtitle
  doc.fillColor('#94a3b8').font('Helvetica').fontSize(10)
    .text(data.projectName || 'Untitled Project', MARGIN + 20, startY + 46, { width: w / 2 });

  // Date badge (right side)
  doc.fillColor('#94a3b8').font('Helvetica').fontSize(9)
    .text(`Generated: ${data.date || new Date().toLocaleDateString()}`, MARGIN + 20, startY + 62, {
      width: w - 40, align: 'right',
    });

  doc.y = startY + 94;

  // Project info card
  doc.save();
  doc.roundedRect(MARGIN, doc.y, w, 70, 6)
    .fillAndStroke(COLORS.panelBg, COLORS.border);
  doc.restore();

  const lx = MARGIN + 16;
  const rx = MARGIN + w * 0.55;
  let ty = doc.y + 12;

  // Row 1
  doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8);
  doc.text('PROJECT', lx, ty, { lineBreak: false });
  doc.fillColor(COLORS.text).font('Helvetica').fontSize(10);
  doc.text(data.projectName || 'N/A', lx + 60, ty, { width: w * 0.4, lineBreak: false });

  doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8);
  doc.text('STATUS', rx, ty, { lineBreak: false });
  doc.fillColor(COLORS.text).font('Helvetica').fontSize(10);
  doc.text(data.projectStatus || '-', rx + 60, ty, { width: w * 0.3, lineBreak: false });

  ty += 22;

  // Row 2
  doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8);
  doc.text('CREATED', lx, ty, { lineBreak: false });
  doc.fillColor(COLORS.text).font('Helvetica').fontSize(10);
  doc.text(data.projectCreatedAt ? new Date(data.projectCreatedAt).toLocaleDateString() : '-', lx + 60, ty, { lineBreak: false });

  doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8);
  doc.text('SEGMENTS', rx, ty, { lineBreak: false });
  doc.fillColor(COLORS.text).font('Helvetica').fontSize(10);
  doc.text(String((data.leaf_calculations || []).length), rx + 60, ty, { lineBreak: false });

  doc.x = MARGIN;
  doc.y = ty + 34;

  // Description
  if (data.projectDescription) {
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(9)
      .text(data.projectDescription, MARGIN, doc.y, { width: w });
    doc.y += 10;
  }
}

function drawSectionBanner(doc, text, index) {
  ensureSpace(doc, 36);
  const w = doc.page.width - MARGIN * 2;

  doc.y += 6;
  doc.save();
  doc.roundedRect(MARGIN, doc.y, w, 28, 5).fill(COLORS.primary);
  doc.restore();

  doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(12)
    .text(text, MARGIN + 12, doc.y + 7, { width: w - 24 });

  doc.y += 36;
}

function drawKeyValuePair(doc, label, value) {
  ensureSpace(doc, 18);
  doc.font('Helvetica-Bold').fillColor(COLORS.muted).fontSize(9)
    .text(`${label}:`, MARGIN + 8, doc.y, { continued: true, width: 120 });
  doc.font('Helvetica').fillColor(COLORS.text).fontSize(9)
    .text(`  ${value || '-'}`);
  doc.y += 2;
}

function drawInputsTable(doc, rows) {
  if (!rows || rows.length === 0) return;

  ensureSpace(doc, 50);
  doc.font('Helvetica-Bold').fillColor(COLORS.text).fontSize(10)
    .text('Input Parameters', MARGIN + 8, doc.y);
  doc.y += 8;

  const w = doc.page.width - MARGIN * 2;
  const colName = w * 0.55;
  const colVal  = w - colName;
  const rowH = 22;

  // Table header
  const drawHead = () => {
    ensureSpace(doc, rowH + 4);
    const hy = doc.y;
    doc.save();
    doc.rect(MARGIN, hy, w, rowH).fill(COLORS.tableHead);
    doc.restore();
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.text);
    doc.text('Parameter', MARGIN + 8, hy + 6, { width: colName - 16, lineBreak: false });
    doc.text('Value', MARGIN + colName + 8, hy + 6, { width: colVal - 16, lineBreak: false });
    doc.x = MARGIN;
    doc.y = hy + rowH;
  };

  drawHead();

  rows.forEach((row, i) => {
    if (doc.y + rowH > doc.page.height - doc.page.margins.bottom - 30) {
      doc.addPage();
      drawHead();
    }
    const ry = doc.y;
    doc.save();
    doc.rect(MARGIN, ry, w, rowH)
      .fillAndStroke(i % 2 === 0 ? COLORS.white : COLORS.rowAlt, COLORS.border);
    doc.restore();

    doc.font('Helvetica').fontSize(9).fillColor(COLORS.text);
    doc.text(asText(row.name), MARGIN + 8, ry + 6, { width: colName - 16, ellipsis: true, lineBreak: false });
    doc.text(asText(row.value), MARGIN + colName + 8, ry + 6, { width: colVal - 16, ellipsis: true, lineBreak: false });
    doc.x = MARGIN;
    doc.y = ry + rowH;
  });

  doc.y += 8;
}

function drawResultsTable(doc, rows) {
  if (!rows || rows.length === 0) return;

  ensureSpace(doc, 50);
  doc.font('Helvetica-Bold').fillColor(COLORS.text).fontSize(10)
    .text('Calculated Results', MARGIN + 8, doc.y);
  doc.y += 8;

  const w = doc.page.width - MARGIN * 2;
  const colName = w * 0.55;
  const colVal  = w - colName;
  const rowH = 22;

  const drawHead = () => {
    ensureSpace(doc, rowH + 4);
    const hy = doc.y;
    doc.save();
    doc.rect(MARGIN, hy, w, rowH).fill(COLORS.tableHead);
    doc.restore();
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.text);
    doc.text('Result', MARGIN + 8, hy + 6, { width: colName - 16, lineBreak: false });
    doc.text('Value', MARGIN + colName + 8, hy + 6, { width: colVal - 16, lineBreak: false });
    doc.x = MARGIN;
    doc.y = hy + rowH;
  };

  drawHead();

  rows.forEach((row, i) => {
    if (doc.y + rowH > doc.page.height - doc.page.margins.bottom - 30) {
      doc.addPage();
      drawHead();
    }
    const ry = doc.y;
    doc.save();
    doc.rect(MARGIN, ry, w, rowH)
      .fillAndStroke(i % 2 === 0 ? COLORS.white : COLORS.rowAlt, COLORS.border);
    doc.restore();

    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.primary);
    doc.text(asText(row.name), MARGIN + 8, ry + 6, { width: colName - 16, ellipsis: true, lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.text);
    doc.text(asText(row.value), MARGIN + colName + 8, ry + 6, { width: colVal - 16, ellipsis: true, lineBreak: false });
    doc.x = MARGIN;
    doc.y = ry + rowH;
  });

  doc.y += 8;
}

function drawMaterialsTable(doc, lines = []) {
  if (!Array.isArray(lines) || lines.length === 0) {
    ensureSpace(doc, 30);
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.muted)
      .text('No materials — pure formula calculation', MARGIN + 8, doc.y);
    doc.y += 16;
    return;
  }

  ensureSpace(doc, 60);
  doc.font('Helvetica-Bold').fillColor(COLORS.text).fontSize(10)
    .text('Material Resources', MARGIN + 8, doc.y);
  doc.y += 8;

  const w = doc.page.width - MARGIN * 2;
  // Columns: Material | Qty | Waste | Unit Price | Subtotal
  const colWidths = [0.32, 0.15, 0.13, 0.20, 0.20].map(r => Math.floor(w * r));
  // Adjust last col to fill remaining
  colWidths[colWidths.length - 1] = w - colWidths.slice(0, -1).reduce((a, b) => a + b, 0);
  const rowH = 24;
  const headers = ['Material', 'Quantity', 'Waste %', 'Unit Price', 'Subtotal'];

  const drawHead = () => {
    ensureSpace(doc, rowH + 4);
    const hy = doc.y;
    doc.save();
    doc.rect(MARGIN, hy, w, rowH).fill(COLORS.tableHead);
    doc.restore();

    let x = MARGIN;
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.text);
    headers.forEach((h, i) => {
      doc.text(h, x + 6, hy + 7, { width: colWidths[i] - 12, ellipsis: true, lineBreak: false });
      x += colWidths[i];
    });
    doc.x = MARGIN;
    doc.y = hy + rowH;
  };

  drawHead();

  lines.forEach((line, i) => {
    if (doc.y + rowH > doc.page.height - doc.page.margins.bottom - 30) {
      doc.addPage();
      drawHead();
    }

    const ry = doc.y;
    doc.save();
    doc.rect(MARGIN, ry, w, rowH)
      .fillAndStroke(i % 2 === 0 ? COLORS.white : COLORS.rowAlt, COLORS.border);
    doc.restore();

    const matName   = pickName(line, 'material_name_en', 'material_name_ar', 'material_name');
    const qty       = n(line.quantity_with_waste ?? line.quantity, 0);
    const unitSym   = line.unit_symbol || '';
    const wastePct  = `${(n(line.waste_factor_snapshot, 0) * 100).toFixed(0)}%`;
    const unitPrice = n(line.unit_price_snapshot, 0);
    const subtotal  = n(line.sub_total, 0);

    const cells = [
      matName,
      `${fmt(qty)} ${unitSym}`,
      wastePct,
      formatMoney(unitPrice),
      formatMoney(subtotal),
    ];

    let x = MARGIN;
    cells.forEach((cell, ci) => {
      const isLast = ci === cells.length - 1;
      doc.font(isLast ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(8.5)
        .fillColor(COLORS.text);
      doc.text(cell, x + 6, ry + 7, { width: colWidths[ci] - 12, ellipsis: true, lineBreak: false });
      x += colWidths[ci];
    });

    doc.x = MARGIN;
    doc.y = ry + rowH;
  });

  // Material subtotal row
  const matTotal = lines.reduce((s, l) => s + n(l.sub_total, 0), 0);
  const ty = doc.y;
  doc.save();
  doc.rect(MARGIN, ty, w, rowH).fill(COLORS.tableHead);
  doc.restore();
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.text);
  doc.text('Materials Total', MARGIN + 6, ty + 7, { width: w * 0.6, lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.success);
  doc.text(formatMoney(matTotal), MARGIN + 6, ty + 7, { width: w - 12, align: 'right', lineBreak: false });
  doc.x = MARGIN;
  doc.y = ty + rowH + 10;
}

function drawLeafTotal(doc, total) {
  ensureSpace(doc, 32);
  const w = doc.page.width - MARGIN * 2;

  doc.save();
  doc.roundedRect(MARGIN, doc.y, w, 28, 4)
    .fillAndStroke(COLORS.panelBg, COLORS.border);
  doc.restore();

  const ty = doc.y;
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.text);
  doc.text('Segment Total:', MARGIN + 12, ty + 8, { width: w * 0.5, lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.success);
  doc.text(formatMoney(total), MARGIN + 12, ty + 8, { width: w - 24, align: 'right', lineBreak: false });

  doc.x = MARGIN;
  doc.y = ty + 36;
}

function drawGrandTotal(doc, total) {
  ensureSpace(doc, 52);
  const w = doc.page.width - MARGIN * 2;

  // Divider
  doc.moveTo(MARGIN, doc.y).lineTo(doc.page.width - MARGIN, doc.y)
    .strokeColor(COLORS.border).lineWidth(1).stroke();
  doc.y += 12;

  // Grand total box
  doc.save();
  doc.roundedRect(MARGIN, doc.y, w, 40, 6).fill(COLORS.headerBg);
  doc.restore();

  const bty = doc.y;
  doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(13);
  doc.text('GRAND TOTAL', MARGIN + 16, bty + 12, { width: w * 0.4, lineBreak: false });
  doc.fillColor('#4ade80').font('Helvetica-Bold').fontSize(16);
  doc.text(formatMoney(total), MARGIN + 16, bty + 10, { width: w - 32, align: 'right', lineBreak: false });

  doc.x = MARGIN;
  doc.y = bty + 52;
}

// ── Input / Result Row Builders ─────────────────────────────────────────────

function toInputRows(leaf) {
  if (Array.isArray(leaf.input_values_display) && leaf.input_values_display.length > 0) {
    return leaf.input_values_display.map((entry) => ({
      name: entry.name || entry.key || '-',
      value: entry.unit ? `${asText(entry.value)} ${entry.unit}` : asText(entry.value),
    }));
  }
  const fv = parseJsonSafe(leaf.field_values);
  return Object.entries(fv).map(([key, value]) => ({ name: key, value: asText(value) }));
}

function toResultRows(leaf) {
  if (Array.isArray(leaf.result_values_display) && leaf.result_values_display.length > 0) {
    return leaf.result_values_display.map((entry) => ({
      name: entry.name || entry.key || '-',
      value: asText(entry.value),
    }));
  }
  const res = parseJsonSafe(leaf.results);
  return Object.entries(res).map(([key, value]) => ({
    name: key.replace(/_/g, ' '),
    value: asText(value),
  }));
}

// ── Main PDF Generators ─────────────────────────────────────────────────────

function generateDetailedProjectPdf(doc, data) {
  drawReportHeader(doc, data);

  const leaves = Array.isArray(data.leaf_calculations) ? data.leaf_calculations : [];

  leaves.forEach((leaf, index) => {
    const catName = leaf.category_name_en || leaf.category_name_ar || 'Category';
    drawSectionBanner(doc, `${index + 1}. ${catName}`, index);

    // Metadata
    const formulaName = leaf.formula_name_en || leaf.formula_name_ar || leaf.formula_name || '-';
    drawKeyValuePair(doc, 'Formula', formulaName);
    drawKeyValuePair(doc, 'Configuration', leaf.config_name || 'Default');
    drawKeyValuePair(doc, 'Calculated On', leaf.created_at ? new Date(leaf.created_at).toLocaleString() : '-');
    doc.y += 6;

    // Tables
    drawInputsTable(doc, toInputRows(leaf));
    drawResultsTable(doc, toResultRows(leaf));
    drawMaterialsTable(doc, leaf.material_lines || []);

    // Leaf total
    drawLeafTotal(doc, n(leaf.leaf_total, 0));
  });

  // Grand total
  drawGrandTotal(doc, n(data.total_cost, 0));
}

function generateLegacyPdf(doc, data) {
  drawReportHeader(doc, data);
  drawSectionBanner(doc, data.categoryName || 'Estimation', 0);

  const inputRows = Object.entries(parseJsonSafe(data.dimensions))
    .map(([key, value]) => ({ name: key, value: asText(value) }));
  drawInputsTable(doc, inputRows);

  const resultRows = (Array.isArray(data.intermediateResults) ? data.intermediateResults : [])
    .map((r) => ({
      name: r.label || r.output_key || 'result',
      value: r.unit ? `${asText(r.value)} ${r.unit}` : asText(r.value),
    }));
  drawResultsTable(doc, resultRows);

  drawMaterialsTable(doc, data.material_lines || []);
  drawGrandTotal(doc, n(data.total_cost, 0));
}

// ── Public API ──────────────────────────────────────────────────────────────

const generatePDF = (data) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: MARGIN,
      size: 'A4',
      bufferPages: true,   // needed for page numbering
      info: {
        Title: `Estimation Report - ${data?.projectName || 'Project'}`,
        Author: 'APEX Estimation Platform',
      },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    if (Array.isArray(data?.leaf_calculations) && data.leaf_calculations.length > 0) {
      generateDetailedProjectPdf(doc, data);
    } else {
      generateLegacyPdf(doc, data || {});
    }

    addFooter(doc);
    doc.end();
  });

export { generatePDF };
