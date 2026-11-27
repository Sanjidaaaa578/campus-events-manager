# Campus Events Manager

Campus Events Manager is a full-featured university Software Engineering web application where students browse and register for campus events, organizers create and manage events, and admins view comprehensive reports and approve events. Data is stored persistently in SQLite.

## User Roles
- **Student**: Browse events, register/cancel registration, enter waitlists when full, view registered events, and receive in-app notifications.
- **Organizer**: Create, edit, and delete events, view attendee and waitlist rosters, and send reminders.
- **Admin**: Approve or reject submitted events, and access system-wide reports and analytics.

---

## Implemented Features (5 Modules)

### 1. Users and Authentication
- Register and log in with secure password hashing (`bcryptjs`) and JWT token authentication.
- Role-based access control (Student, Organizer, Admin) with authorization middleware.
- View and edit own user profile.

### 2. Event Management
- Organizer creates, edits, and deletes events (title, description, date, time, venue, capacity, category).
- Search events by keyword (title, description, venue).
- Filter events by category and date.
- Admin approves or rejects submitted events.

### 3. Event Registration
- Student registers for an event and cancels registration.
- Capacity check strictly enforces seat limits.
- Automated waiting list when an event is full.
- Automatic waitlist promotion when a confirmed student cancels.
- Student views "My Registered Events".
- Organizer views attendee and waiting lists.

### 4. Notifications
- Notify the student when registration is confirmed or waitlisted.
- Notify registered students when an event is updated or cancelled.
- Automatic alert to waitlisted students upon promotion.
- Pre-event reminder broadcasts sent by organizers.
- View in-app notifications and mark as read.

### 5. Admin Reports
- Total events, approved events, registrations, waitlisted count, and cancellations.
- Most popular events ranked by attendee count.
- Attendance and occupancy percentage per event (`(registered / capacity) * 100`).
- Events and registration breakdown per category.

---

## Software Engineering Design Patterns
1. **Factory Pattern** (`src/patterns/user.factory.js`):
   - Encapsulates role-based instantiation of `StudentUser`, `OrganizerUser`, and `AdminUser` with specialized permissions.
2. **Strategy Pattern** (`src/patterns/event.strategy.js`):
   - Dynamic event query sorting strategies (`SortByDateStrategy`, `SortByTitleStrategy`, `SortByCapacityStrategy`) via `EventQueryContext`.
3. **Observer Pattern** (`src/patterns/notification.observer.js`):
   - `NotificationSubject` with `RegistrationObserver`, `WaitlistPromotionObserver`, and `EventBroadcastObserver` to decouple event lifecycle actions from notification creation.

---

## Tech Stack
- **Backend**: Node.js, Express
- **Database**: SQLite3 (with foreign key constraints and memory mode for tests)
- **Frontend**: Responsive HTML5, CSS3, JavaScript (Fetch API) in `public/`
- **Testing**: Jest (Unit & Integration), Supertest (HTTP assertions), Selenium WebDriver (E2E browser automation)
- **CI/CD**: GitHub Actions (Node.js 18.x and 20.x test matrix)

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Git
- Google Chrome (for Selenium E2E tests)

### Installation and Setup
```powershell
# Clone repository
git clone https://github.com/Sanjidaaaa578/campus-events-manager.git

# Navigate to project folder
cd campus-events-manager

# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```
The application will be accessible at: `http://localhost:3000`

---

## Running Tests

```powershell
# Run Unit and Integration tests (63 tests)
npm test

# Run code coverage report
npm run test:coverage

# Run Selenium End-to-End browser tests (headless Chrome)
npm run test:e2e

# Run all test suites
npm run test:all
```

---

## Git Workflow
- Direct commits to `main` are restricted. All development is conducted on dedicated branches.
- Branch naming conventions:
  - `feature/<name>`: New features
  - `fix/<name>`: Bug fixes
  - `test/<name>`: Adding or modifying tests
  - `docs/<name>`: Documentation changes
  - `chore/<name>`: Tooling, dependencies, setup, and maintenance

## Commit Message Format
All commits follow conventional commits:
- `feat:` for new features
- `test:` for test additions or updates
- `fix:` for bug fixes
- `docs:` for documentation updates
- `chore:` for build tasks, package updates, setup, etc.

## Documentation
- Detailed software architecture and complete API reference can be found in [docs/architecture.md](file:///f:/campus-events-manager/docs/architecture.md).

## Status
Completed & Fully Tested
