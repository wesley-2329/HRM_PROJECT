const mongoose = require('mongoose');

const AssetReturnSchema = new mongoose.Schema({
  assetReturnId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  employeeId: { type: String, required: true },
  assetName: { type: String, required: true }, // Laptop, Mobile, SIM, Access Card, Locker Key, etc.
  assetSerialNo: { type: String, default: '' },
  category: { type: String, default: 'IT' },
  status: { type: String, enum: ['Assigned', 'Returned', 'Damaged', 'Missing'], default: 'Assigned' },
  recoveryAmount: { type: Number, default: 0 },
  remarks: { type: String, default: '' },
  verifiedBy: { type: String, default: '' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('AssetReturn', AssetReturnSchema);
