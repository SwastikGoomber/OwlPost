# OwlPost Implementation Details

## Frontend Implementation (React + TypeScript)

### Core Components

1. **Authentication Components**
```typescript
// Login Component (frontend/src/components/auth/Login.tsx)
const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Login logic with API call
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Login form fields */}
        </form>
    );
};
```

2. **Email Management Components**
```typescript
// Email List Component (frontend/src/components/email/EmailList.tsx)
const EmailList: React.FC<{ folder?: string }> = ({ folder = 'INBOX' }) => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmails(folder);
    }, [folder]);

    return (
        <div className="email-list">
            {emails.map(email => (
                <EmailItem key={email.id} email={email} />
            ))}
        </div>
    );
};
```

3. **State Management (Redux)**
```typescript
// Email Slice (frontend/src/store/slices/emailSlice.ts)
const emailSlice = createSlice({
    name: 'email',
    initialState,
    reducers: {
        setEmails: (state, action) => {
            state.emails = action.payload;
        },
        addEmail: (state, action) => {
            state.emails.unshift(action.payload);
        }
    }
});
```

## Backend Implementation (Node.js + Express)

### Core Components

1. **Server Setup**
```javascript
// Server Configuration (backend/src/index.js)
const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.use(express.json());
app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));
```

2. **Email Controller**
```javascript
// Email Controller (backend/src/controllers/emailController.js)
const emailController = {
    async sendEmail(req, res) {
        try {
            const { to, subject, text } = req.body;
            const emailService = new EmailService(req.user);
            
            const result = await emailService.sendMail({
                to,
                subject,
                text
            });

            res.json({ success: true, messageId: result.messageId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getEmails(req, res) {
        try {
            const { folder = 'INBOX' } = req.query;
            const emailService = new EmailService(req.user);
            
            const emails = await emailService.fetchEmails(folder);
            res.json(emails);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
```

3. **Email Service**
```javascript
// Email Service (backend/src/services/emailService.js)
class EmailService {
    constructor(user) {
        this.smtpTransport = nodemailer.createTransport({
            host: 'mail.sileistar.me',
            port: 465,
            secure: true,
            auth: {
                user: user.email,
                pass: user.emailSettings.smtpPassword
            }
        });
    }

    async sendMail(options) {
        return this.smtpTransport.sendMail(options);
    }
}
```

## Email Server Implementation (Postfix + Dovecot)

### Postfix Configuration

1. **Main Configuration**
```bash
# /etc/postfix/main.cf
smtpd_banner = $myhostname ESMTP $mail_name
myhostname = mail.sileistar.me
mydomain = sileistar.me
myorigin = $mydomain
inet_interfaces = all
inet_protocols = ipv4

# TLS parameters
smtpd_tls_cert_file = /etc/ssl/certs/ssl-cert-snakeoil.pem
smtpd_tls_key_file = /etc/ssl/private/ssl-cert-snakeoil.key
smtpd_use_tls = yes
smtpd_tls_auth_only = yes

# Authentication
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes
```

2. **Master Configuration**
```bash
# /etc/postfix/master.cf
smtp      inet  n       -       y       -       -       smtpd
submission inet n       -       y       -       -       smtpd
  -o syslog_name=postfix/submission
  -o smtpd_tls_security_level=encrypt
  -o smtpd_sasl_auth_enable=yes
```

### Dovecot Configuration

1. **Main Configuration**
```bash
# /etc/dovecot/dovecot.conf
protocols = imap pop3 lmtp
listen = *

# SSL Configuration
ssl = required
ssl_cert = </etc/ssl/certs/ssl-cert-snakeoil.pem
ssl_key = </etc/ssl/private/ssl-cert-snakeoil.key

# Authentication
auth_mechanisms = plain login
passdb {
  driver = pam
}
userdb {
  driver = passwd
}

# Mail location
mail_location = maildir:~/Maildir
```

2. **IMAP Configuration**
```bash
# /etc/dovecot/conf.d/10-mail.conf
mail_location = maildir:~/Maildir

# Create default folders
protocol imap {
  mail_plugins = " autocreate"
}

plugin {
  autocreate = Trash
  autocreate2 = Sent
  autocreate3 = Drafts
  autosubscribe = Trash
  autosubscribe2 = Sent
  autosubscribe3 = Drafts
}
```

### Integration Points

1. **Authentication Flow**
- User credentials stored in MongoDB
- Postfix authenticates against Dovecot
- Dovecot verifies against system users

2. **Mail Flow**
- Incoming mail handled by Postfix
- Mail stored in Maildir format
- Dovecot provides IMAP access
- Node.js backend interfaces with both services

3. **Security Measures**
- TLS encryption for all connections
- SASL authentication
- Rate limiting
- Spam protection
