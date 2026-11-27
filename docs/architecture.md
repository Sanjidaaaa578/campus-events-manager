# Campus Events Manager - Software Engineering Architecture

## 1. System Overview
Campus Events Manager is a university software engineering web application built using Node.js, Express, and SQLite. It provides role-based access for Students, Organizers, and Admins to manage events, register attendees with automated waiting lists, trigger asynchronous notification broadcasts, and generate analytical reports.

## 2. Implemented Modules

### Module 1: Users & Authentication
- **User Registration**: Password hashing with `bcryptjs` (salt rounds = 10) and role assignment (`Student`, `Organizer`, `Admin`).
- **User Login**: Credentials validation and signed JWT issuance (`jsonwebtoken`, 24h validity).
- **Profile Management**: Viewing and editing own name, department, and password.
- **RBAC Middleware**: `authenticateToken` for bearer verification and `authorizeRoles(...roles)` for endpoint permission enforcement.

### Module 2: Event Management
- **Event Creation**: Organizers create events (`title`, `description`, `date`, `time`, `venue`, `capacity`, `category`) that submit as `Pending`.
- **Admin Review**: Admins review and update status to `Approved` or `Rejected`.
- **Search & Filter**: Keyword search on title/venue/description and filtering by category and date.
- **Modification & Deletion**: Organizers edit/delete their own events; unauthorized cross-organizer edits are blocked (403 Forbidden).

### Module 3: Event Registration & Waiting List
- **Capacity Checking**: Strictly validates available seats against `event.capacity`.
- **Automated Waitlist**: When full, registrations are automatically placed on a `Waitlisted` status.
- **Waitlist Promotion**: When an active attendee cancels, the earliest waitlisted student is automatically promoted to `Registered`.
- **My Registered Events**: Students view active registrations and waitlist statuses.
- **Organizer Attendee List**: Organizers view registered and waitlisted attendees with contact info.

### Module 4: Notifications
- **Registration Confirmations**: In-app notifications sent upon successful registration or waitlist placement.
- **Cancellation Notifications**: Confirmation sent upon student cancellation.
- **Promotion Notifications**: Instant alert sent to student promoted from the waitlist.
- **Event Update & Cancellation Broadcasts**: Mass alert notifications dispatched to all registered attendees when an organizer updates venue/time or deletes an event.
- **Event Reminders**: Organizers trigger pre-event reminders to all confirmed attendees.
- **In-App Notification Center**: View inbox and mark notifications as read (`PATCH /api/notifications/:id/read`).

### Module 5: Admin Reports & Analytics
- **Overview Summary**: Aggregates total events, approved events count, total active registrations, waitlisted count, and cancellations.
- **Popular Events**: Ranks events by registration volume.
- **Attendance & Occupancy Metrics**: Computes per-event capacity utilization percentage (`(registered / capacity) * 100`).
- **Category Breakdown**: Groups events and total attendee counts across event categories.

---

## 3. Design Patterns

### Factory Pattern (`src/patterns/user.factory.js`)
- **Purpose**: Decouples role instantiation and encapsulates role-specific behavior.
- **Classes**:
  - `BaseUser`: Base class defining common properties and default permissions.
  - `StudentUser`: Specializes permissions (`canRegisterForEvent: true`).
  - `OrganizerUser`: Specializes permissions (`canCreateEvent: true`).
  - `AdminUser`: Grants all permissions (`canCreateEvent`, `canApproveEvent`, `canRegisterForEvent`, `canViewReports`).
  - `UserFactory.createUser(data)`: Instantiates the appropriate user class based on role.

### Strategy Pattern (`src/patterns/event.strategy.js`)
- **Purpose**: Enables interchangeable event sorting and filtering strategies at runtime.
- **Classes**:
  - `EventSortStrategy`: Abstract interface for `getOrderByClause()`.
  - `SortByDateStrategy`: Sorts chronologically (`e.date ASC, e.time ASC`).
  - `SortByTitleStrategy`: Sorts alphabetically by event title (`e.title ASC`).
  - `SortByCapacityStrategy`: Sorts largest venue capacity first (`e.capacity DESC`).
  - `EventQueryContext`: Manages active strategy and dynamic resolution from query params.

### Observer Pattern (`src/patterns/notification.observer.js`)
- **Purpose**: Decouples business logic events (registration, cancellation, event update) from notification dispatching.
- **Classes**:
  - `NotificationObserver`: Interface for `update(eventType, data, db)`.
  - `RegistrationObserver`: Observes `REGISTRATION_CONFIRMED`, `REGISTRATION_WAITLISTED`, `REGISTRATION_CANCELLED`.
  - `WaitlistPromotionObserver`: Observes `WAITLIST_PROMOTED`.
  - `EventBroadcastObserver`: Observes `EVENT_UPDATED` and `EVENT_CANCELLED`.
  - `NotificationSubject`: Manages observer registration (`attach`, `detach`) and notifies observers asynchronously.

---

## 4. API Endpoints Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System health check |
| `POST` | `/api/auth/register` | Public | Register new user (Student, Organizer, Admin) |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT |
| `GET` | `/api/users/profile` | Authenticated | View own user profile |
| `PUT` | `/api/users/profile` | Authenticated | Update own profile |
| `GET` | `/api/events` | Public | Browse events (search, filter, sort strategy) |
| `GET` | `/api/events/:id` | Public | View individual event details |
| `POST` | `/api/events` | Organizer, Admin | Create and submit event for review |
| `PUT` | `/api/events/:id` | Organizer, Admin | Edit event details (triggers observer alert) |
| `DELETE` | `/api/events/:id` | Organizer, Admin | Cancel/delete event (triggers observer alert) |
| `PATCH` | `/api/events/:id/status` | Admin | Approve or reject event |
| `POST` | `/api/events/:id/register` | Student, Admin | Register for event or join waitlist |
| `DELETE` | `/api/events/:id/register` | Student, Admin | Cancel registration (promotes waitlist) |
| `GET` | `/api/registrations/my-events` | Student, Admin | View student's registered events |
| `GET` | `/api/events/:id/attendees` | Organizer, Admin | View attendee and waitlist records |
| `GET` | `/api/notifications` | Authenticated | View user in-app notifications |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Mark notification as read |
| `POST` | `/api/events/:id/remind` | Organizer, Admin | Dispatch pre-event reminder broadcast |
| `GET` | `/api/reports/summary` | Admin | Total events, registrations & cancellations |
| `GET` | `/api/reports/popular-events` | Admin | Ranked event popularity |
| `GET` | `/api/reports/attendance` | Admin | Per-event capacity and occupancy rate |
| `GET` | `/api/reports/categories` | Admin | Category breakdown |

---

## 5. Testing & CI/CD
- **Unit & Integration Tests**: 63 tests across 11 test suites covering models, routes, middlewares, and design patterns.
- **End-to-End Tests**: Selenium WebDriver running headless Chrome simulating real student registration and event sign-up.
- **GitHub Actions CI**: Automated test matrix running on every push and PR against Node.js 18.x and 20.x.
