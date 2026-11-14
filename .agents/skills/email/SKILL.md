---
name: email
description: Use this skill when setting up email functionality for the portfolio contact form. Triggers include: configuring Nodemailer or Resend, sending email notifications on form submission, setting up email templates, or handling email errors.
---

# email

## Recommended: Resend (modern, simple, reliable)
npm install resend

## Alternative: Nodemailer (classic)
npm install nodemailer

## Resend Setup
# /server/src/lib/email.js
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export const sendContactEmail = async ({ name, email, message }) => {
  await resend.emails.send({
    from: 'portfolio@yourdomain.com',
    to: process.env.CONTACT_EMAIL,
    subject: `New message from ${name}`,
    html: `
      <h2>New Portfolio Contact</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
  })
}

## Nodemailer Setup (Gmail)
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD  # use Gmail App Password, not real password
  }
})

export const sendContactEmail = async ({ name, email, message }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.CONTACT_EMAIL,
    subject: `New message from ${name}`,
    html: `
      <h2>New Portfolio Contact</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
  })
}

## Environment Variables
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=your@email.com
EMAIL_USER=your@gmail.com           # Nodemailer only
EMAIL_APP_PASSWORD=your_app_password  # Nodemailer only

## Integration with Contact Controller
import { sendContactEmail } from '../lib/email.js'

export const submitContact = async (req, res) => {
  const { name, email, message } = req.body
  
  # 1. Save to database
  await prisma.contact.create({ data: { name, email, message } })
  
  # 2. Send email notification
  await sendContactEmail({ name, email, message })
  
  res.status(201).json({ success: true, message: 'Message sent successfully.' })
}

## Conventions
- Always save to DB first, then send email
- If email fails, still return success (don't block form submission)
- Never expose email credentials in frontend code
- Use App Passwords for Gmail (never real password)
- Add RESEND_API_KEY or email credentials to Render environment variables

## Examples
- "Set up contact email" → use Resend for simplest setup
- "Email not sending" → check RESEND_API_KEY in .env and Render dashboard
- "Customize email template" → edit html string in sendContactEmail function