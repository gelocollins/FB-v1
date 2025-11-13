
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_at_purchase?: number
          product_id?: string
          quantity?: number
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
          created_at: string
          id: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_method: string
          payment_proof_base64: string | null
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_method: string
          payment_proof_base64?: string | null
          total_amount: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_method?: string
          payment_proof_base64?: string | null
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          account_name: string
          account_number: string
          created_at: string
          id: string
          method_name: string
          qr_code_base64: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          created_at?: string
          id?: string
          method_name: string
          qr_code_base64?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          created_at?: string
          id?: string
          method_name?: string
          qr_code_base64?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string
          discount: number | null
          id: string
          image_base64: string
          name: string
          price: number
          stock: number
        }
        Insert: {
          created_at?: string
          description: string
          discount?: number | null
          id?: string
          image_base64: string
          name: string
          price: number
          stock: number
        }
        Update: {
          created_at?: string
          description?: string
          discount?: number | null
          id?: string
          image_base64?: string
          name?: string
          price?: number
          stock?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          email: string
          id: string
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          address?: string | null
          email: string
          id: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          address?: string | null
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      promos: {
        Row: {
          id: string
          product_id: string | null
          promo_type: "percentage" | "fixed" | "global"
          value: number
          start_date: string | null
          end_date: string | null
          created_at: string
          code: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          promo_type: "percentage" | "fixed" | "global"
          value: number
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          code?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          promo_type?: "percentage" | "fixed" | "global"
          value?: number
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promos_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      stock_logs: {
        Row: {
          id: string
          product_id: string
          previous_stock: number
          new_stock: number
          change_type: "manual" | "sale" | "restock"
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          previous_stock: number
          new_stock: number
          change_type: "manual" | "sale" | "restock"
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          previous_stock?: number
          new_stock?: number
          change_type?: "manual" | "sale" | "restock"
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      user_role: "user" | "admin"
      stock_change_type: "manual" | "sale" | "restock"
      promo_type: "percentage" | "fixed" | "global"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderStatus = Database['public']['Enums']['order_status'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type Promo = Database['public']['Tables']['promos']['Row'];
export type StockLog = Database['public']['Tables']['stock_logs']['Row'];

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderWithItems = Order & {
    order_items: (OrderItem & { products: Product | null })[];
    profiles: Profile | null;
};

export type StockLogWithProduct = StockLog & { products: { name: string } | null };
