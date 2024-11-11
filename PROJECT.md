# OwlPost - Self-Hosted Email Client

## Overview
OwlPost is a modern email client application that provides a complete solution for managing email services. It includes a custom mail server implementation using industry-standard protocols and a modern web interface.

## Features
- Custom domain email support
- Web-based email interface with dark theme
- Email composition and sending
- Email folder management
- User authentication
- Admin dashboard
- Responsive design

## Technology Stack
### Frontend
- React with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- Dark theme support
- Responsive design

### Backend
- Node.js with Express
- MongoDB for data persistence
- JWT authentication
- RESTful API design

### Mail Server
- Postfix for SMTP (sending emails)
- Dovecot for IMAP (receiving emails)
- SSL/TLS encryption
- Custom domain integration

## Architecture

### Frontend Components
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/         # Authentication components
│   │   ├── email/        # Email-related components
│   │   └── layout/       # Layout components
│   ├── pages/            # Page components
│   ├── store/            # Redux store
│   └── services/         # API services
```

### Backend Structure
```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth and validation
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── utils/           # Helper functions
```

### Mail Server Configuration
```bash
# Mail Server Settings
IMAP_PORT=993
SMTP_PORT=465
USE_TLS=true
```

## Security Features
- TLS encryption for all connections
- JWT-based authentication
- Password hashing
- Rate limiting
- Input validation

## Email Features
- Send and receive emails
- Folder management (Inbox, Sent, Drafts, Trash)
- Email composition with rich text support
- File attachments
- Email threading
- Search functionality

## User Interface
- Dark theme by default
- Responsive design
- Modern, clean interface
- Easy navigation
- Mobile-friendly layout

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
```

### Email Endpoints
```
GET /api/emails
POST /api/emails
GET /api/emails/folders
DELETE /api/emails/:id
```

## Installation and Setup

### Prerequisites
- Node.js (v18+)
- MongoDB
- SSL certificates
- Custom domain

### Backend Setup
1. Clone repository
2. Install dependencies
3. Configure environment
4. Start server

### Frontend Setup
1. Install dependencies
2. Configure API endpoint
3. Build application
4. Deploy

### Mail Server Setup
1. Install required packages
2. Configure SSL
3. Set up DNS records
4. Configure mail server

## Deployment
- Frontend served via Nginx
- Backend running with PM2
- MongoDB for data storage
- SSL via Let's Encrypt

## Future Improvements
1. Email templates
2. Calendar integration
3. Contact management
4. Mobile app development
5. Enhanced search capabilities

## Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License
This project is licensed under the MIT License.
