import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) {
    return jsonResponse(401, { error: "Authentication required" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: "Invalid request body" });
  }
  if (
    !body ||
    typeof body !== "object" ||
    (body as { confirmation?: unknown }).confirmation !== "SUPPRIMER MON COMPTE"
  ) {
    return jsonResponse(400, { error: "Confirmation phrase does not match" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(500, { error: "Server configuration is incomplete" });
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return jsonResponse(401, { error: "Invalid or expired session" });
  }
  const userEmail = authData.user.email;

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(authData.user.id);
  if (deleteError) {
    return jsonResponse(409, {
      error: "Account could not be deleted. Related business data may require review.",
    });
  }

  let avatarCleanup = "complete";
  const { data: avatarObjects, error: listError } = await adminClient.storage
    .from("avatars")
    .list(authData.user.id, { limit: 1000 });

  if (listError) {
    avatarCleanup = "incomplete";
  } else if (avatarObjects.length > 0) {
    const paths = avatarObjects.map((object) => `${authData.user.id}/${object.name}`);
    const { error: removeError } = await adminClient.storage.from("avatars").remove(paths);
    if (removeError) avatarCleanup = "incomplete";
  }

  let farewellEmailSent = false;
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("ACCOUNT_DELETION_FROM_EMAIL");
  if (resendApiKey && fromEmail && userEmail) {
    try {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [userEmail],
          subject: "Confirmation de suppression de votre compte",
          text: "Votre compte a été supprimé. Les boutiques et données de commande nécessaires à la continuité commerciale ont été archivées conformément à notre politique de conservation.",
        }),
      });
      farewellEmailSent = emailResponse.ok;
    } catch {
      farewellEmailSent = false;
    }
  }

  return jsonResponse(200, {
    success: true,
    archivedStore: true,
    avatarCleanup,
    farewellEmailSent,
  });
});
