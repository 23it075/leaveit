
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { useAuth } from './AuthContext';
import { getLeaveRequests, createLeaveRequest as apiCreateLeave, updateLeaveRequestStatus } from '../services/api';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'home_leave' | 'one_day_leave' | 'medical_leave' | 'emergency_leave' | 'other';

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  home_leave: 'Home Leave',
  one_day_leave: 'One Day Leave',
  medical_leave: 'Medical Leave',
  emergency_leave: 'Emergency Leave',
  other: 'Other'
};

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  fromTime: string; // New field for time selection
  toTime: string;   // New field for time selection
  reason: string;
  status: LeaveStatus;
  parentApproval: boolean;
  adminApproval: boolean;
  finalApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  createLeaveRequest: (data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'studentId' | 'studentName' | 'parentApproval' | 'adminApproval' | 'finalApproval'>) => Promise<void>;
  updateLeaveRequest: (id: string, status: LeaveStatus) => Promise<void>;
  getStudentLeaves: (studentId: string) => LeaveRequest[];
  getPendingLeaves: () => LeaveRequest[];
  getAllLeaves: () => LeaveRequest[];
  loading: boolean;
  error: string | null;
  refetchLeaves: () => Promise<void>;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};

interface LeaveProviderProps {
  children: ReactNode;
}

export const LeaveProvider: React.FC<LeaveProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch leaves from the API
  const fetchLeaves = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getLeaveRequests();
      console.log('Fetched leave requests:', response.data);
      setLeaveRequests(response.data);
      
      // Always save to localStorage for offline access
      localStorage.setItem('leaveRequests', JSON.stringify(response.data));
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setError('Failed to fetch leave requests');
      
      // Fall back to localStorage data if API fails
      const storedLeaves = localStorage.getItem('leaveRequests');
      if (storedLeaves) {
        try {
          const parsedLeaves = JSON.parse(storedLeaves);
          setLeaveRequests(parsedLeaves);
        } catch (parseErr) {
          console.error('Error parsing stored leave requests:', parseErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch leaves when component mounts and when user changes
  useEffect(() => {
    if (user) {
      fetchLeaves();
    }
  }, [user]);

  // Create a new leave request
  const createLeaveRequest = async (data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'studentId' | 'studentName' | 'parentApproval' | 'adminApproval' | 'finalApproval'>) => {
    if (!user) {
      toast.error('You must be logged in to create a leave request');
      return;
    }

    try {
      setLoading(true);
      const response = await apiCreateLeave(data);
      console.log('Created leave request:', response.data);
      
      // Add the new leave to the state
      setLeaveRequests(prev => [response.data, ...prev]);
      toast.success('Leave request submitted successfully');
      
      // Update localStorage
      const updatedLeaves = [response.data, ...leaveRequests];
      localStorage.setItem('leaveRequests', JSON.stringify(updatedLeaves));
    } catch (err) {
      console.error('Error creating leave request:', err);
      toast.error('Failed to submit leave request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a leave request status
  const updateLeaveRequest = async (id: string, status: LeaveStatus) => {
    try {
      setLoading(true);
      const response = await updateLeaveRequestStatus(id, status);
      console.log('Updated leave request:', response.data);
      
      // Update the leave in the state
      setLeaveRequests(prev => 
        prev.map(leave => leave.id === id ? response.data : leave)
      );
      
      // Update localStorage after state update
      localStorage.setItem('leaveRequests', JSON.stringify(
        leaveRequests.map(leave => leave.id === id ? response.data : leave)
      ));
      
      toast.success(`Leave request ${status}`);
    } catch (err) {
      console.error('Error updating leave request:', err);
      toast.error('Failed to update leave request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to filter leaves
  const getStudentLeaves = (studentId: string) => {
    return leaveRequests.filter(leave => leave.studentId === studentId);
  };

  const getPendingLeaves = () => {
    return leaveRequests.filter(leave => leave.status === 'pending');
  };

  const getAllLeaves = () => {
    return leaveRequests;
  };

  return (
    <LeaveContext.Provider value={{
      leaveRequests,
      createLeaveRequest,
      updateLeaveRequest,
      getStudentLeaves,
      getPendingLeaves,
      getAllLeaves,
      loading,
      error,
      refetchLeaves: fetchLeaves
    }}>
      {children}
    </LeaveContext.Provider>
  );
};
