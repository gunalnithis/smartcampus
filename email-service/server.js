const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

const REQUIRED_ENV_VARS = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_HOST', 'EMAIL_PORT'];
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please update email-service/.env and restart the service.');
  process.exit(1);
}

const smtpPort = Number(process.env.EMAIL_PORT);
const smtpSecure = smtpPort === 465;
const smtpPassword = String(process.env.EMAIL_PASS).replace(/\s+/g, '');

if (Number.isNaN(smtpPort)) {
  console.error('❌ EMAIL_PORT must be a valid number. Current value:', process.env.EMAIL_PORT);
  process.exit(1);
}

console.log('📨 SMTP config loaded:', {
  host: process.env.EMAIL_HOST,
  port: smtpPort,
  secure: smtpSecure,
  user: process.env.EMAIL_USER,
  appPasswordLength: smtpPassword.length,
});

// Middleware
app.use(cors());
app.use(express.json());

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: smtpPort,
  secure: smtpSecure, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: smtpPassword,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email transporter error:', error);
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.log('💡 Gmail AUTH failed. Check these items:');
      console.log('1) EMAIL_USER matches the exact Gmail account used to create the App Password');
      console.log('2) EMAIL_PASS is an active Gmail App Password (16 chars; spaces optional)');
      console.log('3) 2-Step Verification is enabled on that Gmail account');
      console.log('4) If recently changed/revoked, generate a new App Password and update .env');
    }
  } else {
    console.log('✅ Email transporter is ready to send emails');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Email service is running', timestamp: new Date() });
});

// Send OTP Email
app.post('/api/email/send-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: #0369a1; margin-bottom: 20px;">Smart Campus</h1>
          <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
          
          <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
            Your verification code is:
          </p>
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <div style="font-size: 36px; font-weight: bold; color: #0369a1; letter-spacing: 5px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-bottom: 10px;">
            This code will expire in 5 minutes.
          </p>
          
          <p style="color: #999; font-size: 14px;">
            If you did not request this code, please ignore this email.
          </p>
          
          <hr style="border: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            Smart Campus Team<br>
            © 2026 All rights reserved
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Smart Campus - Email Verification OTP',
      html: htmlContent,
      text: `Your OTP for email verification is: ${otp}\n\nThis OTP will expire in 5 minutes.\n\nIf you did not request this OTP, please ignore this email.\n\nThank you,\nSmart Campus Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', info.messageId);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP email',
      error: error.message,
    });
  }
});

// Send Registration Confirmation Email
app.post('/api/email/send-confirmation', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required',
      });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: #15803d; margin-bottom: 20px;">Welcome to Smart Campus! 🎉</h1>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            Hi <strong>${name}</strong>,
          </p>
          
          <p style="color: #666; font-size: 15px; margin-bottom: 20px;">
            Your account has been successfully created and verified.
          </p>
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="color: #333; font-size: 14px; margin: 10px 0;">
              <strong>Email:</strong> ${email}
            </p>
          </div>
          
          <p style="color: #666; font-size: 15px; margin-bottom: 20px;">
            You can now log in to your account and start using Smart Campus.
          </p>
          
          <hr style="border: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            Smart Campus Team<br>
            © 2026 All rights reserved
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Smart Campus - Account Created Successfully',
      html: htmlContent,
      text: `Hi ${name},\n\nYour account has been successfully created and verified.\n\nEmail: ${email}\n\nYou can now log in to your account and start using Smart Campus.\n\nThank you,\nSmart Campus Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent successfully:', info.messageId);

    res.json({
      success: true,
      message: 'Confirmation email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send confirmation email',
      error: error.message,
    });
  }
});

// Send Password Reset Email
app.post('/api/email/send-password-reset', async (req, res) => {
  try {
    const { email, resetLink } = req.body;

    if (!email || !resetLink) {
      return res.status(400).json({
        success: false,
        message: 'Email and resetLink are required',
      });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: #dc2626; margin-bottom: 20px;">Password Reset Request</h1>
          
          <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
            We received a request to reset your password.
          </p>
          
          <p style="color: #666; font-size: 15px; margin-bottom: 20px;">
            Click the button below to reset your password:
          </p>
          
          <a href="${resetLink}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-bottom: 20px;">
            Reset Password
          </a>
          
          <p style="color: #999; font-size: 14px; margin-bottom: 10px;">
            This link will expire in 24 hours.
          </p>
          
          <p style="color: #999; font-size: 14px;">
            If you did not request this, please ignore this email.
          </p>
          
          <hr style="border: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            Smart Campus Team<br>
            © 2026 All rights reserved
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Smart Campus - Password Reset Request',
      html: htmlContent,
      text: `Password Reset Request\n\nWe received a request to reset your password.\n\nClick the link below to reset your password:\n${resetLink}\n\nThis link will expire in 24 hours.\n\nIf you did not request this, please ignore this email.\n\nThank you,\nSmart Campus Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', info.messageId);

    res.json({
      success: true,
      message: 'Password reset email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send password reset email',
      error: error.message,
    });
  }
});

// Send Booking Update Email
app.post('/api/email/send-booking-update', async (req, res) => {
  try {
    const { email, name, resourceName, date, startTime, endTime, status, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Email and message are required',
      });
    }

    const safeName = name || 'User';
    const safeResource = resourceName || 'Resource';
    const safeDate = date || '-';
    const safeStart = startTime || '-';
    const safeEnd = endTime || '-';
    const safeStatus = status || 'UPDATED';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h1 style="color: #0f172a; margin-bottom: 8px;">Smart Campus Booking Update</h1>
          <p style="color: #475569; margin-top: 0;">Hi <strong>${safeName}</strong>,</p>

          <p style="color: #334155; font-size: 15px;">${message}</p>

          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 16px 0;">
            <p style="margin: 6px 0; color: #0f172a;"><strong>Resource:</strong> ${safeResource}</p>
            <p style="margin: 6px 0; color: #0f172a;"><strong>Date:</strong> ${safeDate}</p>
            <p style="margin: 6px 0; color: #0f172a;"><strong>Time:</strong> ${safeStart} - ${safeEnd}</p>
            <p style="margin: 6px 0; color: #0f172a;"><strong>Status:</strong> ${safeStatus}</p>
          </div>

          <p style="color: #64748b; font-size: 13px;">You can view details in your My Bookings page.</p>
          <hr style="border: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 12px;">Smart Campus Team</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Smart Campus - Booking ${safeStatus}`,
      html: htmlContent,
      text: `${message}\n\nResource: ${safeResource}\nDate: ${safeDate}\nTime: ${safeStart} - ${safeEnd}\nStatus: ${safeStatus}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Booking update email sent successfully:', info.messageId);

    res.json({
      success: true,
      message: 'Booking update email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Error sending booking update email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send booking update email',
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Email Service running on http://localhost:${PORT}`);
  console.log(`📧 App: paf`);
  console.log(`📧 Using email: ${process.env.EMAIL_USER}\n`);
});
