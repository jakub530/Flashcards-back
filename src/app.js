const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const setRouter = require('./routers/set')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(setRouter)

module.exports = app