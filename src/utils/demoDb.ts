import type {
  Attendance,
  AttendanceStatus,
  DashboardSummary,
  Department,
  Employee,
  EmploymentType,
  HRDashboardSummary,
  LeaveRequest,
  LeaveType,
  LeaveBalanceSummary,
  Staff_DashboardSummary,
  Position,
  User,
} from '@/types';

const STORAGE_KEY = 'hris_demo_db_v1';

const SEED_VERSION = 1;

interface Schema {
  schemaVersion: number;
  users: User[];
  employees: Employee[];
  departments: Department[];
  positions: Position[];
  leaveTypes: LeaveType[];
  leaveRequests: LeaveRequest[];
  attendance: Attendance[];
  nextId: Record<string, number>;
}

function nextId(db: Schema, table: string): number {
  const id = (db.nextId[table] ?? 1);
  db.nextId[table] = id + 1;
  return id;
}

function seed(): Schema {
  const db: Schema = {
    schemaVersion: SEED_VERSION,
    users: [],
    employees: [],
    departments: [],
    positions: [],
    leaveTypes: [],
    leaveRequests: [],
    attendance: [],
    nextId: {},
  };

  const eng: Department = { id: nextId(db, 'departments'), name: 'Engineering', code: 'ENG', description: 'Builds and maintains our products.', manager_id: null };
  const hr: Department = { id: nextId(db, 'departments'), name: 'Human Resources', code: 'HR', description: 'People operations and culture.', manager_id: null };
  db.departments.push(eng, hr, );

  const swe: Position = { id: nextId(db, 'positions'), title: 'Software Engineer', department_id: eng.id, min_salary: 40000, max_salary: 90000 };
  const hrOfficer: Position = { id: nextId(db, 'positions'), title: 'HR Officer', department_id: hr.id, min_salary: 30000, max_salary: 60000 };
  db.positions.push(swe, hrOfficer, );

  db.leaveTypes.push(
    { id: nextId(db, 'leaveTypes'), name: 'Annual Leave', default_days_per_year: 15, is_paid: true },
    { id: nextId(db, 'leaveTypes'), name: 'Sick Leave', default_days_per_year: 10, is_paid: true },
    { id: nextId(db, 'leaveTypes'), name: 'Unpaid Leave', default_days_per_year: 0, is_paid: false }
  );

  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  const admin: Employee = {
    id: nextId(db, 'employees'), employee_no: 'EMP-0001', first_name: 'Alex', last_name: 'Rivera', 
    full_name: 'Alex Rivera', email: 'alex.rivera@hris.test', phone: null,
    department_id: hr.id, position_id: hrOfficer.id, manager_id: null,
    hire_date: daysAgo(365 * 3), employment_type: 'full_time', status: 'active',
  };
  const jamie: Employee = {
    id: nextId(db, 'employees'), employee_no: 'EMP-0002', first_name: 'Jamie', last_name: 'Chen',
    full_name: 'Jamie Chen', email: 'jamie.chen@hris.test', phone: null,
    department_id: eng.id, position_id: swe.id, manager_id: null,
    hire_date: daysAgo(365 * 2), employment_type: 'full_time', status: 'active',
  };
  const priya: Employee = {
    id: nextId(db, 'employees'), employee_no: 'EMP-0004', first_name: 'Priya', last_name: 'Santos',
    full_name: 'Priya Santos', email: 'priya.santos@hris.test', phone: null,
    department_id: hr.id, position_id: hrOfficer.id, manager_id: null,
    hire_date: daysAgo(400), employment_type: 'full_time', status: 'active',
  };
  db.employees.push(admin, jamie, priya);

  db.users.push(
    { id: nextId(db, 'users'), name: 'Alex Rivera', email: 'admin@hris.test', role: 'admin', employee_id: admin.id },
    { id: nextId(db, 'users'), name: 'Jamie Chen', email: 'jamie.chen@hris.test', role: 'employee', employee_id: jamie.id },
    { id: nextId(db, 'users'), name: 'Priya Santos', email: 'hr@hris.test', role: 'hr', employee_id: priya.id }
  );

  db.leaveRequests.push({
    id: nextId(db, 'leaveRequests'), employee_id: jamie.id, leave_type_id: db.leaveTypes[0].id,
    start_date: daysAgo(-5), end_date: daysAgo(-3), total_days: 3, reason: 'Family trip',
    status: 'pending', approved_by: null, rejection_reason: null,
  });

  db.attendance.push(
    { id: nextId(db, 'attendance'), employee_id: jamie.id, date: daysAgo(0), clock_in: '08:52:00', clock_out: null, status: 'present', notes: null },
    { id: nextId(db, 'attendance'), employee_id: priya.id, date: daysAgo(0), clock_in: '09:00:00', clock_out: null, status: 'present', notes: null }
  );

  return db;
}

