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

// NOTICIAS ACTIONS
type Noticia = Database['public']['Tables']['noticias']['Row'] & { slug?: string; video_url?: string };
type NoticiaUpdate = Database['public']['Tables']['noticias']['Update'] & { slug?: string; video_url?: string };
type NoticiaInsert = Database['public']['Tables']['noticias']['Insert'] & { slug?: string; video_url?: string };

export async function getNoticias() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as any[];
}

export async function getNoticiaBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) throw error;
  return data;
}

export async function upsertNoticia(noticia: any) {
  const supabase = createClient();
  
  // Generar slug si no existe
  if (!noticia.slug && noticia.titulo) {
    noticia.slug = noticia.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const { data, error } = await supabase
    .from('noticias')
    .upsert(noticia)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteNoticia(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('noticias')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function getNoticiasPublicadas(options: {
  page?: number;
  limit?: number;
  search?: string;
  categoria?: string;
} = {}) {
  const supabase = createClient();
  const { page = 0, limit = 9, search, categoria } = options;

  let query = supabase
    .from('noticias')
    .select('*')
    .eq('publicado', true);

  if (search) query = query.ilike('titulo', `%${search}%`);
  if (categoria && categoria !== 'TODAS') query = query.eq('categoria', categoria);

  const { data, error } = await query
    .order('fecha_publicacion', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (error) throw error;
  return (data || []) as any[];
}
