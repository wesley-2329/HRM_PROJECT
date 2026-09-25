const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Timesheet = require('../models/Timesheet');
const connectDB = require('../config/db');

dotenv.config();

const parseTimeStringToDate = (dateStr, timeStr, createdAt) => {
  if (!timeStr) return null;
  // If already an ISO string or Date object
  if (timeStr instanceof Date) return timeStr;
  if (typeof timeStr === 'string' && !isNaN(Date.parse(timeStr)) && timeStr.includes('T')) {
    return new Date(timeStr);
  }

  // If createdAt exists as a reliable UTC instant, prefer createdAt
  if (createdAt && !isNaN(new Date(createdAt).getTime())) {
    return { date: new Date(createdAt), uncertain: false };
  }

  // Ambiguous local time string (e.g. "09:05 AM") without timezone context
  return { date: new Date(), uncertain: true };
};

const runMigration = async () => {
  console.log('[Migration] Connecting to database...');
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error('[Migration Error] Database not connected. Aborting migration.');
    process.exit(1);
  }

  try {
    const records = await Timesheet.find({});
    console.log(`[Migration] Found ${records.length} timesheet records to audit.`);

    let updatedCount = 0;
    let uncertainCount = 0;

    for (const record of records) {
      let modified = false;

      // Handle clockIn
      if (typeof record.clockIn === 'string') {
        const parsedIn = parseTimeStringToDate(record.date, record.clockIn, record.createdAt);
        if (parsedIn) {
          record.clockIn = parsedIn.date;
          if (parsedIn.uncertain) {
            record.legacyTimezoneUncertain = true;
            uncertainCount++;
          }
          modified = true;
        }
      }

      // Handle clockOut
      if (record.clockOut && typeof record.clockOut === 'string') {
        const parsedOut = parseTimeStringToDate(record.date, record.clockOut, record.updatedAt || record.createdAt);
        if (parsedOut) {
          record.clockOut = parsedOut.date;
          if (parsedOut.uncertain) {
            record.legacyTimezoneUncertain = true;
          }
          modified = true;
        }
      }

      if (modified) {
        await record.save();
        updatedCount++;
      }
    }

    console.log(`[Migration Complete] Successfully migrated ${updatedCount} records (${uncertainCount} flagged as legacyTimezoneUncertain).`);
    process.exit(0);
  } catch (err) {
    console.error('[Migration Error]', err);
    process.exit(1);
  }
};

runMigration();
