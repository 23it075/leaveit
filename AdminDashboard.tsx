import React from 'react';
import { useLeave, LeaveRequest, LEAVE_TYPE_LABELS } from '@/contexts/LeaveContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Clock, BarChart3, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminDashboard: React.FC = () => {
  const { leaveRequests, updateLeaveRequest } = useLeave();
  
  const pendingLeaves = leaveRequests.filter(leave => leave.status === 'pending');
  const approvedLeaves = leaveRequests.filter(leave => leave.status === 'approved');
  const rejectedLeaves = leaveRequests.filter(leave => leave.status === 'rejected');
  const allLeaves = [...leaveRequests].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const handleApprove = (id: string) => {
    updateLeaveRequest(id, 'approved');
  };
  
  const handleReject = (id: string) => {
    updateLeaveRequest(id, 'rejected');
  };

  const LeaveTypeBadge: React.FC<{ type: LeaveRequest['leaveType'] }> = ({ type }) => {
    const typeConfig = {
      home_leave: { class: 'bg-blue-100 text-blue-800' },
      one_day_leave: { class: 'bg-purple-100 text-purple-800' },
      medical_leave: { class: 'bg-pink-100 text-pink-800' },
      emergency_leave: { class: 'bg-orange-100 text-orange-800' },
      other: { class: 'bg-gray-100 text-gray-800' }
    };
    
    const config = typeConfig[type] || typeConfig.other;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        <Calendar className="h-3 w-3 mr-1" />
        {LEAVE_TYPE_LABELS[type] || 'Other'}
      </span>
    );
  };

  const LeaveStatusBadge: React.FC<{ status: LeaveRequest['status'] }> = ({ status }) => {
    const statusConfig = {
      pending: { icon: <Clock className="h-4 w-4 mr-1" />, class: 'bg-yellow-100 text-yellow-800' },
      approved: { icon: <CheckCircle className="h-4 w-4 mr-1" />, class: 'bg-green-100 text-green-800' },
      rejected: { icon: <XCircle className="h-4 w-4 mr-1" />, class: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const ApprovalStatus: React.FC<{ approved: boolean | undefined }> = ({ approved }) => {
    if (approved === undefined) return <span className="text-gray-400">N/A</span>;
    
    return approved ? (
      <span className="text-green-600 flex items-center">
        <CheckCircle className="h-4 w-4 mr-1" /> Approved
      </span>
    ) : (
      <span className="text-yellow-600 flex items-center">
        <Clock className="h-4 w-4 mr-1" /> Pending
      </span>
    );
  };

  const LeaveCard: React.FC<{ leave: LeaveRequest; isPending?: boolean }> = ({ leave, isPending }) => {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{leave.studentName}</CardTitle>
              <CardDescription className="flex gap-2 mt-1">
                <LeaveTypeBadge type={leave.leaveType} />
                <span>Created on {format(new Date(leave.createdAt), 'PPP')}</span>
              </CardDescription>
            </div>
            <LeaveStatusBadge status={leave.status} />
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <p className="text-sm font-medium">From Date</p>
              <p className="text-sm">{format(new Date(leave.fromDate), 'PPP')}</p>
            </div>
            <div>
              <p className="text-sm font-medium">To Date</p>
              <p className="text-sm">{format(new Date(leave.toDate), 'PPP')}</p>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-sm font-medium">Reason</p>
            <p className="text-sm text-gray-700">{leave.reason}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Parent Approval</p>
              <ApprovalStatus approved={leave.parentApproval} />
            </div>
            <div>
              <p className="text-sm font-medium">Admin Approval</p>
              <ApprovalStatus approved={leave.adminApproval} />
            </div>
          </div>
          {leave.finalApproval && (
            <div className="mt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> 
                Fully Approved
              </Badge>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Last updated: {format(new Date(leave.updatedAt), 'PPP')}
          </div>
          
          {isPending && (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Leave Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject this leave request? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleReject(leave.id)}
                    >
                      Reject
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Leave Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      {leave.parentApproval 
                        ? "The parent has already approved this request. Your approval will fully approve the leave request."
                        : "Note: This leave still requires parent approval before it's fully approved."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleApprove(leave.id)}>
                      Approve
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{leaveRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingLeaves.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedLeaves.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Leave Management
        </h3>
        <p className="text-muted-foreground">Comprehensive view of all leave requests</p>
      </div>
      
      {pendingLeaves.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          <p className="text-yellow-800">
            You have {pendingLeaves.length} pending leave {pendingLeaves.length === 1 ? 'request' : 'requests'} that require your attention.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <Tabs defaultValue={pendingLeaves.length > 0 ? "pending" : "all"}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <div className="p-4">
            <TabsContent value="pending" className="mt-0">
              {pendingLeaves.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending leave requests to approve.</p>
                </div>
              ) : (
                pendingLeaves.map(leave => (
                  <LeaveCard key={leave.id} leave={leave} isPending={true} />
                ))
              )}
            </TabsContent>
            <TabsContent value="approved" className="mt-0">
              {approvedLeaves.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No approved leave requests.</p>
                </div>
              ) : (
                approvedLeaves.map(leave => (
                  <LeaveCard key={leave.id} leave={leave} />
                ))
              )}
            </TabsContent>
            <TabsContent value="rejected" className="mt-0">
              {rejectedLeaves.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No rejected leave requests.</p>
                </div>
              ) : (
                rejectedLeaves.map(leave => (
                  <LeaveCard key={leave.id} leave={leave} />
                ))
              )}
            </TabsContent>
            <TabsContent value="all" className="mt-0">
              {allLeaves.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No leave requests available.</p>
                </div>
              ) : (
                allLeaves.map(leave => (
                  <LeaveCard key={leave.id} leave={leave} isPending={leave.status === 'pending'} />
                ))
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
