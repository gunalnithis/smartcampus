# Smart Campus - Email Service (Nodemailer)

This is a Node.js + Express service that handles all email sending for Smart Campus using Nodemailer.

## Features

- ✉️ Send OTP verification emails
- ✅ Send account confirmation emails
- 🔐 Send password reset emails
- 📧 Beautiful HTML email templates
- 🚀 REST API endpoints for Java backend integration

## Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Gmail account with App Password enabled

## Installation

1. **Navigate to email service directory:**
```bash
cd email-service
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env` file with:
```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your16charapppassword
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
PORT=3001
NODE_ENV=development
```

## Running the Service

### Development Mode (with nodemon)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

You should see:
```
✅ Email transporter is ready to send emails
🚀 Email Service running on http://localhost:3001
📧 Using email: your-gmail-address@gmail.com
```

## API Endpoints

### 1. Health Check
```
GET /health
```
Returns service status.

### 2. Send OTP Email
```
POST /api/email/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "messageId": "..."
}
```

### 3. Send Confirmation Email
```
POST /api/email/send-confirmation
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Confirmation email sent successfully",
  "messageId": "..."
}
```

### 4. Send Password Reset Email
```
POST /api/email/send-password-reset
Content-Type: application/json

{
  "email": "user@example.com",
  "resetLink": "https://smartcampus.com/reset?token=xyz"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "messageId": "..."
}
```

## Gmail App Password Setup

1. Go to [Google Account Settings](https://myaccount.google.com)
2. Enable 2-Step Verification
3. Go to App Passwords
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Add to `.env` file as `EMAIL_PASS`

## Java Backend Integration

The Java backend connects to this service at `http://localhost:3001`

**Configuration in application.properties:**
```properties
email.service.url=http://localhost:3001
```

## Troubleshooting

### Email not sending?
- Check `.env` file credentials
- Verify Gmail account has App Passwords enabled
- Check if Node.js service is running on port 3001
- Check firewall settings

### Connection refused?
- Make sure service is running: `npm start`
- Check if port 3001 is available
- Check Java backend can reach `http://localhost:3001/health`

### Port already in use?
```bash
# Change PORT in .env file or:
PORT=3002 npm start
```

## File Structure

```
email-service/
├── server.js          # Express server & Nodemailer setup
├── package.json       # Dependencies
├── .env              # Configuration
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Technologies

- **Node.js** - Runtime
- **Express.js** - Web framework
- **Nodemailer** - Email sending library
- **Gmail SMTP** - Email provider
- **CORS** - Cross-origin support

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| EMAIL_USER | Gmail account | your-gmail-address@gmail.com |
| EMAIL_PASS | App Password | - |
| EMAIL_HOST | SMTP host | smtp.gmail.com |
| EMAIL_PORT | SMTP port | 587 |
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development |

## License

ISC

## Support

For issues or questions, please contact the development team.
