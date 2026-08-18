export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          icon: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          icon?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          icon?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      page_views: {
        Row: {
          created_at: string;
          device_type: string;
          id: string;
          path: string;
          referrer: string | null;
          session_id: string;
        };
        Insert: {
          created_at?: string;
          device_type?: string;
          id?: string;
          path: string;
          referrer?: string | null;
          session_id: string;
        };
        Update: {
          created_at?: string;
          device_type?: string;
          id?: string;
          path?: string;
          referrer?: string | null;
          session_id?: string;
        };
        Relationships: [];
      };
      activity_events: {
        Row: {
          created_at: string;
          event_name: string;
          id: string;
          metadata: Json;
          path: string;
          session_id: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          event_name: string;
          id?: string;
          metadata?: Json;
          path: string;
          session_id: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          event_name?: string;
          id?: string;
          metadata?: Json;
          path?: string;
          session_id?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      admin_audit_log: {
        Row: {
          action: string;
          actor_user_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          metadata: Json;
          target_user_id: string | null;
        };
        Insert: {
          action: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          metadata?: Json;
          target_user_id?: string | null;
        };
        Update: {
          action?: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          metadata?: Json;
          target_user_id?: string | null;
        };
        Relationships: [];
      };
      unit_balances: {
        Row: {
          balance: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          balance?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          balance?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      unit_topups: {
        Row: {
          created_at: string;
          exchange_rate: number;
          id: string;
          mmk_amount: number;
          payment_method: string;
          payment_screenshot_url: string | null;
          rejection_reason: string | null;
          status: string;
          transaction_note: string;
          unit_amount: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          exchange_rate?: number;
          id?: string;
          mmk_amount: number;
          payment_method: string;
          payment_screenshot_url?: string | null;
          rejection_reason?: string | null;
          status?: string;
          transaction_note: string;
          unit_amount: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          exchange_rate?: number;
          id?: string;
          mmk_amount?: number;
          payment_method?: string;
          payment_screenshot_url?: string | null;
          rejection_reason?: string | null;
          status?: string;
          transaction_note?: string;
          unit_amount?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      unit_transactions: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          mmk_amount: number | null;
          reference_id: string | null;
          type: string;
          user_id: string;
          usd_amount: number | null;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          mmk_amount?: number | null;
          reference_id?: string | null;
          type: string;
          user_id: string;
          usd_amount?: number | null;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          mmk_amount?: number | null;
          reference_id?: string | null;
          type?: string;
          user_id?: string;
          usd_amount?: number | null;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          created_at: string;
          id: string;
          payment_method: string;
          payment_screenshot_url: string | null;
          product_id: string;
          quantity: number;
          rejection_reason: string | null;
          status: string;
          stock_item_id: string | null;
          total_price: number;
          transaction_note: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          payment_method: string;
          payment_screenshot_url?: string | null;
          product_id: string;
          quantity?: number;
          rejection_reason?: string | null;
          status?: string;
          stock_item_id?: string | null;
          total_price?: number;
          transaction_note?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          payment_method?: string;
          payment_screenshot_url?: string | null;
          product_id?: string;
          quantity?: number;
          rejection_reason?: string | null;
          status?: string;
          stock_item_id?: string | null;
          total_price?: number;
          transaction_note?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_stock_item_id_fkey";
            columns: ["stock_item_id"];
            isOneToOne: false;
            referencedRelation: "stock_items";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category_id: string | null;
          created_at: string;
          description: string;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          price: number;
          what_you_get: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          price?: number;
          what_you_get?: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          price?: number;
          what_you_get?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      stock_items: {
        Row: {
          created_at: string;
          credential_data: string;
          id: string;
          product_id: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          credential_data: string;
          id?: string;
          product_id: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          credential_data?: string;
          id?: string;
          product_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stock_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_stats: { Args: never; Returns: Json };
      approve_unit_topup: {
        Args: { p_topup_id: string };
        Returns: {
          new_balance: number;
          topup_id: string;
        }[];
      };
      reject_unit_topup: {
        Args: { p_reason?: string; p_topup_id: string };
        Returns: undefined;
      };
      purchase_with_units: {
        Args: { p_product_id: string };
        Returns: {
          new_balance: number;
          order_id: string;
        }[];
      };
      approve_order: {
        Args: { p_order_id: string };
        Returns: {
          order_id: string;
          stock_item_id: string;
        }[];
      };
      get_stock_counts: {
        Args: never;
        Returns: {
          available_count: number;
          product_id: string;
        }[];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "customer" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "admin"],
    },
  },
} as const;
