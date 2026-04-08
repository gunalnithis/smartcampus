# Smart Campus - Nodemailer Implementation Setup Guide

## 🎯 Overview

Your application now has a complete email system using Nodemailer:

```
Frontend (React) → Java Backend → Node.js Email Service (Nodemailer) → Gmail SMTP
```

## 📁 Project Structure

```
smart campus/
├── smart-campus/                    # Java Spring Boot Backend
│   ├── src/main/java/.../service/
│   │   ├── EmailService.java        # ✅ Now uses EmailClient
│   │   ├── EmailClient.java         # NEW - Calls Node.js service
│   │   ├── OtpService.java
│   │   └── ...
│   ├── src/main/resources/
│   │   └── application.properties   # Updated - email.service.url
│   └── pom.xml
│
├── smart-campus-frontend/           # React Frontend
│   └── src/pages/
│       ├── RegisterPage.jsx
│       ├── VerifyOtpPage.jsx
│       └── RegisterCompletePage.jsx
│
└── email-service/                   # NEW - Node.js Nodemailer Service
    ├── server.js                    # Express + Nodemailer
    ├── package.json
    ├── .env
    ├── .gitignore
    ├── README.md
    └── test-email-api.sh
```

## 🚀 Quick Start

### Step 1: Setup Email Service (Node.js)

```bash
cd email-service
npm install
```

### Step 2: Configure .env

File: `email-service/.env`
```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your16charapppassword
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
PORT=3001
NODE_ENV=development
```

### Step 3: Start Email Service

```bash
npm run dev
# or
npm start
```

Expected output:
```
✅ Email transporter is ready to send emails
🚀 Email Service running on http://localhost:3001
📧 Using email: your-gmail-address@gmail.com
```

### Step 4: Start Java Backend

```bash
cd smart-campus
mvn spring-boot:run
```

Java backend will connect to Node.js email service automatically.

### Step 5: Start React Frontend

```bash
cd smart-campus-frontend
npm run dev
```

## 📊 How It Works

### Registration Flow with Nodemailer

```
1. USER ENTERS EMAIL → RegisterPage
   └─> POST /api/auth/send-otp
       └─> Java Backend
           └─> HTTP Call to Node.js (localhost:3001/api/email/send-otp)
               └─> Nodemailer sends OTP via Gmail SMTP

2. USER ENTERS OTP → VerifyOtpPage
   └─> POST /api/auth/verify-otp
       └─> Java Backend verifies OTP in MongoDB

3. USER ENTERS NAME & ROLE → RegisterCompletePage
   └─> POST /api/auth/bootstrap-user
       └─> Java Backend creates user (OTP verified)
           └─> Optional: Send confirmation email via Email Service
```

## 🔌 API Endpoints

### Email Service (Node.js on port 3001)

#### Health Check
```bash
curl http://localhost:3001/health
```

#### Send OTP
```bash
curl -X POST http://localhost:3001/api/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

#### Send Confirmation
```bash
curl -X POST http://localhost:3001/api/email/send-confirmation \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe"}'
```

#### Send Password Reset
```bash
curl -X POST http://localhost:3001/api/email/send-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","resetLink":"http://..."}'
```

## 🔐 Gmail App Password

Your email system uses Gmail with App Password (more secure than regular password):

**What is App Password?**
- 16-character password specifically for apps
- More secure than account password
- Can be revoked anytime
- Required for Gmail 2FA enabled accounts

**Your credentials:**
- Email: `your-gmail-address@gmail.com`
- App Password: `your16charapppassword`

## 📧 Email Templates

### OTP Email
- Beautiful HTML layout
- Shows 6-digit OTP in large font
- Includes expiry time (5 minutes)
- Professional branding

### Confirmation Email
- Welcome message
- Shows user details
- Ready to use account
- Call-to-action

### Password Reset Email
- Reset link button
- 24-hour expiry
- Security notification
- Professional layout

## 🐛 Troubleshooting

### Email not sending?

1. **Check Node.js service is running:**
```bash
curl http://localhost:3001/health
```
Expected: `{"status":"Email service is running",...}`

2. **Check Java backend can reach email service:**
```-
Email service URL: http://localhost:3001
(Check application.properties: email.service.url)
```

3. **Check Gmail credentials:**
```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your16charapppassword
```

4. **Check logs:**
```bash
# Node.js logs
npm run dev  # Shows email sending logs

# Java logs
mvn spring-boot:run  # Shows EmailClient errors
```

### Port conflicts?

```bash
# Change email service port in .env
PORT=3002
npm start

# Update Java config
email.service.url=http://localhost:3002
```

## 📱 Testing

### Using curl (Windows PowerShell)
```powershell
$body = @{
    email = "test@example.com"
    otp = "123456"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/email/send-otp" `
  -Method Post -Body $body -ContentType "application/json"
```

### Using Postman
1. Open Postman
2. POST to `http://localhost:3001/api/email/send-otp`
3. Body (raw JSON):
```json
{
  "email": "test@example.com",
  "otp": "123456"
}
```
4. Click Send

## 📚 File Changes Summary

### Modified Files:
- `smart-campus/pom.xml` - Removed spring-boot-starter-mail
- `smart-campus/src/main/resources/application.properties` - Updated email config
- `smart-campus/src/main/java/.../service/EmailService.java` - Now calls EmailClient
- `smart-campus-frontend/src/pages/RegisterCompletePage.jsx` - Email normalization
- etc.

### New Files:
- `smart-campus/src/main/java/.../service/EmailClient.java` - HTTP client to Node.js
- `email-service/server.js` - Express + Nodemailer
- `email-service/package.json` - Node.js dependencies
- `email-service/.env` - Email config
- `email-service/README.md` - Documentation

## ✅ Verification Checklist

- [ ] Node.js service installed: `cd email-service && npm install`
- [ ] .env file created with Gmail credentials
- [ ] Node.js service running: `npm start` (shows "Email transporter is ready")
- [ ] Java backend running: `mvn spring-boot:run`
- [ ] Frontend running: `npm run dev`
- [ ] Test OTP sending: Register page → should receive email
- [ ] Check each service port:
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:8081`
  - Email Service: `http://localhost:3001/health`

## 📞 Configuration Reference

| Component | Port | URL |
|-----------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Java Backend | 8081 | http://localhost:8081 |
| Email Service | 3001 | http://localhost:3001 |
| MongoDB | - | Cloud (Atlas) |
| Gmail SMTP | 587 | smtp.gmail.com |

## 🎉 You're All Set!

Your complete email system is now running with Nodemailer. 

**Summary:**
- ✅ Frontend collects email and OTP input
- ✅ Java backend orchestrates registration flow
- ✅ Node.js email service sends emails via Nodemailer
- ✅ Gmail handles SMTP delivery
- ✅ All services communicate via REST API

Happy coding! 🚀
