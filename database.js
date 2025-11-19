import initSqlJs from 'sql.js';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = './lonesomenomore.db';
let db = null;

// Initialize database
export async function initDatabase() {
  const SQL = await initSqlJs();

  // Try to load existing database or create new one
  try {
    const filebuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(filebuffer);
    console.log('📊 Database loaded from file');
  } catch {
    db = new SQL.Database();
    console.log('📊 Creating new database');
    createTables();
    seedMockData();
    saveDatabase();
  }

  return db;
}

// Create tables
function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS loved_ones (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT,
      nickname TEXT,
      age INTEGER,
      phone_number TEXT,
      location TEXT,
      life_story TEXT,
      interests TEXT,
      health_info TEXT,
      communication_preferences TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      loved_one_id TEXT NOT NULL,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      duration INTEGER DEFAULT 0,
      summary TEXT,
      sentiment TEXT DEFAULT 'neutral',
      topics TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (loved_one_id) REFERENCES loved_ones(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    )
  `);

  console.log('✅ Database tables created');
}

// Seed mock data
function seedMockData() {
  const userId = 'user_1';
  const lovedOneId = 'loved_789xyz';

  db.run(
    `INSERT INTO users (id, email, first_name, last_name) VALUES (?, ?, ?, ?)`,
    [userId, 'test@lonesomenomore.com', 'Test', 'User']
  );

  db.run(
    `INSERT INTO loved_ones (id, user_id, first_name, last_name, nickname, age, phone_number, location, life_story, interests)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      lovedOneId,
      userId,
      'Mary',
      'Smith',
      'Mom',
      75,
      '(555) 987-6543',
      'Phoenix, AZ',
      'Elementary school teacher for 35 years. Loves gardening and spending time with family.',
      JSON.stringify(['Gardening', 'Reading', 'Family'])
    ]
  );

  console.log('✅ Mock data seeded');
}

// Save database to file
export function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Database operations
export function getUser(userId) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  stmt.bind([userId]);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return result;
}

export function getLovedOne(lovedOneId) {
  const stmt = db.prepare('SELECT * FROM loved_ones WHERE id = ?');
  stmt.bind([lovedOneId]);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return result;
}

export function getLovedOnesByUser(userId) {
  const stmt = db.prepare('SELECT * FROM loved_ones WHERE user_id = ?');
  stmt.bind([userId]);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function createConversation(lovedOneId, summary = '', sentiment = 'neutral') {
  const id = `conv_${uuidv4().substring(0, 8)}`;
  db.run(
    `INSERT INTO conversations (id, loved_one_id, summary, sentiment) VALUES (?, ?, ?, ?)`,
    [id, lovedOneId, summary, sentiment]
  );
  saveDatabase();
  return id;
}

export function getConversation(conversationId) {
  const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
  stmt.bind([conversationId]);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();

  if (result) {
    // Get messages for this conversation
    const msgStmt = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC');
    msgStmt.bind([conversationId]);
    const messages = [];
    while (msgStmt.step()) {
      messages.push(msgStmt.getAsObject());
    }
    msgStmt.free();
    result.messages = messages;
  }

  return result;
}

export function getConversations(lovedOneId, limit = 20, offset = 0) {
  const stmt = db.prepare(
    'SELECT * FROM conversations WHERE loved_one_id = ? ORDER BY date DESC LIMIT ? OFFSET ?'
  );
  stmt.bind([lovedOneId, limit, offset]);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function addMessage(conversationId, role, content) {
  const id = `msg_${uuidv4().substring(0, 8)}`;
  db.run(
    `INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)`,
    [id, conversationId, role, content]
  );
  saveDatabase();
  return id;
}

export function updateConversation(conversationId, updates) {
  const { summary, sentiment, duration } = updates;
  if (summary) {
    db.run('UPDATE conversations SET summary = ? WHERE id = ?', [summary, conversationId]);
  }
  if (sentiment) {
    db.run('UPDATE conversations SET sentiment = ? WHERE id = ?', [sentiment, conversationId]);
  }
  if (duration) {
    db.run('UPDATE conversations SET duration = ? WHERE id = ?', [duration, conversationId]);
  }
  saveDatabase();
}

export function createLovedOne(userId, data) {
  const id = `loved_${uuidv4().substring(0, 8)}`;
  db.run(
    `INSERT INTO loved_ones (
      id, user_id, first_name, last_name, nickname, age, phone_number, location,
      life_story, interests, health_info, communication_preferences
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      data.firstName,
      data.lastName,
      data.nickname,
      data.age,
      data.phoneNumber,
      data.location,
      JSON.stringify(data.lifeStory || {}),
      JSON.stringify(data.interests || {}),
      JSON.stringify(data.health || {}),
      JSON.stringify(data.communicationPreferences || {})
    ]
  );
  saveDatabase();
  return id;
}

export function updateLovedOne(lovedOneId, data) {
  // Simple update - extend as needed
  if (data.interests) {
    db.run('UPDATE loved_ones SET interests = ? WHERE id = ?', [
      JSON.stringify(data.interests),
      lovedOneId
    ]);
  }
  if (data.life_story) {
    db.run('UPDATE loved_ones SET life_story = ? WHERE id = ?', [
      JSON.stringify(data.life_story),
      lovedOneId
    ]);
  }
  saveDatabase();
}

export function getDashboardStats(lovedOneId) {
  // Get total conversations
  const countStmt = db.prepare('SELECT COUNT(*) as total FROM conversations WHERE loved_one_id = ?');
  countStmt.bind([lovedOneId]);
  const countResult = countStmt.step() ? countStmt.getAsObject() : { total: 0 };
  countStmt.free();

  // Get recent conversations
  const recentStmt = db.prepare(
    'SELECT * FROM conversations WHERE loved_one_id = ? ORDER BY date DESC LIMIT 5'
  );
  recentStmt.bind([lovedOneId]);
  const recent = [];
  while (recentStmt.step()) {
    recent.push(recentStmt.getAsObject());
  }
  recentStmt.free();

  // Calculate average sentiment (simplified)
  const sentiments = recent.map(c => c.sentiment);
  const posCount = sentiments.filter(s => s === 'positive').length;
  const avgMood = posCount > recent.length / 2 ? 'positive' : 'neutral';

  return {
    totalCalls: countResult.total,
    recentConversations: recent,
    averageMood: avgMood,
    currentStreak: countResult.total
  };
}

export { db };
