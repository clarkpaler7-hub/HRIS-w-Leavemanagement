export type Role = 'admin' | 'hr' | 'employee';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  employee_id: number | null;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  manager_id: number | null;
  manager?: Employee | null;
  employees_count?: number;
}

export interface Position {
  id: number;
  title: string;
  department_id: number;
  min_salary: number | null;
  max_salary: number | null;
}

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';
export type EmployeeStatus = 'active' | 'on_leave' | 'suspended' | 'terminated';

export interface Employee {
  id: number;
  employee_no: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  department_id: number | null;
  position_id: number | null;
  manager_id: number | null;
  hire_date: string;
  employment_type: EmploymentType;
  status: EmployeeStatus;
  department?: Department | null;
  position?: Position | null;
  manager?: Employee | null;
}

export interface LeaveType {
  id: number;
  name: string;
  default_days_per_year: number;
  is_paid: boolean;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: LeaveStatus;
  approved_by: number | null;
  rejection_reason: string | null;
  employee?: Employee;
  leave_type?: LeaveType;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: AttendanceStatus;
  notes: string | null;
  employee?: Employee;
}

export interface DashboardSummary {
  total_employees: number;
  total_departments: number;
  pending_leave_requests: number;
  present_today: number;
  absent_today: number;
  employees_by_department: { id: number; name: string; employees_count: number }[];
  recent_leave_requests: LeaveRequest[];
}

export interface LeaveBalanceSummary {
  leave_type: LeaveType;
  allocated: number;
  used: number;
  remaining: number;
}

export interface Staff_DashboardSummary {
  employee: Employee;
  today_attendance: Attendance | null;
  pending_requests: number;
  recent_requests: LeaveRequest[];
  leave_balances: LeaveBalanceSummary[];
}

export interface HRDashboardSummary {
  pending_requests: number;
  approved_this_month: number;
  rejected_this_month: number;
  by_leave_type: Array<{
    leave_type: LeaveType;
    pending: number;
    approved_this_month: number;
  }>;
  pending_queue: LeaveRequest[];
}
