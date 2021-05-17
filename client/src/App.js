import moment from 'moment'
import { useState } from 'react'

const API_ENDPOINT = 'http://localhost:3001'

const App = () => {
  const [date, setDate] = useState(moment().format('DD-MM-YYYY'))
  const [duration, setDuration] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [eventAdded, setEventAdded] = useState(false)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState()
  const [summary, setSummary] = useState('')

  const resetAll = () => {
    setSummary('')
    setSlots([])
    setSelectedSlot(null)
    setIsError(false)
  }

  const getSlots = async (body) => {
    try {
      setEventAdded(false)
      setIsError(false)
      setIsLoading(true)
      const apiResponse = await fetch(API_ENDPOINT + '/slots', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (apiResponse.status !== 200) {
        throw Error()
      }
      const data = await apiResponse.json()
      setSlots(data)
    } catch (error) {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const addNewEvent = async (body) => {
    try {
      setEventAdded(false)
      setIsError(false)
      setIsLoading(true)
      const apiResponse = await fetch(API_ENDPOINT + '/add', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (apiResponse.status !== 200) {
        throw Error()
      }
      setEventAdded(true)
      resetAll()
    } catch (error) {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div>
        {isLoading ? 'loading...' : ''}
        {isError && <div>Some error occurred! Please try again.</div>}
        <input
          type="text"
          placeholder="Date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <input
          type="number"
          placeholder="Duration"
          value={duration}
          onChange={(event) => setDuration(event.target.valueAsNumber)}
        />
        <button
          type="button"
          onClick={() =>
            getSlots({
              date,
              duration,
            })
          }
        >
          Get Slots
        </button>
      </div>
      <ul>
        {slots.map((item, index) => (
          <li
            key={index}
            onClick={() => {
              setEventAdded(false)
              setSelectedSlot(item)
            }}
          >
            <b>{item.start}</b>
            <span> to </span>
            <b>{item.end}</b>
          </li>
        ))}
      </ul>

      {selectedSlot && (
        <div>
          <input
            type="text"
            placeholder="Details"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
          <button
            onClick={() =>
              addNewEvent({
                ...selectedSlot,
                summary,
              })
            }
          >
            Add New Event
          </button>
        </div>
      )}

      {eventAdded && <div>Event added to calendar!</div>}
    </div>
  )
}

export default App
