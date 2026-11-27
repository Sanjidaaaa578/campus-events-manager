const { connectDatabase, initializeSchema } = require('./config/database');
const UserModel = require('./modules/users/user.model');
const EventModel = require('./modules/events/event.model');
const RegistrationModel = require('./modules/registrations/registration.model');
const NotificationModel = require('./modules/notifications/notification.model');

async function seed() {
  console.log('Seeding demo data into SQLite database...');
  const db = await connectDatabase();
  await initializeSchema(db);

  // Clear existing data for clean demo state
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM notifications;');
      db.run('DELETE FROM registrations;');
      db.run('DELETE FROM events;');
      db.run('DELETE FROM users;', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  console.log('Cleared existing records.');

  // 1. Create Users
  // 1 Admin
  const admin = await UserModel.create(db, {
    name: 'Dr. Sarah Connor (Admin)',
    email: 'admin@campus.edu',
    password: 'password123',
    role: 'Admin',
    department: 'Administration'
  });

  // 2 Organizers
  const org1 = await UserModel.create(db, {
    name: 'Prof. Charles Xavier',
    email: 'organizer1@campus.edu',
    password: 'password123',
    role: 'Organizer',
    department: 'Computer Science & AI'
  });

  const org2 = await UserModel.create(db, {
    name: 'Coach Marcus Vance',
    email: 'organizer2@campus.edu',
    password: 'password123',
    role: 'Organizer',
    department: 'Athletics & Student Life'
  });

  // 5 Students
  const students = [];
  const studentData = [
    { name: 'Alex Johnson', email: 'alex@campus.edu', dept: 'Software Engineering' },
    { name: 'Emily Davis', email: 'emily@campus.edu', dept: 'Data Science' },
    { name: 'Michael Chen', email: 'michael@campus.edu', dept: 'Electrical Engineering' },
    { name: 'Sophia Rodriguez', email: 'sophia@campus.edu', dept: 'Business & Management' },
    { name: 'David Kim', email: 'david@campus.edu', dept: 'Bioinformatics' }
  ];

  for (const s of studentData) {
    const student = await UserModel.create(db, {
      name: s.name,
      email: s.email,
      password: 'password123',
      role: 'Student',
      department: s.dept
    });
    students.push(student);
  }

  // 2. Create 12 Events across various categories and statuses
  const rawEvents = [
    {
      org: org1.id,
      title: 'Global AI & Robotics Summit 2026',
      description: 'Explore generative AI models, autonomous robotics, and interactive hardware demos from top researchers.',
      date: '2026-12-05',
      time: '10:00',
      venue: 'Turing Auditorium A',
      capacity: 3, // small capacity to test full / waitlist
      category: 'Technology',
      status: 'Approved'
    },
    {
      org: org1.id,
      title: 'Full-Stack Web Dev Bootcamp',
      description: 'Hands-on intensive masterclass on modern Node.js, Express, databases, and UI architecture.',
      date: '2026-12-08',
      time: '14:00',
      venue: 'Software Lab 204',
      capacity: 25,
      category: 'Workshop',
      status: 'Approved'
    },
    {
      org: org2.id,
      title: 'Inter-Department Football Championship',
      description: 'Cheer for your faculty team in the annual campus league playoffs! Free refreshments provided.',
      date: '2026-12-10',
      time: '16:00',
      venue: 'Main Campus Stadium',
      capacity: 200,
      category: 'Sports',
      status: 'Approved'
    },
    {
      org: org2.id,
      title: 'Annual Campus Career & Internship Fair',
      description: 'Connect directly with over 40 global technology employers, recruiters, and startup founders.',
      date: '2026-12-12',
      time: '09:00',
      venue: 'University Exhibition Hall',
      capacity: 150,
      category: 'Career',
      status: 'Approved'
    },
    {
      org: org1.id,
      title: 'Competitive Algorithmic Hackathon',
      description: 'Solve real-world distributed systems challenges in teams of up to three. Cash prizes and medals.',
      date: '2026-12-15',
      time: '11:00',
      venue: 'Innovation Hub',
      capacity: 40,
      category: 'Technology',
      status: 'Approved'
    },
    {
      org: org2.id,
      title: 'Campus Marathon & Charity Run',
      description: '5K run across the campus perimeter supporting student scholarship programs.',
      date: '2026-12-18',
      time: '07:30',
      venue: 'University Central Plaza',
      capacity: 100,
      category: 'Sports',
      status: 'Approved'
    },
    {
      org: org1.id,
      title: 'Cybersecurity Threat Modeling Workshop',
      description: 'Interactive capture-the-flag simulation testing web application defenses and cryptography.',
      date: '2026-12-20',
      time: '13:00',
      venue: 'Cyber Range Room 301',
      capacity: 20,
      category: 'Workshop',
      status: 'Approved'
    },
    {
      org: org2.id,
      title: 'Winter Music & Cultural Festival',
      description: 'Live musical acts, student band showcases, and multicultural food booths.',
      date: '2026-12-22',
      time: '18:00',
      venue: 'Open Air Amphitheatre',
      capacity: 300,
      category: 'Social',
      status: 'Approved'
    },
    {
      org: org1.id,
      title: 'Quantum Computing Fundamentals Seminar',
      description: 'An introductory lecture on qubits, quantum superposition, and quantum algorithm simulations.',
      date: '2026-12-24',
      time: '15:00',
      venue: 'Physics Lecture Theatre B',
      capacity: 35,
      category: 'Academic',
      status: 'Pending'
    },
    {
      org: org2.id,
      title: 'Campus Table Tennis Open',
      description: 'Single-elimination table tennis tournament open to students and faculty.',
      date: '2026-12-27',
      time: '16:30',
      venue: 'Student Recreation Complex',
      capacity: 16,
      category: 'Sports',
      status: 'Pending'
    },
    {
      org: org1.id,
      title: 'Blockchain & Smart Contracts Masterclass',
      description: 'Deep dive into decentralized application architectures and gas optimization.',
      date: '2026-12-29',
      time: '14:00',
      venue: 'Online Virtual Hall',
      capacity: 50,
      category: 'Technology',
      status: 'Pending'
    },
    {
      org: org2.id,
      title: 'Late Night Unsupervised Gathering',
      description: 'Unauthorized social event rejected by administration due to venue rules.',
      date: '2026-12-31',
      time: '23:00',
      venue: 'East Quad Lawn',
      capacity: 50,
      category: 'Social',
      status: 'Rejected'
    }
  ];

  const createdEvents = [];
  for (const ev of rawEvents) {
    const created = await EventModel.create(db, {
      organizerId: ev.org,
      title: ev.title,
      description: ev.description,
      date: ev.date,
      time: ev.time,
      venue: ev.venue,
      capacity: ev.capacity,
      category: ev.category
    });
    if (ev.status !== 'Pending') {
      await EventModel.updateStatus(db, created.id, ev.status);
      created.status = ev.status;
    }
    createdEvents.push(created);
  }

  // 3. Populate Registrations and Waiting Lists
  // Fill Event 0 (Global AI & Robotics Summit, capacity: 3)
  // Register 3 students -> event full. Then register 4th and 5th -> waitlisted!
  const fullEvent = createdEvents[0];
  await RegistrationModel.register(db, { eventId: fullEvent.id, studentId: students[0].id });
  await RegistrationModel.register(db, { eventId: fullEvent.id, studentId: students[1].id });
  await RegistrationModel.register(db, { eventId: fullEvent.id, studentId: students[2].id });
  // Waitlisted:
  await RegistrationModel.register(db, { eventId: fullEvent.id, studentId: students[3].id });
  await RegistrationModel.register(db, { eventId: fullEvent.id, studentId: students[4].id });

  // Register some other events
  const workshopEvent = createdEvents[1];
  await RegistrationModel.register(db, { eventId: workshopEvent.id, studentId: students[0].id });
  await RegistrationModel.register(db, { eventId: workshopEvent.id, studentId: students[1].id });

  const sportsEvent = createdEvents[2];
  await RegistrationModel.register(db, { eventId: sportsEvent.id, studentId: students[0].id });
  await RegistrationModel.register(db, { eventId: sportsEvent.id, studentId: students[2].id });
  await RegistrationModel.register(db, { eventId: sportsEvent.id, studentId: students[3].id });

  const careerEvent = createdEvents[3];
  await RegistrationModel.register(db, { eventId: careerEvent.id, studentId: students[1].id });
  await RegistrationModel.register(db, { eventId: careerEvent.id, studentId: students[4].id });

  // 4. Create sample notifications
  await NotificationModel.create(db, {
    userId: students[0].id,
    title: 'Registration Confirmed: Global AI & Robotics Summit 2026',
    message: 'Your registration for "Global AI & Robotics Summit 2026" on 2026-12-05 at Turing Auditorium A has been confirmed.'
  });

  await NotificationModel.create(db, {
    userId: students[3].id,
    title: 'Waitlist Confirmation: Global AI & Robotics Summit 2026',
    message: 'You are currently position #1 on the waiting list for "Global AI & Robotics Summit 2026". We will notify you if a spot opens up.'
  });

  await NotificationModel.create(db, {
    userId: admin.id,
    title: 'New Events Pending Review',
    message: 'There are 3 new organizer event proposals waiting for your administrative approval.'
  });

  console.log('\n======================================================');
  console.log('✅ Demo database seeded successfully!');
  console.log('======================================================');
  console.log('DEMO ACCOUNTS (Password for all accounts is: password123)');
  console.log('------------------------------------------------------');
  console.log('👑 ADMIN:');
  console.log('   Email: admin@campus.edu');
  console.log('\n🧑‍🏫 ORGANIZERS:');
  console.log('   Email: organizer1@campus.edu (Prof. Charles Xavier - CS & AI)');
  console.log('   Email: organizer2@campus.edu (Coach Marcus Vance - Athletics)');
  console.log('\n🎓 STUDENTS:');
  console.log('   Email: alex@campus.edu     (Alex Johnson - Software Eng.)');
  console.log('   Email: emily@campus.edu    (Emily Davis - Data Science)');
  console.log('   Email: michael@campus.edu  (Michael Chen - Electrical Eng.)');
  console.log('   Email: sophia@campus.edu   (Sophia Rodriguez - Waitlisted #1 for AI Summit)');
  console.log('   Email: david@campus.edu    (David Kim - Waitlisted #2 for AI Summit)');
  console.log('======================================================\n');

  await new Promise((resolve) => db.close(resolve));
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = seed;