function load(): Schema {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const fresh = seed();
    save(fresh);
    return fresh;
  }
  try {
    const parsed = JSON.parse(raw) as Schema;
    if (parsed.schemaVersion !== SEED_VERSION) {
      const fresh = seed();
      save(fresh);
      return fresh;
    }
    return parsed;
  } catch {
    const fresh = seed();
    save(fresh);
    return fresh;
  }
}

function save(db: Schema): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function withRelations(db: Schema, e: Employee): Employee {
  return {
    ...e,
    department: db.departments.find((d) => d.id === e.department_id) ?? null,
    position: db.positions.find((p) => p.id === e.position_id) ?? null,
    manager: e.manager_id ? db.employees.find((m) => m.id === e.manager_id) ?? null : null,
  };
}

// ---- Public API (mirrors the shape the UI previously called over HTTP) ----

export const db = {
  resetDemoData(): void {
    save(seed());
  },

  // Auth — purely client-side. Any seeded user email works with password "password".
  login(email: string, password: string): User {
    const data = load();
    const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || password !== 'password') {
      throw new Error('Invalid credentials');
    }
    window.localStorage.setItem('hris_session_user_id', String(user.id));
    return user;
  },
  logout(): void {
    window.localStorage.removeItem('hris_session_user_id');
  },
  currentUser(): User | null {
    const id = window.localStorage.getItem('hris_session_user_id');
    if (!id) return null;
    const data = load();
    return data.users.find((u) => u.id === Number(id)) ?? null;
  },

  // Departments
  listDepartments(): Department[] {
    const data = load();
    return data.departments.map((d) => ({
      ...d,
      employees_count: data.employees.filter((e) => e.department_id === d.id && e.status === 'active').length,
      manager: d.manager_id ? data.employees.find((e) => e.id === d.manager_id) ?? null : null,
    }));
  },
  createDepartment(payload: { name: string; code: string; description?: string }): Department {
    const data = load();
    const department: Department = {
      id: nextId(data, 'departments'),
      name: payload.name,
      code: payload.code,
      description: payload.description || null,
      manager_id: null,
    };
    data.departments.push(department);
    save(data);
    return department;
  },

  // Employees
  listEmployees(filters: { search?: string; department_id?: number; status?: string } = {}): Employee[] {
    const data = load();
    let list = data.employees.map((e) => withRelations(data, e));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.full_name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employee_no.toLowerCase().includes(q)
      );
    }
    if (filters.department_id) list = list.filter((e) => e.department_id === filters.department_id);
    if (filters.status) list = list.filter((e) => e.status === filters.status);
    return list.sort((a, b) => a.first_name.localeCompare(b.first_name));
  },
  createEmployee(payload: {
    employee_no: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    department_id: number | null;
    hire_date: string;
    employment_type: EmploymentType;
  }): Employee {
    const data = load();
    const employee: Employee = {
      id: nextId(data, 'employees'),
      employee_no: payload.employee_no,
      first_name: payload.first_name,
      last_name: payload.last_name,
      full_name: `${payload.first_name} ${payload.last_name}`,
      email: payload.email,
      phone: payload.phone || null,
      department_id: payload.department_id,
      position_id: null,
      manager_id: null,
      hire_date: payload.hire_date,
      employment_type: payload.employment_type,
      status: 'active',
    };
    data.employees.push(employee);
    save(data);
    return withRelations(data, employee);
  },

  // Leave types
  listLeaveTypes(): LeaveType[] {
    return load().leaveTypes;
  },

  // Leave requests
  listLeaveRequests(filters: { employee_id?: number; status?: string } = {}): LeaveRequest[] {
    const data = load();
    let list = data.leaveRequests.map((r) => ({
      ...r,
      employee: data.employees.find((e) => e.id === r.employee_id),
      leave_type: data.leaveTypes.find((t) => t.id === r.leave_type_id),
    }));
    if (filters.employee_id) list = list.filter((r) => r.employee_id === filters.employee_id);
    if (filters.status) list = list.filter((r) => r.status === filters.status);
    return list.sort((a, b) => b.id - a.id);
  },
  createLeaveRequest(payload: {
    employee_id: number;
    leave_type_id: number;
    start_date: string;
    end_date: string;
    reason?: string;
  }): LeaveRequest {
    const data = load();
    const start = new Date(payload.start_date);
    const end = new Date(payload.end_date);
    let days = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) days += 1;
    }
    const request: LeaveRequest = {
      id: nextId(data, 'leaveRequests'),
      employee_id: payload.employee_id,
      leave_type_id: payload.leave_type_id,
      start_date: payload.start_date,
      end_date: payload.end_date,
      total_days: days || 1,
      reason: payload.reason || null,
      status: 'pending',
      approved_by: null,
      rejection_reason: null,
    };
    data.leaveRequests.push(request);
    save(data);
    return request;
  },
  approveLeaveRequest(id: number, approvedBy: number): LeaveRequest {
    const data = load();
    const request = data.leaveRequests.find((r) => r.id === id);
    if (!request) throw new Error('Leave request not found');
    request.status = 'approved';
    request.approved_by = approvedBy;
    save(data);
    return request;
  },
  rejectLeaveRequest(id: number, reason?: string): LeaveRequest {
    const data = load();
    const request = data.leaveRequests.find((r) => r.id === id);
    if (!request) throw new Error('Leave request not found');
    request.status = 'rejected';
    request.rejection_reason = reason || null;
    save(data);
    return request;
  },

  cancelLeaveRequest(id: number, employeeId: number): LeaveRequest {
    const data = load();
    const request = data.leaveRequests.find((r) => r.id === id);
    if (!request) throw new Error('Leave request not found');
    if (request.employee_id !== employeeId) throw new Error('You can only cancel your own requests');
    if (request.status !== 'pending') throw new Error('Only pending requests can be cancelled');
    request.status = 'cancelled';
    save(data);
    return request;
  },

  // Attendance
  listAttendance(filters: { date?: string; employee_id?: number } = {}): Attendance[] {
    const data = load();
    let list = data.attendance.map((a) => ({
      ...a,
      employee: data.employees.find((e) => e.id === a.employee_id),
    }));
    if (filters.date) list = list.filter((a) => a.date === filters.date);
    if (filters.employee_id) list = list.filter((a) => a.employee_id === filters.employee_id);
    return list.sort((a, b) => b.id - a.id);
  },
  clockIn(employeeId: number): Attendance {
    const data = load();
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toTimeString().slice(0, 8);
    let record = data.attendance.find((a) => a.employee_id === employeeId && a.date === today);
    const status: AttendanceStatus = new Date().getHours() >= 9 ? 'late' : 'present';
    if (record) {
      record.clock_in = now;
      record.status = status;
    } else {
      record = {
        id: nextId(data, 'attendance'),
        employee_id: employeeId,
        date: today,
        clock_in: now,
        clock_out: null,
        status,
        notes: null,
      };
      data.attendance.push(record);
    }
    save(data);
    return record;
  },
  clockOut(employeeId: number): Attendance {
    const data = load();
    const today = new Date().toISOString().slice(0, 10);
    const record = data.attendance.find((a) => a.employee_id === employeeId && a.date === today);
    if (!record) throw new Error('No clock-in record found for today');
    record.clock_out = new Date().toTimeString().slice(0, 8);
    save(data);
    return record;
  },

  // Dashboard
  dashboardSummary(): DashboardSummary {
    const data = load();
    const today = new Date().toISOString().slice(0, 10);
    const activeEmployees = data.employees.filter((e) => e.status === 'active');
    const todayAttendance = data.attendance.filter((a) => a.date === today);

    return {
      total_employees: activeEmployees.length,
      total_departments: data.departments.length,
      pending_leave_requests: data.leaveRequests.filter((r) => r.status === 'pending').length,
      present_today: todayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length,
      absent_today: todayAttendance.filter((a) => a.status === 'absent').length,
      employees_by_department: data.departments.map((d) => ({
        id: d.id,
        name: d.name,
        employees_count: activeEmployees.filter((e) => e.department_id === d.id).length,
      })),
      recent_leave_requests: this.listLeaveRequests().slice(0, 5),
    };
  },

  staffDashboardSummary(employeeId: number): Staff_DashboardSummary {
    const data = load();
    const today = new Date().toISOString().slice(0, 10);
    const employee = this.getEmployee(employeeId);
    if (!employee) throw new Error('Employee not found');

    const todayAttendance =
      data.attendance.find((a) => a.employee_id === employeeId && a.date === today) ?? null;
    const myRequests = this.listLeaveRequests({ employee_id: employeeId });

    return {
      employee,
      today_attendance: todayAttendance,
      pending_requests: myRequests.filter((r) => r.status === 'pending').length,
      recent_requests: myRequests.slice(0, 5),
      leave_balances: this.leaveBalanceSummary(employeeId),
    };
  },

  getEmployee(employeeId: number): Employee | null {
    const data = load();
    const employee = data.employees.find((e) => e.id === employeeId);
    return employee ? withRelations(data, employee) : null;
  },

  leaveBalanceSummary(employeeId: number): LeaveBalanceSummary[] {
    const data = load();
    const employee = data.employees.find((e) => e.id === employeeId);
    if (!employee) return [];

    return data.leaveTypes.map((leaveType) => {
      const used = data.leaveRequests
        .filter(
          (r) =>
            r.employee_id === employeeId &&
            r.leave_type_id === leaveType.id &&
            r.status === 'approved'
        )
        .reduce((sum, r) => sum + r.total_days, 0);
      const allocated = leaveType.default_days_per_year;
      return {
        leave_type: leaveType,
        allocated,
        used,
        remaining: Math.max(0, allocated - used),
      };
    });
  },

  hrDashboardSummary(): HRDashboardSummary {
    const data = load();
    const now = new Date();
    const isThisMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    };

    const allRequests = this.listLeaveRequests();

    return {
      pending_requests: allRequests.filter((r) => r.status === 'pending').length,
      approved_this_month: allRequests.filter(
        (r) => r.status === 'approved' && isThisMonth(r.start_date)
      ).length,
      rejected_this_month: allRequests.filter(
        (r) => r.status === 'rejected' && isThisMonth(r.start_date)
      ).length,
      by_leave_type: data.leaveTypes.map((type) => ({
        leave_type: type,
        pending: allRequests.filter((r) => r.leave_type_id === type.id && r.status === 'pending').length,
        approved_this_month: allRequests.filter(
          (r) => r.leave_type_id === type.id && r.status === 'approved' && isThisMonth(r.start_date)
        ).length,
      })),
      pending_queue: allRequests.filter((r) => r.status === 'pending'),
    };
  },
};
