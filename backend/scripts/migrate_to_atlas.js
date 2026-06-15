/**
 * Database Migration Script: Local MongoDB to MongoDB Atlas
 * 
 * Instructions:
 * 1. Ensure your IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP Address).
 * 2. Run this script from the backend directory using: node scripts/migrate_to_atlas.js
 */

const path = require('path');
const dotenv = require('dotenv');
// Load environment variables from the backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('../node_modules/mongoose');
const MongoClient = mongoose.mongo.MongoClient;

const localUri = 'mongodb://localhost:27017/';
const remoteUri = process.env.MONGODB_URI;

if (!remoteUri || !remoteUri.startsWith('mongodb+srv://')) {
  console.error('Error: Please configure a valid MONGODB_URI in your backend/.env file first.');
  process.exit(1);
}

async function migrate() {
  console.log('Connecting to local database...');
  const localClient = await MongoClient.connect(localUri);
  
  const adminDb = localClient.db().admin();
  const dbs = await adminDb.listDatabases();
  console.log('Available databases locally:', dbs.databases.map(d => d.name));
  
  // Check 'test' database (Mongoose default)
  const localDbTest = localClient.db('test');
  const collectionsTest = await localDbTest.listCollections().toArray();
  
  // Check 'talentsphere' database
  const localDbTS = localClient.db('talentsphere');
  const collectionsTS = await localDbTS.listCollections().toArray();

  // Select source database based on which one has data
  const sourceDb = collectionsTest.length >= collectionsTS.length ? localDbTest : localDbTS;
  console.log(`\nSelected source database for migration: "${sourceDb.databaseName}"`);

  const activeCollections = await sourceDb.listCollections().toArray();
  console.log(`Found ${activeCollections.length} collections to migrate.`);

  console.log('\nConnecting to remote MongoDB Atlas database...');
  const remoteClient = await MongoClient.connect(remoteUri);
  const destDb = remoteClient.db(); // connects to database specified in MONGODB_URI
  console.log(`Connected to Atlas database: "${destDb.databaseName}"`);

  for (const colInfo of activeCollections) {
    const colName = colInfo.name;
    if (colName.startsWith('system.')) continue;

    console.log(`\nMigrating collection: "${colName}"...`);
    const sourceCol = sourceDb.collection(colName);
    const destCol = destDb.collection(colName);

    const docs = await sourceCol.find({}).toArray();
    console.log(`- Found ${docs.length} documents in local collection`);
    
    if (docs.length > 0) {
      // Clear destination first to prevent duplicates
      console.log(`- Clearing existing documents in Atlas collection "${colName}"`);
      await destCol.deleteMany({});
      
      const result = await destCol.insertMany(docs);
      console.log(`- Successfully migrated ${result.insertedCount} documents to Atlas`);
    } else {
      console.log(`- Collection is empty, skipping insert.`);
    }
  }

  console.log('\n=============================================');
  console.log('Database migration completed successfully!');
  console.log('=============================================');
  
  await localClient.close();
  await remoteClient.close();
}

migrate().catch(err => {
  console.error('\nMigration failed with error:');
  console.error(err);
  console.log('\nTroubleshooting Tip:');
  console.log('If you see an SSL / connection error (e.g. SSL alert number 80), it means your current');
  console.log('IP address is not whitelisted in your MongoDB Atlas cluster.');
  console.log('Go to MongoDB Atlas -> Network Access -> Add IP Address, and allow access (e.g. 0.0.0.0/0).');
});
