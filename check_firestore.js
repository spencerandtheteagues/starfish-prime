
const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkCollections() {
  const collections = ['seniors', 'caregivers', 'medications', 'appointments'];
  
  for (const colName of collections) {
    console.log(`\n--- Collection: ${colName} ---`);
    try {
      const snapshot = await db.collection(colName).limit(5).get();
      if (snapshot.empty) {
        console.log('No documents found.');
        continue;
      }
      
      snapshot.forEach(doc => {
        console.log(`ID: ${doc.id}`);
        console.log(JSON.stringify(doc.data(), null, 2));
      });
    } catch (error) {
      console.error(`Error fetching ${colName}:`, error.message);
    }
  }
}

checkCollections().then(() => process.exit(0));
