# ClickSitter Quick Start Guide

## ✅ Setup Complete!

All services are configured and database migrations are complete.

## 🚀 Start the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🧪 Test the Application

### Test User Flows

**Professional Onboarding:**
1. Go to http://localhost:3000/auth
2. Sign up as a "Caregiver"
3. Verify phone number (use a number verified in Twilio test mode)
4. Complete AI onboarding interview
5. Verify identity via Stripe Identity

**Parent Flow:**
1. Sign up as a "Parent"
2. Verify phone number
3. (Optional) Subscribe to access full features
4. Search for caregivers
5. Post a job

### Test Webhooks (Optional)

In a separate terminal:
```bash
./scripts/test-webhook.sh
```

Then trigger test events:
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

## 📋 Configuration Status

✅ **Supabase** - Database, Auth, Storage  
✅ **Stripe** - Subscriptions, Identity, Webhooks  
✅ **Twilio** - SMS OTP Verification  
✅ **Upstash Redis** - Rate Limiting  
✅ **Google AI** - Vercel AI SDK with Gemini  
⏳ **Checkr** - Background Checks (optional)

## 🔍 Troubleshooting

**Phone Verification Not Working:**
- In Twilio test mode, you can only send SMS to verified numbers
- Add test numbers at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified

**Database Errors:**
- Verify RLS policies are applied correctly
- Check Supabase dashboard for any migration errors

**AI Features Not Working:**
- Verify Google AI API key is correct
- Check rate limits in Redis

## 📚 Next Steps

1. Test all user flows
2. Add Checkr API key for background checks
3. Set up production environment variables
4. Deploy to production (Vercel recommended)
