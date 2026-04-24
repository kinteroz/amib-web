'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function registerForEvent(data: {
  evento_id: string;
  nombre_completo: string;
  email: string;
  qr_code: string;
  asistio: boolean;
}) {
  try {
    const { error } = await supabaseAdmin
      .from('evento_asistentes')
      .insert([data]);

    if (error) {
      console.error('[registerForEvent] Error inserting:', error);
      throw new Error(error.message);
    }
    return { success: true };
  } catch (err: any) {
    console.error('[registerForEvent] Exception:', err);
    return { success: false, error: err.message };
  }
}
