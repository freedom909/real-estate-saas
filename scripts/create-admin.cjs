const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/saas';
const MYSQL_CONFIG = {
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'princess',
  database: 'saas'
};

async function createAdmins() {
  // Connect to MongoDB to look up real user IDs
  const mongo = new MongoClient(MONGO_URI);
  await mongo.connect();
  const db = mongo.db();
  const usersCollection = db.collection('users');

  // Connect to MySQL for admin_users table
  const conn = await mysql.createConnection(MYSQL_CONFIG);

  const admins = [
    { email: 'minshukudemo@gmail.com', name: 'Demo User', role: 'SUPER_ADMIN' },
    { email: 'gifu0@outlook.com', name: 'Gifu User', role: 'SUPER_ADMIN' },
    { email: 'admin@minshuku.com', name: 'Admin User', role: 'SUPER_ADMIN' },
  ];

  for (const admin of admins) {
    // Look up the user's real MongoDB ID
    const user = await usersCollection.findOne({ email: admin.email });
    if (!user) {
      console.log(`SKIP: No user found in MongoDB for ${admin.email} — log in first via OAuth, then re-run this script`);
      continue;
    }

    const userId = user._id.toString();

    const [existing] = await conn.query('SELECT id FROM admin_users WHERE email = ?', [admin.email]);
    if (existing.length === 0) {
      await conn.query(
        'INSERT INTO admin_users (id, email, name, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [userId, admin.email, admin.name, admin.role, true]
      );
      console.log(`Created: ${admin.email} (id=${userId})`);
    } else if (existing[0].id !== userId) {
      // ID mismatch — update to the real user ID
      await conn.query('UPDATE admin_users SET id = ? WHERE email = ?', [userId, admin.email]);
      console.log(`Updated: ${admin.email} id from ${existing[0].id} → ${userId}`);
    } else {
      console.log(`Exists: ${admin.email} (id=${userId})`);
    }
  }

  const [rows] = await conn.query('SELECT id, email, name, role FROM admin_users');
  console.log('\nAll admin users:', rows);
  await conn.end();
  await mongo.close();
}

createAdmins().catch(console.error);
