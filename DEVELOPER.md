# OwlPost - Developer Documentation

## Current Implementation Details

### Domain Configuration
- Domain: sileistar.me
- Email Service: Mailu
- Admin Account: admin@sileistar.me (password: powtayt0h)
- Test Account: swastik@sileistar.me (password: powtayt0h-)

### Server Details
- VPS Provider: OVH
- IP: [Your VPS IP]
- OS: Ubuntu 20.04
- RAM: 2GB
- Storage: 20GB SSD
- Node.js: v18.x

### Access Points
- Admin Panel: https://mail.sileistar.me/admin
- Webmail: https://mail.sileistar.me/webmail
- API: http://localhost:5000
- Frontend: http://localhost:3000

### Credentials
```
# Mailu Admin
Username: admin@sileistar.me
Password: powtayt0h

# Test Account
Email: swastik@sileistar.me
Mailu Password: powtayt0h-
App Password: powtayt0h

# MongoDB
Database: owlpost
URI: mongodb://localhost:27017/owlpost

# JWT
Secret: your_jwt_secret_here
```

### DNS Records
```
Type    Name    Value               Priority
A       mail    [Your VPS IP]       -
MX      @       mail.sileistar.me   10
TXT     @       v=spf1 mx -all      -
```

### Environment Files

#### Backend (.env)
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/owlpost
PORT=5000

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Email Server Configuration (Mailu)
EMAIL_HOST=mail.sileistar.me
EMAIL_PORT_SMTP=465
EMAIL_PORT_IMAP=993
EMAIL_USE_TLS=true
EMAIL_DOMAIN=sileistar.me

# SMTP Configuration
SMTP_HOST=mail.sileistar.me
SMTP_PORT=465
SMTP_SECURE=true

# Admin Configuration
ADMIN_EMAIL=admin@sileistar.me
ADMIN_PASSWORD=powtayt0h
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## Archive: Project Development History

### Phase 1: Initial Setup (November 2024)

#### 1. Project Structure Creation
```bash
mkdir OwlPost
cd OwlPost
mkdir backend frontend
git init
```

#### 2. Backend Setup
```bash
cd backend
npm init -y
npm install express mongoose jsonwebtoken bcryptjs nodemailer cors dotenv
```

#### 3. Frontend Setup
```bash
cd ../frontend
npx create-react-app . --template typescript
npm install @reduxjs/toolkit react-redux react-router-dom axios tailwindcss
```

### Phase 2: Email Server Evolution

#### 1. Initial Zoho Attempt
- Set up with sileistar.me domain
- SMTP worked but IMAP limited in free tier
- Had to abandon due to limitations

#### 2. Attempted Solutions
1. ForwardEmail.net
   - Free but limited features
   - Not suitable for our needs

2. Yandex.Mail
   - Required paid account
   - Abandoned due to cost

3. Mail-in-a-Box
   - Required fresh VPS
   - Too resource intensive

#### 3. Final Mailu Implementation
1. Initial Setup:
```bash
sudo mkdir -p /mailu
cd /mailu
```

2. Configuration:
```bash
# Download config files
wget https://setup.mailu.io/2024.06/file/[config-id]/docker-compose.yml
wget https://setup.mailu.io/2024.06/file/[config-id]/mailu.env
```

3. Start Services:
```bash
docker-compose up -d
```

4. Create Admin:
```bash
docker-compose exec admin flask mailu admin admin sileistar.me powtayt0h
```

### Phase 3: Integration Steps

#### 1. Email Controller Implementation
```javascript
const createSmtpTransport = (user) => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: user.email,
            pass: user.emailSettings.smtpPassword
        }
    });
};
```

#### 2. Test Account Creation
1. Created swastik@sileistar.me in Mailu
2. Set password: powtayt0h-
3. Created app account with password: powtayt0h

#### 3. Testing Process
```bash
# Test sending email
curl -X POST 'http://localhost:5000/api/emails' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TOKEN' \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "text": "Test email"
  }'

# Test getting folders
curl -X GET 'http://localhost:5000/api/emails/folders' \
  -H 'Authorization: Bearer TOKEN'
```

### Phase 4: Frontend Development

#### 1. Component Structure
```
frontend/src/
├── components/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── email/
│   │   ├── EmailList.tsx
│   │   └── ComposeEmail.tsx
│   └── layout/
│       └── Layout.tsx
└── pages/
    ├── EmailPage.tsx
    └── SettingsPage.tsx
```

#### 2. Redux Store Setup
```typescript
// store/slices/authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.token = action.payload.token;
    }
  }
});
```

### Phase 5: Testing & Debugging

#### 1. Authentication Issues
- Fixed token expiration
- Added proper error handling
- Implemented refresh tokens

#### 2. Email Issues
- Resolved SMTP authentication
- Fixed IMAP connection issues
- Added error logging

### Current Status

#### Working Features
- User registration/login ✓
- Email sending ✓
- Email receiving ✓
- Folder management ✓
- Email reading ✓

#### Known Issues
- Token refresh needed
- Rate limiting implementation pending
- Error handling improvements needed

### Next Steps

1. Frontend Improvements
- Implement dark theme
- Improve layout
- Add account creation feature

2. Backend Enhancements
- Add rate limiting
- Improve error handling
- Add email templates

3. Documentation
- Update API documentation
- Add deployment guide
- Improve troubleshooting guide

### Additional Notes

#### Security Considerations
- All passwords stored in this document
- Production passwords should be changed
- SSL certificates must be renewed

#### Development Tips
- Use PM2 for backend management
- Monitor Docker logs regularly
- Keep backups of MongoDB data

#### Useful Commands
```bash
# Restart backend
pm2 restart owlpost-backend

# Check Mailu logs
docker-compose logs -f

# Backup database
mongodump --db owlpost
