import { useState } from 'react'
import './App.css'

function App() {
const [title, setTitle] = useState('')
const [description, setDescription] = useState('')
const [category, setCategory] = useState('Network/Internet')
const [priority, setPriority] = useState('MEDIUM')
const [message, setMessage] = useState('')
const [ticket, setTicket] = useState(null)
const [loading, setLoading] = useState(false)

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
  const response = await fetch('https://opulent-space-spoon-wrxg99j9w9v7h77p-8080.app.github.dev/api/test/ticket', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const savedTicket = await response.json()

  setTicket(savedTicket)
  setMessage('Ticket submitted successfully!')
} catch (error) {
  console.error(error)
  setMessage(
    'The ticket could not be submitted. Make sure the Spring Boot server is running.'
  )
} finally {
  setLoading(false)
}

}

return (
<main className="app">
<header className="header">
<h1>IT Help Desk</h1>
<p>Submit a technology support request</p>
</header>

  <section className="ticket-card">
    <h2>Submit New Ticket</h2>

    <form onSubmit={handleSubmit}>
      <label htmlFor="title">Title</label>
      <input
        id="title"
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Example: Laptop cannot connect to Wi-Fi"
        required
      />

      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Describe the technology problem..."
        rows="6"
        required
      />

      <label htmlFor="category">Category</label>
      <select
        id="category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      >
        <option value="Hardware">Hardware</option>
        <option value="Software">Software</option>
        <option value="Network/Internet">Network/Internet</option>
        <option value="Account/Access">Account/Access</option>
        <option value="Other">Other</option>
      </select>

      <label htmlFor="priority">Priority</label>
      <select
        id="priority"
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Ticket'}
      </button>
    </form>

    {message && <p className="message">{message}</p>}

    {ticket && (
      <div className="confirmation">
        <h3>Ticket Submitted</h3>
        <p>
          <strong>Ticket ID:</strong> {ticket.id}
        </p>
        <p>
          <strong>Title:</strong> {ticket.title}
        </p>
        <p>
          <strong>Status:</strong> {ticket.status}
        </p>
        <p>
          <strong>Priority:</strong> {ticket.priority}
        </p>
        <p>
          <strong>Category:</strong> {ticket.category?.name}
        </p>
      </div>
    )}
  </section>
</main>

)
}

export default App
