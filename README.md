# IT Help Desk Ticket Management System

A web-based IT Help Desk Ticket Management System that allows users to submit IT support requests and allows IT staff to manage those requests.

## Project Description

The IT Help Desk Ticket Management System provides a centralized way for an organization to submit and manage IT support requests. Users can create tickets describing their issues, while IT staff can view, search, assign, update, resolve, and close tickets.

The system is designed for small to medium-sized organizations and replaces the need to manage support requests through email, phone calls, or in-person communication.

## Main Features

### Requester

- Create a new support ticket
- Enter a ticket title and description
- Select a category
- Select a priority
- Receive a unique ticket ID
- View submitted tickets
- Search for tickets
- Filter tickets by status, priority, and category
- View ticket status and assignment information

### IT Staff

- View submitted tickets
- Search tickets by ID or keyword
- Filter tickets by status, priority, and category
- Assign tickets to IT staff
- Reassign tickets when needed
- Update ticket status
- Update ticket priority
- Update ticket category
- Resolve tickets
- Close tickets

### Validation and Error Handling

The system includes validation for:

- Required ticket fields
- Invalid ticket priority or status values
- Missing ticket categories
- Tickets that cannot be found
- Invalid staff assignments
- Searches with no matching tickets

The system prevents invalid ticket information from being saved.

## Project Tech Stack

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS

### Backend

- Java
- Spring Boot
- Spring Data JPA
- REST API
- Maven

### Database

- MySQL

### Development Tools

- Visual Studio Code
- Git
- GitHub
- MySQL Workbench

## Testing / Software Versions

The application was developed and tested using the following software versions:

- Java: OpenJDK Temurin 25.0.4.1 LTS
- Node.js: 24.21.0
- npm: 11.19.0
- Maven: 3.9.16
- MySQL Server: 8.0.46
- MySQL Workbench: 8.0.46
- Vite: 8.3.0

## Project Structure

```text
it-help-desk-ticket-management-system/
│
├── backend/
│   ├── src/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## System Architecture

The system uses a three-tier architecture.

### Presentation Layer

The React frontend provides the requester interface and IT Staff Dashboard.

### Application Layer

The Spring Boot backend handles the REST API, ticket management, validation, and application logic.

### Data Layer

The MySQL database stores ticket and user information along with categories, ticket history, and ticket notes.

The frontend communicates with the backend through REST API requests.

## Database Setup

The application uses MySQL for persistent data storage.

Create a database named:

```text
helpdesk_db
```

The application uses the following environment variables:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

The default database configuration is:

```text
DB_URL=jdbc:mysql://localhost:3306/helpdesk_db
DB_USERNAME=helpdesk
DB_PASSWORD=<your database password>
```

Make sure the MySQL user has permission to access the `helpdesk_db` database.

The application uses Hibernate to update the database schema when the backend starts.

## Running the Application

### Start the Backend

Open a terminal in the `backend` directory and run:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

### Start the Frontend

Open another terminal in the `frontend` directory.

If the dependencies have not already been installed, run:

```powershell
npm.cmd install
```

Then run:

```powershell
npm.cmd run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

Open the provided address in a web browser.

## Using the System

### Creating a Ticket

1. Open the application.
2. Enter a ticket title.
3. Enter a description of the issue.
4. Select a category.
5. Select a priority.
6. Submit the ticket.
7. The system creates the ticket and provides a ticket ID.

### Managing a Ticket

IT staff can manage submitted tickets from the IT Staff Dashboard.

1. Find the ticket using the search or filters.
2. Open the ticket.
3. Assign or reassign an IT staff member.
4. Update the status, priority, or category as needed.
5. Resolve the ticket when the issue has been addressed.
6. Close the ticket when the request is complete.

Changes are saved through the backend and stored in the MySQL database.

## Ticket Statuses

- Open
- In Progress
- Resolved
- Closed

## Ticket Priorities

- Low
- Medium
- High

## Ticket Categories

- Hardware
- Software
- Network/Internet
- Account/Access
- Other

## Data Persistence

Ticket information is stored in the MySQL database.

Changes to ticket assignments, status, priority, and category are saved through the backend. This allows ticket information to remain available after refreshing the application.

## API Endpoints

The backend provides REST API endpoints for ticket operations.

```text
GET    /api/tickets
GET    /api/tickets/{id}
GET    /api/tickets/staff
POST   /api/tickets
PUT    /api/tickets/{id}/assignment
PUT    /api/tickets/{id}/status
PUT    /api/tickets/{id}/priority
PUT    /api/tickets/{id}/category
```
