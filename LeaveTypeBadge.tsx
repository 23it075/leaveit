
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LeaveType, LEAVE_TYPE_LABELS } from '@/contexts/LeaveContext';

interface LeaveTypeConfig {
  label: string;
  class: string;
}

const LEAVE_TYPE_CONFIG: Record<LeaveType, LeaveTypeConfig> = {
  home_leave: {
    label: LEAVE_TYPE_LABELS.home_leave,
    class: "bg-blue-100 text-blue-800 hover:bg-blue-100"
  },
  one_day_leave: {
    label: LEAVE_TYPE_LABELS.one_day_leave,
    class: "bg-green-100 text-green-800 hover:bg-green-100"
  },
  medical_leave: {
    label: LEAVE_TYPE_LABELS.medical_leave,
    class: "bg-red-100 text-red-800 hover:bg-red-100"
  },
  emergency_leave: {
    label: LEAVE_TYPE_LABELS.emergency_leave,
    class: "bg-orange-100 text-orange-800 hover:bg-orange-100"
  },
  other: {
    label: LEAVE_TYPE_LABELS.other,
    class: "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
};

interface LeaveTypeBadgeProps {
  type: LeaveType;
}

const LeaveTypeBadge: React.FC<LeaveTypeBadgeProps> = ({ type }) => {
  // Default config for unknown types
  const defaultConfig = {
    label: type,
    class: "bg-gray-100 text-gray-800 hover:bg-gray-100"
  };
  
  // Get config for this type or use default
  const typeConfig = LEAVE_TYPE_CONFIG[type] || defaultConfig;
  
  return (
    <Badge className={typeConfig.class} variant="outline">
      {typeConfig.label}
    </Badge>
  );
};

export default LeaveTypeBadge;
