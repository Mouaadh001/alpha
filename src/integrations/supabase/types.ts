export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcement_bar: {
        Row: {
          bg_color: string
          enabled: boolean
          id: boolean
          speed_seconds: number
          text_ar: string
          text_color: string
          text_fr: string
          updated_at: string
        }
        Insert: {
          bg_color?: string
          enabled?: boolean
          id?: boolean
          speed_seconds?: number
          text_ar?: string
          text_color?: string
          text_fr?: string
          updated_at?: string
        }
        Update: {
          bg_color?: string
          enabled?: boolean
          id?: boolean
          speed_seconds?: number
          text_ar?: string
          text_color?: string
          text_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          banner_url: string | null
          cover_url: string | null
          created_at: string
          description_ar: string | null
          description_fr: string | null
          icon: string | null
          id: string
          image_url: string | null
          name_ar: string | null
          name_fr: string
          position: number
          slug: string
          visible: boolean
        }
        Insert: {
          banner_url?: string | null
          cover_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name_ar?: string | null
          name_fr: string
          position?: number
          slug: string
          visible?: boolean
        }
        Update: {
          banner_url?: string | null
          cover_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name_ar?: string | null
          name_fr?: string
          position?: number
          slug?: string
          visible?: boolean
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          config: Json
          created_at: string
          enabled: boolean
          id: string
          position: number
          section_type: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          position?: number
          section_type: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          position?: number
          section_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          image_url: string | null
          line_total_da: number
          order_id: string
          product_id: string | null
          product_name: string
          product_slug: string
          quantity: number
          unit_price_da: number
          variant: string | null
        }
        Insert: {
          id?: string
          image_url?: string | null
          line_total_da: number
          order_id: string
          product_id?: string | null
          product_name: string
          product_slug: string
          quantity: number
          unit_price_da: number
          variant?: string | null
        }
        Update: {
          id?: string
          image_url?: string | null
          line_total_da?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_slug?: string
          quantity?: number
          unit_price_da?: number
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          commune: string
          created_at: string
          full_name: string
          id: string
          notes: string | null
          order_number: string
          phone: string
          status: string
          subtotal_da: number
          total_da: number
          wilaya: string
        }
        Insert: {
          address: string
          commune: string
          created_at?: string
          full_name: string
          id?: string
          notes?: string | null
          order_number?: string
          phone: string
          status?: string
          subtotal_da: number
          total_da: number
          wilaya: string
        }
        Update: {
          address?: string
          commune?: string
          created_at?: string
          full_name?: string
          id?: string
          notes?: string | null
          order_number?: string
          phone?: string
          status?: string
          subtotal_da?: number
          total_da?: number
          wilaya?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          barcode: string | null
          brand: string | null
          category_id: string
          compare_at_price_da: number | null
          cover_image: string | null
          created_at: string
          description_ar: string | null
          description_fr: string | null
          family_key: string | null
          featured: boolean
          gallery: Json
          id: string
          image_url: string | null
          images: string[]
          is_bestseller: boolean
          is_new: boolean
          name_ar: string | null
          name_fr: string
          price_da: number
          price_da_option_2: number | null
          short_description_ar: string | null
          short_description_fr: string | null
          sku: string | null
          slug: string
          stock: number
          storage_option_1: string | null
          storage_option_2: string | null
          subcategory_id: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          active?: boolean
          barcode?: string | null
          brand?: string | null
          category_id: string
          compare_at_price_da?: number | null
          cover_image?: string | null
          created_at?: string
          description_ar?: string | null
          description_fr?: string | null
          family_key?: string | null
          featured?: boolean
          gallery?: Json
          id?: string
          image_url?: string | null
          images?: string[]
          is_bestseller?: boolean
          is_new?: boolean
          name_ar?: string | null
          name_fr: string
          price_da: number
          price_da_option_2?: number | null
          short_description_ar?: string | null
          short_description_fr?: string | null
          sku?: string | null
          slug: string
          stock?: number
          storage_option_1?: string | null
          storage_option_2?: string | null
          subcategory_id?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          active?: boolean
          barcode?: string | null
          brand?: string | null
          category_id?: string
          compare_at_price_da?: number | null
          cover_image?: string | null
          created_at?: string
          description_ar?: string | null
          description_fr?: string | null
          family_key?: string | null
          featured?: boolean
          gallery?: Json
          id?: string
          image_url?: string | null
          images?: string[]
          is_bestseller?: boolean
          is_new?: boolean
          name_ar?: string | null
          name_fr?: string
          price_da?: number
          price_da_option_2?: number | null
          short_description_ar?: string | null
          short_description_fr?: string | null
          sku?: string | null
          slug?: string
          stock?: number
          storage_option_1?: string | null
          storage_option_2?: string | null
          subcategory_id?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      site_status: {
        Row: {
          id: boolean
          maintenance: boolean
          message_ar: string
          message_fr: string
          updated_at: string
        }
        Insert: {
          id?: boolean
          maintenance?: boolean
          message_ar?: string
          message_fr?: string
          updated_at?: string
        }
        Update: {
          id?: boolean
          maintenance?: boolean
          message_ar?: string
          message_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          banner_url: string | null
          category_id: string
          cover_url: string | null
          created_at: string
          description_ar: string | null
          description_fr: string | null
          icon: string | null
          id: string
          name_ar: string | null
          name_fr: string
          position: number
          slug: string
          visible: boolean
        }
        Insert: {
          banner_url?: string | null
          category_id: string
          cover_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          name_ar?: string | null
          name_fr: string
          position?: number
          slug: string
          visible?: boolean
        }
        Update: {
          banner_url?: string | null
          category_id?: string
          cover_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          name_ar?: string | null
          name_fr?: string
          position?: number
          slug?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_order_public: { Args: { order_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
