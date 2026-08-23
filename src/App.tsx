import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleRoute from '@/components/RoleRoute';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Attendance from '@/pages/Attendance';
import Dashboard from '@/pages/Dashboard';
import Employees from '@/pages/Employees';
import Departments from '@/pages/Departments';
import Staff_Dashboard from '@/pages/Staff/Staff_Dashboard';
import Staff_Attendance from '@/pages/Staff/Staff_Attendance';
import Staff_Profile from '@/pages/Staff/Staff_Profile';
import Staff_LeaveRequests from '@/pages/Staff/Staff_LeaveRequests';
import HRDashboard from '@/pages/HR/HRDashboard';
import HRLeaveRequests from './pages/HR/HRLeaveRequests';


function Home() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Dashboard />;
  if (user?.role === 'hr') return <HRDashboard />;
  return <Staff_Dashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />


            {/* For Admin User */}
            <Route 
              path="employees" 
              element={
                <RoleRoute allow={['admin']}>
                  <Employees />
                </RoleRoute>
              } 
            />
            <Route 
              path="departments" 
              element={
                <RoleRoute allow={['admin']}>
                  <Departments />
                </RoleRoute>
              } 
            />
            <Route 
              path="attendance" 
              element={
                <RoleRoute allow={['admin', 'hr']}>
                  <Attendance />
                </RoleRoute>
              } 
            />


            {/* For Staff users */}
            <Route 
              path="staff_attendance" 
              element={
                <RoleRoute allow={['employee']}>
                  <Staff_Attendance />
                </RoleRoute>
              } 
            />
            <Route 
              path="staff_profile" 
              element={
                <RoleRoute allow={['employee']}>
                  <Staff_Profile />
                </RoleRoute>
              } 
            />
            <Route 
              path="staff_leaverequests" 
              element={
                <RoleRoute allow={['employee']}>
                  <Staff_LeaveRequests />
                </RoleRoute>
              } 
            />


            {/* For HR users */}
            <Route 
              path="HRLeaveRequests" 
              element={
                <RoleRoute allow={['hr']}>
                  <HRLeaveRequests />
                </RoleRoute>
              } 
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
