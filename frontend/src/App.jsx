import { useCallback, useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8080/api/tickets'

function App() {
  const [view, setView] = useState('requester')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Network/Internet')
  const [priority, setPriority] = useState('MEDIUM')
  const [message, setMessage] = useState('')
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(false)

  const [tickets, setTickets] = useState([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [listError, setListError] = useState('')

  const [staff, setStaff] = useState([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [managementMessage, setManagementMessage] = useState('')

  const loadTickets = useCallback(async () => {
    const params = new URLSearchParams()

    if (searchText.trim()) {
      params.set('q', searchText.trim())
    }

    if (statusFilter) {
      params.set('status', statusFilter)
    }

    if (priorityFilter) {
      params.set('priority', priorityFilter)
    }

    if (categoryFilter) {
      params.set('category', categoryFilter)
    }

    const query = params.toString()
    const url = query ? `${API_URL}?${query}` : API_URL

    try {
      const response = await fetch(url)

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

  useEffect(() => {
    const timer = setTimeout(loadTickets, 300)

    return () => clearTimeout(timer)
  }, [loadTickets])

  const loadStaff = useCallback(async () => {
    setStaffLoading(true)

    try {
      const response = await fetch(`${API_URL}/staff`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Unable to load IT staff.')
      }

      setStaff(await response.json())
    } catch (error) {
      setManagementMessage(
        error.message || 'Unable to load IT staff.'
      )
    } finally {
      setStaffLoading(false)
    }
  }, [])

  useEffect(() => {
    if (view === 'staff') {
      loadStaff()
      loadTickets()
    }
  }, [view, loadStaff, loadTickets])

  const filtersActive =
    searchText.trim() ||
    statusFilter ||
    priorityFilter ||
    categoryFilter

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
      const response = await fetch(API_URL, {
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

  const updateTicket = async (ticketId, endpoint, value) => {
    setManagementMessage('Updating ticket...')

    try {
      const response = await fetch(
        `${API_URL}/${ticketId}/${endpoint}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            value,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to update ticket.'
        )
      }

      setManagementMessage(
        `Ticket #${ticketId} updated successfully.`
      )

      await loadTickets()
    } catch (error) {
      setManagementMessage(
        error.message || 'Unable to update ticket.'
      )
    }
  }

  const assignTicket = async (ticketId, staffId) => {
    setManagementMessage('Assigning ticket...')

    try {
      const response = await fetch(
        `${API_URL}/${ticketId}/assignment`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            staffId: Number(staffId),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to assign ticket.'
        )
      }

      setManagementMessage(
        `Ticket #${ticketId} assigned successfully.`
      )

      await loadTickets()
    } catch (error) {
      setManagementMessage(
        error.message || 'Unable to assign ticket.'
      )
    }
  }

  const handleStatusChange = async (ticketId, status) => {
    await updateTicket(ticketId, 'status', status)
  }

  const handlePriorityChange = async (ticketId, priorityValue) => {
    await updateTicket(ticketId, 'priority', priorityValue)
  }

  const handleCategoryChange = async (ticketId, categoryValue) => {
    await updateTicket(ticketId, 'category', categoryValue)
  }

  const startWork = async (ticketId) => {
    await updateTicket(ticketId, 'status', 'IN_PROGRESS')
  }

  const resolveTicket = async (ticketId) => {
    await updateTicket(ticketId, 'status', 'RESOLVED')
  }

  const closeTicket = async (ticketId) => {
    await updateTicket(ticketId, 'status', 'CLOSED')
  }

  return (
    <div className="app">
      <header className="header">
        <h1>IT Help Desk</h1>
        <p>Technology support ticket management system</p>

        <div className="view-toggle">
          <button
            type="button"
            className={view === 'requester' ? 'active' : ''}
            onClick={() => setView('requester')}
          >
            Requester View
          </button>

          <button
            type="button"
            className={view === 'staff' ? 'active' : ''}
            onClick={() => setView('staff')}
          >
            IT Staff Dashboard
          </button>
        </div>
      </header>

      <main>
        {view === 'requester' ? (
          <>
            <section className="ticket-card">
              <h2>Submit New Ticket</h2>

              <form onSubmit={handleSubmit}>
                <label>
                  Title

                  <input
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="Example: Laptop cannot connect"
                    required
                  />
                </label>

                <label>
                  Description

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Describe the technology problem..."
                    required
                  />
                </label>

                <label>
                  Category

                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
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
                    onChange={(event) =>
                      setPriority(event.target.value)
                    }
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

              {message && (
                <p className="message">{message}</p>
              )}

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
                    <strong>Category:</strong>{' '}
                    {ticket.category?.name}
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
                  onChange={(event) =>
                    setSearchText(event.target.value)
                  }
                  placeholder="Search by ticket ID or keyword"
                  aria-label="Search tickets by ticket ID or keyword"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
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
                  onChange={(event) =>
                    setPriorityFilter(event.target.value)
                  }
                  aria-label="Filter by priority"
                >
                  <option value="">All priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value)
                  }
                  aria-label="Filter by category"
                >
                  <option value="">All categories</option>
                  <option>Hardware</option>
                  <option>Software</option>
                  <option>Network/Internet</option>
                  <option>Account/Access</option>
                  <option>Other</option>
                </select>

                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!filtersActive}
                >
                  Clear filters
                </button>
              </div>

              {listError && (
                <p className="message">{listError}</p>
              )}

              {tickets.length === 0 ? (
                <p>
                  {filtersActive
                    ? 'No tickets match your search or filters.'
                    : 'No tickets have been submitted.'}
                </p>
              ) : (
                tickets.map((savedTicket) => (
                  <div
                    className="saved-ticket"
                    key={savedTicket.id}
                  >
                    <h3>
                      Ticket #{savedTicket.id}:{' '}
                      {savedTicket.title}
                    </h3>

                    <p>{savedTicket.description}</p>

                    <p>
                      <strong>Status:</strong>{' '}
                      {savedTicket.status}
                    </p>

                    <p>
                      <strong>Priority:</strong>{' '}
                      {savedTicket.priority}
                    </p>

                    <p>
                      <strong>Category:</strong>{' '}
                      {savedTicket.category?.name}
                    </p>
                  </div>
                ))
              )}
            </section>
          </>
        ) : (
          <section className="ticket-card staff-dashboard">
            <h2>IT Staff Dashboard</h2>

            <p>
              Manage submitted tickets, assignments, priorities,
              categories, and status.
            </p>

            {managementMessage && (
              <p className="message">
                {managementMessage}
              </p>
            )}

            {staffLoading ? (
              <p>Loading IT staff...</p>
            ) : (
              <p>
                Available IT staff: {staff.length}
              </p>
            )}

            {listError && (
              <p className="message">{listError}</p>
            )}

            <div className="ticket-filters">
              <input
                type="search"
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
                placeholder="Search by ticket ID or keyword"
                aria-label="Search tickets by ticket ID or keyword"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
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
                onChange={(event) =>
                  setPriorityFilter(event.target.value)
                }
                aria-label="Filter by priority"
              >
                <option value="">All priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                <option>Hardware</option>
                <option>Software</option>
                <option>Network/Internet</option>
                <option>Account/Access</option>
                <option>Other</option>
              </select>

              <button
                type="button"
                onClick={clearFilters}
                disabled={!filtersActive}
              >
                Clear filters
              </button>
            </div>

            {tickets.length === 0 ? (
              <p>
                {filtersActive
                  ? 'No tickets match your search or filters.'
                  : 'No tickets have been submitted.'}
              </p>
            ) : (
              <div className="staff-ticket-list">
                {tickets.map((savedTicket) => (
                  <div
                    className="saved-ticket staff-ticket"
                    key={savedTicket.id}
                  >
                    <h3>
                      Ticket #{savedTicket.id}:{' '}
                      {savedTicket.title}
                    </h3>

                    <p>{savedTicket.description}</p>

                    <p>
                      <strong>Requester:</strong>{' '}
                      {savedTicket.requester?.fullName ||
                        savedTicket.requester?.username ||
                        'Unknown'}
                    </p>

                    <p>
                      <strong>Current Status:</strong>{' '}
                      {savedTicket.status}
                    </p>

                    <p>
                      <strong>Current Priority:</strong>{' '}
                      {savedTicket.priority}
                    </p>

                    <p>
                      <strong>Current Category:</strong>{' '}
                      {savedTicket.category?.name}
                    </p>

                    <p>
                      <strong>Assigned To:</strong>{' '}
                      {savedTicket.assignedStaff?.fullName ||
                        'Unassigned'}
                    </p>

                    <div className="ticket-management">
                      <label>
                        Assign To

                        <select
                          value={
                            savedTicket.assignedStaff?.id || ''
                          }
                          onChange={(event) => {
                            if (event.target.value) {
                              assignTicket(
                                savedTicket.id,
                                event.target.value
                              )
                            }
                          }}
                        >
                          <option value="">
                            Select IT staff
                          </option>

                          {staff.map((staffMember) => (
                            <option
                              key={staffMember.id}
                              value={staffMember.id}
                            >
                              {staffMember.fullName}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Status

                        <select
                          value={savedTicket.status}
                          onChange={(event) =>
                            handleStatusChange(
                              savedTicket.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">
                            In progress
                          </option>
                          <option value="RESOLVED">
                            Resolved
                          </option>
                          <option value="CLOSED">
                            Closed
                          </option>
                        </select>
                      </label>

                      <label>
                        Priority

                        <select
                          value={savedTicket.priority}
                          onChange={(event) =>
                            handlePriorityChange(
                              savedTicket.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </select>
                      </label>

                      <label>
                        Category

                        <select
                          value={
                            savedTicket.category?.name || ''
                          }
                          onChange={(event) =>
                            handleCategoryChange(
                              savedTicket.id,
                              event.target.value
                            )
                          }
                        >
                          <option>Hardware</option>
                          <option>Software</option>
                          <option>Network/Internet</option>
                          <option>Account/Access</option>
                          <option>Other</option>
                        </select>
                      </label>
                    </div>

                    <div className="ticket-actions">
                      <button
                        type="button"
                        onClick={() =>
                          startWork(savedTicket.id)
                        }
                        disabled={
                          savedTicket.status === 'IN_PROGRESS'
                        }
                      >
                        Start Work
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          resolveTicket(savedTicket.id)
                        }
                        disabled={
                          savedTicket.status === 'RESOLVED' ||
                          savedTicket.status === 'CLOSED'
                        }
                      >
                        Resolve
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          closeTicket(savedTicket.id)
                        }
                        disabled={
                          savedTicket.status === 'CLOSED'
                        }
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
