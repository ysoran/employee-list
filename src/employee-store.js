/**
 * Employee data model
 * @typedef {Object} Employee
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} dateOfEmployment
 * @property {string} dateOfBirth
 * @property {string} phoneNumber
 * @property {string} emailAddress
 * @property {string} department
 * @property {string} position
 */

class EmployeeStore {
  constructor() {
    /** @type {Employee[]} */
    this.employees = [];

    /** Listeners to notify when employees change */
    this.subscribers = [];

    this.localStorageKey = 'employee_management_app_data';

    // Load initial data from localStorage or seed dummy data
    this._loadFromStorage();
  }

  _loadFromStorage() {
    try {
      const rawData = localStorage.getItem(this.localStorageKey);
      this.employees = rawData ? JSON.parse(rawData) : [];

      // If nothing stored yet, add some dummy employees
      if (!this.employees.length) {
        this._seedDummyData();
      }
    } catch (error) {
      console.error('Failed to load employee data from localStorage:', error);
      this.employees = [];
      this._seedDummyData();
    }
  }

  _saveToStorage() {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.employees));
    } catch (error) {
      console.error('Failed to save employee data:', error);
    }
  }

  // Add some dummy employees so the app has something to show
  _seedDummyData() {
    this.employees = [
      {
        id: 'emp1',
        firstName: 'Alice',
        lastName: 'Smith',
        dateOfEmployment: '2020-01-15',
        dateOfBirth: '1990-05-20',
        phoneNumber: '123-456-7890',
        emailAddress: 'alice.smith@example.com',
        department: 'Tech',
        position: 'Senior',
      },
      {
        id: 'emp2',
        firstName: 'Bob',
        lastName: 'Johnson',
        dateOfEmployment: '2021-03-01',
        dateOfBirth: '1992-11-10',
        phoneNumber: '098-765-4321',
        emailAddress: 'bob.j@example.com',
        department: 'Analytics',
        position: 'Medior',
      },
      {
        id: 'emp3',
        firstName: 'Charlie',
        lastName: 'Brown',
        dateOfEmployment: '2022-07-20',
        dateOfBirth: '1995-02-28',
        phoneNumber: '555-123-4567',
        emailAddress: 'charlie.b@example.com',
        department: 'HR',
        position: 'Junior',
      },
      {
        id: 'emp4',
        firstName: 'Diana',
        lastName: 'Prince',
        dateOfEmployment: '2019-09-01',
        dateOfBirth: '1988-08-12',
        phoneNumber: '777-888-9999',
        emailAddress: 'diana.p@example.com',
        department: 'Marketing',
        position: 'Senior',
      },
      {
        id: 'emp5',
        firstName: 'Eve',
        lastName: 'Adams',
        dateOfEmployment: '2023-02-14',
        dateOfBirth: '1998-04-03',
        phoneNumber: '111-222-3333',
        emailAddress: 'eve.a@example.com',
        department: 'Sales',
        position: 'Medior',
      },
    ];

    // Make sure to persist dummy data right away
    this._saveToStorage();
  }

  // Notify all subscribers about changes
  _notify() {
    this.subscribers.forEach(cb => cb(this.employees));
  }

  /**
   * Subscribe to employee list changes.
   * Immediately calls the callback with current data.
   * Returns a function to unsubscribe.
   * @param {(employees: Employee[]) => void} callback
   * @returns {() => void}
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.employees);

    return () => {
      this.subscribers = this.subscribers.filter(fn => fn !== callback);
    };
  }

  /**
   * Add a new employee to the store.
   * Checks for email or phone duplicates.
   * Returns the new employee or null if conflicts.
   * @param {Omit<Employee, 'id'>} data
   * @returns {Employee|null}
   */
  addEmployee(data) {
    // Generate a simple unique id - could be improved!
    const id = 'emp' + Date.now() + Math.floor(Math.random() * 1000);
    const newEmployee = { ...data, id };

    if (this.isEmailTaken(newEmployee.emailAddress) || this.isPhoneNumberTaken(newEmployee.phoneNumber)) {
      // We don't add duplicates
      return null;
    }

    this.employees.push(newEmployee);
    this._saveToStorage();
    this._notify();

    return newEmployee;
  }

  /**
   * Update an existing employee.
   * Returns true if successful, false if not found or conflict.
   * @param {Employee} updatedEmployee
   * @returns {boolean}
   */
  updateEmployee(updatedEmployee) {
    const index = this.employees.findIndex(emp => emp.id === updatedEmployee.id);
    if (index === -1) {
      return false; // Employee not found
    }

    // Avoid email or phone conflicts with other employees
    if (
      this.isEmailTaken(updatedEmployee.emailAddress, updatedEmployee.id) ||
      this.isPhoneNumberTaken(updatedEmployee.phoneNumber, updatedEmployee.id)
    ) {
      return false;
    }

    // Update the record
    this.employees[index] = { ...updatedEmployee };
    this._saveToStorage();
    this._notify();

    return true;
  }

  /**
   * Remove employee by id.
   * Returns true if something was deleted.
   * @param {string} id
   * @returns {boolean}
   */
  deleteEmployee(id) {
    const originalLength = this.employees.length;
    this.employees = this.employees.filter(emp => emp.id !== id);

    if (this.employees.length < originalLength) {
      this._saveToStorage();
      this._notify();
      return true;
    }

    return false; // No employee with that id
  }

  /**
   * Check if email is taken by another employee (excluding optional id).
   * @param {string} email
   * @param {string} [excludeId='']
   * @returns {boolean}
   */
  isEmailTaken(email, excludeId = '') {
    return this.employees.some(emp => emp.emailAddress === email && emp.id !== excludeId);
  }

  /**
   * Check if phone number is taken by another employee (excluding optional id).
   * @param {string} phone
   * @param {string} [excludeId='']
   * @returns {boolean}
   */
  isPhoneNumberTaken(phone, excludeId = '') {
    return this.employees.some(emp => emp.phoneNumber === phone && emp.id !== excludeId);
  }

  /**
   * Return a copy of all employees.
   * @returns {Employee[]}
   */
  getAllEmployees() {
    return [...this.employees];
  }

  /**
   * Find employee by ID.
   * @param {string} id
   * @returns {Employee|undefined}
   */
  getEmployeeById(id) {
    return this.employees.find(emp => emp.id === id);
  }
}

export const employeeStore = new EmployeeStore();
