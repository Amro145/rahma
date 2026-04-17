import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://backend.amroaltayeb14.workers.dev",
});

export const { signIn, signUp, signOut, useSession } = authClient;
