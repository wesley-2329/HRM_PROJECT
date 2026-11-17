// Answers 400 naming the fields a form left empty, instead of saving a made-up value for them.
// fields: { bodyKey: 'Label shown to the user' }
const requireFields = (body, fields) => {
  const missing = Object.keys(fields).filter(k => body[k] === undefined || body[k] === null || String(body[k]).trim() === '');
  if (missing.length) {
    const err = new Error(`Please fill in: ${missing.map(k => fields[k]).join(', ')}.`);
    err.status = 400;
    throw err;
  }
};

module.exports = { requireFields };
