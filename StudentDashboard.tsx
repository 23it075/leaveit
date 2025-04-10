import React, { useState } from 'react';
import { useLeave, LeaveType, LEAVE_TYPE_LABELS } from '@/contexts/LeaveContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Check, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import LeaveTypeBadge from '@/components/LeaveTypeBadge';
import { toast } from "sonner";

const StudentDashboard: React.FC = () => {
  const { leaveRequests, createLeaveRequest, loading } = useLeave();
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    fromTime: '08:00',
    toTime: '17:00',
    reason: '',
    leaveType: '' as LeaveType
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fromDate || !formData.toDate || !formData.reason || !formData.leaveType) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createLeaveRequest(formData);
      setFormData({
        fromDate: '',
        toDate: '',
        fromTime: '08:00',
        toTime: '17:00',
        reason: '',
        leaveType: '' as LeaveType
      });
    } catch (error) {
      console.error('Error submitting leave request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="outline"><Check className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100" variant="outline"><X className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100" variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Leave Request</TabsTrigger>
          <TabsTrigger value="history">Leave History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit a New Leave Request</CardTitle>
              <CardDescription>
                Fill out the form below to submit a new leave request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select
                    value={formData.leaveType}
                    onValueChange={(value) => handleSelectChange('leaveType', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromDate">From Date</Label>
                    <Input
                      id="fromDate"
                      name="fromDate"
                      type="date"
                      value={formData.fromDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toDate">To Date</Label>
                    <Input
                      id="toDate"
                      name="toDate"
                      type="date" 
                      value={formData.toDate}
                      onChange={handleChange}
                      min={formData.fromDate}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromTime">From Time</Label>
                    <Input
                      id="fromTime"
                      name="fromTime"
                      type="time"
                      value={formData.fromTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toTime">To Time</Label>
                    <Input
                      id="toTime"
                      name="toTime"
                      type="time" 
                      value={formData.toTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Leave</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    placeholder="Explain why you need this leave..."
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows={4}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                  {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Leave History</CardTitle>
              <CardDescription>
                View all your previous leave requests and their statuses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4">Loading leave history...</p>
              ) : leaveRequests.length > 0 ? (
                <div className="space-y-4">
                  {leaveRequests.map((leave) => (
                    <Card key={leave.id} className="overflow-hidden">
                      <div className="flex items-center p-4 border-b">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <LeaveTypeBadge type={leave.leaveType as LeaveType} />
                            {getStatusBadge(leave.status)}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 inline-block mr-1" />
                            {format(new Date(leave.fromDate), 'MMM dd, yyyy')} 
                            {leave.fromDate !== leave.toDate && 
                              <> - {format(new Date(leave.toDate), 'MMM dd, yyyy')}</>
                            }
                            {leave.fromTime && 
                              <span className="ml-2">
                                <Clock className="h-3 w-3 inline-block mr-1" />
                                {leave.fromTime} - {leave.toTime}
                              </span>
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            Parent: {leave.parentApproval ? 
                              <span className="text-green-600">Approved</span> : 
                              <span className="text-gray-500">Pending</span>
                            }
                          </p>
                          <p className="text-sm">
                            Admin: {leave.adminApproval ? 
                              <span className="text-green-600">Approved</span> : 
                              <span className="text-gray-500">Pending</span>
                            }
                          </p>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm">{leave.reason}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You have no leave requests yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
