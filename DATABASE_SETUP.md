# Database Setup Instructions

## Prerequisites

Make sure you have PostgreSQL installed on your machine.

### Check if PostgreSQL is installed:
```bash
psql --version
```

If not installed, install it using Homebrew (macOS):
```bash
brew install postgresql@14
brew services start postgresql@14
```

Or download from: https://www.postgresql.org/download/

## Database Setup Steps

### 1. Create the Database

Open your terminal and run:
```bash
createdb lututor_db
```

### 2. Run the Schema

Navigate to the project root directory and execute the schema file:
```bash
cd /path/to/COMP330-LUSocialApp
psql -d lututor_db -f backend/database/schema.sql
```

### 3. Verify Database Creation

Check if the database was created successfully:
```bash
psql -d lututor_db -c "\dt"
```

You should see the following tables:
- users
- profiles
- tutor_listings
- bookings
- reviews

### 4. Create Test User (Optional but Recommended)

Create a test account for immediate testing:
```bash
psql -d lututor_db -c "INSERT INTO users (email, password_hash, role, is_verified) VALUES ('test@university.edu', '\$2b\$10\$0YSBAW.H7cUJxfb1zhW2v.iKEhXjkyv/xWaC9caJIzwKSPpTdpOg.', 'student', true);"
```

## Running the Application

### Start the Backend:
```bash
cd backend
npm install
npm run dev
```

The backend should start on `http://localhost:4000`

You should see:
```
✅ Connected to PostgreSQL database
✅ Database connected at: [timestamp]
🚀 API running on http://localhost:4000
```

### Start the Frontend:
```bash
cd frontend
npm install
npm start
```

The frontend should open automatically at `http://localhost:3000`

## Testing the Application

Once both servers are running:

### Option 1: Use Test Account (Quick Testing)

A pre-created test account is available for immediate testing:

**Test Credentials:**
- **Email:** `test@university.edu`
- **Password:** `Test1234`
- **Role:** Student

Simply go to http://localhost:3000/login and use these credentials.

### Option 2: Register New Account

1. **Register**: Go to http://localhost:3000/register
   - Use a `.edu` email address
   - Password must have 8+ characters with uppercase, lowercase, and number
   
2. **Login**: Go to http://localhost:3000/login
   - Use the credentials you just created

3. **Dashboard**: After login, you'll be redirected to the dashboard

### Create Additional Test Users

To create more test users manually:

```bash
# Generate a password hash
cd backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123', 10, (err, hash) => console.log(hash));"

# Insert the user (replace HASH with the generated hash)
psql -d lututor_db -c "INSERT INTO users (email, password_hash, role, is_verified) VALUES ('user@test.edu', 'HASH', 'student', true);"
```

## Troubleshooting

### Error: "database 'lututor_db' does not exist"
- Run: `createdb lututor_db`
- Then run the schema: `psql -d lututor_db -f backend/database/schema.sql`

### Error: "Cannot find module 'bcrypt'" or similar
- Run: `cd backend && npm install`

### Error: Connection refused (PostgreSQL not running)
- Start PostgreSQL: `brew services start postgresql@14`
- Or check your PostgreSQL service status

### Reset Database (if needed)
To drop and recreate the database:
```bash
dropdb lututor_db
createdb lututor_db
psql -d lututor_db -f backend/database/schema.sql
```

Don't forget to recreate the test user if you reset the database!

## Database Configuration

The database connection is configured in `backend/src/db/connection.js`:
- Default connection: `postgresql://localhost/lututor_db`
- Can be overridden with `DATABASE_URL` environment variable

## Notes

- This is a **local development database** - data is only stored on your machine
- The database persists between server restarts
- Each team member needs to set up their own local database
- Don't commit database files to Git (already in .gitignore)
- The test account password meets all requirements: 8+ chars, uppercase, lowercase, number
