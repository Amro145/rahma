import { createAuthClient } from "better-auth/react";
import { organizationClient, inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://backend.amroaltayeb14.workers.dev",
  plugins: [
    organizationClient(),
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          defaultValue: "student",
          required: false,
        },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession, organization } = authClient;

/** Typed user shape including the custom `role` RBAC field */
export interface UserWithRole {
    id: string;
    email: string;
    name: string;
    role: "admin" | "student";
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
