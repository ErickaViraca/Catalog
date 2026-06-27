# SmartCatalog - Ecommerce Platform

Modern ecommerce catalog built with Next.js 15, TypeScript, TailwindCSS, and Prisma ORM.

> 🇪🇸 **Estado**: Traducción al español en progreso

## 🚀 Features

- **Home Page**: Hero banner, featured categories, featured products
- **Shop Page**: Product grid with category filters, search, and sorting
- **Product Details**: Product gallery, specifications, stock tracking
- **Admin Panel**: CRUD operations for products, categories, and banners
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Type-Safe**: Full TypeScript support
- **Database Ready**: Prisma ORM with SQLite (dev) and PostgreSQL (production)

## 📋 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS
- **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (production)
- **Deployment**: Vercel

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo>
cd catalog-app
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env.local
```

4. Create database tables:
```bash
npx prisma migrate dev --name init
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Pages

- **Home** (`/`): Landing page with featured products
- **Shop** (`/shop`): Product catalog with filters
- **Product Details** (`/products/[slug]`): Individual product page
- **Admin** (`/admin`): Management panel for products, categories, banners

## 🗄️ Database Schema

### Category
- id, name, slug, image, createdAt, updatedAt

### Product
- id, name, slug, description, price, stock, images, categoryId
- Relations: Many-to-One with Category

### Banner
- id, title, image, link, order, active, createdAt, updatedAt

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variable in Vercel:
   ```
   DATABASE_URL=<your-neon-postgresql-url>
   ```
4. Deploy

### Using Neon Database

1. Create account at [neon.tech](https://neon.tech)
2. Create a PostgreSQL database
3. Copy the connection string
4. Add to Vercel environment variables

## 📝 Development

### Generate Prisma Client after schema changes:
```bash
npx prisma generate
```

### View database with Prisma Studio:
```bash
npx prisma studio
```

## 📖 Project Structure

```
catalog-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── admin/             # Admin pages
│   ├── shop/              # Shop page
│   └── products/          # Product details page
├── components/            # React components
│   ├── common/            # Reusable components (Button, etc.)
│   ├── layout/            # Layout components (Navbar, Footer)
│   └── products/          # Product-specific components
├── data/                  # Mock data
├── lib/                   # Utilities (Prisma client, etc.)
├── types/                 # TypeScript type definitions
├── prisma/                # Prisma schema and migrations
└── public/                # Static assets
```

## 🎯 Next Steps

- [ ] Add shopping cart functionality
- [ ] Integrate payment gateway
- [ ] Add user authentication
- [ ] Implement order management
- [ ] Add product reviews
- [ ] Setup email notifications

## 📄 License

MIT
