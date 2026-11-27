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
      category: 'Technology'
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
    options.addArguments('--window-size=1440,1080');

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

    // Verify Title / Brand
    const titleElement = await driver.wait(
      until.elementLocated(By.css('[data-testid="nav-brand"]')),
      10000
    );
    const titleText = await titleElement.getText();
    expect(titleText).toContain('Campus Events');

    // Verify seeded event appears in list
    const eventItem = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Annual Tech Summit')]")),
      10000
    );
    expect(await eventItem.getText()).toBe('Annual Tech Summit');
  });

  test('Student can register a new account via the UI', async () => {
    await driver.get(`${BASE_URL}/register.html`);

    // Fill registration form
    await driver.findElement(By.id('reg-name')).sendKeys('Selenium Student');
    await driver.findElement(By.id('reg-email')).sendKeys('selenium_student@campus.edu');
    await driver.findElement(By.id('reg-password')).sendKeys('password123');
    await driver.findElement(By.id('reg-dept')).sendKeys('Informatics');

    // Submit with scroll into view
    const submitBtn = await driver.findElement(By.id('register-btn'));
    await driver.executeScript('arguments[0].scrollIntoView(true);', submitBtn);
    await driver.executeScript('arguments[0].click();', submitBtn);

    // Wait for redirect to index.html with logged-in status
    const userNameEl = await driver.wait(
      until.elementLocated(By.id('nav-user-name')),
      10000
    );
    expect(await userNameEl.getText()).toBe('Selenium Student');
  });

  test('Logged-in student registers for an event via the UI', async () => {
    // Navigate to event details
    await driver.get(`${BASE_URL}/event-details.html?id=1`);

    // Wait for register button
    const registerBtn = await driver.wait(
      until.elementLocated(By.id('register-btn')),
      10000
    );
    await driver.executeScript('arguments[0].scrollIntoView(true);', registerBtn);
    await driver.executeScript('arguments[0].click();', registerBtn);

    // Wait for action feedback
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Cancel Registration') or contains(@class, 'toast')]")),
      10000
    );
    const updatedBtn = await driver.findElement(By.id('register-btn'));
    expect(await updatedBtn.getText()).toContain('Cancel');
  });
});
