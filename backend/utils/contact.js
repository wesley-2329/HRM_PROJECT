// Contact normalisation for duplicate-candidate detection (Bug 075).
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

// Last 10 digits, so "+91 98765-43210" and "9876543210" compare equal; shorter numbers are too ambiguous to match on.
const phoneKey = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : '';
};

// Mongo filter matching a candidate by whichever contact details actually exist; null when there are none.
const duplicateContactQuery = (email, phone) => {
  const or = [];
  const e = normalizeEmail(email);
  if (e) or.push({ email: new RegExp(`^\\s*${escapeRegex(e)}\\s*$`, 'i') });
  const p = phoneKey(phone);
  if (p) or.push({ phone: new RegExp(`${p.split('').join('\\D*')}\\D*$`) });
  return or.length ? { $or: or } : null;
};

module.exports = { normalizeEmail, phoneKey, duplicateContactQuery };
