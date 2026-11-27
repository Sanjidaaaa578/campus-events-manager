const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const { createApp } = require('../src/app');
const { connectDatabase, initializeSchema } = require('../src/config/database');
const UserModel = require('../src/modules/users/user.model');
const EventModel = require('../src/modules/events/event.model');
const RegistrationModel = require('../src/modules/registrations/registration.model');

async function capture() {
  const PORT = 3567;
  const BASE_URL = `http://localhost:${PORT}`;

  const db = await connectDatabase(':memory:');
  await initializeSchema(db);

  // Seed sample users
  const admin = await UserModel.create(db, {
    name: 'Dr. Sarah Connor (Admin)',
    email: 'admin@campus.edu',
    password: 'password123',
    role: 'Admin',
    department: 'Administration'
  });

  const org1 = await UserModel.create(db, {
    name: 'Prof. Charles Xavier',
    email: 'organizer1@campus.edu',
    password: 'password123',
    role: 'Organizer',
    department: 'Computer Science'
  });

  const student1 = await UserModel.create(db, {
    name: 'Alex Johnson',
    email: 'alex@campus.edu',
    password: 'password123',
    role: 'Student',
    department: 'Software Engineering'
  });

  // Seed sample events
  const ev1 = await EventModel.create(db, {
    organizerId: org1.id,
    title: 'Global AI & Robotics Summit 2026',
    description: 'Explore generative AI models, autonomous robotics, and interactive hardware demos from top researchers.',
    date: '2026-12-05',
    time: '10:00',
    venue: 'Turing Auditorium A',
    capacity: 60,
    category: 'Technology'
  });
  await EventModel.updateStatus(db, ev1.id, 'Approved');

  const ev2 = await EventModel.create(db, {
    organizerId: org1.id,
    title: 'Full-Stack Web Dev Bootcamp',
    description: 'Hands-on intensive masterclass on modern Node.js, Express, databases, and UI architecture.',
    date: '2026-12-08',
    time: '14:00',
    venue: 'Software Lab 204',
    capacity: 25,
    category: 'Workshop'
  });
  await EventModel.updateStatus(db, ev2.id, 'Approved');

  const ev3 = await EventModel.create(db, {
    organizerId: org1.id,
    title: 'Inter-Department Football Championship',
    description: 'Cheer for your faculty team in the annual campus league playoffs! Free refreshments provided.',
    date: '2026-12-10',
    time: '16:00',
    venue: 'Main Campus Stadium',
    capacity: 200,
    category: 'Sports'
  });
  await EventModel.updateStatus(db, ev3.id, 'Approved');

  await RegistrationModel.register(db, { eventId: ev1.id, studentId: student1.id });
  await RegistrationModel.register(db, { eventId: ev2.id, studentId: student1.id });

  const app = createApp(db);
  const server = await new Promise(res => {
    const s = app.listen(PORT, () => res(s));
  });

  const options = new chrome.Options();
  options.addArguments('--headless=new');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1440,960');

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  const screenshotDir = path.join(__dirname, '../docs/screenshots');

  async function snap(url, filename, waitSelector) {
    await driver.get(url);
    if (waitSelector) {
      await driver.wait(until.elementLocated(By.css(waitSelector)), 8000);
      await driver.sleep(600); // allow transitions
    }
    const data = await driver.takeScreenshot();
    fs.writeFileSync(path.join(screenshotDir, filename), Buffer.from(data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  }

  try {
    // 1. Homepage
    await snap(`${BASE_URL}/index.html`, '01_homepage.png', '[data-testid="hero-title"]');

    // 2. Login Page
    await snap(`${BASE_URL}/login.html`, '02_login_page.png', '[data-testid="login-submit-btn"]');

    // 3. Register Page
    await snap(`${BASE_URL}/register.html`, '03_register_page.png', '[data-testid="register-submit-btn"]');

    // 4. Browse Catalog
    await snap(`${BASE_URL}/events.html`, '04_events_catalog.png', '[data-testid="filter-keyword"]');

    // 5. Event Details
    await snap(`${BASE_URL}/event-details.html?id=1`, '05_event_details.html.png', '#event-title');

    // 6. Log in as Student and snap Profile
    await driver.get(`${BASE_URL}/login.html`);
    await driver.findElement(By.id('email')).sendKeys('alex@campus.edu');
    await driver.findElement(By.id('password')).sendKeys('password123');
    await driver.findElement(By.id('login-btn')).click();
    await driver.wait(until.elementLocated(By.id('nav-user-name')), 8000);
    await driver.sleep(500);

    // Profile Page
    await snap(`${BASE_URL}/profile.html`, '06_profile_page.png', '#profileName');

    // My Registrations
    await snap(`${BASE_URL}/my-registrations.html`, '07_my_registrations.png', '#confirmed-list');

    // 7. Log in as Admin and snap Admin Dashboard & Approvals
    await driver.get(`${BASE_URL}/login.html`);
    await driver.executeScript('localStorage.clear();');
    await driver.get(`${BASE_URL}/login.html`);
    await driver.findElement(By.id('email')).sendKeys('admin@campus.edu');
    await driver.findElement(By.id('password')).sendKeys('password123');
    await driver.findElement(By.id('login-btn')).click();
    await driver.wait(until.elementLocated(By.id('nav-user-name')), 8000);
    await driver.sleep(500);

    // Admin Dashboard
    await snap(`${BASE_URL}/admin-dashboard.html`, '08_admin_dashboard.png', '#categoryChart');
    await snap(`${BASE_URL}/admin-approvals.html`, '09_admin_approvals.png', '#approvals-table-body');

    console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } finally {
    await driver.quit();
    server.close();
  }
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
