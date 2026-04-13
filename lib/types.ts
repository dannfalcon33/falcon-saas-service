import type { LucideIcon } from 'lucide-react';

// Enums
export type AppRole = 'admin' | 'client' | 'technician';
export type LeadStatus = 'new' | 'contacted' | 'negotiation' | 'won' | 'lost';
export type ClientStatus = 'pending_payment' | 'active' | 'suspended' | 'cancelled';
export type SubscriptionStatus = 'pending_payment' | 'active' | 'expired' | 'suspended' | 'cancelled';
export type PaymentMethod = 'binance' | 'zinli' | 'pago_movil' | 'transferencia' | 'efectivo' | 'otro';
export type PaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';
export type VisitType = 'included' | 'extra' | 'emergency';
export type VisitStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'missed';
export type VisitRequestStatus = 'pending' | 'scheduled' | 'rejected';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IncidentChannel = 'dashboard' | 'phone' | 'whatsapp' | 'email' | 'onsite';

// Base Interfaces
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: AppRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBPlan {
  id: string;
  code: string;
  name: string;
  price_usd: number;
  monthly_visit_limit?: number;
  is_unlimited_visits: boolean;
  response_time_min_hours?: number;
  response_time_max_hours?: number;
  remote_support_label?: string;
  maintenance_label?: string;
  cloud_backup_label?: string;
  local_backup_label?: string;
  backup_verification_label?: string;
  recovery_validation_label?: string;
  advisory_label?: string;
  monitoring_label?: string;
  scope_label?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  company_name: string;
  email: string;
  phone?: string;
  city?: string;
  service_zone?: string;
  plan_interest_id?: string;
  source?: string;
  status: LeadStatus;
  notes?: string;
  converted_client_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  owner_profile_id?: string;
  business_name: string;
  contact_name: string;
  main_email: string;
  main_phone?: string;
  rif_or_id?: string;
  city?: string;
  zone?: string;
  address?: string;
  billing_email?: string;
  administrative_contact?: string;
  invitation_sent_at?: string;
  access_enabled_at?: string;
  status: ClientStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  client_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  start_date?: string;
  end_date?: string;
  renewal_due_date?: string;
  activated_at?: string;
  activated_by?: string;
  price_snapshot_usd: number;
  visit_limit_snapshot?: number;
  is_unlimited_snapshot: boolean;
  visit_used_count: number;
  visit_available_count: number;
  days_remaining: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joins
  plan?: DBPlan;
}

export interface Payment {
  id: string;
  client_id: string;
  subscription_id: string;
  amount_usd: number;
  payment_method: PaymentMethod;
  reference_code?: string;
  proof_file_url?: string;
  proof_file_path?: string;
  status: PaymentStatus;
  paid_at?: string;
  submitted_at?: string;
  verified_at?: string;
  verified_by?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  client_id: string;
  subscription_id?: string;
  assigned_to?: string;
  visit_type: VisitType;
  status: VisitStatus;
  scheduled_start: string;
  scheduled_end?: string;
  completed_at?: string;
  title: string;
  description?: string;
  internal_notes?: string;
  client_visible_notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface VisitRequest {
  id: string;
  client_id: string;
  subscription_id?: string;
  requested_by?: string;
  priority: IncidentPriority;
  title: string;
  description: string;
  requested_at: string;
  status: VisitRequestStatus;
  admin_notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  linked_visit_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  client_id: string;
  subscription_id?: string;
  reported_by?: string;
  assigned_to?: string;
  title: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  channel: IncidentChannel;
  reported_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceReport {
  id: string;
  client_id: string;
  subscription_id?: string;
  visit_id?: string;
  incident_id?: string;
  created_by?: string;
  title: string;
  summary: string;
  work_performed?: string;
  recommendations?: string;
  file_url?: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
}

// UI Types
export interface Plan {
  id?: string;
  name: string;
  price: string;
  popular?: boolean;
  description: string;
  features: string[];
  target?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface UseCase {
  icon: LucideIcon;
  title: string;
  description: string;
}
