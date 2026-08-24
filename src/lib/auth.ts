import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User, { UserRole } from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                await connectDB();
                try {
                  const { seedStenoInstituteAccountAction } = await import("@/app/actions/steno");
                  await seedStenoInstituteAccountAction();
                } catch (e) {}

                const normalizedEmail = credentials.email.trim().toLowerCase();
                const user = await User.findOne({ email: normalizedEmail })
                    .select("name email password role isActive image");

                if (!user || !user.password) {
                    throw new Error("Invalid Credentials");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid Credentials");
                }

                if (!user.isActive) {
                    throw new Error("ACCOUNT_PENDING_APPROVAL");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                };
            },
        }),
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
          ? [
              GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              }),
            ]
          : []),
    ],
    callbacks: {
        async signIn({ user, account }) {
          if (account?.provider === "google") {
            try {
              await connectDB();
              const existingUser = await User.findOne({ email: user.email?.toLowerCase() });
              if (!existingUser) {
                const newUser = await User.create({
                  name: user.name || "Google User",
                  email: user.email?.toLowerCase(),
                  image: user.image,
                  role: UserRole.STUDENT,
                  isActive: true,
                });
                (user as any).id = newUser._id.toString();
                (user as any).role = newUser.role;
              } else {
                if (!existingUser.isActive) {
                  return false;
                }
                (user as any).id = existingUser._id.toString();
                (user as any).role = existingUser.role;
                (user as any).image = existingUser.image || user.image;
              }
            } catch (err) {
              console.error("Google Sign-In DB Sync Error:", err);
              return false;
            }
          }
          return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || "STUDENT";
                token.name = user.name;
                token.image = (user as any).image;
            }
            if (trigger === "update") {
                if (session?.name) token.name = session.name;
                if (session?.image) token.image = session.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = (token.role as UserRole) || UserRole.STUDENT;
                session.user.name = token.name as string;
                session.user.image = token.image as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/student/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    logger: {
        error(code, metadata) {
            if (code === "JWT_SESSION_ERROR") {
                return;
            }
            console.error(code, metadata);
        },
        warn(code) {},
    },
};
