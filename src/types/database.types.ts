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
          tipo_hero: 'split' | 'fullscreen-video' | 'fullscreen-image'
          efecto_overlay: 'matrix' | 'pulse' | 'grain' | 'none'
          media_url: string | null
          media_tipo: 'image' | 'video'
          badge_texto: string | null
          cta_texto: string | null
          cta_enlace: string | null
          cta_texto_2: string | null
          cta_enlace_2: string | null
          estadisticas_json: Json
          duracion: number | null
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
          tipo_hero?: 'split' | 'fullscreen-video' | 'fullscreen-image'
          efecto_overlay?: 'matrix' | 'pulse' | 'grain' | 'none'
          media_url?: string | null
          media_tipo?: 'image' | 'video'
          badge_texto?: string | null
          cta_texto?: string | null
          cta_enlace?: string | null
          cta_texto_2?: string | null
          cta_enlace_2?: string | null
          estadisticas_json?: Json
          duracion?: number | null
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
          tipo_hero?: 'split' | 'fullscreen-video' | 'fullscreen-image'
          efecto_overlay?: 'matrix' | 'pulse' | 'grain' | 'none'
          media_url?: string | null
          media_tipo?: 'image' | 'video'
          badge_texto?: string | null
          cta_texto?: string | null
          cta_enlace?: string | null
          cta_texto_2?: string | null
          cta_enlace_2?: string | null
          estadisticas_json?: Json
          duracion?: number | null
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
          tipo_hero: 'split' | 'fullscreen-video' | 'fullscreen-image'
          efecto_overlay: 'matrix' | 'pulse' | 'grain' | 'none'
          media_url: string | null
          media_tipo: 'image' | 'video'
          badge_texto: string | null
          cta_texto: string | null
          layout_tipo: 'classic' | 'modern' | 'minimal' | 'immersive'
          configuracion_registro: Json | null
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
          tipo_hero?: 'split' | 'fullscreen-video' | 'fullscreen-image'
          efecto_overlay?: 'matrix' | 'pulse' | 'grain' | 'none'
          media_url?: string | null
          media_tipo?: 'image' | 'video'
          badge_texto?: string | null
          cta_texto?: string | null
          layout_tipo?: 'classic' | 'modern' | 'minimal' | 'immersive'
          configuracion_registro?: Json | null
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
          tipo_hero?: 'split' | 'fullscreen-video' | 'fullscreen-image'
          efecto_overlay?: 'matrix' | 'pulse' | 'grain' | 'none'
          media_url?: string | null
          media_tipo?: 'image' | 'video'
          badge_texto?: string | null
          cta_texto?: string | null
          layout_tipo?: 'classic' | 'modern' | 'minimal' | 'immersive'
          configuracion_registro?: Json | null
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
      examenes_certificacion: {
        Row: {
          id: string
          titulo: string
          descripcion: string | null
          fecha: string
          hora: string | null
          modalidad: 'presencial' | 'distancia' | 'ambas'
          sede: string | null
          cupo_maximo: number | null
          url_registro: string | null
          certificacion_id: string | null
          activo: boolean
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descripcion?: string | null
          fecha: string
          hora?: string | null
          modalidad?: 'presencial' | 'distancia' | 'ambas'
          sede?: string | null
          cupo_maximo?: number | null
          url_registro?: string | null
          certificacion_id?: string | null
          activo?: boolean
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descripcion?: string | null
          fecha?: string
          hora?: string | null
          modalidad?: 'presencial' | 'distancia' | 'ambas'
          sede?: string | null
          cupo_maximo?: number | null
          url_registro?: string | null
          certificacion_id?: string | null
          activo?: boolean
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documentos_cert: {
        Row: {
          id: string
          titulo: string
          descripcion: string | null
          categoria: 'guia' | 'manual' | 'formato' | 'comunicado' | 'tarifa' | 'reglamento' | 'otro'
          subcategoria: string | null
          tipo_perfil: 'independiente' | 'institucion' | 'consar' | 'general'
          storage_path: string | null
          url_publica: string | null
          orden: number
          activo: boolean
          fecha_publicacion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descripcion?: string | null
          categoria?: 'guia' | 'manual' | 'formato' | 'comunicado' | 'tarifa' | 'reglamento' | 'otro'
          subcategoria?: string | null
          tipo_perfil?: 'independiente' | 'institucion' | 'consar' | 'general'
          storage_path?: string | null
          url_publica?: string | null
          orden?: number
          activo?: boolean
          fecha_publicacion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descripcion?: string | null
          categoria?: 'guia' | 'manual' | 'formato' | 'comunicado' | 'tarifa' | 'reglamento' | 'otro'
          subcategoria?: string | null
          tipo_perfil?: 'independiente' | 'institucion' | 'consar' | 'general'
          storage_path?: string | null
          url_publica?: string | null
          orden?: number
          activo?: boolean
          fecha_publicacion?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      micrositios_cert: {
        Row: {
          id: string
          slug: string
          titulo: string
          subtitulo: string | null
          descripcion: string | null
          tipo: 'proceso' | 'guia' | 'faq' | 'referencia'
          perfil_objetivo: 'independiente' | 'institucion' | 'consar' | 'general'
          contenido_json: Json
          documento_origen_id: string | null
          imagen_cover: string | null
          color_acento: string | null
          icono: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          titulo: string
          subtitulo?: string | null
          descripcion?: string | null
          tipo?: 'proceso' | 'guia' | 'faq' | 'referencia'
          perfil_objetivo?: 'independiente' | 'institucion' | 'consar' | 'general'
          contenido_json?: Json
          documento_origen_id?: string | null
          imagen_cover?: string | null
          color_acento?: string | null
          icono?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          titulo?: string
          subtitulo?: string | null
          descripcion?: string | null
          tipo?: 'proceso' | 'guia' | 'faq' | 'referencia'
          perfil_objetivo?: 'independiente' | 'institucion' | 'consar' | 'general'
          contenido_json?: Json
          documento_origen_id?: string | null
          imagen_cover?: string | null
          color_acento?: string | null
          icono?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      evento_ponentes: {
        Row: {
          id: string
          evento_id: string
          nombre: string
          cargo: string | null
          bio: string | null
          imagen_url: string | null
          orden: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          nombre: string
          cargo?: string | null
          bio?: string | null
          imagen_url?: string | null
          orden?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          nombre?: string
          cargo?: string | null
          bio?: string | null
          imagen_url?: string | null
          orden?: number
          created_at?: string
          updated_at?: string
        }
      }
      evento_asistentes: {
        Row: {
          id: string
          evento_id: string
          usuario_id: string | null
          nombre_completo: string | null
          email: string | null
          qr_code: string
          asistio: boolean
          fecha_registro: string
          fecha_checkin: string | null
        }
        Insert: {
          id?: string
          evento_id: string
          usuario_id?: string | null
          nombre_completo?: string | null
          email?: string | null
          qr_code: string
          asistio?: boolean
          fecha_registro?: string
          fecha_checkin?: string | null
        }
        Update: {
          id?: string
          evento_id?: string
          usuario_id?: string | null
          nombre_completo?: string | null
          email?: string | null
          qr_code?: string
          asistio?: boolean
          fecha_registro?: string
          fecha_checkin?: string | null
        }
      }
      evento_preguntas: {
        Row: {
          id: string
          evento_id: string
          asistente_id: string | null
          usuario_id: string | null
          autor_nombre: string | null
          pregunta: string
          respondida: boolean
          destacada: boolean
          votos: number
          created_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          asistente_id?: string | null
          usuario_id?: string | null
          autor_nombre?: string | null
          pregunta: string
          respondida?: boolean
          destacada?: boolean
          votos?: number
          created_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          asistente_id?: string | null
          usuario_id?: string | null
          autor_nombre?: string | null
          pregunta?: string
          respondida?: boolean
          destacada?: boolean
          votos?: number
          created_at?: string
        }
      }
      evento_galeria: {
        Row: {
          id: string
          evento_id: string
          media_url: string
          media_tipo: 'image' | 'video'
          titulo: string | null
          orden: number
          created_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          media_url: string
          media_tipo?: 'image' | 'video'
          titulo?: string | null
          orden?: number
          created_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          media_url?: string
          media_tipo?: 'image' | 'video'
          titulo?: string | null
          orden?: number
          created_at?: string
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
