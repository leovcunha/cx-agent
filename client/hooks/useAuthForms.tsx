import { useCallback, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const useEmailPasswordLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setIsLoading(true);
      setError(null);

      try {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) {
          throw loginError;
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password]
  );

  return {
    email,
    password,
    error,
    isLoading,
    setEmail,
    setPassword,
    handleLogin,
  };
};

export const useEmailPasswordSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError(null);
      setWarning(null);

      if (password !== repeatPassword) {
        setError("Passwords do not match");
        return;
      }
      if (!businessName) {
        setError("Business Name is required");
        return;
      }
      setIsLoading(true);

      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          throw signUpError;
        }

        const user = data?.user;
        if (user) {
          let emailVerified = false;
          if (user.user_metadata && user.user_metadata.email_verified === false) {
            emailVerified = false;
          } else if (
            user.identities &&
            user.identities.length > 0 &&
            user.identities[0].identity_data &&
            user.identities[0].identity_data.email_verified === false
          ) {
            emailVerified = false;
          } else {
            emailVerified = true;
          }

          if (emailVerified === true) {
            setWarning("This email is already registered. Please log in or reset your password instead.");
            return;
          }

          // Create the business profile
          const { error: bizError } = await supabase.from("businesses").insert({
            id: user.id,
            name: businessName,
            description: businessDescription,
          });

          if (bizError) {
            console.error("Error creating business profile on signup:", bizError);
            throw bizError;
          }
        }

        setSuccess(true);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, repeatPassword, businessName, businessDescription]
  );

  return {
    email,
    password,
    repeatPassword,
    businessName,
    businessDescription,
    error,
    warning,
    success,
    isLoading,
    setEmail,
    setPassword,
    setRepeatPassword,
    setBusinessName,
    setBusinessDescription,
    handleSignUp,
  };
};

export const useForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setIsLoading(true);
      setError(null);

      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: "http://localhost:3000/update-password",
        });
        if (resetError) {
          throw resetError;
        }
        setSuccess(true);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [email]
  );

  return {
    email,
    error,
    success,
    isLoading,
    setEmail,
    handleForgotPassword,
  };
};

export const useUpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setIsLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) {
          throw updateError;
        }
        location.href = "/protected";
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [password]
  );

  return {
    password,
    error,
    isLoading,
    setPassword,
    handleUpdatePassword,
  };
};

export const useOAuthLogin = () => {
  const handleGoogleLogin = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }, []);

  return { handleGoogleLogin };
};
