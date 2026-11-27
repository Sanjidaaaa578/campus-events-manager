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
  ShadingType
} = require('docx');

async function generateSimpleLearningLogDocx() {
  console.log("Generating simple Learning Log .docx document...");

  function heading1(text) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({ text, bold: true, size: 26, color: '1E1B4B', font: 'Arial' })
      ]
    });
  }

  function p(text, isBold = false) {
    return new Paragraph({
      spacing: { before: 40, after: 80, line: 260 },
      children: [
        new TextRun({ text, bold: isBold, size: 20, color: '334155', font: 'Arial' })
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
      children: cells.map((text, idx) => new TableCell({
        shading: isAlt ? { fill: 'F8FAFC', type: ShadingType.CLEAR } : { fill: 'FFFFFF', type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [
          new Paragraph({
            alignment: idx === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
            children: [
              new TextRun({
                text,
                size: 19,
                bold: idx === 0,
                color: idx === 0 ? '4338CA' : '334155',
                font: 'Arial'
              })
            ]
          })
        ]
      }))
    });
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 20, color: '334155' }
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
          // Header banner
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({
                text: "RAJSHAHI UNIVERSITY OF ENGINEERING & TECHNOLOGY (RUET)",
                bold: true,
                size: 18,
                color: '64748B',
                font: 'Arial'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({
                text: "CSE 3206: Software Engineering & Information System Design Sessional",
                size: 18,
                color: '64748B',
                font: 'Arial'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 200 },
            children: [
              new TextRun({
                text: "SELF-DIRECTED LEARNING LOG (CO4 / PO12)",
                bold: true,
                size: 24,
                color: '1E1B4B',
                font: 'Arial'
              })
            ]
          }),

          p("Project: Campus Events Manager", true),
          p("Tool / Technique Selected: GitHub Actions (Continuous Integration) & Selenium WebDriver (Automated E2E Testing)", true),
          p("Description: This learning log documents the progressive stages of autonomous research, technical experimentation, obstacles faced, and resolutions achieved while integrating automated testing and CI/CD pipelines beyond the course syllabus."),

          new Paragraph({ spacing: { before: 100, after: 100 } }),

          // The Learning Log Table (No Dates - Uses Milestones/Stages)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              tableHeader([
                "Learning Stage",
                "Topic & Hands-on Activity",
                "Resources Consulted",
                "Obstacle / Error Encountered",
                "Resolution & Key Takeaway"
              ]),
              tableRow([
                "Stage 1:\nWorkflow Syntax",
                "YAML structure, runner environments, and event triggers (on: push, on: pull_request).",
                "Official GitHub Actions Documentation & Starter Workflows",
                "Workflow triggered unnecessarily on documentation updates (.md) and images, consuming runner quota.",
                "Configured path filtering (paths-ignore: [\"docs/**\", \"*.md\"]) to restrict triggers strictly to production and test code."
              ]),
              tableRow([
                "Stage 2:\nMatrix Strategy",
                "Configuring multi-version Node.js matrix testing (Node 20.x Active LTS & Node 22.x Current LTS).",
                "GitHub Actions Docs: 'Using a matrix for your jobs'",
                "Slow pipeline run times (over 3.5 minutes) caused by re-downloading dependencies on every commit.",
                "Implemented actions/setup-node@v4 with 'cache: npm', slashing pipeline execution time down to 32 seconds.",
                true
              ]),
              tableRow([
                "Stage 3:\nE2E Automation",
                "Writing automated browser acceptance tests using Selenium WebDriver and chromedriver.",
                "SeleniumHQ JavaScript API Reference & Chrome DevTools flags",
                "Headless Chrome threw ElementClickInterceptedError when attempting to click form submit buttons.",
                "Discovered headless Chrome defaults to an 800x600 viewport; fixed by setting '--window-size=1440,1080' and scrollIntoView."
              ]),
              tableRow([
                "Stage 4:\nCoverage Gates",
                "Enforcing minimum code coverage thresholds (>80%) on every pull request via Jest.",
                "Jest CLI Documentation: '--coverage' and coverage threshold configurations",
                "Running test:coverage in CI failed because headless cloud runners lacked local Google Chrome binaries.",
                "Separated unit/integration tests from browser E2E tests using '--testPathIgnorePatterns=tests/e2e' in the CI script.",
                true
              ]),
              tableRow([
                "Stage 5:\nBranch Protection",
                "Linking GitHub repository branch protection rules with automated CI status checks.",
                "GitHub Repository Settings & Branch Protection Documentation",
                "Risk of team members accidentally pushing unreviewed or broken code directly to main.",
                "Locked the main branch, enforcing required passing status checks ('Unit & Integration Tests') before merging."
              ])
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 80 } }),

          heading1("Summary of Outcomes Achieved:"),
          p("• 100% Automated CI Pipeline: Zero broken builds landing on the main branch across 17 Pull Requests."),
          p("• Multi-Version Compatibility: Guaranteed runtime stability across both Node.js 20 and Node.js 22 LTS environments."),
          p("• Strict Quality Gate: Verified 84.6% statement coverage and 95.8% branch/pattern coverage on every commit."),
          p("• Autonomous Learning (PO12): Successfully mastered modern DevSecOps tools without instructor-led lab tutorials.")
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath1 = path.join(__dirname, '../CSE3206_Lab6_Learning_Log.docx');
  const outPath2 = path.join(__dirname, '../docs/CSE3206_Lab6_Learning_Log.docx');

  fs.writeFileSync(outPath1, buffer);
  fs.writeFileSync(outPath2, buffer);

  console.log(`Simple Learning Log successfully created at:\n  1. ${outPath1}\n  2. ${outPath2}`);
}

generateSimpleLearningLogDocx().catch(err => {
  console.error("Failed to generate simple Learning Log report:", err);
  process.exit(1);
});
