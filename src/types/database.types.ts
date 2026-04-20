export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      banners: {
        Row: {
          activo: boolean
          created_at: string
          enlace: string | null
          id: string
          imagen_url: string | null
          orden: number
          subtitulo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          enlace?: string | null
          id?: string
          imagen_url?: string | null
          orden?: number
          subtitulo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          enlace?: string | null
          id?: string
          imagen_url?: string | null
          orden?: number
          subtitulo?: string | null
          titulo?: string
          updated_at?: string
        }
      }
      certificaciones: {
        Row: {
          activo: boolean
          codigo: string
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          orden: number
          requisitos: string | null
          updated_at: string
          vigencia_meses: number | null
        }
        Insert: {
          activo?: boolean
          codigo: string
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          orden?: number
          requisitos?: string | null
          updated_at?: string
          vigencia_meses?: number | null
        }
        Update: {
          activo?: boolean
          codigo?: string
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number
          requisitos?: string | null
          updated_at?: string
          vigencia_meses?: number | null
        }
      }
      eventos: {
        Row: {
          activo: boolean
          audiencia: string | null
          costo: number | null
          created_at: string
          descripcion: string | null
          es_destacado: boolean
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          imagen_url: string | null
          modalidad: string | null
          registro_url: string | null
          tipo_acceso: string | null
          titulo: string
          ubicacion: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          audiencia?: string | null
          costo?: number | null
          created_at?: string
          descripcion?: string | null
          es_destacado?: boolean
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          imagen_url?: string | null
          modalidad?: string | null
          registro_url?: string | null
          tipo_acceso?: string | null
          titulo: string
          ubicacion?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          audiencia?: string | null
          costo?: number | null
          created_at?: string
          descripcion?: string | null
          es_destacado?: boolean
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          imagen_url?: string | null
          modalidad?: string | null
          registro_url?: string | null
          tipo_acceso?: string | null
          titulo?: string
          ubicacion?: string | null
          updated_at?: string
        }
      }
      evento_tickets: {
        Row: {
          id: string
          evento_id: string
          nombre: string
          descripcion: string | null
          precio: number
          cantidad_disponible: number | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          nombre: string
          descripcion?: string | null
          precio: number
          cantidad_disponible?: number | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          nombre?: string
          descripcion?: string | null
          precio?: number
          cantidad_disponible?: number | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      noticias: {
        Row: {
          categoria: string | null
          contenido: string | null
          created_at: string
          destacado: boolean
          fecha_publicacion: string | null
          id: string
          imagen_url: string | null
          publicado: boolean
          resumen: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          contenido?: string | null
          created_at?: string
          destacado?: boolean
          fecha_publicacion?: string | null
          id?: string
          imagen_url?: string | null
          publicado?: boolean
          resumen?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          contenido?: string | null
          created_at?: string
          destacado?: boolean
          fecha_publicacion?: string | null
          id?: string
          imagen_url?: string | null
          publicado?: boolean
          resumen?: string | null
          titulo?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
