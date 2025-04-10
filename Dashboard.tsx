
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import StudentDashboard from './StudentDashboard';
import ParentDashboard from './ParentDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardHeader />
      
      <main className="flex-1 py-6">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">
            Welcome back, {user.name}
          </h2>
          
          {user.role === 'student' && <StudentDashboard />}
          {user.role === 'parent' && <ParentDashboard />}
          {user.role === 'admin' && <AdminDashboard />}
        </div>
      </main>
      
      <footer className="py-4 border-t bg-white">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Hostel Leave Management System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
