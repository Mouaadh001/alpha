import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const uuid = z.object({ id: z.string().uuid() });

export const getOrderById = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => uuid.parse(data))
  .handler(async ({ data }) => {
    const supabasePublic = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
    const { data: order, error } = await supabasePublic
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!order) return null;
    const { data: items, error: e2 } = await supabasePublic
      .from("order_items")
      .select("*")
      .eq("order_id", data.id);
    if (e2) throw e2;
    return { order, items: items ?? [] };
  });
