"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/ToastProvider";
import { Input } from "@/components/form";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { TrashIcon } from "@/components/common/icons";
import { FORM_STYLES } from "@/src/config/ui";
import { slugify } from "@/src/lib/slugify";
import { combine, required, minLength, validateForm } from "@/src/lib/validators";

interface TrackedLink {
  id: string;
  slug: string;
  destinationUrl: string;
  label: string;
  active: boolean;
  createdAt: string;
  clickCount: number;
}

interface LinkClick {
  id: string;
  clickedAt: string;
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  referrer: string | null;
  ipAddress: string | null;
}

export default function LinksAdminPage() {
  const { showSuccess, showError } = useToast();
  const [links, setLinks] = useState<TrackedLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const [newLink, setNewLink] = useState({ label: "", slug: "", destinationUrl: "" });

  const validators = {
    label: combine(required("El nombre"), minLength(2, "El nombre")),
    slug: combine(required("El slug"), minLength(2, "El slug")),
    destinationUrl: required("La URL de destino"),
  };

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(
    null
  );

  const [selectedLink, setSelectedLink] = useState<TrackedLink | null>(null);
  const [clicks, setClicks] = useState<LinkClick[]>([]);
  const [clicksLoading, setClicksLoading] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/links");
      const data = await response.json();
      if (data.success) {
        setLinks(data.data);
      } else {
        showError(data.error || "Error al obtener los links");
      }
    } catch (err) {
      showError("Error al conectar con el servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleCreate = async () => {
    setSubmitAttempted(true);
    const errors = validateForm(newLink, validators);
    if (Object.keys(errors).length > 0) {
      showError("Revisa los campos marcados en rojo");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLink),
      });
      const data = await response.json();
      if (data.success) {
        await fetchLinks();
        showSuccess("¡Link creado exitosamente!");
        setNewLink({ label: "", slug: "", destinationUrl: "" });
        setSlugTouched(false);
        setSubmitAttempted(false);
      } else {
        showError(data.error || "Error al crear el link");
      }
    } catch (err) {
      showError("Error al guardar el link");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (link: TrackedLink) => {
    try {
      setLoading(true);
      const response = await fetch("/api/links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: link.id, active: !link.active }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchLinks();
      } else {
        showError(data.error || "Error al actualizar el link");
      }
    } catch (err) {
      showError("Error al actualizar el link");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/links", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchLinks();
        if (selectedLink?.id === id) setSelectedLink(null);
        showSuccess("¡Link eliminado exitosamente!");
      } else {
        showError(data.error || "Error al eliminar el link");
      }
    } catch (err) {
      showError("Error al eliminar el link");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClicks = async (link: TrackedLink) => {
    setSelectedLink(link);
    try {
      setClicksLoading(true);
      const response = await fetch(`/api/links/clicks?linkId=${link.id}`);
      const data = await response.json();
      if (data.success) {
        setClicks(data.data);
      } else {
        showError(data.error || "Error al obtener los clics");
      }
    } catch (err) {
      showError("Error al conectar con el servidor");
      console.error(err);
    } finally {
      setClicksLoading(false);
    }
  };

  const handleCopy = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(`${origin}/r/${slug}`);
      showSuccess("Link copiado al portapapeles");
    } catch (err) {
      showError("No se pudo copiar el link");
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Rastreo de Links</h1>
        <Link href="/adminMiTiendaSmart26" className="text-sm text-primary hover:underline">
          ← Volver al panel
        </Link>
      </div>

      <p className="text-sm text-muted mb-8 max-w-2xl">
        Crea un link corto para compartir en redes sociales. Cada vez que alguien
        lo abra, quedará registrado el momento, la ubicación aproximada (según
        su IP) y el dispositivo — sin identificar a la persona.
      </p>

      <div className={`bg-white rounded-lg shadow ${FORM_STYLES.cardPadding} mb-8`}>
        <h2 className="text-2xl font-bold mb-6">Nuevo Link</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Nombre interno"
            required
            value={newLink.label}
            validate={validators.label}
            forceTouched={submitAttempted}
            helperText='Ej: "Encuesta IG - lanzamiento app"'
            onChange={(label) => {
              setNewLink((prev) => ({
                ...prev,
                label,
                slug: slugTouched ? prev.slug : slugify(label),
              }));
            }}
          />
          <Input
            label="Slug (parte final de la URL)"
            required
            value={newLink.slug}
            validate={validators.slug}
            forceTouched={submitAttempted}
            helperText={origin ? `${origin}/r/${newLink.slug || "..."}` : undefined}
            onChange={(value) => {
              setSlugTouched(true);
              setNewLink((prev) => ({ ...prev, slug: slugify(value) }));
            }}
          />
        </div>
        <div className="mb-4">
          <Input
            label="URL de destino"
            required
            value={newLink.destinationUrl}
            validate={validators.destinationUrl}
            forceTouched={submitAttempted}
            helperText="El documento/página a la que se redirige, ej: link de Google Drive"
            onChange={(destinationUrl) => setNewLink((prev) => ({ ...prev, destinationUrl }))}
          />
        </div>
        <Button onClick={handleCreate} disabled={loading}>
          {loading ? "Guardando..." : "Crear Link"}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        {loading && links.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">Cargando links...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Link</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Clics</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{link.label}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <span>/r/{link.slug}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(link.slug)}
                        className="text-primary hover:underline"
                      >
                        Copiar
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleViewClicks(link)}
                      className="text-primary hover:underline font-semibold"
                    >
                      {link.clickCount}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(link)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        link.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {link.active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete({ id: link.id, label: link.label })}
                      disabled={loading}
                      aria-label="Eliminar link"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {links.length === 0 && !loading && (
          <div className="px-6 py-8 text-center text-gray-500">
            Aún no hay links. ¡Crea el primero!
          </div>
        )}
      </div>

      {selectedLink && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Visitas de &quot;{selectedLink.label}&quot;</h2>
            <button
              type="button"
              onClick={() => setSelectedLink(null)}
              className="text-sm text-gray-500 hover:underline"
            >
              Cerrar
            </button>
          </div>
          {clicksLoading ? (
            <div className="px-6 py-8 text-center text-gray-500">Cargando...</div>
          ) : clicks.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Todavía no hay visitas registradas para este link.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ubicación</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Dispositivo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Navegador</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Referente</th>
                  </tr>
                </thead>
                <tbody>
                  {clicks.map((click) => (
                    <tr key={click.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {new Date(click.clickedAt).toLocaleString("es-BO")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {[click.city, click.region, click.country].filter(Boolean).join(", ") ||
                          "Desconocida"}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">
                        {click.deviceType || "-"} / {click.os || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">{click.browser || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                        {click.referrer || "Directo"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Eliminar link"
        message={
          confirmDelete
            ? `¿Estás seguro de que deseas eliminar el link "${confirmDelete.label}"? Se perderá también el historial de visitas. Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (!confirmDelete) return;
          const { id } = confirmDelete;
          setConfirmDelete(null);
          await handleDelete(id);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
