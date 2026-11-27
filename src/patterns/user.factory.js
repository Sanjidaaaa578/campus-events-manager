/**
 * Base User Class
 */
class BaseUser {
  constructor({ id, name, email, role, department = null, created_at = null, updated_at = null }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.department = department;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  canCreateEvent() {
    return false;
  }

  canApproveEvent() {
    return false;
  }

  canRegisterForEvent() {
    return false;
  }

  canViewReports() {
    return false;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      department: this.department,
      permissions: {
        canCreateEvent: this.canCreateEvent(),
        canApproveEvent: this.canApproveEvent(),
        canRegisterForEvent: this.canRegisterForEvent(),
        canViewReports: this.canViewReports()
      }
    };
  }
}

/**
 * Student User: Registers for events, views registered events, receives notifications.
 */
class StudentUser extends BaseUser {
  constructor(data) {
    super({ ...data, role: 'Student' });
  }

  canRegisterForEvent() {
    return true;
  }
}

/**
 * Organizer User: Creates and manages events, views attendee lists, sends reminders.
 */
class OrganizerUser extends BaseUser {
  constructor(data) {
    super({ ...data, role: 'Organizer' });
  }

  canCreateEvent() {
    return true;
  }
}

/**
 * Admin User: Approves/rejects events, views reports and analytics, full access.
 */
class AdminUser extends BaseUser {
  constructor(data) {
    super({ ...data, role: 'Admin' });
  }

  canCreateEvent() {
    return true;
  }

  canApproveEvent() {
    return true;
  }

  canRegisterForEvent() {
    return true;
  }

  canViewReports() {
    return true;
  }
}

/**
 * Factory Pattern: UserFactory
 * Encapsulates the instantiation of role-specific User objects.
 */
class UserFactory {
  static createUser(userData) {
    if (!userData || !userData.role) {
      throw new Error('User data with a valid role is required');
    }

    switch (userData.role) {
      case 'Student':
        return new StudentUser(userData);
      case 'Organizer':
        return new OrganizerUser(userData);
      case 'Admin':
        return new AdminUser(userData);
      default:
        throw new Error(`Unsupported user role: ${userData.role}`);
    }
  }
}

module.exports = {
  BaseUser,
  StudentUser,
  OrganizerUser,
  AdminUser,
  UserFactory
};
