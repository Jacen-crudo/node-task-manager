const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'jacen.crudo@gmail.com',
        subject: 'Welcome to the Task Manager App!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app!`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'jacen.crudo@gmail.com',
        subject: 'We\'re sorry to see you go!',
        text: `${name}, thank you for being a great member of this app and we're sorry to see you go. If you wouldn't mind leaving a review of what made you leave our app, that can help us improve to make the experience better.\n\nWe look forward to hearing from you soon\n\nDev,`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}