// ✅ FIX: unified email service used for both calculate and export flows.
// Was silently swallowing SMTP errors — now propagates them so callers can
// surface failure to the client (email_sent flag / X-Email-Sent header).

import nodemailer from 'nodemailer';

// إعدادات محرك البريد
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: process.env.EMAIL_USER ? {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  } : undefined, // fallback if undefined
});

/**
 * Send a PDF estimation report by email.
 *
 * @param {string} to         - recipient email address
 * @param {object} data       - estimation data (projectName, categoryName,
 *                              material_lines, service_lines, total_cost, …)
 * @param {Buffer|null} pdfBuffer - PDF attachment (optional)
 */
const sendEmail = async (to, data, pdfBuffer) => {

  // ── Build material rows ──────────────────────────────────────────────────
  const materialRows = (data.material_lines || [])
    .map(
      (item) => `
        <tr>
          <td style="border:1px solid #ddd; padding:8px;">
            ${item.material_name_en || item.material_name || ''}
          </td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">
            ${(item.quantity_with_waste ?? item.quantity ?? 0).toFixed(4)}
            ${item.unit_symbol || ''}
          </td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">
            ${(item.sub_total || 0).toFixed(2)} DZD
          </td>
        </tr>`
    )
    .join('');

  // ── Build service rows ───────────────────────────────────────────────────
  const serviceRows = (data.service_lines || [])
    .map(
      (svc) => `
        <tr>
          <td style="border:1px solid #ddd; padding:8px;">
            ${svc.service_name_en || svc.service_name || ''}
          </td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">
            ${(svc.quantity ?? 0).toFixed(4)} ${svc.unit_symbol || ''}
          </td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">
            ${(svc.sub_total || 0).toFixed(2)} DZD
          </td>
        </tr>`
    )
    .join('');

  const budgetLabel =
    data.budget_type === 'LOW'  ? '🟢 Low (Optimistic)'  :
    data.budget_type === 'HIGH' ? '🔴 High (Conservative)' :
                                  '🟡 Medium (Standard)';

  const htmlContent = `
    <div style="font-family:Arial,sans-serif; max-width:700px; margin:0 auto;
                border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">

      <!-- Header -->
      <div style="background:#1d4ed8; color:white; padding:24px;">
        <h2 style="margin:0;">📊 Estimation Report</h2>
        <p style="margin:6px 0 0; opacity:0.85;">
          ${data.projectName || data.categoryName || 'Project'}
        </p>
      </div>

      <!-- Meta -->
      <div style="padding:16px 24px; background:#f8fafc; border-bottom:1px solid #e2e8f0;">
        <table style="width:100%;">
          <tr>
            <td style="color:#64748b; font-size:13px;">Category</td>
            <td style="font-weight:bold;">${data.categoryName || '—'}</td>
            <td style="color:#64748b; font-size:13px;">Date</td>
            <td style="font-weight:bold;">${data.date || new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="color:#64748b; font-size:13px;">Budget Type</td>
            <td style="font-weight:bold;" colspan="3">${budgetLabel}</td>
          </tr>
        </table>
      </div>

      <!-- Materials -->
      ${materialRows ? `
      <div style="padding:24px;">
        <h3 style="color:#1e293b; margin:0 0 12px;">🧱 Materials</h3>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Material</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:right;">Quantity</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${materialRows}</tbody>
        </table>
      </div>` : ''}

      <!-- Services -->
      ${serviceRows ? `
      <div style="padding:0 24px 24px;">
        <h3 style="color:#1e293b; margin:0 0 12px;">🔧 Services</h3>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Service</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:right;">Quantity</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${serviceRows}</tbody>
        </table>
      </div>` : ''}

      <!-- Total -->
      <div style="padding:16px 24px; background:#1d4ed8; color:white; text-align:right;">
        <span style="font-size:18px; font-weight:bold;">
          Total: ${(data.total_cost || 0).toFixed(2)} DZD
        </span>
      </div>

      <!-- Footer -->
      <div style="padding:12px 24px; text-align:center; color:#94a3b8; font-size:12px;">
        © ${new Date().getFullYear()} APEX Smart Construction — جميع الحقوق محفوظة
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `📊 Estimation Report – ${data.projectName || data.categoryName || 'Project'}`,
    html:    htmlContent,
  };

  if (pdfBuffer && pdfBuffer.length > 0) {
    mailOptions.attachments = [
      {
        filename:    'Rapport_Estimation.pdf',
        content:     pdfBuffer,
        contentType: 'application/pdf',
      },
    ];
  }

  try {
    if (!process.env.EMAIL_USER) {
      console.log(`[MOCK EMAIL to ${to}] Subject: ${mailOptions.subject}`);
      return; // Skip real email logic in dev without env vars
    }
    await transporter.sendMail(mailOptions);
    console.log(`[sendEmail] Report sent to ${to}`);
  } catch (err) {
    console.error('[sendEmail] Error:', err.message);
    throw new Error(`Failed to send report email: ${err.message}`);
  }
};

export { sendEmail };
