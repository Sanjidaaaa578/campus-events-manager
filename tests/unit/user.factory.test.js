const {
  UserFactory,
  StudentUser,
  OrganizerUser,
  AdminUser,
  BaseUser
} = require('../../src/patterns/user.factory');

describe('Design Pattern: Factory (UserFactory)', () => {
  test('should create a StudentUser with appropriate permissions', () => {
    const student = UserFactory.createUser({
      id: 1,
      name: 'Sam Student',
      email: 'sam@campus.edu',
      role: 'Student',
      department: 'Physics'
    });

    expect(student).toBeInstanceOf(BaseUser);
    expect(student).toBeInstanceOf(StudentUser);
    expect(student.canRegisterForEvent()).toBe(true);
    expect(student.canCreateEvent()).toBe(false);
    expect(student.canApproveEvent()).toBe(false);
    expect(student.canViewReports()).toBe(false);

    const json = student.toJSON();
    expect(json.permissions.canRegisterForEvent).toBe(true);
    expect(json.permissions.canCreateEvent).toBe(false);
  });

  test('should create an OrganizerUser with appropriate permissions', () => {
    const organizer = UserFactory.createUser({
      id: 2,
      name: 'Olivia Organizer',
      email: 'olivia@campus.edu',
      role: 'Organizer',
      department: 'Student Union'
    });

    expect(organizer).toBeInstanceOf(BaseUser);
    expect(organizer).toBeInstanceOf(OrganizerUser);
    expect(organizer.canCreateEvent()).toBe(true);
    expect(organizer.canRegisterForEvent()).toBe(false);
    expect(organizer.canApproveEvent()).toBe(false);
    expect(organizer.canViewReports()).toBe(false);
  });

  test('should create an AdminUser with all permissions', () => {
    const admin = UserFactory.createUser({
      id: 3,
      name: 'Arthur Admin',
      email: 'arthur@campus.edu',
      role: 'Admin'
    });

    expect(admin).toBeInstanceOf(BaseUser);
    expect(admin).toBeInstanceOf(AdminUser);
    expect(admin.canCreateEvent()).toBe(true);
    expect(admin.canApproveEvent()).toBe(true);
    expect(admin.canRegisterForEvent()).toBe(true);
    expect(admin.canViewReports()).toBe(true);
  });

  test('should throw error when invalid or unsupported role is provided', () => {
    expect(() => {
      UserFactory.createUser({ name: 'Guest', role: 'Guest' });
    }).toThrow('Unsupported user role: Guest');

    expect(() => {
      UserFactory.createUser({ name: 'NoRole' });
    }).toThrow('User data with a valid role is required');
  });
});
