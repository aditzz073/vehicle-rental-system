const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendEmail(to, subject, html, text = null) {
        try {
            const mailOptions = {
                from: `"AutoHive" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
                text: text || this.stripHtml(html)
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }
    }

    async sendPasswordResetEmail(email, resetToken, firstName) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        const html = `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
                    <h1 style="color: #fff; margin: 0;">AutoHive</h1>
                </div>
                <div style="padding: 40px 20px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello ${firstName},</p>
                    <p>You requested a password reset for your AutoHive account. Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    </div>
                    <p>This link will expire in 1 hour for security reasons.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p>
                </div>
                <div style="background-color: #333; padding: 20px; text-align: center; color: #fff; font-size: 12px;">
                    <p>&copy; 2024 AutoHive. All rights reserved.</p>
                </div>
            </div>
        `;

        return await this.sendEmail(email, 'Password Reset - AutoHive', html);
    }

    async sendBookingConfirmationEmail(email, booking, firstName) {
        const html = `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
                    <h1 style="color: #fff; margin: 0;">AutoHive</h1>
                </div>
                <div style="padding: 40px 20px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Booking Confirmation</h2>
                    <p>Hello ${firstName},</p>
                    <p>Your vehicle booking has been confirmed! Here are the details:</p>
                    
                    <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
                        <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
                        <p><strong>Vehicle:</strong> ${booking.vehicle_name}</p>
                        <p><strong>Pickup Date:</strong> ${new Date(booking.start_date).toLocaleDateString()}</p>
                        <p><strong>Return Date:</strong> ${new Date(booking.end_date).toLocaleDateString()}</p>
                        <p><strong>Total Cost:</strong> $${booking.total_cost}</p>
                        <p><strong>Status:</strong> ${booking.status}</p>
                    </div>
                    
                    <p>Please arrive 30 minutes before your pickup time with a valid driver's license and credit card.</p>
                    <p>If you need to make any changes to your booking, please contact us immediately.</p>
                </div>
                <div style="background-color: #333; padding: 20px; text-align: center; color: #fff; font-size: 12px;">
                    <p>&copy; 2024 AutoHive. All rights reserved.</p>
                    <p>Contact us: support@autohive.com | +1 (555) 123-4567</p>
                </div>
            </div>
        `;

        return await this.sendEmail(email, `Booking Confirmation - ${booking.vehicle_name}`, html);
    }

    async sendBookingReminderEmail(email, booking, firstName) {
        const pickupDate = new Date(booking.start_date);
        const html = `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
                    <h1 style="color: #fff; margin: 0;">AutoHive</h1>
                </div>
                <div style="padding: 40px 20px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Booking Reminder</h2>
                    <p>Hello ${firstName},</p>
                    <p>This is a friendly reminder that your vehicle pickup is scheduled for tomorrow!</p>
                    
                    <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Pickup Details</h3>
                        <p><strong>Vehicle:</strong> ${booking.vehicle_name}</p>
                        <p><strong>Pickup Date:</strong> ${pickupDate.toLocaleDateString()} at ${pickupDate.toLocaleTimeString()}</p>
                        <p><strong>Location:</strong> AutoHive Main Location</p>
                    </div>
                    
                    <p><strong>Don't forget to bring:</strong></p>
                    <ul>
                        <li>Valid driver's license</li>
                        <li>Credit card for security deposit</li>
                        <li>Booking confirmation (this email)</li>
                    </ul>
                </div>
                <div style="background-color: #333; padding: 20px; text-align: center; color: #fff; font-size: 12px;">
                    <p>&copy; 2024 AutoHive. All rights reserved.</p>
                </div>
            </div>
        `;

        return await this.sendEmail(email, 'Booking Reminder - Tomorrow', html);
    }

    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '');
    }
}

module.exports = new EmailService();
