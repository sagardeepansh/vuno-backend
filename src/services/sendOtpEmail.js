import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "connectdeepansh@gmail.com",
    pass: process.env.EMAIL_PASS || "sstnbpawcfeyoscm",
  },
});

export const sendOtpEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: "Your OTP Code - Vuno",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color:#111;">Verify Your Email</h2>
          <p>Your OTP code is:</p>

          <div style="
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 5px;
            margin: 20px 0;
            color: #000;
          ">
            ${otp}
          </div>

          <p>This OTP is valid for <strong>5 minutes</strong>.</p>

          <p style="color: #666; font-size: 12px;">
            If you didn’t request this, you can ignore this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("OTP email sent:", info.messageId);

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("Failed to send OTP email");
  }
};