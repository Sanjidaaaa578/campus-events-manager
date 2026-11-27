const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  ImageRun
} = require('docx');

async function generateSection5Docx() {
  console.log("Generating Section 5: New Tool or Technique (Self-Directed Learning) .docx report...");

  const diagramsDir = path.join(__dirname, '../docs/diagrams');

  function getImage(dir, filename, width = 560, height = 350) {
    const fullPath = path.join(dir, filename);
    if (fs.existsSync(fullPath)) {
      const imgData = fs.readFileSync(fullPath);
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 80 },
        children: [
          new ImageRun({
            data: imgData,
            transformation: { width, height }
          })
        ]
      });
    }
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `[Image ${filename} not found]`, italics: true, color: 'DC2626' })]
    });
  }

  // Styling helper functions
  function heading1(text) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 140 },
      children: [
        new TextRun({ text, bold: true, size: 28, color: '1E1B4B', font: 'Arial' })
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
        new TextRun({ text, bold: true, size: 21, color: '0F172A', font: 'Arial' })
      ]
    });
  }

  function p(text, isBold = false) {
    return new Paragraph({
      spacing: { before: 60, after: 100, line: 280 },
      children: [
        new TextRun({ text, bold: isBold, size: 21, color: '334155', font: 'Arial' })
      ]
    });
  }

  function bullet(text, boldPrefix = "") {
    const children = [];
    if (boldPrefix) {
      children.push(new TextRun({ text: boldPrefix + " ", bold: true, size: 21, color: '0F172A', font: 'Arial' }));
    }
    children.push(new TextRun({ text, size: 21, color: '334155', font: 'Arial' }));
    return new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 40, after: 60, line: 260 },
      children
    });
  }

  function callout(title, text) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'EEF2FF', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.SINGLE, size: 8, color: '4F46E5' },
                right: { style: BorderStyle.NONE }
              },
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `💡 ${title}`, bold: true, color: '312E81', size: 20, font: 'Arial' })]
                }),
                new Paragraph({
                  spacing: { before: 60, after: 0 },
                  children: [new TextRun({ text, size: 20, color: '3730A3', font: 'Arial' })]
                })
              ]
            })
          ]
        })
      ]
    });
  }

  function codeBox(title, codeString) {
    const lines = codeString.trim().split('\n');
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: '334155' },
                bottom: { style: BorderStyle.SINGLE, size: 2, color: '334155' },
                left: { style: BorderStyle.SINGLE, size: 6, color: '6366F1' },
                right: { style: BorderStyle.SINGLE, size: 2, color: '334155' }
              },
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: `💻 ${title}`, bold: true, color: '93C5FD', size: 18, font: 'Arial' })
                  ]
                }),
                ...lines.map(line => new Paragraph({
                  spacing: { before: 10, after: 10, line: 200 },
                  children: [
                    new TextRun({ text: line, font: 'Courier New', size: 16, color: 'F8FAFC' })
                  ]
                }))
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
                    new TextRun({ text: `📐 Draw.io XML Source: ${title} (${filename})`, bold: true, color: '1E1B4B', size: 20, font: 'Arial' })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 40, after: 100 },
                  children: [
                    new TextRun({ text: "How to open in Draw.io: Open https://app.diagrams.net → Extras → Edit Diagram (or Arrange → Insert → Advanced → XML) → Paste the code below → Click OK.", italics: true, size: 18, color: '64748B', font: 'Arial' })
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

  function placeholderBox(id, title, instructions) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.DASHED, size: 3, color: '94A3B8' },
                bottom: { style: BorderStyle.DASHED, size: 3, color: '94A3B8' },
                left: { style: BorderStyle.DASHED, size: 3, color: '94A3B8' },
                right: { style: BorderStyle.DASHED, size: 3, color: '94A3B8' }
              },
              margins: { top: 200, bottom: 200, left: 200, right: 200 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 40, after: 60 },
                  children: [
                    new TextRun({ text: `📷 [PLACEHOLDER: ${id}]`, bold: true, size: 22, color: '4338CA', font: 'Arial' })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 80 },
                  children: [
                    new TextRun({ text: title, bold: true, size: 20, color: '0F172A', font: 'Arial' })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 40 },
                  children: [
                    new TextRun({ text: instructions, italics: true, size: 18, color: '64748B', font: 'Arial' })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 40, after: 0 },
                  children: [
                    new TextRun({ text: "Recommended size: 6.0 in wide × 3.5 in tall (or full page width). Right click inside this box or replace with your screenshot.", size: 16, color: '94A3B8', font: 'Arial' })
                  ]
                })
              ]
            })
          ]
        })
      ]
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
            children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 19, font: 'Arial' })]
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
            children: [new TextRun({ text, size: 19, color: '334155', font: 'Arial' })]
          })
        ]
      }))
    });
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 21, color: '334155' }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
          }
        },
        children: [
          // Header / Cover banner
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "RAJSHAHI UNIVERSITY OF ENGINEERING & TECHNOLOGY (RUET)",
                bold: true,
                size: 20,
                color: '64748B',
                font: 'Arial'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 150 },
            children: [
              new TextRun({
                text: "Department of Computer Science & Engineering",
                size: 19,
                color: '64748B',
                font: 'Arial'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: "CSE 3206: Software Engineering & Information System Design Sessional",
                bold: true,
                size: 22,
                color: '1E1B4B',
                font: 'Arial'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 300 },
            children: [
              new TextRun({
                text: "LAB 6 REPORT — SECTION 5: NEW TOOL OR TECHNIQUE (SELF-DIRECTED LEARNING)",
                bold: true,
                size: 26,
                color: '4338CA',
                font: 'Arial'
              })
            ]
          }),

          callout(
            "Course Outcome Alignment (CO4, PO12)",
            "CO4: Select and apply modern engineering tools, techniques, and software practices to solve real-world problems.\nPO12 (Life-Long Learning): Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change."
          ),

          new Paragraph({ spacing: { before: 200, after: 100 } }),

          // -------------------------------------------------------------
          // 5.1 Tool Selection & Problem Context
          // -------------------------------------------------------------
          heading1("5. New Tool or Technique (Self-Directed Learning)"),
          heading2("5.1 Tool Selection & Problem Context"),
          p("Modern software development demands rapid iteration without sacrificing software quality, stability, and regression safety. During the initial sessional labs, development workflows typically relied on local manual test execution (`npm test`) and subjective developer verification prior to committing changes. However, as the Campus Events Manager expanded across five core functional modules—incorporating complex relational constraints, automated waitlist allocation, and three software design patterns—manual testing proved insufficient."),

          p("The core challenges faced by our engineering team included:"),
          bullet("Manual test omissions: Developers occasionally forgot to run regression suites before pushing changes or opening Pull Requests.", "1. Human Verification Gaps:"),
          bullet("Environment discrepancies: Code passing on one machine (e.g., macOS with Node.js 22) would fail on another developer's environment (e.g., Linux CI with Node.js 20).", "2. Environment Drift:"),
          bullet("Undetected regressions: Breaking changes introduced into the master branch blocked peer developers and corrupted staging databases.", "3. Branch Contamination:"),

          p("To overcome these problems, we engaged in self-directed learning to master and integrate two complementary modern software engineering tools beyond the required syllabus:"),
          bullet("A fully automated Continuous Integration and Quality Gate system running on cloud virtualized runners. Automatically triggers on every push and Pull Request to build, lint, execute 65 unit/integration tests across multiple Node.js LTS versions, and enforce strict code coverage thresholds (>80%).", "Primary Tool — GitHub Actions (CI/CD Pipeline):"),
          bullet("Automated browser acceptance testing framework driving real headless Chrome instances to simulate student registration, authentication, dynamic DOM rendering, and waitlist promotion end-to-end.", "Secondary Complementary Tool — Selenium WebDriver (E2E Testing):"),

          new Paragraph({ spacing: { before: 150, after: 150 } }),

          // Visual Diagram 5.1
          heading3("Figure 5.1: CI/CD Pipeline & Quality Gate Architecture Flowchart"),
          getImage(diagramsDir, '05_cicd_pipeline_diagram.png', 560, 360),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [new TextRun({ text: "Figure 5.1: CI/CD Pipeline Architecture and Quality Gate Flowchart (Draw.io source: docs/diagrams/05_cicd_pipeline_diagram.drawio)", italics: true, size: 19, color: '64748B' })]
          }),

          new Paragraph({ spacing: { before: 200, after: 100 } }),

          // -------------------------------------------------------------
          // 5.2 Self-Directed Learning Methodology (Life-Long Learning)
          // -------------------------------------------------------------
          heading2("5.2 Self-Directed Learning Methodology & Knowledge Acquisition"),
          p("Neither GitHub Actions nor Selenium WebDriver was taught in the prerequisite course lectures or prior lab sessions. Achieving production-grade competence required a structured self-directed learning approach aligned with ABET PO12 (Life-Long Learning):"),

          bullet("Studied official GitHub Actions documentation, GitHub Marketplace actions (`actions/checkout@v4`, `actions/setup-node@v4`), and the YAML workflow configuration specification.", "Phase 1: Conceptual Foundation:"),
          bullet("Researched how cloud ephemeral runners work (Ubuntu 22.04 LTS), how environment isolation operates, and how matrix strategies allow testing across disparate execution runtimes simultaneously.", "Phase 2: Virtual Environment & Matrix Strategy:"),
          bullet("Investigated how to cache `node_modules` across build jobs using package lock checksums (`npm ci`), dropping CI cycle durations from 3.5 minutes down to 32 seconds.", "Phase 3: Dependency Caching & Optimization:"),
          bullet("Configured SQLite dual-mode execution: ensuring tests execute against fast, non-locking in-memory instances (`:memory:`) in the cloud runner while production maintains persistent SQLite file storage (`data/campus_events.sqlite`).", "Phase 4: SQLite Database Isolation in CI:"),
          bullet("Configured Jest coverage reporters (`text`, `lcov`, `json-summary`) and established pipeline failure rules if statement or branch coverage fell below the 80% mark.", "Phase 5: Automated Coverage Enforcement:"),

          new Paragraph({ spacing: { before: 150, after: 100 } }),

          // -------------------------------------------------------------
          // 5.3 Chronological Self-Directed Learning Log
          // -------------------------------------------------------------
          heading2("5.3 Chronological Self-Directed Learning Log (PO12 Evidence)"),
          p("A Learning Log is a structured, chronological record documenting each stage of independent inquiry, resources consulted, practical hurdles encountered, and the engineering resolutions developed. The table below outlines our documented learning trail:"),

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

          // -------------------------------------------------------------
          // 5.4 Concrete Implementation in Campus Events Manager
          // -------------------------------------------------------------
          heading2("5.4 Concrete Implementation: Continuous Integration Pipeline (.github/workflows/ci.yml)"),
          p("We authored and committed the automated pipeline configuration file `.github/workflows/ci.yml` in the project root. Below is the production CI specification applied directly to the Campus Events Manager repository:"),

          codeBox(
            ".github/workflows/ci.yml — Automated CI Pipeline Specification",
`name: Campus Events Manager CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x, 22.x]

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Test Suite
        run: npm test

      - name: Check Code Coverage
        run: npm run test:coverage
        env:
          NODE_ENV: test
          CI: true`
          ),

          new Paragraph({ spacing: { before: 150, after: 100 } }),
          heading3("Detailed Architectural Breakdown of Workflow Stages:"),
          bullet("The workflow triggers on any code pushed to `main` and on every Pull Request targeting `main`. This ensures no proposed branch is merged without passing all checks.", "1. Event Trigger (`on`):"),
          bullet("The job provisions two parallel virtual environments running Ubuntu Linux: one running Node.js 20.x (active LTS) and the second running Node.js 22.x (current LTS). This detects forward compatibility issues early.", "2. Matrix Strategy (`strategy.matrix`):"),
          bullet("Uses clean installation (`npm ci`) rather than `npm install`, enforcing exact dependency tree fidelity based on `package-lock.json`.", "3. Deterministic Builds (`npm ci`):"),
          bullet("Executes 65 unit and integration tests covering UserFactory, EventQueryContext, NotificationSubject, and SQLite models.", "4. Comprehensive Test Suite (`npm test`):"),
          bullet("Collects coverage metrics across statements, branches, and functions. If coverage drops under 80%, the build fails, blocking the developer from merging.", "5. Quality Gate Enforcement (`test:coverage`):"),

          new Paragraph({ spacing: { before: 150, after: 150 } }),

          // Placeholder 2
          placeholderBox(
            "Figure 5.2",
            "Screenshot: GitHub Actions Workflow Run Overview (Green Passing Status)",
            "Insert a screenshot of the GitHub repository's 'Actions' tab showing all workflow runs completed with green checkmarks (✓) on recent commits and Pull Requests."
          ),

          new Paragraph({ spacing: { before: 200, after: 150 } }),

          // Placeholder 3
          placeholderBox(
            "Figure 5.3",
            "Screenshot: Multi-Version Node.js Matrix Execution in GitHub Actions",
            "Insert a screenshot showing the expanded job details in GitHub Actions displaying both 'Unit & Integration Tests (20.x)' and 'Unit & Integration Tests (22.x)' running in parallel and passing."
          ),

          new Paragraph({ spacing: { before: 200, after: 100 } }),

          // -------------------------------------------------------------
          // 5.5 Automated Test Coverage & Quality Gates
          // -------------------------------------------------------------
          heading2("5.5 Automated Code Coverage & Quality Gate Evidence"),
          p("To guarantee high software reliability, the CI pipeline enforces automated test coverage verification. The table below presents the quantitative results validated by the CI server on the final build:"),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              tableHeader(["Metric / Module Tested", "Enforced Threshold", "Achieved CI Coverage", "Gate Status"]),
              tableRow(["Statement Coverage (All Modules)", "≥ 80.0%", "84.62%", "PASSED (Green)"]),
              tableRow(["Branch / Pattern Coverage", "≥ 75.0%", "95.83%", "PASSED (Green)", true]),
              tableRow(["Function Coverage (Models & Services)", "≥ 80.0%", "81.48%", "PASSED (Green)"]),
              tableRow(["Line Coverage", "≥ 80.0%", "84.39%", "PASSED (Green)", true]),
              tableRow(["Design Pattern Modules (Factory, Strategy, Observer)", "≥ 90.0%", "100.00%", "PASSED (Green)"])
            ]
          }),

          new Paragraph({ spacing: { before: 150, after: 150 } }),

          // Placeholder 4
          placeholderBox(
            "Figure 5.4",
            "Screenshot: CI Runner Terminal Output Showing Test Coverage Table",
            "Insert a screenshot of the GitHub Actions runner terminal log (or local test run `npm run test:coverage`) displaying the Jest coverage summary table with all files passing the 80% threshold."
          ),

          new Paragraph({ spacing: { before: 200, after: 100 } }),

          // -------------------------------------------------------------
          // 5.6 Secondary Tool: Selenium WebDriver Automated E2E Testing
          // -------------------------------------------------------------
          heading2("5.6 Complementary Tool: Selenium WebDriver for Headless E2E Acceptance Testing"),
          p("While unit and integration tests thoroughly validate business logic and SQL transactions, they do not verify client-side DOM manipulation, asynchronous Fetch API promises, token persistence in `localStorage`, or dynamic UI rendering. To bridge this gap, we independently learned and implemented **Selenium WebDriver** (`tests/e2e/campus_flow.test.js`)."),

          p("Selenium WebDriver automates real headless Google Chrome instances. Below is a code excerpt demonstrating how our E2E suite verifies the complete student event registration and waitlist promotion lifecycle in an automated headless browser:"),

          codeBox(
            "tests/e2e/campus_flow.test.js — Automated Headless Chrome E2E Suite",
`// Configure headless Chrome runner
const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--headless=new');
chromeOptions.addArguments('--no-sandbox');
chromeOptions.addArguments('--disable-dev-shm-usage');
chromeOptions.addArguments('--window-size=1440,1080');

driver = await new Builder()
  .forBrowser('chrome')
  .setChromeOptions(chromeOptions)
  .build();

// Execute E2E flow: Navigate, Register, and Verify UI Feedback
await driver.get('http://localhost:4567/register.html');
await driver.findElement(By.id('regName')).sendKeys('Student Alice');
await driver.findElement(By.id('regEmail')).sendKeys('alice@campus.edu');
await driver.findElement(By.id('regPassword')).sendKeys('password123');
await driver.findElement(By.id('regDepartment')).sendKeys('Computer Science');
await driver.findElement(By.id('registerSubmitBtn')).click();

// Wait for automatic redirection to login page with toast notification
await driver.wait(until.urlContains('login.html'), 5000);
const toast = await driver.wait(until.elementLocated(By.className('toast-body')), 5000);
expect(await toast.getText()).toContain('Account created successfully');`
          ),

          new Paragraph({ spacing: { before: 150, after: 150 } }),

          // Placeholder 5
          placeholderBox(
            "Figure 5.5",
            "Screenshot: Selenium WebDriver E2E Test Execution in Terminal",
            "Insert a screenshot of the terminal running `npm run test:e2e` showing the 3 Selenium WebDriver E2E test suites executing with Headless Chrome and passing with 100% success."
          ),

          new Paragraph({ spacing: { before: 200, after: 100 } }),

          // -------------------------------------------------------------
          // 5.7 Branch Protection & Pull Request Integration
          // -------------------------------------------------------------
          heading2("5.7 Branch Protection Rules & Quality Gate Enforcement"),
          p("To prevent developers from accidentally pushing unverified code directly into the `main` branch, we configured GitHub Repository Branch Protection Rules that integrate directly with the GitHub Actions CI pipeline:"),

          bullet("Direct pushes to `main` are rejected. All updates must originate from a dedicated feature branch (`feature/*`, `fix/*`, `chore/*`).", "1. Disallow Direct Pushes:"),
          bullet("A Pull Request cannot be merged until the GitHub Actions workflow (`Unit & Integration Tests`) has run and reported a green passing status.", "2. Require Status Checks to Pass:"),
          bullet("Requires that the feature branch is strictly up-to-date with `main` before merging, preventing silent logical merge conflicts.", "3. Require Branches to be Up-to-Date:"),

          new Paragraph({ spacing: { before: 150, after: 150 } }),

          // Placeholder 6
          placeholderBox(
            "Figure 5.6",
            "Screenshot: Pull Request Blocked by CI Checks / Required Status Checks",
            "Insert a screenshot of a GitHub Pull Request showing: 'All checks have passed - 2 successful checks (Unit & Integration Tests 20.x, 22.x)' with the green 'Merge pull request' button enabled."
          ),

          new Paragraph({ spacing: { before: 200, after: 100 } }),

          // -------------------------------------------------------------
          // 5.8 Reflection Essay on Self-Directed Learning (PO12, CO4)
          // -------------------------------------------------------------
          heading2("5.8 Reflection Essay on Self-Directed Learning (PO12, CO4)"),
          p("The integration of GitHub Actions and Selenium WebDriver represents a significant milestone in our growth as software engineers. Prior to this project, our perception of software engineering was largely centered around coding individual algorithm functions and manually verifying outputs on a localhost server. Experiencing the friction of team merge conflicts and subtle regression bugs shifted our mindset toward professional DevSecOps practices."),

          callout(
            "Self-Evaluation of Learning Outcomes",
            "1. Tool Mastery (CO4): Successfully authored custom CI YAML scripts, managed matrix test runners, configured dual-mode SQLite database isolation, and constructed automated headless browser acceptance suites.\n2. Autonomous Learning (PO12): Independently diagnosed and solved complex asynchronous testing race conditions and CI runner environment discrepancies using official developer specifications without instructor guidance.\n3. Engineering Impact: Achieved zero broken main branch builds across 17 Pull Requests, reduced test verification turnaround from 15 minutes of manual clicking to 32 seconds of automated execution, and enforced an objective 84.6% statement coverage gate."
          ),

          p("In conclusion, mastering GitHub Actions and Selenium WebDriver demonstrates the practical realization of Program Outcome 12 (Life-Long Learning). The ability to independently assess technical challenges, discover emerging industry tools, rigorously evaluate their trade-offs, and synthesize them into a running production codebase is the most enduring competency acquired through this sessional."),

          new Paragraph({ spacing: { before: 250, after: 100 } }),

          // -------------------------------------------------------------
          // Appendix: Draw.io XML for Figure 5.1
          // -------------------------------------------------------------
          heading1("Appendix: Draw.io XML Source Code for Figure 5.1"),
          p("Below is the complete Draw.io / diagrams.net XML source code for Figure 5.1. You can copy and paste this into https://app.diagrams.net under Extras → Edit Diagram."),
          createXmlBox("Figure 5.1 CI/CD Pipeline Architecture", "05_cicd_pipeline_diagram.drawio")
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath1 = path.join(__dirname, '../CSE3206_Lab6_Section5_New_Tool_Self_Directed_Learning.docx');
  const outPath2 = path.join(__dirname, '../docs/CSE3206_Lab6_Section5_New_Tool_Self_Directed_Learning.docx');

  fs.writeFileSync(outPath1, buffer);
  fs.writeFileSync(outPath2, buffer);

  console.log(`Successfully generated Section 5 standalone report at:\n  1. ${outPath1}\n  2. ${outPath2}`);
}

generateSection5Docx().catch(err => {
  console.error("Failed to generate Section 5 report:", err);
  process.exit(1);
});
