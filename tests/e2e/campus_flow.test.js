const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { createApp } = require('../../src/app');
const { connectDatabase, initializeSchema } = require('../../src/config/database');
const UserModel = require('../../src/modules/users/user.model');
const EventModel = require('../../src/modules/events/event.model');

describe('End-to-End Testing (Selenium Web Driver)', () => {
  let server;
  let driver;
  let db;
  const PORT = 4567;
  const BASE_URL = `http://localhost:${PORT}`;

  beforeAll(async () => {
    // 1. Initialize test database
    db = await connectDatabase(':memory:');
    await initializeSchema(db);

    // Seed test organizer & event
    const organizer = await UserModel.create(db, {
      name: 'Organizer Eve',
      email: 'eve@campus.edu',
      password: 'password123',
      role: 'Organizer'
    });

    const event = await EventModel.create(db, {
      organizerId: organizer.id,
      title: 'Annual Tech Summit',
      description: 'Keynotes and workshops',
      date: '2026-12-24',
      time: '10:00',
      venue: 'Main Hall',
      capacity: 50,
      category: 'Tech'
    });
    await EventModel.updateStatus(db, event.id, 'Approved');

    // 2. Start HTTP server
    const app = createApp(db);
    await new Promise((resolve) => {
      server = app.listen(PORT, resolve);
    });

    // 3. Build headless Chrome driver
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (db) {
      db.close();
    }
  });

  test('Page loads and displays title and seeded events', async () => {
    await driver.get(BASE_URL);

    // Verify Title
    const titleElement = await driver.findElement(By.id('app-title'));
    const titleText = await titleElement.getText();
    expect(titleText).toBe('Campus Events Manager');

    // Verify seeded event appears in list
    const eventItem = await driver.wait(
      until.elementLocated(By.xpath("//h3[contains(text(), 'Annual Tech Summit')]")),
      10000
    );
    expect(await eventItem.getText()).toBe('Annual Tech Summit');
  });

  test('Student can register a new account via the UI', async () => {
    await driver.get(BASE_URL);

    // Switch to Register Tab
    const registerTabBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Register')]"));
    await registerTabBtn.click();

    // Fill form
    await driver.findElement(By.id('register-name')).sendKeys('Selenium Student');
    await driver.findElement(By.id('register-email')).sendKeys('selenium_student@campus.edu');
    await driver.findElement(By.id('register-password')).sendKeys('password123');
    await driver.findElement(By.id('register-dept')).sendKeys('Informatics');

    // Submit
    const submitBtn = await driver.findElement(By.id('register-submit-btn'));
    await submitBtn.click();

    // Wait for success message
    const msgBox = await driver.wait(
      until.elementLocated(By.xpath("//div[@id='auth-message' and contains(@class, 'success')]")),
      10000
    );
    expect(await msgBox.getText()).toContain('Registered successfully');

    // Verify header updates with logged-in status
    const userDisplay = await driver.findElement(By.id('user-display'));
    expect(await userDisplay.getText()).toContain('Selenium Student (Student)');
  });

  test('Logged-in student registers for an event via the UI', async () => {
    // Click Register on the event card
    const registerBtn = await driver.wait(
      until.elementLocated(By.className('btn-register')),
      10000
    );
    await registerBtn.click();

    // Check confirmation message
    const actionMsg = await driver.wait(
      until.elementLocated(By.xpath("//div[@id='action-message' and contains(@class, 'success')]")),
      10000
    );
    expect(await actionMsg.getText()).toContain('confirmed');
  });
});
