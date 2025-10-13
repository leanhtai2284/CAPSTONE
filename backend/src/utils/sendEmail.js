import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // Tạo một transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Tạo nội dung email
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // Gửi email
  const info = await transporter.sendMail(message);
  console.log("Email sent: %s", info.messageId);
};

export default sendEmail;
