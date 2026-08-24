const now = new Date();

// Categorías, marcas y productos ya se leen de la DB real (ver /shop,
// Inicio y /products/[slug]) — el mock de banners queda porque esa
// tabla todavía no está en uso (tab "Banners" oculto en el admin).
export const mockBanners = [
  {
    id: "banner-1",
    title: "Summer Mega Sale",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=300&fit=crop",
    link: "/shop",
    order: 1,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "banner-2",
    title: "New Collection",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=300&fit=crop",
    link: "/shop",
    order: 2,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
];
