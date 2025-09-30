import express from 'express'
const router = express.Router()
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // your Gmail address from .env
    pass: process.env.GMAIL_PASS, // your app password from .env
  },
})

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, preferredTime, message, plan } = req.body || {}

    const subject = `New Pricing Inquiry (${plan || 'General'}) – ${name}`
    const html = `
      <h2>New Inquiry</h2>
      <p><strong>Plan:</strong> ${plan || 'General'}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      ${preferredTime ? `<p><strong>Preferred time:</strong> ${preferredTime}</p>` : ''}
      <p><strong>Message:</strong><br>${(message || '').replace(/\n/g, '<br>')}</p>
    `

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // send to yourself for now
      replyTo: email,
      subject,
      html,
    })

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: 'Email send failed' })
  }
})