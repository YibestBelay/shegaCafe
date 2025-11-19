import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const email = user.email ?? undefined;
      if (!email) return false;

      // 1️⃣ Check if user exists and role is 'waiter'
      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) {
        return false;
      }
      // if (dbUser.role !== "waiter") {
      //   return false;
      // }

      // 2️⃣ Automatically create/link OAuth account if it doesn't exist
      if (!account) {
        return false;
      }
      const existingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
      });

      if (!existingAccount) {
        await prisma.account.create({
          data: {
            userId: dbUser.id,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            type: account.type,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
          },
        });
        
      }

      return true;
    },

    async session({ session }) {
      const email = session.user?.email ?? undefined;
      if (!email) return session;

      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (dbUser) session.user.role = dbUser.role;

      return session;
    },
  },
 
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
