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
    const ADMIN_BASE_URL = (
      Deno.env.get("ADMIN_BASE_URL") || "https://alpha-rktkejilu-mouaadh-s-projects1.vercel.app"
    ).replace(/\/$/, "");

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
    const escapeHtml = (value: unknown) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    const orderDate = new Date(order.created_at).toLocaleDateString("fr-DZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const deliveryType = (order.notes ?? "").toLowerCase().includes("domicile")
      ? "A domicile"
      : "Bureau";

    const itemsRows = (items ?? [])
      .map(
        (i) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;">
            ${escapeHtml(i.product_name)}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">${i.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;color:#111827;">${formatDA(i.line_total_da)}</td>
        </tr>`,
      )
      .join("");

    const itemsText = (items ?? [])
      .map((i) => `- ${i.product_name} x${i.quantity}: ${formatDA(i.line_total_da)}`)
      .join("\n");

    const text = [
      `Nouvelle commande Alpha Store #${order.order_number}`,
      "",
      `Client: ${order.full_name}`,
      `Telephone: ${order.phone}`,
      `Wilaya: ${order.wilaya}`,
      `Commune: ${order.commune}`,
      `Livraison: ${deliveryType}`,
      order.notes ? `Notes: ${order.notes}` : null,
      "",
      "Produits:",
      itemsText,
      "",
      `Total: ${formatDA(order.total_da)}`,
      `Admin: ${ADMIN_BASE_URL}/admin/orders/${order.id}`,
      "",
      `Commande du ${orderDate}`,
    ]
      .filter(Boolean)
      .join("\n");

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px;">
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
      <h1 style="margin:0 0 6px;font-size:22px;line-height:1.25;color:#111827;">Nouvelle commande Alpha Store</h1>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Commande #${escapeHtml(order.order_number)} - ${orderDate}</p>

      <h2 style="margin:0 0 10px;font-size:16px;color:#111827;">Client</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:22px;">
        <tr><td style="padding:4px 0;color:#6b7280;width:120px;">Nom</td><td style="padding:4px 0;color:#111827;">${escapeHtml(order.full_name)}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Telephone</td><td style="padding:4px 0;color:#111827;">${escapeHtml(order.phone)}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Wilaya</td><td style="padding:4px 0;color:#111827;">${escapeHtml(order.wilaya)}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Commune</td><td style="padding:4px 0;color:#111827;">${escapeHtml(order.commune)}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Livraison</td><td style="padding:4px 0;color:#111827;">${escapeHtml(deliveryType)}</td></tr>
        ${order.notes ? `<tr><td style="padding:4px 0;color:#6b7280;">Notes</td><td style="padding:4px 0;color:#111827;">${escapeHtml(order.notes)}</td></tr>` : ""}
      </table>

      <h2 style="margin:0 0 10px;font-size:16px;color:#111827;">Produits</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:18px;">
        <thead>
          <tr>
            <th style="padding:0 0 8px;text-align:left;color:#6b7280;font-size:12px;">Produit</th>
            <th style="padding:0 0 8px;text-align:center;color:#6b7280;font-size:12px;">Qte</th>
            <th style="padding:0 0 8px;text-align:right;color:#6b7280;font-size:12px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <div style="border-top:2px solid #111827;padding-top:14px;margin-bottom:22px;">
        <p style="margin:0;text-align:right;font-size:18px;font-weight:700;color:#111827;">Total: ${formatDA(order.total_da)}</p>
      </div>

      <a href="${ADMIN_BASE_URL}/admin/orders/${order.id}"
         style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:700;font-size:14px;">
        Voir la commande
      </a>
      <p style="margin:22px 0 0;color:#9ca3af;font-size:12px;">Alpha Store - notification automatique de commande.</p>
    </div>
  </div>
</body>
</html>`;

    const missingConfig = [
      isMissingEmailConfig(RESEND_API_KEY) ? "RESEND_API_KEY" : null,
      isMissingEmailConfig(ADMIN_EMAIL) ? "ADMIN_EMAIL" : null,
    ].filter(Boolean);

    if (missingConfig.length > 0) {
      console.warn("send-order-email skipped: missing config:", missingConfig.join(", "));
      return jsonResponse({
        success: true,
        email_sent: false,
        skipped: true,
        reason: `Missing email config: ${missingConfig.join(", ")}`,
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
        subject: `Nouvelle commande Alpha Store #${order.order_number}`,
        text,
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
        provider_status: resendRes.status,
        provider_response: resendData,
      });
    }

    return jsonResponse({
      success: true,
      email_sent: true,
      email_id:
        typeof resendData === "object" && resendData && "id" in resendData ? resendData.id : null,
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
