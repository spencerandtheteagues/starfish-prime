import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { NextResponse } from "next/server";

const handler = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Github({ clientId: process.env.GITHUB_ID || "", clientSecret: process.env.GITHUB_SECRET || "" }),
    Google({ clientId: process.env.GOOGLE_CLIENT_ID || "", clientSecret: process.env.GOOGLE_CLIENT_SECRET || "" })
  ],
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };
