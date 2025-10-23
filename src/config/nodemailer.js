import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/* node-mailer set up */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
  debug: true, // <-- enable debug logs
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Transporter connection error:", error.message);
  } else {
    console.log("Transporter is ready to send messages");
  }
});

export default transporter;
