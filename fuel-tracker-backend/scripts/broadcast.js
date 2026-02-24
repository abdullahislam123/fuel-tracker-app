const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sendBroadcast = async () => {
    try {
        // 1. Connect to Database
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ connected to MongoDB");

        // 2. Setup Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your preferred service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 3. Fetch all users
        const users = await User.find({}, 'email username');
        console.log(`📡 Found ${users.length} users fetching emails...`);

        if (users.length === 0) {
            console.log("⚠️ No users found in database.");
            process.exit(0);
        }

        // 4. Send Emails
        for (const user of users) {
            const mailOptions = {
                from: `"FuelTracker Pro" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "🚀 New Features Alert: Trip Estimator & Station Finder!",
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
            <h2 style="color: #10b981; font-style: italic;">FuelTracker Pro Upgraded!</h2>
            <p>Hi <b>${user.username}</b>,</p>
            <p>We've just added some powerful new features to help you save fuel and manage your vehicles better:</p>
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 15px; margin-bottom: 10px;">
              <h3 style="margin-top: 0; color: #059669;">📍 Station Finder</h3>
              <p style="margin-bottom: 0;">Locate nearby fuel stations and get instant navigation. Never run out of fuel again!</p>
            </div>

            <div style="background: #eff6ff; padding: 15px; border-radius: 15px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #2563eb;">📊 Trip Estimator</h3>
              <p style="margin-bottom: 0;">Calculate exactly how much fuel and money you'll need for your next trip before you leave.</p>
            </div>

            <p>Check out these features now on your dashboard!</p>
            
            <a href="https://fuel-tracker-frontend.vercel.app/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 12px 25px; border-radius: 10px; text-decoration: none; font-weight: bold; font-style: italic;">Open Dashboard</a>
            
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px;">© 2026 FuelTracker // Simple Fuel Management</p>
          </div>
        `,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`✅ Email sent to: ${user.email}`);
            } catch (err) {
                console.error(`❌ Failed to send to ${user.email}:`, err.message);
            }
        }

        console.log("🏁 Broadcast complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ ERROR:", error);
        process.exit(1);
    }
};

sendBroadcast();
