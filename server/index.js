const express = require('express')
const cors = require('cors')
const axios = require('axios')
const bodyParser = require('body-parser')

const fetch = require('./fetch')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

// fetch data in advace
fetch.initializeFakeDB()

app.get('/', fetch.showFakeDB)

app.post('/getStoryInfo', fetch.getStoryInfo)

app.listen(3001, () => {
  console.log('Your server is running on port 3001')
})
