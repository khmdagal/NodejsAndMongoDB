const nodeMailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Define the transport

    const transporter = nodeMailer.createTransport({
        host: process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_EMAIL_PASSWORD
        }
    })
    // 2) Define the email options
    const emailOptions = {
        from: 'Khadar <khmdagal@gmail.com>',
        to: options.email,
        text: options.text
        //HTML
    }

    // 3) Then send the actual email

    await transporter.sendMail(emailOptions)

}

module.exports = sendEmail