import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET, 
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      async authorize() {
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

      if (isApiAuth) return true;

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/words", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
};
