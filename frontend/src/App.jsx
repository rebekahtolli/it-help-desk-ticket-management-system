import { useCallback, useEffect, useState } from 'react'
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
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [listError, setListError] = useState('')

  // The back end performs the search and filtering; the UI only sends the criteria.
  const loadTickets = useCallback(async () => {
    const params = new URLSearchParams()
    if (searchText.trim()) params.set('q', searchText.trim())
    if (statusFilter) params.set('status', statusFilter)
    if (priorityFilter) params.set('priority', priorityFilter)
    if (categoryFilter) params.set('category', categoryFilter)

    const query = params.toString()

    try {
      const response = await fetch(
        `http://localhost:8080/api/tickets${query ? `?${query}` : ''}`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Unable to load tickets.')
      }

      setTickets(await response.json())
      setListError('')
    } catch (error) {
      setListError(error.message || 'Unable to load tickets.')
    }
  }, [searchText, statusFilter, priorityFilter, categoryFilter])

  // Reload (after a short pause while typing) whenever the search or filters change.
  useEffect(() => {
    const timer = setTimeout(loadTickets, 300)
    return () => clearTimeout(timer)
  }, [loadTickets])

  const filtersActive =
    searchText.trim() || statusFilter || priorityFilter || categoryFilter

  const clearFilters = () => {
    setSearchText('')
    setStatusFilter('')
    setPriorityFilter('')
    setCategoryFilter('')
  }

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
      setMessage(`Ticket #${data.id} submitted successfully!`)

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

        <section className="ticket-card">
          <h2>Submitted Tickets</h2>

          <div className="ticket-filters">
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search by ticket ID or keyword"
              aria-label="Search tickets by ticket ID or keyword"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              aria-label="Filter by priority"
            >
              <option value="">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              <option>Hardware</option>
              <option>Software</option>
              <option>Network/Internet</option>
              <option>Account/Access</option>
              <option>Other</option>
            </select>

            <button type="button" onClick={clearFilters} disabled={!filtersActive}>
              Clear filters
            </button>
          </div>

          {listError && <p className="message">{listError}</p>}

          {tickets.length === 0 ? (
            <p>
              {filtersActive
                ? 'No tickets match your search or filters.'
                : 'No tickets have been submitted.'}
            </p>
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
