const mongoose = require('mongoose');

const NoDueCertificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true, unique: true },
  certificateNumber: { type: String, required: true }, // e.g. NDC-2026-001
  exitId: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: { type: String, required: true },
  lastWorkingDay: { type: Date, required: true },
  
  // Verification flags
  hrCleared: { type: Boolean, default: true },
  financeCleared: { type: Boolean, default: true },
  payrollCleared: { type: Boolean, default: true },
  itCleared: { type: Boolean, default: true },
  securityCleared: { type: Boolean, default: true },
  assetsCleared: { type: Boolean, default: true },
  complianceCleared: { type: Boolean, default: true },
  
  pdfUrl: { type: String, default: '' },
  issuedDate: { type: Date, default: Date.now },
  digitalSignatureHash: { type: String, default: 'SIG-VERIFIED-HASH' },
  qrVerificationCode: { type: String, default: 'QR-NDC-2026' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('NoDueCertificate', NoDueCertificateSchema);
