const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { db } = require('./env');

const pool = mysql.createPool({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  dateStrings: true,
  multipleStatements: false,
});

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user','vendor','admin','superadmin') NOT NULL DEFAULT 'user',
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    vendor_document_url VARCHAR(500),
    verification_status ENUM('pending','approved','rejected') DEFAULT 'approved',
    document_verified_by CHAR(36),
    kyc_document_url VARCHAR(500),
    kyc_status ENUM('unverified','pending','approved','rejected') DEFAULT 'unverified',
    kyc_verified_by CHAR(36),
    kyc_document_url VARCHAR(500),
    kyc_status ENUM('unverified','pending','approved') DEFAULT 'unverified',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_verified_by FOREIGN KEY (document_verified_by)
      REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_kyc_verified_by FOREIGN KEY (kyc_verified_by)
      REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const createProductsTable = `
  CREATE TABLE IF NOT EXISTS products (
    id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(160) NOT NULL,
    description TEXT,
    category ENUM('electronics','fashion','appliances','sports') NOT NULL,
    image_url VARCHAR(500),
    rental_price_per_day DECIMAL(10,2) NOT NULL,
    refundable_deposit DECIMAL(10,2) NOT NULL,
    status ENUM('available','rented','maintenance') NOT NULL DEFAULT 'available',
    vendor_id CHAR(36),
    vendor_name VARCHAR(160),
    vendor_rating DECIMAL(3,2) DEFAULT 0,
    specifications JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_category (category),
    INDEX idx_products_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const createProductImagesTable = `
  CREATE TABLE IF NOT EXISTS product_images (
    id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_images_product_id FOREIGN KEY (product_id)
      REFERENCES products(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const createRentalsTable = `
  CREATE TABLE IF NOT EXISTS rentals (
    id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('pending','active','completed','cancelled') NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    payment_intent_id VARCHAR(255),
    delivery_address VARCHAR(255),
    contact_phone VARCHAR(20),
    handed_over_at DATETIME NULL,
    returned_at DATETIME NULL,
    fine_amount DECIMAL(10,2) DEFAULT 0,
    daily_fine DECIMAL(10,2) DEFAULT 100,
    return_request_note TEXT,
    return_request_image VARCHAR(500),
    return_requested_at DATETIME,
    return_request_status ENUM('none','pending','approved','rejected') DEFAULT 'none',
    return_rejection_reason VARCHAR(150),
    return_rejection_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rentals_user_id FOREIGN KEY (user_id)
      REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rentals_product_id FOREIGN KEY (product_id)
      REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_rentals_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const migrateProductsTable = async (connection) => {
  try {
    // Check if specifications column exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'specifications'`,
      [db.database]
    );

    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE products
        ADD COLUMN specifications JSON AFTER vendor_rating
      `);
      // eslint-disable-next-line no-console
      console.info('✅ Migrated products table: Added specifications column');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  Products migration warning:', error.message);
  }
};

const migrateUsersTable = async (connection) => {
  try {
    // First, update the role ENUM to include 'vendor' if it doesn't already
    try {
      await connection.query(`
        ALTER TABLE users 
        MODIFY COLUMN role ENUM('user','vendor','admin','superadmin') NOT NULL DEFAULT 'user'
      `);
      // eslint-disable-next-line no-console
      console.info('✅ Updated role ENUM to include vendor');
    } catch (err) {
      // ENUM might already be correct, continue
    }

    // Check if vendor_document_url column exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'vendor_document_url'`,
      [db.database]
    );

    if (columns.length === 0) {
      // Add missing vendor-related columns one by one to handle errors gracefully
      try {
        await connection.query(`
          ALTER TABLE users
          ADD COLUMN vendor_document_url VARCHAR(500) AFTER is_verified
        `);
      } catch (err) {
        // Column might already exist, continue
      }

      try {
        await connection.query(`
          ALTER TABLE users
          ADD COLUMN verification_status ENUM('pending','approved','rejected') DEFAULT 'approved' AFTER vendor_document_url
        `);
      } catch (err) {
        // Column might already exist, continue
      }

      try {
        await connection.query(`
          ALTER TABLE users
          ADD COLUMN document_verified_by CHAR(36) AFTER verification_status
        `);
      } catch (err) {
        // Column might already exist, continue
      }

      // Check if foreign key constraint exists before adding
      const [constraints] = await connection.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND CONSTRAINT_NAME = 'fk_document_verified_by'`,
        [db.database]
      );

      if (constraints.length === 0) {
        try {
          await connection.query(`
            ALTER TABLE users
            ADD CONSTRAINT fk_document_verified_by 
            FOREIGN KEY (document_verified_by) REFERENCES users(id) ON DELETE SET NULL
          `);
        } catch (err) {
          // Foreign key might fail if there are existing records, ignore
        }
      }

      // eslint-disable-next-line no-console
      console.info('✅ Migrated users table: Added vendor-related columns');
    }

    const [kycDocumentColumn] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'kyc_document_url'`,
      [db.database]
    );

    if (kycDocumentColumn.length === 0) {
      try {
        await connection.query(`
          ALTER TABLE users
          ADD COLUMN kyc_document_url VARCHAR(500) AFTER document_verified_by
        `);
      } catch (err) {
        // ignore
      }
    }

    try {
      await connection.query(`
        ALTER TABLE users
        MODIFY COLUMN kyc_status ENUM('unverified','pending','approved','rejected') DEFAULT 'unverified'
      `);
    } catch (err) {
      // ignore
    }

    const [kycVerifiedByColumn] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'kyc_verified_by'`,
      [db.database]
    );

    if (kycVerifiedByColumn.length === 0) {
      try {
        await connection.query(`
          ALTER TABLE users
          ADD COLUMN kyc_verified_by CHAR(36) AFTER kyc_status
        `);
      } catch (err) {
        // ignore
      }

      try {
        await connection.query(`
          ALTER TABLE users
          ADD CONSTRAINT fk_kyc_verified_by FOREIGN KEY (kyc_verified_by)
          REFERENCES users(id) ON DELETE SET NULL
        `);
      } catch (err) {
        // ignore
      }

      // eslint-disable-next-line no-console
      console.info('✅ Migrated users table: Added KYC verification metadata');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  Migration warning:', error.message);
  }
};

const migrateRentalsTable = async (connection) => {
  try {
    const columnsToAdd = [
      { name: 'payment_intent_id', definition: 'VARCHAR(255)' },
      { name: 'delivery_address', definition: 'VARCHAR(255)' },
      { name: 'contact_phone', definition: 'VARCHAR(20)' },
      { name: 'handed_over_at', definition: 'DATETIME NULL' },
      { name: 'returned_at', definition: 'DATETIME NULL' },
      { name: 'fine_amount', definition: 'DECIMAL(10,2) DEFAULT 0' },
      { name: 'daily_fine', definition: 'DECIMAL(10,2) DEFAULT 100' },
      { name: 'return_request_note', definition: 'TEXT' },
      { name: 'return_request_image', definition: 'VARCHAR(500)' },
      { name: 'return_requested_at', definition: 'DATETIME' },
      {
        name: 'return_request_status',
        definition: `ENUM('none','pending','approved','rejected') DEFAULT 'none'`,
      },
      { name: 'return_rejection_reason', definition: 'VARCHAR(150)' },
      { name: 'return_rejection_note', definition: 'TEXT' },
    ];

    for (const column of columnsToAdd) {
      // eslint-disable-next-line no-await-in-loop
      const [existing] = await connection.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'rentals' AND COLUMN_NAME = ?`,
        [db.database, column.name]
      );
      if (existing.length === 0) {
        // eslint-disable-next-line no-await-in-loop
        await connection.query(
          `ALTER TABLE rentals ADD COLUMN ${column.name} ${column.definition}`
        );
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  Rentals migration warning:', error.message);
  }
};

const seedSuperAdmin = async (connection) => {
  const [existing] = await connection.query(
    "SELECT id FROM users WHERE role = 'superadmin' LIMIT 1"
  );

  if (existing.length === 0) {
    const passwordHash = await bcrypt.hash('SuperAdmin@123', 10);
    await connection.query(
      `INSERT INTO users (name, email, password_hash, role, is_verified)
       VALUES (:name, :email, :password_hash, 'superadmin', 1)`,
      {
        name: 'Super Admin',
        email: 'superadmin@rentreturn.com',
        password_hash: passwordHash,
      }
    );
    // eslint-disable-next-line no-console
    console.info('✅ Seeded default superadmin (superadmin@rentreturn.com / SuperAdmin@123)');
  }
};

const initDatabase = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query('SET NAMES utf8mb4');
    await connection.query(createUsersTable);
    await connection.query(createProductsTable);
    await connection.query(createProductImagesTable);
    await connection.query(createRentalsTable);
    await migrateUsersTable(connection);
    await migrateProductsTable(connection);
    await migrateRentalsTable(connection);
    await seedSuperAdmin(connection);
    // eslint-disable-next-line no-console
    console.info('✅ Database tables are ready.');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to initialize database tables:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  initDatabase,
};
