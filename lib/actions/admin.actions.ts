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

  // Trigger automated access flow if the client doesn't have an owner yet
  try {
    const { data: pay } = await supabaseAdmin
      .from('payments')
      .select('client_id')
      .eq('id', paymentId)
      .single();

    if (pay?.client_id) {
       await enableClientAccess(pay.client_id);
    }
  } catch (err) {
    console.error("Failed to auto-enable access:", err);
  }

  return { data, error: null };
}

/**
 * Enable dashboard access for a client (Invite + Profile)
 */
export async function enableClientAccess(clientId: string) {
  if (!supabaseAdmin) throw new Error('Servidor no configurado correctamente');

  try {
    // 1. Get Client Data
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) throw new Error('Cliente no encontrado');

    // 2. Check if user already exists in Auth
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    let user = authData?.users.find(u => u.email === client.main_email);

    if (!user) {
      // 3. Invite user
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        client.main_email,
        { 
          redirectTo: 'http://localhost:3000/auth/set-password'
        }
      );
      if (inviteError) {
        console.error('Invite error:', inviteError);
        throw inviteError;
      }
      user = inviteData.user;
    }

    if (!user) throw new Error('No se pudo crear o encontrar el usuario');

    // 4. Create/Update Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: client.main_email,
        full_name: client.contact_name,
        role: 'client',
        is_active: true,
        updated_at: new Date().toISOString()
      });

    if (profileError) throw profileError;

    // 5. Update Client with owner ID and audit
    const { error: updateError } = await supabaseAdmin
      .from('clients')
      .update({
        owner_profile_id: user.id,
        invitation_sent_at: new Date().toISOString(),
        access_enabled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (updateError) throw updateError;

    revalidatePath('/admin/clients');
    return { success: true, userId: user.id };

  } catch (error: any) {
    console.error("Enable Access Error:", error);
    return { error: error.message };
  }
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

// Lead Management
export async function getLeads(status?: string) {
  const supabase = await createServerClientComponent();
  let query = supabase
    .from('leads')
    .select('*, plan:plan_interest_id(*)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function updateLeadStatus(id: string, status: string) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (!error) revalidatePath('/admin/leads');
  return { data, error };
}

export async function updateLeadNotes(id: string, notes: string) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('leads')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (!error) revalidatePath('/admin/leads');
  return { data, error };
}

/**
 * CONVERT LEAD TO CLIENT
 * Uses the SQL function for atomic conversion
 */
export async function convertLeadToClient(leadId: string, adminId: string, activateNow: boolean = true) {
  if (!supabaseAdmin) throw new Error('Servidor no configurado correctamente');

  const { data, error } = await supabaseAdmin.rpc('convert_lead_to_client', {
    p_lead_id: leadId,
    p_admin_profile_id: adminId,
    p_activate_now: activateNow
  });

  if (error) {
    console.error("Conversion Error:", error);
    return { error: error.message };
  }

  revalidatePath('/admin/leads');
  revalidatePath('/admin/clients');
  revalidatePath('/dashboard');
  
  return { success: true, data };
}


/**
 * Get overall admin dashboard statistics
 */
export async function getAdminStats() {
  const supabase = await createServerClientComponent();
  
  // 1. Active Clients
  const { count: activeClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // 2. Pending Payments
  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'submitted');

  // 3. Subscriptions (Active, Expiring, Expired)
  const { data: subsData } = await supabase
    .from('subscriptions')
    .select('status, price_snapshot_usd, days_remaining')
    .in('status', ['active', 'expired', 'suspended']);

  let mrr = 0;
  let expiringSoon = 0;
  let expired = 0;
  let activeSubs = 0;

  subsData?.forEach(sub => {
    if (sub.status === 'active') {
      activeSubs++;
      mrr += Number(sub.price_snapshot_usd);
      if (sub.days_remaining <= 7) {
        expiringSoon++;
      }
    } else if (sub.status === 'expired') {
      expired++;
    }
  });

  // 4. Incidents
  const { data: incidentsData } = await supabase
    .from('incidents')
    .select('status, priority')
    .in('status', ['open', 'in_progress']);

  const openIncidents = incidentsData?.length || 0;
  const criticalIncidents = incidentsData?.filter(i => i.priority === 'critical').length || 0;

  // 5. Visits this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0,0,0,0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const { count: visitsThisWeek } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_start', startOfWeek.toISOString())
    .lte('scheduled_start', endOfWeek.toISOString());

  return {
    data: {
      activeClients: activeClients || 0,
      mrr,
      pendingPayments: pendingPayments || 0,
      activeSubscriptions: activeSubs || 0,
      expiringSoon,
      expired,
      openIncidents,
      criticalIncidents,
      visitsThisWeek: visitsThisWeek || 0,
    },
    error: null
  };
}

