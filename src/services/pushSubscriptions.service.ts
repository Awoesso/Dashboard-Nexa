import { supabase } from "@/lib/supabase";

/* ============================================================================
   TYPES
============================================================================ */

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
  updated_at: string;
}

interface BrowserPushSubscriptionJSON {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
}

/* ============================================================================
   SAVE / UPDATE
============================================================================ */

export const savePushSubscription = async (
  subscription: PushSubscription
): Promise<PushSubscriptionRecord> => {
  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Utilisateur non connecté."
    );
  }

  const json =
    subscription.toJSON() as BrowserPushSubscriptionJSON;

  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    throw new Error(
      "Push Subscription invalide."
    );
  }

  const { data, error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict: "endpoint",
      }
    )
    .select(`
      id,
      user_id,
      endpoint,
      p256dh,
      auth,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    throw new Error(
      `Impossible d'enregistrer la Push Subscription : ${error.message}`
    );
  }

  return data as PushSubscriptionRecord;
};

/* ============================================================================
   DELETE
============================================================================ */

export const deletePushSubscription =
  async (
    subscription: PushSubscription
  ): Promise<void> => {
    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const json =
      subscription.toJSON() as BrowserPushSubscriptionJSON;

    const endpoint = json.endpoint;

    if (!endpoint) {
      return;
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(
        `Impossible de supprimer la Push Subscription : ${error.message}`
      );
    }
  };