import Link from "next/link";
import { auth, signOut } from "@/src/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div>
      <div className="bg-gray-100 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-muted">
            Sesión iniciada como <strong>{session?.user?.email}</strong>
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/adminMiTiendaSmart26/links"
              className="text-sm text-primary hover:underline"
            >
              Rastreo de Links
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="text-sm text-danger hover:underline">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
