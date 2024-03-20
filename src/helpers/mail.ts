import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  sendmail: true,
  path: '/usr/sbin/sendmail'
});

interface MailOptions {
    from: string,
    to: string,
    subject: string,
    text: string
}

function sendMail(options : MailOptions) {
    transporter.sendMail(options, (error, info) => {
       if(error) {
           console.error('Error sending mail ', error);
           return;
       }

       console.log('Sent mail ', info.response);
    });
}

export default sendMail;