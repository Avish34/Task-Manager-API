const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.API_KEY)
const Welcomemail=async (email,name)=>{
    await sgMail.send({
        to: email,
        from:'porwalavish34@gmail.com',
        subject: 'Thanks For Joining us!',
        text: `Welcome ${name} to our Service.`
    })
}

const CancelMail=async (email,name)=>{
    await sgMail.send({
        to: email,
        from:'porwalavish34@gmail.com',
        subject: 'Cancelation Mail!',
        text: `See you Soon ${name}.`
    })
}

module.exports={
    CancelMail,
    Welcomemail
}