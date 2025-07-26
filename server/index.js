import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './utils/db.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())


import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Dynamically load all route files in /routes
const routesDir = path.join(__dirname, 'routes')
const files = fs.readdirSync(routesDir)
for (const file of files) {
  if (file.endsWith('.js')) {
    const route = await import(`./routes/${file}`)
    const routeName = file.replace('Routes.js', '').toLowerCase()
    app.use(`/api/${routeName}`, route.default)
  }
}

app.get('/', (req, res) => {
  res.send('Marsh Monster API is live!')
})

const PORT = process.env.PORT || 5050

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  )
})