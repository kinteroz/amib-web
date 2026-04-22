'use client';

import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

type Banner = Database['public']['Tables']['banners']['Row'];
type BannerUpdate = Database['public']['Tables']['banners']['Update'];
type BannerInsert = Database['public']['Tables']['banners']['Insert'];

export async function getBanners() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('orden', { ascending: true });
  
  if (error) throw error;
  return data as Banner[];
}

export async function upsertBanner(banner: BannerInsert | BannerUpdate) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('banners')
    .upsert(banner)
    .select()
    .single();
  
  if (error) throw error;
  return data as Banner;
}

export async function deleteBanner(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

export async function updateBannerOrder(updates: { id: string; orden: number }[]) {
  const supabase = createClient();
  const { error } = await supabase
    .from('banners')
    .upsert(updates);
  
  if (error) throw error;
  return true;
}
