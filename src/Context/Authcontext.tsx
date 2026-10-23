import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rateLimiting";

interface AuthResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;

  signUpNewUser: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<AuthResponse>;
  verifySignupOtp: (email: string, token: string) => Promise<AuthResponse>;
  resendSignupOtp: (email: string) => Promise<AuthResponse>;
  signInWithOAuth: (provider: "google") => Promise<AuthResponse>;
  requestPasswordReset: (email: string) => Promise<AuthResponse>;
  updatePassword: (password: string) => Promise<AuthResponse>;
  signOutOtherSessions: () => Promise<AuthResponse>;

  signInUser: (
    email: string,
    password: string
  ) => Promise<AuthResponse>;

  signOut: () => Promise<void>;
};

const Authcontext = createContext<AuthContextType | undefined>(
  undefined
);

type AuthcontextProviderProps = {
  children: ReactNode;
};

export const AuthcontextProvider = ({
  children,
}: AuthcontextProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // =========================
  // SIGN UP
  // =========================

  const signUpNewUser = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResponse> => {
    try {
      const cleanEmail = email.trim();
      const cleanFirstName = firstName.trim();
      const cleanLastName = lastName.trim();

      // Rate limiting
      const rateLimitResult = rateLimit(
        `signup-${cleanEmail}`,
        3,
        60000
      );

      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: `Too many signup attempts. Please try again in ${rateLimitResult.waitSeconds} seconds.`,
        };
      }

      // Create Supabase account
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            first_name: cleanFirstName,
            last_name: cleanLastName,
          },
        },
      });

      // Supabase error
      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Signup error:", error);
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during signup.",
      };
    }
  };

  const verifySignupOtp = async (
    email: string,
    token: string,
  ): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: "signup",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to verify this code.",
      };
    }
  };

  const resendSignupOtp = async (email: string): Promise<AuthResponse> => {
    try {
      const cleanEmail = email.trim();
      const rateLimitResult = rateLimit(`resend-signup-${cleanEmail}`, 3, 60000);

      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: `Too many requests. Try again in ${rateLimitResult.waitSeconds} seconds.`,
        };
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
      });

      return error
        ? { success: false, error: error.message }
        : { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to resend the code.",
      };
    }
  };

  const signInWithOAuth = async (
    provider: "google",
  ): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });

      return error
        ? { success: false, error: error.message }
        : { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to start sign-in.",
      };
    }
  };

  const requestPasswordReset = async (email: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` },
      );

      return error
        ? { success: false, error: error.message }
        : { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to request a reset.",
      };
    }
  };

  const updatePassword = async (password: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        return { success: false, error: error.message };
      }

      const { error: revokeError } = await supabase.auth.signOut({ scope: "others" });
      return revokeError
        ? { success: false, error: "Mot de passe changé, mais les autres sessions n'ont pas pu être révoquées." }
        : { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to update the password.",
      };
    }
  };

  const signOutOtherSessions = async (): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "others" });
      return error
        ? { success: false, error: error.message }
        : { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to revoke other sessions.",
      };
    }
  };

  // =========================
  // SIGN IN
  // =========================

  const signInUser = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const cleanEmail = email.trim();

      // Rate limiting
      const rateLimitResult = rateLimit(
        `signin-${cleanEmail}`,
        5,
        60000
      );

      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: `Too many login attempts. Please try again in ${rateLimitResult.waitSeconds} seconds.`,
        };
      }

      // Login
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      // Supabase error
      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Signin error:", error);
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during signin.",
      };
    }
  };

  // =========================
  // SESSION
  // =========================

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setSession(session);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(
            "Error fetching session:",
            error
          );
        }

        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =========================
  // SIGN OUT
  // =========================

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setSession(null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "Error signing out:",
          error
        );
      }

      throw error;
    }
  };

  // =========================
  // PROVIDER
  // =========================

  return (
    <Authcontext.Provider
      value={{
        session,
        isLoading,
        signUpNewUser,
        verifySignupOtp,
        resendSignupOtp,
        signInWithOAuth,
        requestPasswordReset,
        updatePassword,
        signOutOtherSessions,
        signInUser,
        signOut,
      }}
    >
      {children}
    </Authcontext.Provider>
  );
};

// =========================
// USER AUTH
// =========================

export const UserAuth = () => {
  const context = useContext(Authcontext);

  if (!context) {
    throw new Error(
      "UserAuth must be used within AuthcontextProvider"
    );
  }

  return context;
};