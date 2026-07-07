const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'pgmanager.db');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  db.serialize(() => {
    // 1. Users (Students, Managers, Owners)
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      role TEXT DEFAULT 'student',
      pg_id INTEGER
    )`);

    // 2. PGs
    db.run(`CREATE TABLE IF NOT EXISTS pgs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      type TEXT, 
      facilities TEXT,
      owner_id INTEGER,
      FOREIGN KEY(owner_id) REFERENCES users(id)
    )`);

    // 3. Rooms
    db.run(`CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pg_id INTEGER,
      room_number TEXT NOT NULL,
      type TEXT, 
      price INTEGER,
      capacity INTEGER,
      occupied INTEGER DEFAULT 0,
      FOREIGN KEY(pg_id) REFERENCES pgs(id)
    )`);

    // 4. Bookings
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      room_id INTEGER,
      start_date TEXT,
      status TEXT DEFAULT 'active',
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(room_id) REFERENCES rooms(id)
    )`);

    // 5. Payments
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      amount INTEGER,
      type TEXT, 
      status TEXT DEFAULT 'paid',
      date TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // 6. Complaints
    db.run(`CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      description TEXT,
      status TEXT DEFAULT 'open',
      date TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // 7. Notices
    db.run(`CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pg_id INTEGER,
      title TEXT,
      content TEXT,
      date TEXT,
      FOREIGN KEY(pg_id) REFERENCES pgs(id)
    )`);
  });
};

const seedDb = () => {
  db.serialize(() => {
    db.get("SELECT COUNT(*) as count FROM pgs", (err, row) => {
      if (row && row.count === 0) {
        console.log("Seeding extensive dummy data for Manager and Owner...");
        
        // Users (Owner = 2, Manager = 3, Students = 1, 4, 5, 6)
        db.run(`INSERT INTO users (id, name, phone, email, role, pg_id) VALUES 
          (1, 'Aman Verma', '+91 9876543210', 'aman@example.com', 'student', 1),
          (2, 'Sandeep Singh', '+91 9999999999', 'sandeep@example.com', 'owner', NULL),
          (3, 'Rajesh Kumar', '+91 8888888888', 'rajesh@example.com', 'manager', 1),
          (4, 'Rohan Das', '+91 7777777777', 'rohan@example.com', 'student', 1),
          (5, 'Neha Sharma', '+91 6666666666', 'neha@example.com', 'student', 2),
          (6, 'Priya Singh', '+91 5555555555', 'priya@example.com', 'student', 2)
        `);

        // PGs (owned by Sandeep, ID: 2)
        db.run(`INSERT INTO pgs (id, name, address, type, facilities, owner_id) VALUES 
          (1, 'LPU Boys PG', 'Near LPU Gate 2', 'Boys', 'AC, WiFi, Laundry, Meals', 2),
          (2, 'LPU Girls PG', 'Near LPU Gate 1', 'Girls', 'AC, WiFi, Security, Meals', 2),
          (3, 'Emerald Suite PG', 'City Center', 'Unisex', 'AC, WiFi, Gym', 2),
          (4, 'Sapphire Residency', 'North Campus', 'Boys', 'AC, Meals', 2),
          (5, 'Ruby Heights', 'South Campus', 'Girls', 'AC, Security', 2),
          (6, 'Diamond Enclave', 'West Campus', 'Unisex', 'Premium, AC, Meals', 2)
        `);

        // Rooms
        db.run(`INSERT INTO rooms (id, pg_id, room_number, type, price, capacity, occupied) VALUES 
          (1, 1, '101', 'Non-AC', 6500, 2, 2),
          (2, 1, '102', 'AC', 8500, 2, 0),
          (3, 2, '201', 'AC', 9000, 2, 2),
          (4, 3, '301', 'AC', 12000, 1, 0),
          (5, 4, '401', 'Non-AC', 6000, 3, 3),
          (6, 5, '501', 'AC', 9500, 2, 1),
          (7, 6, '601', 'Premium', 15000, 1, 1)
        `); // Total Beds: 2+2+2+1+3+2+1 = 13. Occupied: 2+0+2+0+3+1+1 = 9. Vacant: 4.

        // Bookings (Matches Occupied counts)
        db.run(`INSERT INTO bookings (user_id, room_id, start_date, status) VALUES 
          (1, 1, '2023-08-01', 'active'),
          (4, 1, '2023-08-05', 'active'),
          (5, 3, '2023-09-01', 'active'),
          (6, 3, '2023-09-10', 'active')
        `);

        // Payments (Generating some "paid" and "pending" to simulate collection)
        const currentMonthStr = new Date().toISOString().slice(0, 7) + '-01T10:00:00Z'; // e.g. 2026-06-01
        
        db.run(`INSERT INTO payments (user_id, amount, type, status, date) VALUES 
          (1, 6500, 'Rent', 'paid', '${currentMonthStr}'),
          (4, 6500, 'Rent', 'pending', '${currentMonthStr}'),
          (5, 9000, 'Rent', 'paid', '${currentMonthStr}'),
          (6, 9000, 'Rent', 'paid', '${currentMonthStr}')
        `); // Collection: 6500 + 9000 + 9000 = 24500. Pending: 6500.

        // Add some historical payments to simulate trend
        const lastMonthStr = '2026-05-01T10:00:00Z';
        db.run(`INSERT INTO payments (user_id, amount, type, status, date) VALUES 
          (1, 6500, 'Rent', 'paid', '${lastMonthStr}'),
          (4, 6500, 'Rent', 'paid', '${lastMonthStr}'),
          (5, 9000, 'Rent', 'paid', '${lastMonthStr}')
        `); // Last month collection: 22000

        db.run(`INSERT INTO complaints (user_id, title, description, status, date) VALUES 
          (1, 'AC Not Cooling', 'The AC in room 101 is not cooling effectively.', 'open', '2026-06-15T12:00:00Z')
        `);

        db.run(`INSERT INTO notices (pg_id, title, content, date) VALUES 
          (1, 'Diwali Celebration', 'We will have a small get-together on Diwali night.', '2026-06-20T10:00:00Z')
        `);
      }
    });
  });
};

module.exports = { db, initDb, seedDb };
