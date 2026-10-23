import { useCallback, useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:8080/api/tickets';

function App() {
  const [view, setView] = useState('requester');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Network/Internet');
  const [priority, setPriority] = useState('MEDIUM');
  const [message, setMessage] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [listError, setListError] = useState('');

  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [managementMessage, setManagementMessage] = useState('');

  const [notesTicket, setNotesTicket] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  const [noteVisibleToRequester, setNoteVisibleToRequester] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesMessage, setNotesMessage] = useState('');

  const loadTickets = useCallback(async () => {
    const params = new URLSearchParams();

    if (searchText.trim()) params.set('q', searchText.trim());
    if (statusFilter) params.set('status', statusFilter);
    if (priorityFilter) params.set('priority', priorityFilter);
    if (categoryFilter) params.set('category', categoryFilter);

    const query = params.toString();

    try {
      const response = await fetch(
        query ? `${API_URL}?${query}` : API_URL
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Unable to load tickets.');
      }

      setTickets(await response.json());
      setListError('');
    } catch (error) {
      setListError(error.message || 'Unable to load tickets.');
    }
  }, [searchText, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(loadTickets, 300);
    return () => clearTimeout(timer);
  }, [loadTickets]);

  const loadStaff = useCallback(async () => {
    setStaffLoading(true);

    try {
      const response = await fetch(`${API_URL}/staff`);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Unable to load IT staff.');
      }

      setStaff(await response.json());
      setManagementMessage('');
    } catch (error) {
      setManagementMessage(error.message || 'Unable to load IT staff.');
    } finally {
      setStaffLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'staff') {
      loadStaff();
      loadTickets();
    }
  }, [view, loadStaff, loadTickets]);

  const filtersActive = Boolean(
    searchText.trim() || statusFilter || priorityFilter || categoryFilter
  );

  const clearFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage('Please enter a title and description.');
      return;
    }

    setLoading(true);
    setMessage('');
    setTicket(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to submit ticket.');
      }

      setTicket(data);
      setMessage(`Ticket #${data.id} submitted successfully!`);
      setTitle('');
      setDescription('');
      setCategory('Network/Internet');
      setPriority('MEDIUM');
      await loadTickets();
    } catch (error) {
      setMessage(error.message || 'Unable to submit ticket.');
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId, endpoint, value) => {
    setManagementMessage('Updating ticket...');

    try {
      const response = await fetch(
        `${API_URL}/${ticketId}/${endpoint}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update ticket.');
      }

      setManagementMessage(`Ticket #${ticketId} updated successfully.`);
      await loadTickets();
    } catch (error) {
      setManagementMessage(error.message || 'Unable to update ticket.');
    }
  };

  const assignTicket = async (ticketId, staffId) => {
    setManagementMessage('Assigning ticket...');

    try {
      const response = await fetch(
        `${API_URL}/${ticketId}/assignment`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ staffId: Number(staffId) }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to assign ticket.');
      }

      setManagementMessage(`Ticket #${ticketId} assigned successfully.`);
      await loadTickets();
    } catch (error) {
      setManagementMessage(error.message || 'Unable to assign ticket.');
    }
  };

  const handleStatusChange = (id, value) =>
    updateTicket(id, 'status', value);

  const handlePriorityChange = (id, value) =>
    updateTicket(id, 'priority', value);

  const handleCategoryChange = (id, value) =>
    updateTicket(id, 'category', value);

  const startWork = (id) => updateTicket(id, 'status', 'IN_PROGRESS');
  const resolveTicket = (id) => updateTicket(id, 'status', 'RESOLVED');
  const closeTicket = (id) => updateTicket(id, 'status', 'CLOSED');

  const loadNotes = async (ticketId = notesTicket?.id) => {
    if (!ticketId) return;

    setNotesLoading(true);
    setNotesMessage('');

    try {
      const response = await fetch(`${API_URL}/${ticketId}/notes`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to load conversation (HTTP ${response.status}).`
        );
      }

      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotesMessage(error.message || 'Unable to load conversation.');
    } finally {
      setNotesLoading(false);
    }
  };

  const openNotes = async (selectedTicket) => {
    setNotesTicket(selectedTicket);
    setNotes([]);
    setNoteContent('');
    setNotesMessage('');
    setNoteVisibleToRequester(true);
    await loadNotes(selectedTicket.id);
  };

const sendNote = async (event) => {
  event.preventDefault();

  if (!notesTicket || !noteContent.trim()) {
    setNotesMessage('Enter a message before sending.');
    return;
  }

  setNotesLoading(true);
  setNotesMessage('');

  const senderType = view === 'staff' ? 'IT_STAFF' : 'USER';

  try {
    const response = await fetch(
      `${API_URL}/${notesTicket.id}/notes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: noteContent.trim(),
          visibleToRequester:
            senderType === 'USER' ? true : noteVisibleToRequester,
          senderType,
        }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
          `Unable to send message (HTTP ${response.status}).`
      );
    }

    setNoteContent('');
    await loadNotes();
    setNotesMessage('Message sent successfully.');
  } catch (error) {
    setNotesMessage(
      error.message || 'Unable to send message.'
    );
  } finally {
    setNotesLoading(false);
  }
};

  const renderFilters = () => (
    <div className="ticket-filters">
      <input
        type="search"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        placeholder="Search by ticket ID or keyword"
        aria-label="Search tickets"
      />

      <select
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
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
      >
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <select
        value={categoryFilter}
        onChange={(event) => setCategoryFilter(event.target.value)}
      >
        <option value="">All categories</option>
        <option value="Hardware">Hardware</option>
        <option value="Software">Software</option>
        <option value="Network/Internet">Network/Internet</option>
        <option value="Account/Access">Account/Access</option>
        <option value="Other">Other</option>
      </select>

      <button type="button" onClick={clearFilters} disabled={!filtersActive}>
        Clear filters
      </button>
    </div>
  );

  const renderNotes = () => {
  if (!notesTicket) {
    return null;
  }

  return (
    <section className="ticket-card">
      <h2>Conversation: Ticket #{notesTicket.id}</h2>
      <p>{notesTicket.title}</p>

      <button
        type="button"
        onClick={() => {
          setNotesTicket(null);
          setNotes([]);
          setNotesMessage('');
        }}
      >
        Close Conversation
      </button>

      <button
        type="button"
        onClick={loadNotes}
        disabled={notesLoading}
      >
        {notesLoading ? 'Loading...' : 'Refresh Conversation'}
      </button>

      {notesMessage && (
        <p className="message" role="status">
          {notesMessage}
        </p>
      )}

      <div className="conversation-messages">
        <h3>Messages</h3>

        {notesLoading && notes.length === 0 ? (
          <p>Loading conversation...</p>
        ) : notes.length === 0 ? (
          <p>No messages yet. Start the conversation below.</p>
        ) : (
          notes.map((note) => (
            <article className="saved-ticket" key={note.id}>
              <p>
                <strong>
                  {note.author?.role?.toUpperCase() === 'IT_STAFF'
                    ? 'IT Staff'
                    : 'User'}
                </strong>
              </p>

              <p>{note.content}</p>

              <p>
                <small>
                  {note.createdAt
                    ? new Date(note.createdAt).toLocaleString()
                    : ''}
                </small>
              </p>

              <p>
                <small>
                  {note.visibleToRequester
                    ? 'Requester-visible message'
                    : 'Internal IT note'}
                </small>
              </p>
            </article>
          ))
        )}
      </div>

      <form onSubmit={sendNote}>
        <label>
          Message
          <textarea
            value={noteContent}
            onChange={(event) => setNoteContent(event.target.value)}
            placeholder="Write your update..."
            required
          />
        </label>

        {view === 'staff' && (
          <label>
            <input
              type="checkbox"
              checked={noteVisibleToRequester}
              onChange={(event) =>
                setNoteVisibleToRequester(event.target.checked)
              }
            />
            Visible to requester
          </label>
        )}

        <button
          type="submit"
          disabled={notesLoading || !noteContent.trim()}
        >
          {notesLoading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </section>
  );
};

  const renderTicket = (item, isStaffView = false) => (
    <div className="saved-ticket" key={item.id}>
      <h3>Ticket #{item.id}: {item.title}</h3>
      <p>{item.description}</p>

      {isStaffView && (
        <p>
          <strong>Requester:</strong> {item.requester?.fullName || 'Unknown'}
        </p>
      )}

      <p><strong>Status:</strong> {item.status}</p>
      <p><strong>Priority:</strong> {item.priority}</p>
      <p><strong>Category:</strong> {item.category?.name}</p>
      <p>
        <strong>Assigned To:</strong>{' '}
        {item.assignedStaff?.fullName || 'Unassigned'}
      </p>

      {isStaffView && (
        <>
          <div className="ticket-management">
            <label>
              Assign To
              <select
                value={item.assignedStaff?.id || ''}
                onChange={(event) => {
                  if (event.target.value) {
                    assignTicket(item.id, event.target.value);
                  }
                }}
              >
                <option value="">Select IT staff</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select
                value={item.status}
                onChange={(event) =>
                  handleStatusChange(item.id, event.target.value)
                }
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </label>

            <label>
              Priority
              <select
                value={item.priority}
                onChange={(event) =>
                  handlePriorityChange(item.id, event.target.value)
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
                value={item.category?.name || ''}
                onChange={(event) =>
                  handleCategoryChange(item.id, event.target.value)
                }
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network/Internet">Network/Internet</option>
                <option value="Account/Access">Account/Access</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          <div className="ticket-actions">
            <button
              type="button"
              onClick={() => startWork(item.id)}
              disabled={item.status === 'IN_PROGRESS'}
            >
              Start Work
            </button>
            <button
              type="button"
              onClick={() => resolveTicket(item.id)}
              disabled={['RESOLVED', 'CLOSED'].includes(item.status)}
            >
              Resolve
            </button>
            <button
              type="button"
              onClick={() => closeTicket(item.id)}
              disabled={item.status === 'CLOSED'}
            >
              Close
            </button>
          </div>
        </>
      )}

      <button type="button" onClick={() => openNotes(item)}>
        View Conversation
      </button>
    </div>
  );

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
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Network/Internet">Network/Internet</option>
                    <option value="Account/Access">Account/Access</option>
                    <option value="Other">Other</option>
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
              {renderFilters()}
              {listError && <p className="message">{listError}</p>}

              {tickets.length === 0 ? (
                <p>
                  {filtersActive
                    ? 'No tickets match your search or filters.'
                    : 'No tickets have been submitted.'}
                </p>
              ) : (
                tickets.map((item) => renderTicket(item))
              )}
            </section>

            {renderNotes()}
          </>
        ) : (
          <>
            <section className="ticket-card staff-dashboard">
              <h2>IT Staff Dashboard</h2>
              <p>Manage tickets, assignments, priorities, categories, status, and conversations.</p>

              {managementMessage && (
                <p className="message">{managementMessage}</p>
              )}

              {staffLoading ? (
                <p>Loading IT staff...</p>
              ) : (
                <p>Available IT staff: {staff.length}</p>
              )}

              {listError && <p className="message">{listError}</p>}
              {renderFilters()}

              {tickets.length === 0 ? (
                <p>
                  {filtersActive
                    ? 'No tickets match your search or filters.'
                    : 'No tickets have been submitted.'}
                </p>
              ) : (
                <div className="staff-ticket-list">
                  {tickets.map((item) => renderTicket(item, true))}
                </div>
              )}
            </section>

            {renderNotes()}
          </>
        )}
      </main>
    </div>
  );
}

export default App;