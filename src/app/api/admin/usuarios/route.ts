import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Verifica que el request viene de un admin autenticado
async function verifyAdmin(): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'No autenticado' };
  if (user.user_metadata?.role !== 'admin') return { ok: false, error: 'Sin permisos' };
  return { ok: true };
}

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — listar usuarios
export async function GET() {
  const { ok, error } = await verifyAdmin();
  if (!ok) return NextResponse.json({ error }, { status: 403 });

  const supabase = adminClient();
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  const mapped = users.map(u => ({
    id: u.id,
    email: u.email,
    role: u.user_metadata?.role ?? null,
    institucion: u.user_metadata?.institucion ?? null,
    nombre: u.user_metadata?.nombre ?? null,
    telefono: u.user_metadata?.telefono ?? null,
    matricula: u.user_metadata?.matricula ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    email_confirmed_at: u.email_confirmed_at,
  }));

  return NextResponse.json({ users: mapped });
}

// POST — crear usuario
export async function POST(req: NextRequest) {
  const { ok, error } = await verifyAdmin();
  if (!ok) return NextResponse.json({ error }, { status: 403 });

  const body = await req.json();
  const { email, password, role, nombre, institucion } = body;

  if (!email || !password || !role) {
    return NextResponse.json({ error: 'email, password y role son requeridos' }, { status: 400 });
  }
  if (!['admin', 'asociado', 'certificado', 'responsable_comite', 'encargado_catedra', 'profesor'].includes(role)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
  }

  const supabase = adminClient();
  const { data, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, nombre: nombre ?? '', institucion: institucion ?? '' },
  });

  if (createError) return NextResponse.json({ error: createError.message }, { status: 400 });
  return NextResponse.json({ user: data.user }, { status: 201 });
}

// PATCH — actualizar rol / metadata
export async function PATCH(req: NextRequest) {
  const { ok, error } = await verifyAdmin();
  if (!ok) return NextResponse.json({ error }, { status: 403 });

  const body = await req.json();
  const { id, role, nombre, institucion } = body;

  if (!id) return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
  if (role && !['admin', 'asociado', 'certificado', 'responsable_comite', 'encargado_catedra', 'profesor'].includes(role)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
  }

  const supabase = adminClient();

  // Leer metadata actual para hacer merge
  const { data: existing } = await supabase.auth.admin.getUserById(id);
  const currentMeta = existing?.user?.user_metadata ?? {};

  const updatedMeta = {
    ...currentMeta,
    ...(role !== undefined && { role }),
    ...(nombre !== undefined && { nombre }),
    ...(institucion !== undefined && { institucion }),
  };

  const { data, error: updateError } = await supabase.auth.admin.updateUserById(id, {
    user_metadata: updatedMeta,
  });

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
  return NextResponse.json({ user: data.user });
}

// DELETE — eliminar usuario
export async function DELETE(req: NextRequest) {
  const { ok, error } = await verifyAdmin();
  if (!ok) return NextResponse.json({ error }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id es requerido' }, { status: 400 });

  const supabase = adminClient();
  const { error: deleteError } = await supabase.auth.admin.deleteUser(id);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
