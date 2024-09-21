import  express  from "express";
import nodemailer from 'nodemailer';
import { send } from "process";


const transporter=nodemailer.createTransport({
   service:'gmail',
   auth:{
    user:process.env.EMAIL,
    pass:process.env.MAIL_PASS_KEY
   }
})
const sendMail=(to:string,subject:string,text:string)=>{
    const mailOptions={
        from:process.env.EMAIL,
        to,
        subject,
        text,
    };
    return transporter.sendMail(mailOptions);

}
export {sendMail};
