'use server';

import { createServerClientComponent, supabaseAdmin } from '@/lib/supabase-server';
import { Client, Payment, ClientStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Get all clients for admin dashboard
 */
export async function getAllClients() {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('clients')
    .select('*, profiles:owner_profile_id(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error);
    return { data: null, error };
  }

  return { data: data as Client[], error: null };
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

  // Call the SQL function defined in falconit_supabase_definitivo.sql
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
