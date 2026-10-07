export type UserRole = 'candidate' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
  profile?: CandidateProfile | CompanyProfile;
}

export interface CandidateProfile {
  id?: string;
  user_id: string;
  full_name: string;
  phone?: string;
  location?: string;
  headline?: string;
  bio?: string;
  experience_years?: number;
  education?: string;
  resume_url?: string;
  skills: string[];
}

export interface CompanyProfile {
  id?: string;
  user_id: string;
  name: string;
  logo_url?: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
}

export interface Job {
  id: string;
  company_id?: string;
  employer_id: string;
  title: string;
  description: string;
  category: string;
  employment_type: string; // 'Full-time' | 'Part-time' | 'Remote' | 'Contract' | 'Internship'
  location: string;
  experience_level: string; // 'Entry' | 'Mid' | 'Senior' | 'Lead'
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  skills: string[];
  status: 'open' | 'closed';
  created_at: string;
  updated_at?: string;
  company_name?: string;
  company_logo?: string;
  company_description?: string;
  company_website?: string;
  company_location?: string;
  company_industry?: string;
  applications_count?: number;
  is_saved?: boolean;
  has_applied?: boolean;
  application_status?: ApplicationStatus;
}

export type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  cover_note?: string;
  resume_url?: string;
  applied_date: string;
  last_updated?: string;
  job_title: string;
  job_location: string;
  employment_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  job_status: 'open' | 'closed';
  company_name: string;
  company_logo?: string;
  // Detail views
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  candidate_skills?: string[];
  candidate_experience?: number;
  headline?: string;
}

export interface JobFilters {
  q?: string;
  location?: string;
  category?: string;
  experience?: string;
  employment_type?: string;
  skills?: string;
}
