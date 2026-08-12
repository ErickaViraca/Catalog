import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Emails autorizados a acceder al admin, separados por coma en la env var.
// Ej: ADMIN_EMAILS="duena@gmail.com,socio@gmail.com"
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

if (adminEmails.length === 0) {
  console.error("ERROR: ADMIN_EMAILS environment variable not set — nadie podrá iniciar sesión");
}

// IMPORTANTE: este módulo lo importa proxy.ts (que puede correr en Edge
// runtime), así que no debe importar el cliente de DB ni nada de Node-only.
// Sesión vía JWT en cookie firmada — no se necesitan tablas en la DB.
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Google autentica a cualquiera con cuenta de Google; acá decidimos
    // quién está AUTORIZADO: solo los emails de la lista entran.
    signIn({ user }) {
      const email = user.email?.toLowerCase() ?? "";
      return adminEmails.includes(email);
    },
    // El rol viaja en el token — hoy todo el que entra es "admin";
    // si mañana hay más roles, este es el único lugar a extender.
    jwt({ token }) {
      token.role = "admin";
      return token;
    },
  },
});
