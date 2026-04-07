'use server';

import { createServerClientComponent, supabaseAdmin } from '@/lib/supabase-server';
import { Client, Payment, ClientStatus, Subscription, Visit } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Get all clients with their current subscription and plan info
 */
export async function getClients(query?: string) {
  const supabase = await createServerClientComponent();
  
  let fetch = supabase
    .from('clients')
    .select(`
      *,
      profiles:owner_profile_id (*),
      subscriptions (
        id,
        status,
        end_date,
        plan:plan_id (name)
      )
    `)
    .order('business_name');

  if (query) {
    fetch = fetch.or(`business_name.ilike.%${query}%,contact_name.ilike.%${query}%,main_email.ilike.%${query}%`);
  }

  const { data, error } = await fetch;
  return { data, error };
}

/**
 * Create a new client manually
 */
export async function createClient(clientData: Partial<Client>) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('clients')
    .insert(clientData)
    .select()
    .single();
  
  if (!error) revalidatePath('/admin/clients');
  return { data, error };
}

/**
 * Update client data
 */
export async function updateClient(clientId: string, clientData: Partial<Client>) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', clientId)
    .select()
    .single();
  
  if (!error) revalidatePath('/admin/clients');
  return { data, error };
}

/**
 * Delete a client
 */
export async function deleteClient(clientId: string) {
  const supabase = await createServerClientComponent();
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);
  
  if (!error) revalidatePath('/admin/clients');
  return { error };
}

// Subscription Management
export async function getSubscriptions(filter?: string) {
  const supabase = await createServerClientComponent();
  
  let query = supabase
    .from('subscriptions')
    .select(`
      *,
      client:client_id (id, business_name),
      plan:plan_id (id, name, monthly_visit_limit, is_unlimited_visits)
    `)
    .order('created_at', { ascending: false });

  if (filter && filter !== 'all') {
    query = query.eq('status', filter);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function createSubscription(subData: Partial<Subscription>) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subData)
    .select()
    .single();
  
  if (!error) {
    revalidatePath('/admin/subscriptions');
    revalidatePath('/admin/clients');
  }
  return { data, error };
}

export async function updateSubscription(id: string, subData: Partial<Subscription>) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('subscriptions')
    .update(subData)
    .eq('id', id)
    .select()
    .single();
  
  if (!error) {
    revalidatePath('/admin/subscriptions');
    revalidatePath('/admin/clients');
  }
  return { data, error };
}

/**
 * Get all submitted payments for validation
 */
export async function getPendingPayments() {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('payments')
    .select('*, clients:client_id(business_name, contact_name)')
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending payments:', error);
    return { data: null, error };
  }

  return { data: data as Payment[], error: null };
}

/**
 * Verify a payment and activate subscription using the SQL function
 */
export async function verifyPayment(paymentId: string, adminProfileId: string) {
  if (!supabaseAdmin) throw new Error('Supabase Service Role Key is missing');

  const { data, error } = await supabaseAdmin.rpc('activate_subscription_from_verified_payment', {
    p_payment_id: paymentId,
    p_admin_profile_id: adminProfileId,
  });

  if (error) {
    console.error('Error verifying payment:', error);
    return { data: null, error };
  }

  revalidatePath('/admin/payments');
  revalidatePath('/admin/subscriptions');
  revalidatePath('/dashboard');
  return { data, error: null };
}

/**
 * Manually update client status
 */
export async function updateClientStatus(clientId: string, status: ClientStatus) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('clients')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', clientId);

  if (error) {
    console.error('Error updating client status:', error);
    return { data: null, error };
  }

  revalidatePath('/admin/clients');
  return { data, error: null };
}

// Visit Management
export async function getVisits() {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('visits')
    .select(`
      *,
      client:client_id (business_name),
      technician:assigned_to (full_name)
    `)
    .order('scheduled_start', { ascending: false });
  
  return { data, error };
}

export async function createVisit(visitData: Partial<Visit>) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('visits')
    .insert(visitData)
    .select()
    .single();
  
  if (!error) revalidatePath('/admin/visits');
  return { data, error };
}

export async function updateVisit(id: string, visitData: Partial<Visit>) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('visits')
    .update(visitData)
    .eq('id', id)
    .select()
    .single();
  
  if (!error) {
    revalidatePath('/admin/visits');
    revalidatePath('/dashboard/visits');
  }
  return { data, error };
}

// Incident Management
export async function getIncidents() {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *,
      client:client_id (business_name),
      reporter:reported_by (full_name),
      technician:assigned_to (full_name)
    `)
    .order('reported_at', { ascending: false });
  
  return { data, error };
}

export async function updateIncident(id: string, incidentData: any) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('incidents')
    .update({
      ...incidentData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (!error) {
    revalidatePath('/admin/incidents');
    revalidatePath('/dashboard/incidents');
  }
  return { data, error };
}

// Service Report Management
export async function getServiceReports(clientId?: string) {
  const supabase = await createServerClientComponent();
  let query = supabase
    .from('service_reports')
    .select(`
      *,
      client:client_id (business_name),
      visit:visit_id (title, scheduled_start),
      incident:incident_id (title)
    `)
    .order('created_at', { ascending: false });

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function createServiceReport(reportData: any) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('service_reports')
    .insert(reportData)
    .select()
    .single();
  
  if (!error) {
    revalidatePath('/admin/reports');
    revalidatePath('/dashboard/reports');
  }
  return { data, error };
}
