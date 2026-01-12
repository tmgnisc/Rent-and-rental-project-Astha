# Backend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Make sure you have a `.env` file in the `server/` directory with the following variables:
   ```
   DB_HOST=your_database_host
   DB_PORT=3306
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   PORT=5000
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=your_email@gmail.com
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

3. **If You Get "Duplicate Column" Error**

   If you see an error about duplicate columns (like `kyc_document_url`), the database table might have been partially created. You have two options:

   **Option A: Drop and Recreate Tables (⚠️ This will delete all data)**
   ```sql
   -- Connect to your MySQL database and run:
   DROP TABLE IF EXISTS rentals;
   DROP TABLE IF EXISTS password_reset_tokens;
   DROP TABLE IF EXISTS product_images;
   DROP TABLE IF EXISTS products;
   DROP TABLE IF EXISTS users;
   ```
   Then restart the server - it will recreate all tables.

   **Option B: Fix the Existing Table (Safe - keeps data)**
   ```sql
   -- Connect to your MySQL database and check if duplicate columns exist:
   DESCRIBE users;
   
   -- If you see duplicate kyc_document_url or kyc_status, you may need to manually fix it
   -- The migration code should handle this automatically now
   ```

4. **Start the Server**
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

5. **Create Superadmin Account**
   ```bash
   npm run create-superadmin
   ```
   
   Or with custom credentials:
   ```bash
   node create-superadmin.js your-email@example.com YourPassword123
   ```

## Troubleshooting

### "Tables are not ready" Error
- Check your database connection in `.env`
- Verify database exists
- Check MySQL is running
- Ensure user has CREATE/ALTER permissions

### "Duplicate column" Error
- The fix has been applied to the code
- If error persists, drop and recreate tables (see Option A above)
- Or manually check and fix the table structure

### Connection Refused
- Verify database host and port
- Check firewall settings
- Ensure MySQL service is running
- Verify credentials in `.env`

### Port Already in Use
- Change `PORT` in `.env` to a different port (e.g., 5001)
- Or stop the process using port 5000



