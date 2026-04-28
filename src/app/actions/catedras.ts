'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Interfaz para el resultado del procesamiento
export interface CsvProcessingResult {
  total: number
  added: number
  enrolled: number
  errors: number
  details: string[]
}

/**
 * Procesa un archivo CSV (en string) y registra/suscribe a los alumnos
 * a una cátedra específica.
 */
export async function processStudentsCsv(catedraId: string, institucionId: string, csvData: string): Promise<CsvProcessingResult> {
  const supabase = createClient()
  
  // Parseo básico de CSV separado por comas
  const lines = csvData.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  if (lines.length < 2) {
    throw new Error('El archivo CSV debe contener al menos los encabezados y una fila de datos.')
  }
  
  // Asumimos que la primera fila es el encabezado y las siguientes son los datos
  const rows = lines.slice(1)
  
  const results: CsvProcessingResult = {
    total: rows.length,
    added: 0,
    enrolled: 0,
    errors: 0,
    details: []
  }

  for (const row of rows) {
    // Para simplificar, asumimos el formato estricto: matricula,nombre,email
    const cols = row.split(',')
    if (cols.length < 3) continue;
    
    const matricula = cols[0].trim()
    const nombre = cols[1].trim()
    const email = cols[2].trim()

    try {
      // 1. Verificar si el alumno ya existe en la base de datos por email
      let { data: existingAlumno, error: searchError } = await supabase
        .from('alumnos')
        .select('id')
        .eq('email', email)
        .single()
        
      let alumnoId = existingAlumno?.id

      if (!alumnoId) {
        // En un entorno de producción con admin auth, aquí llamaríamos a:
        // await supabase.auth.admin.inviteUserByEmail(email)
        // Por ahora, creamos el registro directamente en la tabla pública
        const { data: newAlumno, error: createError } = await supabase
          .from('alumnos')
          .insert({
            matricula,
            nombre,
            email,
            institucion_id: institucionId
          })
          .select('id')
          .single()
          
        if (createError) throw createError
        alumnoId = newAlumno.id
        results.added++
      }

      // 2. Inscribir al alumno en la Cátedra (tabla puente)
      const { error: enrollError } = await supabase
        .from('catedra_alumnos')
        .insert({
          catedra_id: catedraId,
          alumno_id: alumnoId,
          estado_aprobacion: 'CURSANDO'
        })
        
      if (enrollError) {
        // Ignoramos error de violación de llave única (ya está inscrito)
        if (enrollError.code !== '23505') {
          throw enrollError
        } else {
          results.details.push(`${email} ya estaba inscrito en esta cátedra.`)
        }
      } else {
         results.enrolled++
      }

    } catch (e: any) {
      results.errors++
      results.details.push(`Error con ${email}: ${e.message || e.toString()}`)
    }
  }

  // Refrescar las vistas de administración de cátedras
  revalidatePath('/admin/catedras')
  revalidatePath(`/admin/catedras/${catedraId}`)
  
  return results
}
