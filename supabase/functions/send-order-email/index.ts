import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isMissingEmailConfig = (value: string | null | undefined) =>
  !value || value.includes("YOUR_") || value === "your@email.com";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { order_id } = await req.json();
    if (!order_id) throw new Error("order_id is required");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Alpha Store <onboarding@resend.dev>";
    const ADMIN_BASE_URL = (Deno.env.get("ADMIN_BASE_URL") || "https://alpha-rktkejilu-mouaadh-s-projects1.vercel.app").replace(/\/$/, "");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase service credentials are not configured");
    }

    // Fetch order + items via service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();
    if (orderErr || !order) throw new Error(`Order not found: ${orderErr?.message}`);

    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order_id);
    if (itemsErr) throw new Error(`Items error: ${itemsErr?.message}`);

    const formatDA = (n: number) => `${n.toLocaleString("fr-DZ")} DA`;

    const itemsRows = (items ?? [])
      .map(
        (i) => `
        <tr style="border-bottom:1px solid #2a2a3a;">
          <td style="padding:12px 8px;color:#e2e0ff;">
            ${i.product_name}${i.variant ? ` <span style="color:#a78bfa;font-size:12px;">(${i.variant})</span>` : ""}
          </td>
          <td style="padding:12px 8px;text-align:center;color:#a0a0b0;">${i.quantity}</td>
          <td style="padding:12px 8px;text-align:right;color:#e2e0ff;font-family:monospace;">${formatDA(i.unit_price_da)}</td>
          <td style="padding:12px 8px;text-align:right;color:#c4b5fd;font-weight:700;font-family:monospace;">${formatDA(i.line_total_da)}</td>
        </tr>`
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#070711;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a0a2e 0%,#12082a 100%);border:1px solid #2a1f4a;border-radius:16px;padding:28px 32px;margin-bottom:24px;text-align:center;">
      <div style="font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#fff;margin-bottom:4px;">
        ALPHA<span style="color:#a855f7;">.</span>STORE
      </div>
      <div style="color:#a78bfa;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Nouvelle commande reçue 🎉</div>
    </div>

    <!-- Order badge -->
    <div style="background:#0f0a1e;border:1px solid #2a1f4a;border-radius:12px;padding:20px 24px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="color:#6b6b8a;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Numéro de commande</div>
        <div style="color:#fff;font-size:22px;font-weight:800;font-family:monospace;">#${order.order_number}</div>
      </div>
      <div style="background:#a855f7;color:#fff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px;text-transform:uppercase;letter-spacing:1px;">
        En attente
      </div>
    </div>

    <!-- Customer info -->
    <div style="background:#0f0a1e;border:1px solid #2a1f4a;border-radius:12px;padding:20px 24px;margin-bottom:16px;">
      <div style="color:#a78bfa;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:14px;">👤 Informations client</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:5px 0;color:#6b6b8a;font-size:13px;width:120px;">Nom</td>
          <td style="padding:5px 0;color:#e2e0ff;font-weight:600;">${order.full_name}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;color:#6b6b8a;font-size:13px;">Téléphone</td>
          <td style="padding:5px 0;color:#e2e0ff;font-weight:600;">${order.phone}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;color:#6b6b8a;font-size:13px;">Wilaya</td>
          <td style="padding:5px 0;color:#e2e0ff;font-weight:600;">${order.wilaya}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;color:#6b6b8a;font-size:13px;">Commune</td>
          <td style="padding:5px 0;color:#e2e0ff;font-weight:600;">${order.commune}</td>
        </tr>
        ${order.notes ? `<tr><td style="padding:5px 0;color:#6b6b8a;font-size:13px;">Notes</td><td style="padding:5px 0;color:#a78bfa;font-size:13px;">${order.notes}</td></tr>` : ""}
      </table>
    </div>

    <!-- Order items -->
    <div style="background:#0f0a1e;border:1px solid #2a1f4a;border-radius:12px;overflow:hidden;margin-bottom:16px;">
      <div style="padding:16px 24px;border-bottom:1px solid #2a1f4a;">
        <div style="color:#a78bfa;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">🛍️ Produits commandés</div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#0a0718;">
            <th style="padding:10px 8px;text-align:left;color:#6b6b8a;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Produit</th>
            <th style="padding:10px 8px;text-align:center;color:#6b6b8a;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Qté</th>
            <th style="padding:10px 8px;text-align:right;color:#6b6b8a;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Prix unit.</th>
            <th style="padding:10px 8px;text-align:right;color:#6b6b8a;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <!-- Totals -->
      <div style="padding:16px 24px;border-top:1px solid #2a1f4a;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#6b6b8a;font-size:13px;">Sous-total</span>
          <span style="color:#e2e0ff;font-family:monospace;">${formatDA(order.subtotal_da)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:1px solid #2a1f4a;">
          <span style="color:#fff;font-weight:800;font-size:16px;">TOTAL</span>
          <span style="color:#a855f7;font-family:monospace;font-weight:800;font-size:18px;">${formatDA(order.total_da)}</span>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${ADMIN_BASE_URL}/admin/orders/${order.id}"
         style="display:inline-block;background:#a855f7;color:#fff;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:700;font-size:14px;letter-spacing:0.5px;">
        Voir dans l'admin →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#3d3d5a;font-size:12px;">
      Alpha Store — Algérie • Commande du ${new Date(order.created_at).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
    </div>
  </div>
</body>
</html>`;

    if (isMissingEmailConfig(RESEND_API_KEY) || isMissingEmailConfig(ADMIN_EMAIL)) {
      console.warn("send-order-email skipped: email provider is not configured");
      return jsonResponse({
        success: true,
        email_sent: false,
        skipped: true,
        reason: "Email provider is not configured",
      });
    }

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: `🛍️ Nouvelle commande #${order.order_number} — ${order.full_name} (${order.wilaya})`,
        html,
      }),
    });

    let resendData: unknown = null;
    try {
      resendData = await resendRes.json();
    } catch {
      resendData = await resendRes.text().catch(() => null);
    }

    if (!resendRes.ok) {
      console.error("Resend rejected the order email:", resendData);
      return jsonResponse({
        success: true,
        email_sent: false,
        warning: "Email provider rejected the message",
      });
    }

    return jsonResponse({
      success: true,
      email_sent: true,
      email_id: typeof resendData === "object" && resendData && "id" in resendData ? resendData.id : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("send-order-email error:", message);
    return jsonResponse({
      success: false,
      email_sent: false,
      error: message,
    });
  }
});
