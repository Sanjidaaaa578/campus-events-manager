# Campus Events Manager

Campus Events Manager is a university software engineering web application where students browse and register for campus events, organizers create and manage events, and admins view comprehensive reports. Data is stored persistently in SQLite.

## User Roles
- **Student**: Browse events, register/cancel registration, view registered events, and receive notifications.
- **Organizer**: Create, edit, and delete events, and view attendee lists.
- **Admin**: Approve or reject submitted events, and view system reports and analytics.

## Planned Features

### 1. Users and Authentication
- Register and log in
- Role-based access (Student, Organizer, Admin)
- View and edit own profile

### 2. Event Management
- Organizer creates, edits, and deletes events (title, description, date, time, venue, capacity, category)
- Search events by keyword
- Filter events by category and date
- Admin approves or rejects submitted events

### 3. Event Registration
- Student registers for an event and cancels registration
- Capacity check (no registration when the event is full)
- Waiting list when an event is full
- Student views "My Registered Events"
- Organizer views the attendee list

### 4. Notifications
- Notify the student when registration is confirmed or cancelled
- Notify registered students when an event is updated or cancelled
- Reminder before the event
- View notifications in the app

### 5. Admin Reports
- Total events and registrations
- Most popular events
- Attendance per event
- Events per category

## Tech Stack
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Testing**: Jest (Unit testing), Selenium (End-to-End testing)
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Git

### Installation and Setup
```powershell
# Clone repository
git clone https://github.com/Sanjidaaaa578/campus-events-manager.git

# Navigate to project folder
cd campus-events-manager

# Install dependencies
npm install

# Run tests
npm test
```

## Git Workflow
- Direct commits to `main` are restricted. All development is conducted on dedicated branches.
- Branch naming conventions:
  - `feature/<name>`: New features
  - `fix/<name>`: Bug fixes
  - `test/<name>`: Adding or modifying tests
  - `docs/<name>`: Documentation changes
  - `chore/<name>`: Tooling, dependencies, setup, and maintenance

## Commit Message Format
All commits follow standard conventional prefix format:
- `feat:` for new features
- `test:` for test additions or updates
- `fix:` for bug fixes
- `docs:` for documentation updates
- `chore:` for build tasks, package updates, setup, etc.

*Example:* `feat: add student event registration endpoint`

## Status
In development
