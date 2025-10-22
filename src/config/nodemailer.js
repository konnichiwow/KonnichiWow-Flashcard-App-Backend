import nodemailer from "nodemailer";

/* node-mailer set up */
const transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_SERVICE, //the service
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD 
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log('Transporter connection error:', error.message);
    } else {
        console.log('Transporter is ready to send messages');
    }
});

export default transporter;