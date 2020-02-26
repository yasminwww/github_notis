require('dotenv').config()
const cors = require('cors')
const cookieSession = require('cookie-session')
const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')

const allowCORS = require('./allowCORS.js')
const DBconnect = require('./config/db_config.js')
const passportSetup = require('./config/passport_setup.js') // Initiating passportStrategy (runs Automatically)
const authRoutes = require('./routes/auth.js')
const profileRoutes = require('./routes/profile.js')
const csp = require('express-csp-header')
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const secret = process.env.COOKIE_SECRET
app.use(cookieSession({
	maxAge: 24 * 60 * 60 * 1000,
	keys: [secret]
}))

app.use(csp({
	policies: {
		'default-src': [csp.NONE],
		'img-src': [csp.SELF],
	}
}))

app.use(passport.initialize())
app.use(passport.session())
// app.use(allowCORS)
// app.use(cors)
DBconnect()

app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.get('/', (req, res) => {
	res.send('home')
})

const port = process.env.PORT || 8000

app.listen(port, () => {
	console.log(`Hello port ${port}.`)
})

