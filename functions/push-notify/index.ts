import webpush from "npm:web-push";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PushRequest = {
  userId?: string;
  message?: string;
};

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { userId, message } = await request.json() as PushRequest;
  if (!userId || !message) {
    return new Response(JSON.stringify({ error: "Missing userId or message" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const subject = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@example.com";
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");

  if (!publicKey || !privateKey) {
    return new Response(JSON.stringify({ error: "Missing VAPID keys" }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase service credentials" }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("subscription")
    .eq("user_id", userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }

  const results = await Promise.allSettled((data || []).map((row) => (
    webpush.sendNotification(row.subscription, JSON.stringify({ userId, message }))
  )));

  return new Response(JSON.stringify({ ok: true, sent: results.filter((item) => item.status === "fulfilled").length }), {
    headers: { "content-type": "application/json" }
  });
});
