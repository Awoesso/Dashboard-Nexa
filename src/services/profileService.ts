import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/profile";

const loadProfileRow = async (userId: string) => {
  return supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
};

const isFutureIssuedJwtError = (error: {
  message: string;
  details?: string | null;
  hint?: string | null;
}) => `${error.message} ${error.details ?? ""} ${error.hint ?? ""}`
  .toLowerCase()
  .includes("jwt issued at future");

export const getProfile = async (
  userId: string,
): Promise<{
  data: Profile | null;
  error: string | null;
}> => {
  let { data, error } = await loadProfileRow(userId);

  if (error && isFutureIssuedJwtError(error)) {
    const { data: refreshedSession, error: refreshError } =
      await supabase.auth.refreshSession();

    if (refreshError || !refreshedSession.session) {
      return {
        data: null,
        error: refreshError?.message ?? error.message,
      };
    }

    ({ data, error } = await loadProfileRow(userId));
  }

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data,
    error: null,
  };
};
