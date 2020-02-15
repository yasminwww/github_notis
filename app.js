const cors = require('cors')
const cookieSession = require('cookie-session')
const express = require('express')
const passport = require('passport')

const DBconnect = require('./config/db_config.js')
const passportSetup = require('./config/passport_setup.js') // Initiating passportStrategy
const authRoutes = require('./routes/auth.js')
const profileRoutes = require('./routes/profile.js')

require('dotenv').config()
const app = express()
const secret = process.env.SECRET
app.use(cookieSession({
	maxAge: 24 * 60 * 60 * 1000,
	keys: [secret]
}))

DBconnect()
app.use(cors())

app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.get('/', (req, res) => {
	res.send('home')
})

const port = process.env.PORT || 8000

app.listen(port, () => {
	console.log(`Hello port ${port}.`)
})

