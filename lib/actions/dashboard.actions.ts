'use server';

import { createServerClientComponent, supabaseAdmin } from '@/lib/supabase-server';
import { Subscription, Payment, Incident, PaymentMethod, IncidentPriority } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Get the current active subscription for a client
 */
export async function getCurrentSubscription(clientId: string) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, plan:plans(*)')
    .eq('client_id', clientId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error fetching subscription:', error);
    return { data: null, error };
  }

  return { data: data as Subscription, error: null };
}

/**
 * Get payment history for a client
 */
export async function getPaymentHistory(clientId: string) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payments:', error);
    return { data: null, error };
  }

  return { data: data as Payment[], error: null };
}

/**
 * Submit a payment proof
 */
export async function submitPaymentProof(formData: {
  clientId: string;
  subscriptionId: string;
  amountUsd: number;
  paymentMethod: PaymentMethod;
  referenceCode?: string;
  proofFileUrl?: string;
}) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('payments')
    .insert({
      client_id: formData.clientId,
      subscription_id: formData.subscriptionId,
      amount_usd: formData.amountUsd,
      payment_method: formData.paymentMethod,
      reference_code: formData.referenceCode,
      proof_file_url: formData.proofFileUrl,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting payment:', error);
    return { data: null, error };
  }

  revalidatePath('/dashboard/payments');
  return { data: data as Payment, error: null };
}

/**
 * Report a new incident
 */
export async function createIncident(formData: {
  clientId: string;
  subscriptionId?: string;
  title: string;
  description: string;
  priority: IncidentPriority;
}) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('incidents')
    .insert({
      client_id: formData.clientId,
      subscription_id: formData.subscriptionId,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'open',
      channel: 'dashboard',
      reported_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating incident:', error);
    return { data: null, error };
  }

  revalidatePath('/dashboard/incidents');
  return { data: data as Incident, error: null };
}

/**
 * Generate a signed URL for a private file in Supabase Storage
 */
export async function getSignedUrl(path: string, bucket: string = 'payment-proofs') {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60); // 1 minute expiry

  if (error) {
    console.error('Error generating signed URL:', error);
    return { data: null, error };
  }

  return { data: data.signedUrl, error: null };
}
