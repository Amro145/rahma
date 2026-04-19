import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://backend.amroaltayeb14.workers.dev",
  plugins: [
    organizationClient()
  ]
});

export const { signIn, signUp, signOut, useSession, organization } = authClient;
