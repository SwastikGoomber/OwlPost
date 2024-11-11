# OwlPost - Email Client Application

## Project Setup Guide

This guide provides step-by-step instructions to recreate the OwlPost email client application.

### Prerequisites
- VPS with Ubuntu 20.04+
- Domain name with DNS access
- Node.js v18+
- MongoDB
- Docker and Docker Compose
- SSL certificates

### Step 1: Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/owlpost.git
cd owlpost
```

2. Create project structure:
```bash
mkdir -p backend/src/{controllers,models,routes,middleware,utils}
mkdir -p frontend/src/{components,pages,store,services}
```

### Step 2: Backend Setup

1. Initialize backend:
```bash
cd backend
npm init -y
```

2. Install dependencies:
```bash
npm install express mongoose jsonwebtoken bcryptjs nodemailer cors dotenv imap mailparser
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
MONGODB_URI=mongodb://localhost:27017/owlpost
PORT=5000
JWT_SECRET=your_jwt_secret
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT_SMTP=465
EMAIL_PORT_IMAP=993
```

### Step 3: Frontend Setup

1. Create React application:
```bash
cd ../frontend
npx create-react-app . --template typescript
```

2. Install dependencies:
```bash
npm install @reduxjs/toolkit react-redux react-router-dom axios tailwindcss
```

3. Configure Tailwind:
```bash
npx tailwindcss init
```

### Step 4: Mail Server Setup

1. Create Mailu directory:
```bash
sudo mkdir -p /mailu
cd /mailu
```

2. Download configuration files:
```bash
# Get docker-compose.yml and mailu.env from setup.mailu.io
wget [configuration-url]/docker-compose.yml
wget [configuration-url]/mailu.env
```

3. Configure DNS records:
```
Type    Name    Value               Priority
A       mail    [Your VPS IP]       -
MX      @       mail.domain.com     10
TXT     @       v=spf1 mx -all      -
```

4. Start Mailu:
```bash
docker-compose up -d
```

5. Create admin account:
```bash
docker-compose exec admin flask mailu admin admin domain.com password
```

### Step 5: Application Configuration

1. Configure backend email settings:
```javascript
// backend/src/controllers/emailController.js
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

2. Set up frontend API configuration:
```typescript
// frontend/src/services/api.ts
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### Step 6: Deployment

1. Backend deployment:
```bash
cd backend
npm install
pm2 start src/index.js --name owlpost-backend
```

2. Frontend deployment:
```bash
cd frontend
npm install
npm run build
```

3. Configure Nginx:
```nginx
server {
    listen 80;
    server_name owlpost.domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name owlpost.domain.com;

    ssl_certificate /etc/letsencrypt/live/owlpost.domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/owlpost.domain.com/privkey.pem;

    location / {
        root /var/www/owlpost/frontend/build;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 7: Testing

1. Test email sending:
```bash
curl -X POST 'http://localhost:5000/api/emails' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "to": "test@domain.com",
    "subject": "Test Email",
    "text": "This is a test email"
  }'
```

2. Test email receiving:
```bash
curl -X GET 'http://localhost:5000/api/emails/folders' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Step 8: Maintenance

1. Monitor logs:
```bash
pm2 logs owlpost-backend
docker-compose logs -f
```

2. Backup data:
```bash
mongodump --db owlpost --out /backup/mongo/$(date +%Y%m%d)
```

3. Update SSL certificates:
```bash
certbot renew
```

## Troubleshooting

### Common Issues

1. Email Authentication Failures
- Check SMTP/IMAP credentials
- Verify SSL/TLS settings
- Check DNS records

2. Connection Issues
- Verify firewall settings
- Check port accessibility
- Confirm SSL certificate validity

3. Frontend Issues
- Clear browser cache
- Check console for errors
- Verify API endpoint configuration

## Additional Resources

- [Mailu Documentation](https://mailu.io/master/)
- [Node.js Documentation](https://nodejs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)

## License
This project is licensed under the MIT License.
