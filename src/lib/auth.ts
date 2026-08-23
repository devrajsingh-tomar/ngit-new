import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
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
                session.user.role = token.role as UserRole;
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
                // Silently ignore: Usually a stale cookie from changing NEXTAUTH_SECRET in development
                return;
            }
            console.error(code, metadata);
        },
        warn(code) {},
    },
};
