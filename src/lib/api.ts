const BASE_URL = 'http://127.0.0.1:8000/api';

// Helper to get token from localStorage
function getToken(): string | null {
    return localStorage.getItem('auth_token');
}

// Helper for API requests
async function request(method: string, endpoint: string, data?: object) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.message || 'Something went wrong');
    }

    return json;
}

// ---- Auth ----
export const api = {
    // Login
    async login(email: string, password: string) {
        const data = await request('POST', '/login', { email, password });
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        return data.user;
    },

    // Logout
    async logout() {
        await request('POST', '/logout');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    },

    // Get current user
    currentUser() {
        const user = localStorage.getItem('auth_user');
        return user ? JSON.parse(user) : null;
    },

    // Get the employee record linked to the current logged-in user
    async getMyEmployee() {
        return await request('GET', '/me/employee');
    },

    // ---- Employees ----
    async listEmployees() {
        return await request('GET', '/employees');
    },

    async createEmployee(payload: object) {
        return await request('POST', '/employees', payload);
    },

    async updateEmployee(id: number, payload: object) {
        return await request('PUT', `/employees/${id}`, payload);
    },

    async deleteEmployee(id: number) {
        return await request('DELETE', `/employees/${id}`);
    },

    // ---- Attendance ----
    async listAttendance(filters?: { date?: string; employee_id?: number }) {
        const params = new URLSearchParams();
        if (filters?.date) params.append('date', filters.date);
        if (filters?.employee_id) params.append('employee_id', String(filters.employee_id));
        return await request('GET', `/attendance?${params.toString()}`);
    },

    // ---- Leave Types ----
    async listLeaveTypes() {
        return await request('GET', '/leave-types');
    },

    // ---- Leave Balances ----
    async listLeaveBalances() {
        return await request('GET', '/leave-balances');
    },

    // ---- Leave Requests ----
    async listLeaveRequests() {
        return await request('GET', '/leave-requests');
    },

    async createLeaveRequest(payload: object) {
        return await request('POST', '/leave-requests', payload);
    },

    async endorseLeaveRequest(id: number) {
        return await request('POST', `/leave-requests/${id}/endorse`);
    },

    async markReceivedLeaveRequest(id: number) {
        return await request('POST', `/leave-requests/${id}/received`);
    },

    async approveLeaveRequest(id: number, hr_remarks?: string) {
        return await request('POST', `/leave-requests/${id}/approve`, { hr_remarks });
    },

        async rejectLeaveRequest(id: number, hr_remarks?: string) {
        return await request('POST', `/leave-requests/${id}/reject`, { hr_remarks });
    },

    // ---- Notifications ----
    async listNotifications() {
        return await request('GET', '/notifications');
    },

    async markNotificationRead(id: number) {
        return await request('POST', `/notifications/${id}/read`);
    },

    async markAllNotificationsRead() {
        return await request('POST', '/notifications/read-all');
    },
};