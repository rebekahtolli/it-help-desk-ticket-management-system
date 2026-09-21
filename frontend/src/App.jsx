import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Network/Internet')
  const [priority, setPriority] = useState('MEDIUM')
  const [message, setMessage] = useState('')
  const [ticket, setTicket] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)

  const loadTickets = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/tickets')

      if (!response.ok) {
        throw new Error('Unable to load tickets.')
      }

      const data = await response.json()
      setTickets(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!title.trim() || !description.trim()) {
      setMessage('Please enter a title and description.')
      return
    }

    setLoading(true)
    setMessage('')
    setTicket(null)

    try {
      const response = await fetch('http://localhost:8080/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to submit ticket.')
      }

      setTicket(data)
      setMessage('Ticket submitted successfully!')

      setTitle('')
      setDescription('')
      setCategory('Network/Internet')
      setPriority('MEDIUM')

      await loadTickets()
    } catch (error) {
      setMessage(error.message || 'Unable to submit ticket.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>IT Help Desk</h1>
        <p>Submit a technology support request</p>
      </header>

      <main>
        <section className="ticket-card">
          <h2>Submit New Ticket</h2>

          <form onSubmit={handleSubmit}>
            <label>
              Title
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Laptop cannot connect"
                required
              />
            </label>

            <label>
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the technology problem..."
                required
              />
            </label>

            <label>
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option>Hardware</option>
                <option>Software</option>
                <option>Network/Internet</option>
                <option>Account/Access</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Priority
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>

            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>

          {message && <p className="message">{message}</p>}

          {ticket && (
            <div className="confirmation">
              <h3>Ticket Created</h3>
              <p><strong>Ticket ID:</strong> {ticket.id}</p>
              <p><strong>Title:</strong> {ticket.title}</p>
              <p><strong>Status:</strong> {ticket.status}</p>
              <p><strong>Priority:</strong> {ticket.priority}</p>
              <p><strong>Category:</strong> {ticket.category?.name}</p>
            </div>
          )}
        </section>

        <section className="ticket-card">
          <h2>Submitted Tickets</h2>

          {tickets.length === 0 ? (
            <p>No tickets have been submitted.</p>
          ) : (
            tickets.map((savedTicket) => (
              <div className="saved-ticket" key={savedTicket.id}>
                <h3>
                  Ticket #{savedTicket.id}: {savedTicket.title}
                </h3>
                <p>{savedTicket.description}</p>
                <p>
                  <strong>Status:</strong> {savedTicket.status}
                </p>
                <p>
                  <strong>Priority:</strong> {savedTicket.priority}
                </p>
                <p>
                  <strong>Category:</strong> {savedTicket.category?.name}
                </p>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  )
}

export default App