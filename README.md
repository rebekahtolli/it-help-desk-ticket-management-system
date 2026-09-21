# IT Help Desk Ticket Management System

Developed by Team Alpha

## Project Overview

The IT Help Desk Ticket Management System is a web application designed to allow users to submit technology support requests and allow IT staff to manage those requests.

The current implementation includes a working vertical slice for ticket submission. A requester can enter a ticket through the React interface, submit it to the Spring Boot backend, store the ticket in a MySQL database, and retrieve the saved ticket for display in the interface.

## Project Tech Stack

- Frontend: React 19 with Vite
- Backend: Java with Spring Boot 4
- Database: MySQL 8
- Persistence: Spring Data JPA / Hibernate
- Build Tools: Maven Wrapper and npm

## Software Used During Development

The project was tested with the following versions:

- Java 25.0.1
- Spring Boot 4.0.8
- MySQL Server 8.0.46
- Node.js 24.21.0
- npm 11.19.0
- React 19.2.8
- Vite 8.3.0

The Maven Wrapper is included with the backend project, so a separate Maven installation is not required.

## Database Setup

MySQL Server must be installed and running before starting the backend.

Create a database for the application:

```sql
CREATE DATABASE helpdesk_db;
```

The application uses environment variables for the database connection. Database credentials should not be stored directly in the repository.

### Windows Command Prompt

Set the following environment variables before starting the backend:

```bat
set DB_URL=jdbc:mysql://localhost:3306/helpdesk_db
set DB_USERNAME=YOUR_MYSQL_USERNAME
set DB_PASSWORD=YOUR_MYSQL_PASSWORD
```

Replace `YOUR_MYSQL_USERNAME` and `YOUR_MYSQL_PASSWORD` with the credentials for your local MySQL installation.

### macOS/Linux

```bash
export DB_URL=jdbc:mysql://localhost:3306/helpdesk_db
export DB_USERNAME=YOUR_MYSQL_USERNAME
export DB_PASSWORD=YOUR_MYSQL_PASSWORD
```

The application uses Hibernate with `spring.jpa.hibernate.ddl-auto=update`, so the required application tables are created or updated automatically when the backend starts successfully.

No SQL seed file is required for the current vertical slice. When the first ticket is submitted, the application creates the current test requester and the selected ticket category if they do not already exist.

## Running the Backend

From the root of the repository, change to the backend directory.

### Windows

```bat
cd backend
mvnw.cmd spring-boot:run
```

### macOS/Linux

```bash
cd backend
./mvnw spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

The ticket API is available at:

```text
http://localhost:8080/api/tickets
```

## Running the Frontend

Open a second terminal and change to the frontend directory:

```bat
cd frontend
npm install
npm run dev
```

Vite will display the local development address. By default, the application is available at:

```text
http://localhost:5173
```

Open that address in a web browser.

## Current Vertical Slice

The current working vertical slice implements ticket submission from the user interface through the database.

The process is:

1. The requester enters a title, description, category, and priority in the React interface.
2. The requester selects **Submit Ticket**.
3. The frontend sends a POST request to `/api/tickets`.
4. `TicketController` receives and validates the request.
5. `TicketService` sends the ticket through the persistence layer.
6. Spring Data JPA/Hibernate saves the ticket to MySQL.
7. The backend returns the created ticket to the frontend.
8. The interface displays a successful submission confirmation.
9. The frontend retrieves saved tickets from `/api/tickets` and displays them in the Submitted Tickets section.
10. Refreshing the page retrieves the persisted ticket from the database again.

The backend also rejects invalid ticket submissions, such as a request with a missing title, instead of creating an invalid database record.

## Current Database Tables

The current data model includes:

- `users`
- `categories`
- `tickets`
- `ticket_notes`
- `ticket_history`

For the current ticket-submission vertical slice, the main tables involved are `users`, `categories`, and `tickets`.

The `tickets` table contains relationships to the requester, category, and assigned IT staff member. The assigned staff relationship can remain empty when a new ticket is first submitted.

## Testing the Backend

Make sure the database environment variables are set and MySQL is running.

From the backend directory:

```bat
mvnw.cmd test
```

A successful test run should end with:

```text
BUILD SUCCESS
```

## Building the Frontend

From the frontend directory:

```bat
npm run build
```

A successful build creates the production files in the frontend `dist` directory.

## Current Implementation Status

The current system skeleton supports creating and retrieving help desk tickets through the React interface, Spring Boot backend, and MySQL database.

Future development will expand the system to include features such as IT staff ticket management, ticket assignment, status changes, notes, ticket history, overdue ticket identification, and the remaining planned functionality.