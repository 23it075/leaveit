
import axios from 'axios';
import { UserRole } from '../contexts/AuthContext';

// Create an axios instance with default configs
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mock data for development (remove in production)
const mockUsers = [
  { id: '1', name: 'Student User', email: 'student@example.com', role: 'student' },
  { id: '2', name: 'Parent User', email: 'parent@example.com', role: 'parent' },
  { id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin' }
];

// Mock leave requests data - initialize from localStorage if available
let mockLeaveRequests = (() => {
  const storedData = localStorage.getItem('leaveRequests');
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (e) {
      console.error('Error parsing stored leave requests', e);
      return [];
    }
  }
  return [];
})();

// Auth services
export const loginUser = async (email: string, password: string) => {
  try {
    // Try the actual API call first
    return await API.post('/auth/login', { email, password });
  } catch (error) {
    console.log('Using mock login due to API error');
    // Mock implementation for development
    const user = mockUsers.find(u => u.email === email);
    if (user && password.length > 5) {
      return {
        data: {
          token: 'mock-token-' + user.id,
          user
        }
      };
    }
    throw new Error('Invalid credentials');
  }
};

export const registerUser = async (name: string, email: string, password: string, role: UserRole) => {
  try {
    // Try the actual API call first
    return await API.post('/auth/register', { name, email, password, role });
  } catch (error) {
    console.log('Using mock registration due to API error');
    // Mock implementation for development
    const newId = (mockUsers.length + 1).toString();
    const newUser = { id: newId, name, email, role };
    mockUsers.push(newUser);
    
    return {
      data: {
        token: 'mock-token-' + newId,
        user: newUser
      }
    };
  }
};

export const getCurrentUser = async () => {
  try {
    // Try the actual API call first
    return await API.get('/auth/me');
  } catch (error) {
    console.log('Using mock user data due to API error');
    // Mock implementation for development
    const token = localStorage.getItem('token');
    if (token && token.startsWith('mock-token-')) {
      const userId = token.replace('mock-token-', '');
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        return { data: user };
      }
    }
    throw new Error('Not authenticated');
  }
};

// Leave services
export const getLeaveRequests = async () => {
  try {
    return await API.get('/leave');
  } catch (error) {
    console.log('Using mock leave data due to API error');
    // Get current user from token
    const token = localStorage.getItem('token');
    let userId = null;
    
    if (token && token.startsWith('mock-token-')) {
      userId = token.replace('mock-token-', '');
    }
    
    // Filter leave requests based on user role and id
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      // During development, share all leave requests with all users to test functionality
      return { data: mockLeaveRequests };
    }
    
    throw new Error('Not authenticated');
  }
};

export const getLeaveRequestById = async (id: string) => {
  try {
    return await API.get(`/leave/${id}`);
  } catch (error) {
    console.log('Using mock leave data due to API error');
    const leaveRequest = mockLeaveRequests.find(leave => leave.id === id);
    if (leaveRequest) {
      return { data: leaveRequest };
    }
    throw new Error('Leave request not found');
  }
};

export const createLeaveRequest = async (leaveData: any) => {
  try {
    return await API.post('/leave', leaveData);
  } catch (error) {
    console.log('Using mock leave creation due to API error');
    
    // Get current user
    const token = localStorage.getItem('token');
    if (!token || !token.startsWith('mock-token-')) {
      throw new Error('Not authenticated');
    }
    
    const userId = token.replace('mock-token-', '');
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create new leave request
    const newLeave = {
      id: (mockLeaveRequests.length + 1).toString(),
      studentId: userId,
      studentName: user.name,
      leaveType: leaveData.leaveType,
      fromDate: leaveData.fromDate,
      toDate: leaveData.toDate,
      fromTime: leaveData.fromTime || '08:00',
      toTime: leaveData.toTime || '17:00',
      reason: leaveData.reason,
      status: 'pending',
      parentApproval: false,
      adminApproval: false,
      finalApproval: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockLeaveRequests.push(newLeave);
    
    // Save to localStorage for persistence
    localStorage.setItem('leaveRequests', JSON.stringify(mockLeaveRequests));
    
    return { data: newLeave };
  }
};

export const updateLeaveRequestStatus = async (id: string, status: string) => {
  try {
    return await API.put(`/leave/${id}`, { status });
  } catch (error) {
    console.log('Using mock leave update due to API error');
    
    // Get current user role
    const token = localStorage.getItem('token');
    if (!token || !token.startsWith('mock-token-')) {
      throw new Error('Not authenticated');
    }
    
    const userId = token.replace('mock-token-', '');
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Find the leave request
    const leaveIndex = mockLeaveRequests.findIndex(leave => leave.id === id);
    if (leaveIndex === -1) {
      throw new Error('Leave request not found');
    }
    
    const leave = { ...mockLeaveRequests[leaveIndex] };
    
    // Update based on user role
    if (user.role === 'parent') {
      leave.parentApproval = status === 'approved';
    } else if (user.role === 'admin') {
      leave.adminApproval = status === 'approved';
    }
    
    // Update status based on approvals
    if (status === 'rejected') {
      leave.status = 'rejected';
      leave.finalApproval = false;
    } else if (leave.parentApproval && leave.adminApproval) {
      leave.status = 'approved';
      leave.finalApproval = true;
    } else {
      leave.status = 'pending';
    }
    
    leave.updatedAt = new Date().toISOString();
    mockLeaveRequests[leaveIndex] = leave;
    
    // Save to localStorage for persistence
    localStorage.setItem('leaveRequests', JSON.stringify(mockLeaveRequests));
    
    return { data: leave };
  }
};

export default API;
