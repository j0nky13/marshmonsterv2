const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Missing fields' })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `New message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  }

  try {
    await transporter.sendMail(mailOptions)
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Email error:', err)
    res.status(500).json({ success: false, error: 'Failed to send email' })
  }
})

export default router