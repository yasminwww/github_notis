require('dotenv').config()
const crypto = require('crypto')
const router = require('express').Router()
const helper = require('../helpers/helper.js')
const Hook = require('../models/hook.js.js')
const User = require('../models/user.js')


// io.sockets.connected[req.user.id].emit(notification)

// TODO: Save token to mongoDB Use it later in all routes and helpers

const authCheck = (req, res, next) => {
  !req.user ? res.redirect('/') : next()
}


router.get('/', (req, res, next) => {
  const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
  res.status(200).send(req.user)
})

router.get('/getevents', async (req, res, next) => {
  const username = req.user.login
  const user = await User.findOne({ git_id: req.user.id })
  const token = user.token
  const allEvents = await helper.getAllOrganizationEvents(token, username)
  res.status(200).send({ ...allEvents })
})


router.get('/orgs', authCheck, async (req, res, next) => {
  const user = await User.findOne({ git_id: req.user.id })
  const token = user.token
  const orgs = await helper.getOrganizationsFromGithub(token)
  res.status(200).send({ ...orgs })
})


router.post('/events', authCheck, async (req, res, next) => {
  const { githubUrl } = req.body.data
  const user = await User.findOne({ git_id: req.user.id })
  const token = user.token
  const data = await helper.getOrganizationPropertyContent(token, githubUrl)
  res.status(200).send({ ...data })
})


router.post('/repos', authCheck, async (req, res, next) => {
  const { githubUrl } = req.body.data
  const data = await helper.getOrganizationPropertyContent(githubUrl)
  res.status(200).send({ ...data })
})


router.get('/webhook', authCheck, async (req, res, next) => {
  try {
    const webhooks = await Hook.find({ git_id: req.user.id }).select('-_id')
    return res.status(200).send({ webhooks })
  } catch (err) {
    next(err)
  }
})


router.post('/webhook', authCheck, async (req, res, next) => {
  try {
    const { githubUrl, orgName, webhook } = req.body.data

    const user = await User.findOne({ git_id: req.user.id })
    const token = user.token
    const existsingHook = await Hook.findOne({ git_id: req.user.id, organization: orgName })

    if (!existsingHook) {
      const newHook = new Hook({
        url: githubUrl,
        webhook: webhook,
        organization: orgName,
        username: req.user.login,
        git_id: req.user.id
      })
      await newHook.save()
      helper.createWebhook(orgName, token)
    }
    res.status(201).send({
      msg: 'Webhook url saved.'
    })
  } catch (err) {
    next(err)
  }
})

// need to be posting without auth here, only Github validation 
// will save this route.
router.post('/payload', async (req, res, next) => {
  try {
    console.log(req.body)
    const typeOfEvent = req.headers['x-github-event']
    const org = req.body.organization.login
    const sender = req.body.sender.id
    const io = req.app.get('socketio')
    let socketid = []

    const hook = await Hook.findOne({ git_id: sender, organization: org })
      .catch(err => console.log('POST payload ', err))

    // Send to client
    // io.on('connection', socket => {
    //   console.log('socket id: ', socket.id)
    //   socket.username = req.user.login
    //   socketid.push(socket.id)
    //   // if (socketid[0] === socket.id) { }
    //   socket.emit('message', 'typeOfEvent')
    // })

    const slackHookKey = hook.webhook
    const url = `https://hooks.slack.com/services/${slackHookKey}`

    helper.evaluateSettings(typeOfEvent, hook, req, url)

    res.status(200).send('Payload validated')
  } catch (err) {
    next(err)
  }
})


router.post('/settings', authCheck, async (req, res, next) => {
  try {
    const { org } = req.body.data

    const findHook = await Hook.find({ git_id: req.user.id, organization: org })
    res.send(findHook)
  } catch (err) {
    next(err)
  }
})

router.put('/settings', authCheck, async (req, res, next) => {
  try {
    const { type, state, org } = req.body.data
    const findHook = await Hook.findOne({ git_id: req.user.id, organization: org })
      .catch(err => console.log('PUT settings ', err))

    const query = {}
    query[type] = state   // Apparently When I do {type: state}, the key is the string 'type' and not the value of the variable name

    if (findHook !== null) {
      await Hook.updateOne({ '_id': findHook._id }, { $set: query })
    }
    res.send('Done with settings')
  } catch (err) {
    next(err)
  }
})

module.exports = router
