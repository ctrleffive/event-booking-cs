const google = require('googleapis')
const path = require('path')
const cors = require('cors')
const express = require('express')
const Moment = require('moment')
const MomentRange = require('moment-range')

const moment = MomentRange.extendMoment(Moment)

const clientPath = '../../client/build'

const privatekey = require('./service-key.json')
const PORT = process.env.PORT || 3001
const calendarId = 'chandujs@live.com'

const app = express()
const calendar = new google.calendar_v3.Calendar()

const jwtClient = new google.Auth.JWT(
  privatekey.client_email,
  null,
  privatekey.private_key,
  ['https://www.googleapis.com/auth/calendar']
)

jwtClient.authorize()

app.use(cors())
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(express.static(path.resolve(__dirname, clientPath)))
app.get('/', (_req, res) => {
  res.sendFile(path.resolve(__dirname, clientPath, 'index.html'))
})

app.post('/slots', async (req, res) => {
  try {
    // {
    //   "date": "15-05-2021",
    //   "duration": 4
    // }
    const requestData = req.body

    const startOfDay = moment(requestData.date, 'DD-MM-YYYY').startOf('day')
    const endOfDay = moment(requestData.date, 'DD-MM-YYYY').endOf('day')

    const list = await calendar.events.list({
      auth: jwtClient,
      calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
    })

    let freeSlots = []

    for (
      const startTime = startOfDay.clone().add(1, 'hour');
      startTime
        .clone()
        .add(requestData.duration, 'hours')
        .isSame(startOfDay, 'day');
      startTime.add(1, 'hour')
    ) {
      const endTime = startTime.clone().add(requestData.duration, 'hours')
      freeSlots.push({
        start: startTime.toDate(),
        end: endTime.toDate(),
      })
    }

    for (const event of list.data.items) {
      freeSlots = freeSlots.filter((item) => {
        const eventRange = moment.range(
          moment(event.start.dateTime),
          moment(event.end.dateTime)
        )
        const itemRange = moment.range(moment(item.start), moment(item.end))

        return !itemRange.overlaps(eventRange)
      })
    }

    return res.json(freeSlots)
  } catch (error) {
    return res.json({ error })
  }
})

app.post('/add', async (req, res) => {
  try {
    // {
    //   summary: 'A new dynamic event!',
    //   start: '2021-05-14T19:30:00.000Z',
    //   end: '2021-05-14T23:30:00.000Z',
    // }
    const requestData = req.body

    const result = await calendar.events.insert({
      auth: jwtClient,
      calendarId,
      requestBody: {
        start: {
          dateTime: moment(requestData.start).toISOString(),
        },
        end: {
          dateTime: moment(requestData.end).toISOString(),
        },
        source: {
          title: 'Event Bot',
          url: 'http://event-booking.github.io',
        },
        summary: requestData.summary,
      },
    })

    return res.json(result)
  } catch (error) {
    return res.json({ error: true })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT} 👍`)
})
