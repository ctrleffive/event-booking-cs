import moment from 'moment'
import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  FormControl,
  Alert,
  Modal,
  Row,
} from 'react-bootstrap'

const API_ENDPOINT = 'http://localhost:3001'

const App = () => {
  const [date, setDate] = useState(moment().format('DD-MM-YYYY'))
  const [duration, setDuration] = useState(1)
  const [isFetchLoading, setIsFetchLoading] = useState(false)
  const [isSetLoading, setIsSetLoading] = useState(false)
  const [isError, setIsError] = useState()
  const [eventAdded, setEventAdded] = useState(false)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState()
  const [summary, setSummary] = useState('')

  const resetAll = () => {
    setSummary('')
    setSlots([])
    setSelectedSlot(null)
    setIsError(null)
  }

  const getSlots = async (body) => {
    try {
      if (!date || !duration) {
        throw Error('Invalid inputs!')
      } else if (date !== moment(date, 'DD-MM-YYYY').format('DD-MM-YYYY')) {
        throw Error('Invalid date format! Format must be DD-MM-YYYY')
      }
      setEventAdded(false)
      setIsError(null)
      setIsFetchLoading(true)
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
      setIsError(error?.message || 'Some error occurred! Please try again.')
    } finally {
      setIsFetchLoading(false)
    }
  }

  const addNewEvent = async (body) => {
    try {
      setEventAdded(false)
      setIsError(null)
      setIsSetLoading(true)
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
      setIsError(error?.message || 'Some error occurred! Please try again.')
    } finally {
      setIsSetLoading(false)
    }
  }

  useEffect(() => {
    resetAll()
  }, [duration, date])

  return (
    <Container style={{ padding: '5rem' }}>
      <Row>
        <Col md="6">
          <Form.Group as={Row}>
            <Form.Label column sm="3">
              Date
            </Form.Label>
            <Col sm="9">
              <FormControl
                type="text"
                placeholder="Choose a date"
                disabled={isFetchLoading}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label column sm="3">
              Duration
            </Form.Label>
            <Col sm="9">
              <FormControl
                type="number"
                placeholder="Duration in hours"
                disabled={isFetchLoading}
                value={duration}
                onChange={(event) => setDuration(event.target.valueAsNumber)}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label column sm="3"></Form.Label>
            <Col sm="9">
              <Button
                variant="primary"
                disabled={isFetchLoading}
                onClick={() =>
                  getSlots({
                    date,
                    duration,
                  })
                }
              >
                {isFetchLoading
                  ? 'loading...'
                  : slots.length > 0
                  ? 'Refetch Slots'
                  : 'Get Slots'}
              </Button>
            </Col>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        {slots.map((item, index) => (
          <Col
            sm="3"
            key={index}
            onClick={() => {
              setEventAdded(false)
              setSelectedSlot(item)
            }}
          >
            <Card style={{ width: '18rem' }}>
              <Card.Body>
                <Card.Title>{moment(item.start).format('LT')}</Card.Title>
                <Card.Text>
                  With {duration} hours, ends on {moment(item.end).format('LT')}
                </Card.Text>
                <Button variant="primary">Book This Slot</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={!!selectedSlot} onHide={() => setSelectedSlot(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Book Slot</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group as={Row}>
            <Form.Label column sm="4">
              Event Details
            </Form.Label>
            <Col sm="8">
              <FormControl
                disabled={isSetLoading}
                as="textarea"
                placeholder="Details (optional)"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="4"></Form.Label>
            <Col sm="8">
              <Button
                disabled={isSetLoading}
                variant="primary"
                onClick={() =>
                  addNewEvent({
                    ...selectedSlot,
                    summary,
                  })
                }
              >
                {isSetLoading ? 'loading...' : 'Add New Event'}
              </Button>
            </Col>
          </Form.Group>
        </Modal.Body>
      </Modal>

      {isError && <Alert variant="danger">{isError}</Alert>}
      {eventAdded && <Alert variant="success">Event added to calendar!</Alert>}
    </Container>
  )
}

export default App
