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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_verified_by FOREIGN KEY (document_verified_by)
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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rentals_user_id FOREIGN KEY (user_id)
      REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rentals_product_id FOREIGN KEY (product_id)
      REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_rentals_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

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
