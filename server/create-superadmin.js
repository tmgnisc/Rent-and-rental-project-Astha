#!/usr/bin/env node

/**
 * Utility script to create a superadmin account
 * Usage: node create-superadmin.js [email] [password]
 * 
 * If email and password are not provided, it will use defaults:
 * - Email: superadmin@rentreturn.com
 * - Password: SuperAdmin@123
 */

const readline = require('readline');
const bcrypt = require('bcryptjs');
const { pool } = require('./src/config/db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createSuperAdmin = async (email, password) => {
  const connection = await pool.getConnection();
  try {
    // Check if superadmin already exists
    const [existing] = await connection.query(
      "SELECT id, email FROM users WHERE role = 'superadmin' AND email = ?",
      [email.toLowerCase()]
    );

    if (existing.length > 0) {
      console.log(`\n⚠️  Superadmin with email ${email} already exists!`);
      console.log(`   User ID: ${existing[0].id}`);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert superadmin
    await connection.query(
      `INSERT INTO users (name, email, password_hash, role, is_verified)
       VALUES (?, ?, ?, 'superadmin', 1)`,
      ['Super Admin', email.toLowerCase(), passwordHash]
    );

    console.log(`\n✅ Superadmin created successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`\n⚠️  Please change the password after first login for security.`);
  } catch (error) {
    console.error('\n❌ Error creating superadmin:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('   Email already exists in the database.');
    }
    process.exit(1);
  } finally {
    connection.release();
    rl.close();
  }
};

const main = async () => {
  console.log('\n🔐 Create Superadmin Account\n');

  // Get email and password from command line arguments or prompt
  const args = process.argv.slice(2);
  let email = args[0];
  let password = args[1];

  if (!email) {
    email = await question('Enter email (default: superadmin@rentreturn.com): ');
    email = email.trim() || 'superadmin@rentreturn.com';
  }

  if (!password) {
    password = await question('Enter password (default: SuperAdmin@123): ');
    password = password.trim() || 'SuperAdmin@123';
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('\n❌ Invalid email format!');
    process.exit(1);
  }

  // Validate password length
  if (password.length < 8) {
    console.error('\n❌ Password must be at least 8 characters long!');
    process.exit(1);
  }

  await createSuperAdmin(email, password);
  process.exit(0);
};

// Run the script
main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});



