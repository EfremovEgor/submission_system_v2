import nodemailer from "nodemailer";
import {
    EMAIL,
    EMAIL_HOST,
    EMAIL_PASSWORD,
    EMAIL_PORT,
} from "$env/static/private";
let transporter = nodemailer.createTransport({
    port: parseInt(EMAIL_PORT),
    host: EMAIL_HOST,
    auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD,
    },
});

transporter.verify(function (error, success) {
    if (error) {
        console.error(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

export default transporter;
