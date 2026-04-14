import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "m@example.com" },
        password: { label: "Mật khẩu", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập đầy đủ email và mật khẩu.");
        }

        // Tìm người dùng trong DB (Prisma NextAuth User Model)
        // Nếu user đang xài Supabase, quá trình migrate Phase 05 sẽ copy từ auth.users sang đây
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        });

        if (!user || !user.passwordHash) {
          // Lưu ý: Nếu user migrate từ Supabase mà chưa được copy sang, login sẽ thất bại
          // Có thể add fallback query raw vào auth.users nếu vẫn dùng DB Supabase cũ
          throw new Error("Không tìm thấy người dùng hoặc bạn đã đăng nhập bằng Google/Facebook.");
        }

        // So sánh mật khẩu bằng bcrypt (Supabase brypt hashes thường tương thích với bcryptjs)
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Mật khẩu không chính xác.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    })
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        (session.user as any).id = token.sub as string;
        // Truyền role từ JWT ra ngoài Session để Frontend đọc
        (session.user as any).role = (token as any).role ?? "USER";
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      // Chỉ tra DB lấy role lúc user vừa đăng nhập (signIn)
      // Các lần sau đọc từ token cache — không tốn query DB
      if (trigger === "signIn" && user) {
        token.sub = user.id;
        // Lấy role từ DB
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        (token as any).role = dbUser?.role ?? "USER";
      }
      return token;
    }
  }
};
