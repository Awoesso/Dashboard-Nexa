import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Profile } from "@/types/profile";
import { UserAuth } from "@/Context/Authcontext";
import { getProfile } from "@/services/profileService";

type ProfileContextType = {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<
  ProfileContextType | undefined
>(undefined);

type ProfileProviderProps = {
  children: ReactNode;
};

export { ProfileContext };

export const ProfileProvider = ({
  children,
}: ProfileProviderProps) => {
  const { session, isLoading: authLoading } = UserAuth();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const requestSequence = useRef(0);

  const loadProfile = useCallback(async () => {
    const requestId = ++requestSequence.current;

    if (!session?.user?.id) {
      setProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getProfile(session.user.id);

      if (requestId !== requestSequence.current) return;

      if (result.error) {
        setError(result.error);
        setProfile(null);
      } else {
        setProfile(result.data);
      }
    } catch (profileError: unknown) {
      if (requestId !== requestSequence.current) return;

      setError(
        profileError instanceof Error
          ? profileError.message
          : "Impossible de charger votre profil."
      );
      setProfile(null);
    } finally {
      if (requestId === requestSequence.current) {
        setIsLoading(false);
      }
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    (async () => {
      await loadProfile();
    })();
  }, [authLoading, loadProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        refreshProfile: loadProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};