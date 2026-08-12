import { NextResponse } from "next/server";
import { auth } from "./auth";

// Devuelve null si hay sesión válida; si no, la respuesta 401 lista para
// retornar. Defensa en profundidad: proxy.ts ya bloquea las escrituras sin
// sesión, pero cada handler vuelve a verificar por sí mismo — si mañana se
// agrega una ruta nueva y se olvida el matcher del proxy, o el matcher se
// rompe en un refactor, la API sigue protegida igual.
export async function requireAuth(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }
  return null;
}
