#!/bin/bash
# Test Email Service Endpoints

# Test Health Check
echo "=== Testing Health Check ==="
curl -X GET http://localhost:3001/health | json_pp

# Test Send OTP Email
echo -e "\n=== Testing Send OTP ==="
curl -X POST http://localhost:3001/api/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }' | json_pp

# Test Send Confirmation Email
echo -e "\n=== Testing Send Confirmation ==="
curl -X POST http://localhost:3001/api/email/send-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "John Doe"
  }' | json_pp

# Test Send Password Reset Email
echo -e "\n=== Testing Send Password Reset ==="
curl -X POST http://localhost:3001/api/email/send-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "resetLink": "https://smartcampus.com/reset?token=xyz123"
  }' | json_pp
