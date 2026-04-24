export type UserRole = 'admin' | 'school_admin' | 'clerk';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  createdAt: any;
}

export interface School {
  id: string;
  name: string;
  code: string;
  location?: string;
  district?: string;
}

export interface Student {
  id: string;
  fullName: string;
  pupilId: string;
  gender: 'Male' | 'Female';
  dob: string;
  enrollmentYear: number;
  schoolId: string;
  status: 'active' | 'archived';
  createdAt: any;
  updatedAt: any;
}

export interface Guardian {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  studentId: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: any;
}
