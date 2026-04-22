import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type Noticia = Database['public']['Tables']['noticias']['Row'];

export async function getNoticiasServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('publicado', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Noticia[];
}

export async function getNoticiaBySlugServer(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // Ignorar error de 'no encontrado' para manejarlo en el UI
  return data as Noticia | null;
}
