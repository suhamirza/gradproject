const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail service
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  debug: true,
  logger: true 
});

async function sendWelcomeEmail(userData) {
  try {
    
    const email = userData.Email;
    const username = userData.Username;
    const verificationCode = userData.VerificationCode;

    if (!email) {
      throw new Error('Invalid user data: Email is required');
    }

    if (!username) {
      throw new Error('Invalid user data: Username is required');
    }

    if (!verificationCode) {
      throw new Error('Invalid user data: VerificationCode is required');
    }

    await transporter.verify();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Welcome to Taskify - Verify Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">Welcome to Taskify!</h1>
          <p>Hello ${username},</p>
          <p>Thank you for signing up with Taskify. We're excited to have you on board!</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2c3e50; margin-top: 0;">Your Verification Code</h2>
            <p style="font-size: 24px; font-weight: bold; color: #2c3e50; text-align: center; letter-spacing: 5px;">
              ${verificationCode}
            </p>
            <p>Please use this code to verify your account. This code will expire in 24 hours.</p>
          </div>

          <p>If you didn't create an account with Taskify, please ignore this email.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>The Taskify Team</p>
        </div>
      `
    };

    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    console.log('Welcome email with verification code sent to:', email);
  } catch (error) {
    console.error('Error sending welcome email:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    // Don't throw the error to prevent message requeue
    console.error('Email sending failed, but message will be acknowledged');
  }
}

module.exports = {
  sendWelcomeEmail
}; 