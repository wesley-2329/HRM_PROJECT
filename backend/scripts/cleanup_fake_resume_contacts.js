// Finds contact details the old resume parser invented (Bug 075): emails like applicant_<time>_<n>@example.com
// and the placeholder phone +91 98765 43210. DRY RUN by default — prints what it would change and writes nothing.
//   MONGODB_URI=... node scripts/cleanup_fake_resume_contacts.js            # report only
//   MONGODB_URI=... node scripts/cleanup_fake_resume_contacts.js --apply    # blank the fake values, re-check duplicates
require('dotenv').config();
const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { duplicateContactQuery } = require('../utils/contact');

const FAKE_EMAIL = /^applicant_\d+_\d+@example\.com$/i;
const FAKE_PHONE = /^\+91 98765 43210$/;
const APPLY = process.argv.includes('--apply');
const fake = { $or: [{ email: FAKE_EMAIL }, { phone: FAKE_PHONE }] };

(async () => {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Database: ${mongoose.connection.name}  Mode: ${APPLY ? 'APPLY' : 'dry run (no changes)'}`);
  const resumes = await ResumeAnalysis.find(fake);
  const cands = await Candidate.find(fake);
  console.log(`Resume analyses with invented contacts: ${resumes.length}`);
  console.log(`Candidates with invented contacts:      ${cands.length}`);
  for (const c of cands) {
    console.log(`  candidate ${c._id} ${FAKE_EMAIL.test(c.email) ? 'email' : ''} ${FAKE_PHONE.test(c.phone) ? 'phone' : ''}`);
    if (APPLY) await Candidate.updateOne({ _id: c._id }, { $set: { ...(FAKE_EMAIL.test(c.email) && { email: '' }), ...(FAKE_PHONE.test(c.phone) && { phone: '' }) } });
  }
  for (const r of resumes) {
    const email = FAKE_EMAIL.test(r.email) ? '' : r.email;
    const phone = FAKE_PHONE.test(r.phone) ? '' : r.phone;
    // Re-check the duplicate flag against real contact details only, ignoring the resume's own candidate
    const q = duplicateContactQuery(email, phone);
    const match = q ? await Candidate.findOne({ ...q, ...(r.candidateId && mongoose.isValidObjectId(r.candidateId) && { _id: { $ne: r.candidateId } }) }) : null;
    const change = r.isDuplicate !== !!match ? ` duplicate ${r.isDuplicate} -> ${!!match}` : '';
    console.log(`  resume ${r._id}${change}`);
    if (APPLY) await ResumeAnalysis.updateOne({ _id: r._id }, { $set: { email, phone, isDuplicate: !!match, duplicateCandidateId: match ? match._id : null } });
  }
  console.log(APPLY ? 'Done.' : 'Nothing was changed. Re-run with --apply to make these changes.');
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
