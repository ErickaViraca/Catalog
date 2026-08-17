import { redirect } from "next/navigation";
import { auth, signIn } from "@/src/lib/auth";
import { XiaomiLogo } from "@/components/common/XiaomiLogo";
import { Button } from "@/components/common/Button";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session) {
    redirect("/adminMiTiendaSmart26");
  }

  const { error, callbackUrl } = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <XiaomiLogo size={48} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-muted text-sm mb-6">
          Inicia sesión con tu cuenta de Google autorizada para administrar la
          tienda.
        </p>

        {error === "AccessDenied" && (
          <div className="bg-danger-bg border border-danger-border text-danger text-sm rounded-lg px-4 py-3 mb-6">
            Tu cuenta de Google no está autorizada para acceder al panel.
          </div>
        )}
        {error && error !== "AccessDenied" && (
          <div className="bg-danger-bg border border-danger-border text-danger text-sm rounded-lg px-4 py-3 mb-6">
            Ocurrió un error al iniciar sesión. Intenta de nuevo.
          </div>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl || "/adminMiTiendaSmart26" });
          }}
        >
          <Button type="submit" size="lg" className="w-full">
            Iniciar sesión con Google
          </Button>
        </form>
      </div>
    </div>
  );
}
