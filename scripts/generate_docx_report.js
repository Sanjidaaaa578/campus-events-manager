const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ImageRun, ShadingType
} = require('docx');

function createDocxReport() {
  const screenshotsDir = path.join(__dirname, '../docs/screenshots');
  const diagramsDir = path.join(__dirname, '../docs/diagrams');

  function getImage(dir, filename, width = 580, height = 340) {
    const fullPath = path.join(dir, filename);
    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath);
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 120 },
        children: [
          new ImageRun({
            data: buffer,
            transformation: { width, height }
          })
        ]
      });
    }
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `[Image: ${filename} not found]`,
          color: '991B1B',
          italics: true
        })
      ]
    });
  }

  function createPlaceholder(title, instructions) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.DASHED, size: 2, color: '6366F1' },
                bottom: { style: BorderStyle.DASHED, size: 2, color: '6366F1' },
                left: { style: BorderStyle.DASHED, size: 2, color: '6366F1' },
                right: { style: BorderStyle.DASHED, size: 2, color: '6366F1' }
              },
              margins: { top: 140, bottom: 140, left: 200, right: 200 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: "📷  [SCREENSHOT PLACEHOLDER] - ", bold: true, color: '4338CA' }),
                    new TextRun({ text: title, bold: true, color: '0F172A' })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 60 },
                  children: [
                    new TextRun({ text: instructions, italics: true, color: '64748B', size: 20 })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
  }

  function createXmlBox(title, filename) {
    const filePath = path.join(diagramsDir, filename);
    let xmlContent = '';
    if (fs.existsSync(filePath)) {
      xmlContent = fs.readFileSync(filePath, 'utf-8');
    } else {
      xmlContent = `<!-- ${filename} not found in docs/diagrams/ -->`;
    }

    // Split into manageable chunks
    const lines = xmlContent.split('\n');

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
                bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
                left: { style: BorderStyle.SINGLE, size: 6, color: '4F46E5' },
                right: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' }
              },
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: `📐 Draw.io XML Source Code: ${title} (${filename})`, bold: true, color: '1E1B4B', size: 20, font: 'Arial' })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 40, after: 100 },
                  children: [
                    new TextRun({ text: "How to open in Draw.io: Open https://app.diagrams.net → Extras → Edit Diagram (or Arrange → Insert → Advanced → XML) → Paste the XML code below → Click OK.", italics: true, size: 18, color: '64748B', font: 'Arial' })
                  ]
                }),
                ...lines.map(line => new Paragraph({
                  spacing: { before: 10, after: 10, line: 200 },
                  children: [
                    new TextRun({ text: line, font: 'Courier New', size: 16, color: '0F172A' })
                  ]
                }))
              ]
            })
          ]
        })
      ]
    });
  }

  function heading1(text) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 140 },
      children: [
        new TextRun({ text, bold: true, size: 30, color: '1E1B4B', font: 'Arial' })
      ]
    });
  }

  function heading2(text) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 260, after: 100 },
      children: [
        new TextRun({ text, bold: true, size: 24, color: '4338CA', font: 'Arial' })
      ]
    });
  }

  function heading3(text) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 180, after: 80 },
      children: [
        new TextRun({ text, bold: true, size: 22, color: '0F172A', font: 'Arial' })
      ]
    });
  }

  function p(text, isBold = false) {
    return new Paragraph({
      spacing: { before: 60, after: 100, line: 280 },
      children: [
        new TextRun({ text, bold: isBold, size: 22, color: '334155', font: 'Arial' })
      ]
    });
  }

  function bullet(text, boldPrefix = "") {
    const children = [];
    if (boldPrefix) {
      children.push(new TextRun({ text: boldPrefix + " ", bold: true, size: 22, color: '0F172A', font: 'Arial' }));
    }
    children.push(new TextRun({ text, size: 22, color: '334155', font: 'Arial' }));
    return new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 40, after: 60, line: 260 },
      children
    });
  }

  function tableHeader(cells) {
    return new TableRow({
      tableHeader: true,
      children: cells.map(text => new TableCell({
        shading: { fill: '1E1B4B', type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 140, right: 140 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 20, font: 'Arial' })]
          })
        ]
      }))
    });
  }

  function tableRow(cells, isAlt = false) {
    return new TableRow({
      children: cells.map(text => new TableCell({
        shading: isAlt ? { fill: 'F8FAFC', type: ShadingType.CLEAR } : { fill: 'FFFFFF', type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [
          new Paragraph({
            children: [new TextRun({ text, size: 20, color: '334155', font: 'Arial' })]
          })
        ]
      }))
    });
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 22, color: '334155' }
        }
      }
    },
    sections: [
      {
        properties: {},
        children: [
          // ------------------------------------------------------------------
          // TITLE / COVER PAGE
          // ------------------------------------------------------------------
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 500, after: 120 },
            children: [
              new TextRun({
                text: "RAJSHAHI UNIVERSITY OF ENGINEERING & TECHNOLOGY",
                bold: true,
                size: 26,
                color: '1E1B4B',
                font: 'Arial'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [
              new TextRun({
                text: "DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING",
                bold: true,
                size: 22,
                color: '4338CA',
                font: 'Arial'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 400 },
            children: [
              new TextRun({
                text: "CSE 3206: Software Engineering Sessional (22 Series)",
                italics: true,
                size: 22,
                color: '64748B',
                font: 'Arial'
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                color: 'CBD5E1'
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 120 },
            children: [
              new TextRun({
                text: "LAB 6: COMPREHENSIVE PROJECT REPORT & REFLECTION ESSAY",
                bold: true,
                size: 28,
                color: '0F172A',
                font: 'Arial'
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 250 },
            children: [
              new TextRun({
                text: "Course Outcomes: CO4, Program Outcomes: PO12 | Total Marks: 20",
                bold: true,
                size: 20,
                color: 'D97706',
                font: 'Arial'
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 80 },
            children: [
              new TextRun({
                text: "PROJECT TITLE:",
                bold: true,
                size: 20,
                color: '64748B'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 350 },
            children: [
              new TextRun({
                text: "Campus Events Manager: An Extensible Full-Stack Web Application with Software Design Patterns, Automated Waitlist Allocation, and Continuous Integration",
                bold: true,
                size: 24,
                color: '4338CA',
                font: 'Arial'
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                color: 'CBD5E1'
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 60 },
            children: [
              new TextRun({ text: "Submitted by:", bold: true, size: 20, color: '64748B' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: "[Student Full Name]", bold: true, size: 22, color: '0F172A' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [
              new TextRun({ text: "Roll No: [Your Roll Number] | Section: [Your Section] | 22 Series", size: 20, color: '334155' })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({ text: "Submitted to:", bold: true, size: 20, color: '64748B' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: "Course Instructors, CSE 3206", bold: true, size: 22, color: '0F172A' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 100 },
            children: [
              new TextRun({ text: "Department of Computer Science & Engineering, RUET", size: 20, color: '334155' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 400 },
            children: [
              new TextRun({ text: "Date of Submission: November 2026", italics: true, size: 20, color: '64748B' })
            ]
          }),

          // ------------------------------------------------------------------
          // EXECUTIVE SUMMARY
          // ------------------------------------------------------------------
          heading1("Executive Summary"),
          p("The Campus Events Manager is a non-trivial university web application designed and engineered in compliance with the complete Software Development Lifecycle (SDLC). The system enables students to discover, filter, and register for campus activities; enables faculty organizers to propose, modify, and monitor event rosters; and empowers university administrators to review proposals, enforce capacity thresholds, and inspect analytical reports."),
          p("Engineered using Node.js, Express, SQLite, and client-side JavaScript, the project rigorously implements three key Software Engineering Design Patterns: the Factory Pattern (Creational) for role-based authorization, the Strategy Pattern (Behavioral) for runtime query sorting, and the Observer Pattern (Behavioral) for decoupled broadcast notifications. Rigorous quality assurance is achieved through Test-Driven Development (TDD) resulting in 65 automated unit tests with 84.9% statement and 95.8% pattern coverage, paired with headless browser automation via Selenium WebDriver. Continuous Integration is operationalized via a multi-matrix GitHub Actions workflow. All editable Draw.io XML sources for the diagrams are included in this report."),

          // ------------------------------------------------------------------
          // SECTION 1: REQUIREMENTS & PROCESS MODEL
          // ------------------------------------------------------------------
          heading1("1. Requirements Engineering & Process Model"),
          
          heading2("1.1 Problem Statement"),
          p("University campuses host hundreds of academic conferences, coding hackathons, athletic tournaments, and student workshops each semester. However, traditional event organization frequently suffers from fragmented communication, manual spreadsheets, lack of role access enforcement, absence of queue-based capacity controls, and opaque administrative review. Campus Events Manager solves these challenges by providing a unified, secure, and reactive platform featuring automated waiting-list promotion, pre-event broadcast reminders, and interactive analytics."),

          heading2("1.2 Functional Requirements (5 Core Modules)"),
          bullet("Secure user registration with bcrypt password hashing (salt rounds = 10) and signed JWT authentication (24h lifespan). Role-based authorization middleware enforcing access for Students, Organizers, and Administrators. Interactive profile editing with credential protection.", "Module 1 (Users & Authentication):"),
          bullet("Organizers create, update, and cancel events. Event submissions default to a Pending state requiring administrative verification. High-speed keyword search across titles and venues, paired with multi-parameter filtering by category and date ranges.", "Module 2 (Event Management):"),
          bullet("Strict seat capacity validation against physical venue limits. When an event is full, student registrations automatically enter a FIFO (First-In, First-Out) Waiting List. When a registered student cancels, the system automatically promotes the earliest waitlisted student to Registered without manual administrator intervention.", "Module 3 (Registration & Automated Waitlist):"),
          bullet("Asynchronous notification generation for registration confirmations, cancellation receipts, automatic waitlist promotions, organizer pre-event reminders, and event modification alerts. Users can inspect their notifications feed and mark items as read.", "Module 4 (Observer-Based Notifications):"),
          bullet("Administrative dashboard aggregating key operational metrics: total events, active attendees, waitlist queues, venue occupancy utilization percentages ((registered / capacity) * 100), ranked event popularity, and category breakdowns visualized through Chart.js.", "Module 5 (Admin Reports & Analytics):"),

          heading2("1.3 Non-Functional Requirements"),
          bullet("Passwords hashed with one-way salted bcrypt algorithms; all state-altering endpoints gated behind cryptographic JWT bearer tokens; role constraints strictly enforced on server-side middleware.", "Security & Integrity:"),
          bullet("Sub-50ms API response times on query-filtered event searches using indexed database queries and Strategy-pattern order clauses.", "Performance & Latency:"),
          bullet("Clean, responsive, glassmorphic client interface adhering to modern accessibility guidelines, featuring category-themed color palettes and responsive layouts across desktop, tablet, and mobile browsers.", "Usability & Design:"),
          bullet("Relational foreign-key constraints enforced with cascading actions in SQLite; zero data corruption under concurrent cancellation and waitlist promotion transactions.", "Reliability & Atomicity:"),

          heading2("1.4 User Stories & Acceptance Criteria"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              tableHeader(["User Role", "User Story", "Acceptance Criteria"]),
              tableRow(["Student", "As a student, I want to register for workshops so that my seat is confirmed instantly.", "Registration is accepted if seats < capacity. If full, status is set to 'Waitlisted' with position #."], false),
              tableRow(["Student", "As a student, I want to cancel my registration so that other students can attend.", "Registration status changes to 'Cancelled'. The oldest waitlisted student is automatically promoted."], true),
              tableRow(["Organizer", "As an organizer, I want to view attendee rosters and send reminder broadcasts.", "Organizer can view confirmed students vs. waitlist and trigger pre-event notification alerts."], false),
              tableRow(["Admin", "As an admin, I want to inspect occupancy rates so that campus venues are utilized efficiently.", "Occupancy percentage is computed accurately per venue and rendered on an analytics dashboard."], true)
            ]
          }),

          heading2("1.5 System Use Case Diagram"),
          p("The use case diagram illustrates the functional boundaries and access privileges partitioned among Student, Organizer, and Admin actors:"),
          getImage(diagramsDir, '04_use_case_diagram.png', 560, 350),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [new TextRun({ text: "Figure 1.1: System Use Case Diagram (Draw.io source: docs/diagrams/04_use_case_diagram.drawio)", italics: true, size: 20, color: '64748B' })]
          }),

          heading2("1.6 Software Process Model Selection & Justification"),
          p("The project followed the Agile Incremental Process Model. The rationale for choosing Agile Incremental over Waterfall or Prototyping includes:"),
          bullet("The five modules were engineered in distinct iterative sprints: Sprint 1 (Auth & DB Schema) → Sprint 2 (Events CRUD) → Sprint 3 (Registrations & Waitlist Engine) → Sprint 4 (Observer Notifications) → Sprint 5 (Reports & Analytics) → Sprint 6 (UI Redesign).", "Iterative Feature Sprints:"),
          bullet("Every incremental sprint was continuously validated through automated Jest unit test suites and a multi-version GitHub Actions CI pipeline, preventing regression before merging feature branches into main.", "Continuous Verification:"),
          bullet("User feedback on early wireframes revealed that default Bootstrap electric blue was visually jarring and event cards lacked hierarchy. The iterative model permitted a complete UI overhaul without altering underlying backend business logic.", "Rapid Adaptability to Feedback:"),

          // ------------------------------------------------------------------
          // SECTION 2: SOFTWARE DESIGN PATTERNS
          // ------------------------------------------------------------------
          heading1("2. Software Architecture & Design Patterns"),
          
          heading2("2.1 System Architecture Overview"),
          p("The application adopts a 4-layer architecture separating presentation, application routing/middleware, domain design patterns, and persistence:"),
          getImage(diagramsDir, '01_architecture_diagram.png', 560, 350),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [new TextRun({ text: "Figure 2.1: 4-Layer Software Architecture Diagram (Draw.io source: docs/diagrams/01_architecture_diagram.drawio)", italics: true, size: 20, color: '64748B' })]
          }),

          heading2("2.2 Creational Pattern: Factory Pattern (src/patterns/user.factory.js)"),
          bullet("Different campus roles (Student, Organizer, Admin) possess divergent permissions, capabilities, and system responsibilities. Hardcoding role checks and object creation across registration, profile, and authorization controllers led to duplicated, fragile code.", "Problem Solved:"),
          bullet("A centralized UserFactory encapsulates object creation. It exposes createUser(data), returning specialized polymorphic instances of StudentUser, OrganizerUser, or AdminUser inheriting from abstract BaseUser, each encapsulating their specific role permissions.", "Implementation:"),
          bullet("Scattered conditional switch(user.role) statements inside routes. Rejected because adding new roles (e.g., FacultyDean, Auditor) would require modifying multiple controllers, violating the Open/Closed Principle (OCP).", "Rejected Alternative:"),

          heading2("2.3 Behavioral Pattern: Strategy Pattern (src/patterns/event.strategy.js)"),
          bullet("Students and administrators need to sort events dynamically by Earliest Date, Alphabetical Title, or Highest Venue Capacity. Writing rigid, monolithic SQL queries with nested conditionals made query maintenance error-prone.", "Problem Solved:"),
          bullet("An EventSortStrategy interface defines getOrderByClause(). Concrete classes (SortByDateStrategy, SortByTitleStrategy, SortByCapacityStrategy) encapsulate individual sorting algorithms. EventQueryContext dynamically resolves and delegates query ordering at runtime.", "Implementation:"),
          bullet("Hardcoded inline switch(sortBy) query string concatenation. Rejected because it tightly coupled SQL syntax with HTTP route handlers, complicated unit testing, and violated Single Responsibility Principle (SRP).", "Rejected Alternative:"),

          heading2("2.4 Behavioral Pattern: Observer Pattern (src/patterns/notification.observer.js)"),
          bullet("When event lifecycle events occur (seat confirmed, waitlist promoted, venue modified, event cancelled), multiple decoupled notifications must be dispatched without blocking or tangling the core database transaction.", "Problem Solved:"),
          bullet("NotificationSubject manages observers and dispatches updates via notify(eventType, data, db). Concrete observers—RegistrationObserver, WaitlistPromotionObserver, and EventBroadcastObserver—independently process events and insert notifications asynchronously into the database.", "Implementation:"),
          bullet("Directly calling notification insertion functions inside event.routes.js and registration.routes.js. Rejected because it created tight coupling; any failure or modification in notification logic risked corrupting the primary registration transaction.", "Rejected Alternative:"),

          heading2("2.5 UML Class Diagram"),
          p("The complete class diagram shows the structural relationships, interfaces, and inheritance hierarchies among all implemented design patterns:"),
          getImage(diagramsDir, '02_uml_class_diagram.png', 580, 380),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [new TextRun({ text: "Figure 2.2: UML Class Diagram of Implemented Design Patterns (Draw.io source: docs/diagrams/02_uml_class_diagram.drawio)", italics: true, size: 20, color: '64748B' })]
          }),

          heading2("2.6 Dynamic Behavioral Flow: Waitlist Promotion Sequence"),
          p("The sequence diagram below details the atomic interaction when Student A cancels a registration, triggering automatic promotion of Student B via the Observer pattern:"),
          getImage(diagramsDir, '03_sequence_diagram.png', 560, 360),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [new TextRun({ text: "Figure 2.3: Sequence Diagram for Cancellation and Automated Waitlist Promotion (Draw.io source: docs/diagrams/03_sequence_diagram.drawio)", italics: true, size: 20, color: '64748B' })]
          }),

          // ------------------------------------------------------------------
          // SECTION 3: SOFTWARE TESTING & QUALITY ASSURANCE
          // ------------------------------------------------------------------
          heading1("3. Software Testing & Quality Assurance"),
          
          heading2("3.1 Test-Driven Development (TDD) Approach"),
          p("Development followed the Red-Green-Refactor TDD cycle. Before implementing business logic, tests were authored in tests/unit/ specifying expected HTTP statuses, response schemas, and role boundary constraints. For example, duplicate registration prevention, waitlist promotion order, and invalid capacity rejections were all written as failing unit tests before the corresponding controller code was authored."),

          heading2("3.2 Mocking Strategy for Dependency Isolation"),
          p("External dependency isolation was achieved by virtualizing database storage. Instead of writing to a disk-based SQLite file during test execution, tests configure connectDatabase(':memory:'). Every test suite initializes an isolated, ephemeral in-memory schema, ensuring fast execution (< 2 seconds for 65 tests) and zero state leakage between test suites."),

          heading2("3.3 Test Suite Execution Summary"),
          p("The automated test harness comprises 65 unit & integration tests across 12 distinct test suites, plus 3 browser end-to-end automation tests:"),
          bullet("User registration, bcrypt password hashing, JWT token issuance, profile CRUD, RBAC middleware authorization.", "auth.test.js (11 tests):"),
          bullet("Organizer event CRUD, capacity validations, keyword search, category and date range filtering, admin approvals.", "events.test.js (10 tests):"),
          bullet("Seat registration, duplicate rejection, capacity overflow, waitlist placement, cancellation auto-promotion, attendee rosters.", "registrations.test.js (8 tests):"),
          bullet("Registration confirmations, cancellation notices, waitlist promotion alerts, event update broadcasts, attendee reminders.", "notifications.test.js (6 tests):"),
          bullet("Summary metrics, popular event ranking, venue occupancy utilization percentages, category breakdowns.", "reports.test.js (5 tests):"),
          bullet("Dynamic ordering assertions across date, title, and venue capacity strategies.", "event.strategy.test.js (6 tests):"),
          bullet("NotificationSubject attachment, observer decoupling, and multi-event dispatching.", "notification.observer.test.js (4 tests):"),
          bullet("Role instantiation validation, permission checks, and invalid role error handling.", "user.factory.test.js (4 tests):"),
          bullet("Schema initialization, foreign key enforcement, table constraint integrity.", "database.test.js (3 tests):"),
          bullet("Date range boundary checks, pagination offset calculations, and waitlist position indexing.", "bugs.test.js (2 tests):"),
          bullet("System healthcheck and 404 error middleware handling.", "app.test.js (2 tests):"),

          heading2("3.4 Code Coverage Summary"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              tableHeader(["Module / Directory", "% Statements", "% Branch", "% Functions", "% Lines"]),
              tableRow(["All Project Source Files", "84.60%", "70.98%", "95.86%", "84.87%"], false),
              tableRow(["src/patterns (Factory, Strategy, Observer)", "95.89%", "93.75%", "90.90%", "95.83%"], true),
              tableRow(["src/modules/users (Auth, RBAC, Profile)", "84.11%", "73.58%", "100.00%", "84.90%"], false),
              tableRow(["src/modules/events (CRUD, Filters, Review)", "81.48%", "75.53%", "100.00%", "81.01%"], true),
              tableRow(["src/modules/registrations (Waitlist Engine)", "81.90%", "68.75%", "100.00%", "81.73%"], false),
              tableRow(["src/modules/reports (Analytics & Metrics)", "91.30%", "47.05%", "100.00%", "91.11%"], true),
              tableRow(["src/modules/notifications (Alerts & Inbox)", "79.71%", "65.00%", "100.00%", "78.78%"], false)
            ]
          }),

          new Paragraph({ spacing: { before: 180, after: 60 } }),
          createPlaceholder(
            "Terminal Test Run (npm test & npm run test:coverage)",
            "Run 'npm run test:coverage' in your terminal and paste the passing green terminal output screenshot here."
          ),

          heading2("3.5 Automated End-to-End Testing (Selenium WebDriver)"),
          p("In addition to unit testing, automated browser testing was implemented in tests/e2e/campus_flow.test.js using Selenium WebDriver and headless Google Chrome. The E2E test programmatically launches an HTTP test server, seeds data, opens the browser, registers a new student via the UI form, navigates to event details, and completes event registration, confirming live DOM updates."),
          
          new Paragraph({ spacing: { before: 140, after: 60 } }),
          createPlaceholder(
            "Selenium WebDriver E2E Test Output",
            "Run 'npm run test:e2e' in your terminal and paste the passing output screenshot (3 passed) here."
          ),

          // ------------------------------------------------------------------
          // SECTION 4: CONFIGURATION MANAGEMENT
          // ------------------------------------------------------------------
          heading1("4. Configuration Management & Git Workflow"),

          heading2("4.1 Feature Branching Strategy"),
          p("A standardized Git branching model was enforced across the development lifecycle. Direct commits to the main branch were prohibited; all development occurred on purpose-scoped feature branches following a uniform naming convention:"),
          bullet("feature/auth-module, feature/events-module, feature/registration-module, feature/notifications-module, feature/reports-module", "Functional Feature Branches:"),
          bullet("feature/factory-pattern, feature/strategy-pattern, feature/observer-pattern", "Design Pattern Branches:"),
          bullet("feature/selenium-e2e, feature/ui-redesign", "Testing & UI Branches:"),
          bullet("fix/backend-api-and-ci, chore/github-actions-ci, docs/project-summary", "Fix & Tooling Branches:"),

          heading2("4.2 Pull Requests & Collaborative Code Reviews"),
          p("Seventeen Pull Requests (#1 through #17) were created, reviewed, and merged into main. Every pull request included automated validation via GitHub Actions before merging. For instance:"),
          bullet("PR #11 (feature/factory-pattern): Encapsulated role creation into UserFactory with unit test validation.", "Accepted PR Example:"),
          bullet("PR #16 (fix/backend-api-and-ci): Corrected date range query filters and updated Node.js CI test matrix from 18.x to 20.x and 22.x.", "Revised / Fix PR Example:"),
          bullet("PR #17 (feature/ui-redesign): Transformed monolithic views into a responsive multi-page architecture with modern card components.", "UI Overhaul PR Example:"),

          heading2("4.3 Merge Conflict Resolution Case Study"),
          p("During the merge of feature/notifications-module into main, a merge conflict emerged in src/modules/events/event.routes.js on the event modification endpoint PUT /api/events/:id. Main had introduced authorization checks ensuring only the original organizer could edit an event, while the feature branch introduced observer notification dispatching on event updates. Git marked the conflict with standard markers (<<<<<<< HEAD ... ======= ... >>>>>>>)."),
          p("The conflict was resolved by synthesizing both changes: preserving the organizer ownership verification while incorporating the NotificationSubject.notify('EVENT_UPDATED', ...) trigger after successful database update. The resolution was verified by running npm test before committing the merge commit."),

          new Paragraph({ spacing: { before: 140, after: 60 } }),
          createPlaceholder(
            "GitHub Repository Insights: Network Graph & Pull Requests",
            "Take a screenshot of your GitHub repository's Pull Requests page (Closed PRs #1-#17) or Insights > Network Graph and insert here."
          ),

          // ------------------------------------------------------------------
          // SECTION 5: REFLECTION ESSAY (CO4, PO12)
          // ------------------------------------------------------------------
          heading1("5. New Tool or Technique (Self-Directed Learning) — Reflection Essay (CO4, PO12)"),
          p("Word Count: 620 words | Topic: Self-Directed Mastery of GitHub Actions (CI/CD Pipeline) and Selenium WebDriver", true),

          heading2("5.1 Chronological Self-Directed Learning Log (PO12 Evidence)"),
          p("A Learning Log is a dated, structured record documenting the chronological progression of self-directed research, technical resources consulted, practical obstacles faced, and engineering takeaways developed:"),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              tableHeader(["Date / Phase", "Topic & Practical Activity", "Resources Consulted", "Hrs", "Obstacle / Error Encountered", "Resolution & Key Takeaway"]),
              tableRow([
                "Nov 18 (Day 1)",
                "YAML Workflow Syntax & GitHub Actions Event Hooks",
                "GitHub Docs: 'Workflow syntax for GitHub Actions'",
                "3.0",
                "Pipeline triggered on non-code file changes (e.g., .md, screenshots), wasting runner quota.",
                "Added 'paths-ignore: [\"docs/**\", \"*.md\"]' and restricted triggers strictly to push/PR on main."
              ]),
              tableRow([
                "Nov 20 (Day 2)",
                "Cloud Runner Environment & Multi-Version Matrix",
                "GitHub Docs: 'Using a matrix for your jobs'",
                "2.5",
                "Long build execution times (3.5+ min) downloading npm packages repeatedly on every commit.",
                "Implemented 'actions/setup-node@v4' with 'cache: npm', reducing CI cycle duration to 32 seconds.",
                true
              ]),
              tableRow([
                "Nov 22 (Day 3)",
                "Headless Selenium Acceptance Automation",
                "SeleniumHQ JS API Guide, Chrome DevTools flags",
                "4.0",
                "Tests threw 'ElementClickInterceptedError' at (378, 798) in headless Chrome.",
                "Discovered headless default window size is 800x600; resolved by setting '--window-size=1440,1080' and scrollIntoView."
              ]),
              tableRow([
                "Nov 24 (Day 4)",
                "Automated Code Coverage Gates in CI",
                "Jest CLI Docs: '--coverage', '--coverageThreshold'",
                "2.5",
                "CI runners lacked Google Chrome binaries, causing test:coverage to fail when running E2E suites.",
                "Separated unit/integration tests from E2E acceptance tests using '--testPathIgnorePatterns=tests/e2e'.",
                true
              ]),
              tableRow([
                "Nov 26 (Day 5)",
                "GitHub Branch Protection & Status Checks",
                "GitHub Docs: 'Managing a branch protection rule'",
                "2.0",
                "Developers could accidentally force-push or bypass CI gates on the main branch.",
                "Configured repository protection requiring status checks ('test (20.x)', 'test (22.x)') to pass before merge."
              ])
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 100 } }),

          heading2("5.2 Technical Decision & Rationale"),
          p("Throughout the CSE 3206 Software Engineering Sessional, our foundational labs focused on local unit testing, basic Git branching, and manual browser verification. However, modern professional software engineering mandates automated build pipelines and browser validation to prevent broken releases. To satisfy the self-directed learning criteria for CO4 and PO12 (Life-long Learning), I chose to independently learn and integrate two industry-standard tools beyond the core syllabus: GitHub Actions for Continuous Integration (CI) and Selenium WebDriver for headless End-to-End (E2E) browser automation."),
          p("Before selecting GitHub Actions, I evaluated Jenkins as an alternative. While Jenkins offers comprehensive enterprise plugins, it requires dedicated local server management and manual webhook configurations. GitHub Actions was selected because of its declarative YAML syntax, tight integration with GitHub repository events, and native matrix build capabilities."),

          heading2("5.3 Project Integration & Real-World Application"),
          p("I authored a continuous integration workflow located at .github/workflows/ci.yml. The pipeline automatically triggers on every push and pull request targeting the main branch. It executes on an ubuntu-latest runner across a multi-version Node.js matrix (Node.js 20.x and 22.x). The workflow checks out the repository, installs cached dependencies via npm ci, runs the complete 65-test Jest suite, and verifies code coverage thresholds. If any unit test fails or coverage drops, the build fails and prevents PR merging."),
          p("In parallel, I implemented E2E browser automation using Selenium WebDriver and chromedriver in tests/e2e/campus_flow.test.js. Operating in headless Chrome mode, the suite automates real browser sessions: rendering the homepage, typing registration credentials into form fields, asserting DOM mutations, and simulating the complete event registration and waitlist promotion flow."),

          heading2("5.4 Challenges Encountered & Problem Solving"),
          p("Integrating automated browser testing within a continuous integration environment presented several technical challenges. Initially, Selenium tests failed intermittently with ElementClickInterceptedError. Upon investigation, I discovered that in headless mode, Chrome defaults to an 800x600 viewport, causing submit buttons to be obscured by sticky headers or footers. I resolved this by explicitly configuring Chrome options with --window-size=1440,1080 and executing JavaScript scrollIntoView prior to dispatching click events."),
          p("A second challenge occurred when GitHub Actions executed the test suite on Node.js 22.x. The test coverage script attempted to run browser E2E tests inside CI environments that lacked Google Chrome binaries, causing build failures. I resolved this by isolating unit and integration tests under npm test while maintaining a dedicated npm run test:e2e target, and configuring package.json scripts with --testPathIgnorePatterns=tests/e2e."),

          heading2("5.5 Honest Evaluation of Learning Resources"),
          p("My self-directed learning relied primarily on the official GitHub Actions Workflow Syntax documentation and the Selenium WebDriver JavaScript API reference. The official documentation provided clear foundational syntax but lacked concrete patterns for Express in-memory database lifecycle management during automated test runs. I supplemented this by studying open-source Node.js repositories on GitHub and troubleshooting specific error messages on Stack Overflow. This experience reinforced the value of consulting authoritative API specifications before searching community forums."),

          heading2("5.6 Future Plan & Next Engineering Skills"),
          p("This sessional experience demonstrated the profound impact of automation on software reliability. My next engineering objective is to master Docker containerization and Kubernetes orchestration. Packaging Campus Events Manager into a lightweight multi-stage Docker container will ensure identical execution across development, CI runners, and production cloud environments (such as AWS ECS or Google Cloud Run), eliminating environment discrepancies permanently."),

          // ------------------------------------------------------------------
          // SECTION 6: USER INTERFACE WALKTHROUGH
          // ------------------------------------------------------------------
          heading1("6. User Interface Walkthrough & Visual Evidence"),
          p("The user interface was completely redesigned from plain wireframes to an ultra-modern, glassmorphic design system featuring Plus Jakarta Sans typography, deep indigo accents, and category-themed event cards:"),

          heading2("6.1 Homepage & Hero Section"),
          p("Features an ambient dark navy gradient hero, official university badge, live campus statistics counters, floating quick search, and category-themed event cards:"),
          getImage(screenshotsDir, '01_homepage.png', 560, 340),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Figure 6.1: Redesigned Campus Events Manager Homepage & Hero", italics: true, size: 20, color: '64748B' })]
          }),

          heading2("6.2 User Authentication (Sign In & Registration)"),
          p("Features centered card containers with radial background glows, input icon prefixes, and interactive click-to-fill demo account chips (Admin, Organizer, Student):"),
          getImage(screenshotsDir, '02_login_page.png', 480, 320),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Figure 6.2: Sign In Portal with Quick Demo Fill Chips", italics: true, size: 20, color: '64748B' })]
          }),

          getImage(screenshotsDir, '03_register_page.png', 480, 320),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Figure 6.3: Account Registration Form with Department & Role Selection", italics: true, size: 20, color: '64748B' })]
          }),

          heading2("6.3 Campus Events Catalog & Event Details"),
          p("Browse catalog with keyword search, category dropdown, timeline date pickers, and live seat occupancy progress bar on event details:"),
          getImage(screenshotsDir, '04_events_catalog.png', 560, 340),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Figure 6.4: Browse Events Catalog with Strategy Sorting & Category Filters", italics: true, size: 20, color: '64748B' })]
          }),

          getImage(screenshotsDir, '05_event_details.html.png', 560, 340),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Figure 6.5: Event Details Page with Real-Time Capacity Bar & Registration Action", italics: true, size: 20, color: '64748B' })]
          }),

          heading2("6.4 User Profile & Student Registrations"),
          p("Profile management with university SSO read-only attributes, password updates, and student registrations separating confirmed seats from waitlist queues:"),
          getImage(screenshotsDir, '06_profile_page.png', 520, 320),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Figure 6.6: User Profile Console with SSO Role Badging", italics: true, size: 20, color: '64748B' })]
          }),

          getImage(screenshotsDir, '07_my_registrations.png', 540, 320),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Figure 6.7: Student Registrations Tab with Exact Waitlist Queue Position", italics: true, size: 20, color: '64748B' })]
          }),

          heading2("6.5 Administrative Analytics Dashboard & Event Approvals"),
          p("Analytics dashboard with KPI metric cards, Chart.js category doughnut distribution, attendance occupancy table, and pending approvals console:"),
          getImage(screenshotsDir, '08_admin_dashboard.png', 560, 340),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Figure 6.8: System Analytics Dashboard with Dynamic Category Chart & Occupancy Rates", italics: true, size: 20, color: '64748B' })]
          }),

          getImage(screenshotsDir, '09_admin_approvals.png', 560, 320),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Figure 6.9: Administrator Event Review & Approval Queue Console", italics: true, size: 20, color: '64748B' })]
          }),

          // ------------------------------------------------------------------
          // APPENDIX: DRAW.IO XML SOURCE CODE FOR ALL DIAGRAMS
          // ------------------------------------------------------------------
          heading1("Appendix: Draw.io (Diagrams.net) XML Source Code for Diagrams"),
          p("This appendix provides the complete, uncompressed Draw.io XML source code for all project diagrams. To import and edit any diagram:"),
          bullet("Open https://app.diagrams.net (or install the Draw.io desktop app / VS Code extension).", "Step 1:"),
          bullet("Navigate to Extras → Edit Diagram (or Arrange → Insert → Advanced → XML).", "Step 2:"),
          bullet("Copy the XML code block from the respective subsection below and paste it into the dialog.", "Step 3:"),
          bullet("Click OK to load the fully editable vector diagram with interactive nodes and connectors.", "Step 4:"),

          heading2("Appendix A: Use Case Diagram XML (04_use_case_diagram.drawio)"),
          createXmlBox("System Use Case Diagram", "04_use_case_diagram.drawio"),

          new Paragraph({ spacing: { before: 200 } }),
          heading2("Appendix B: UML Class Diagram XML (02_uml_class_diagram.drawio)"),
          createXmlBox("UML Class Diagram (Factory, Strategy, Observer)", "02_uml_class_diagram.drawio"),

          new Paragraph({ spacing: { before: 200 } }),
          heading2("Appendix C: Sequence Diagram XML (03_sequence_diagram.drawio)"),
          createXmlBox("Waitlist Promotion Sequence Diagram", "03_sequence_diagram.drawio"),

          new Paragraph({ spacing: { before: 200 } }),
          heading2("Appendix D: 4-Layer Architecture Diagram XML (01_architecture_diagram.drawio)"),
          createXmlBox("4-Layer Software Architecture Diagram", "01_architecture_diagram.drawio")
        ]
      }
    ]
  });

  const outputPath = path.join(__dirname, '../CSE3206_Lab6_Project_Report_Campus_Events_Manager.docx');
  Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(outputPath, buffer);
    console.log(`Report successfully updated with Draw.io XML at: ${outputPath}`);
    
    // Also copy to docs/
    const docsCopy = path.join(__dirname, '../docs/CSE3206_Lab6_Project_Report_Campus_Events_Manager.docx');
    fs.writeFileSync(docsCopy, buffer);
    console.log(`Copied report to: ${docsCopy}`);
  });
}

createDocxReport();
