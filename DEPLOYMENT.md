# Deployment Instructions

## 📋 Checklist Pre-Deployment

- ✅ Code: Todos los commits están listos
- ✅ Build: Production build compila sin errores
- ✅ Database: Prisma schema configurado
- ✅ Environment: Variables de entorno documentadas

## 🚀 Pasos para Hacer Deploy

### 1. Push a GitHub

```bash
git push -u origin claude/wonderful-bardeen-ewfogq
```

Si tienes problemas de conectividad, espera 5 minutos y reintenta.

### 2. Crear Pull Request (Opcional)

```bash
# Si quieres crear un PR antes de mergear a main:
gh pr create --title "SmartCatalog MVP" \
  --body "Initial MVP with home, shop, product details, and admin pages"
```

### 3. Deploy en Vercel

1. Ve a https://vercel.com
2. Conecta tu repo de GitHub
3. Selecciona este proyecto
4. Agrega variables de entorno:
   ```
   DATABASE_URL=<tu-connection-string-de-neon>
   ```
5. Deploy

### 4. Conectar Dominio

1. En Vercel, ve a Settings > Domains
2. Agrega: `mi-tienda-smart-bolivia.com`
3. Actualiza los DNS en tu registrador de dominios

## 📦 Estructura de Deployment

### Vercel
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Neon Database
- Type: PostgreSQL
- Region: us-east-1
- Connection: Usa `DATABASE_URL` de Vercel

## 🔧 Troubleshooting

### Error: Database not found
→ Asegúrate que `DATABASE_URL` apunta a Neon en producción

### Error: Images not loading
→ Ya está configurado en `next.config.ts` para Unsplash

### Error: Build fails
→ Verifica que todas las dependencias instaladas localmente se instalen también en Vercel

## 📝 Git Branches

- `claude/wonderful-bardeen-ewfogq`: Feature branch con MVP
- `main`: (A crear) Rama principal para producción

### Para mergear a main:
```bash
git checkout main
git pull origin main
git merge claude/wonderful-bardeen-ewfogq
git push origin main
```

## 🎯 Próximas Features (Post-MVP)

1. **Carrito de Compras**
   - LocalStorage para session storage
   - API routes para persistencia

2. **Autenticación**
   - NextAuth.js o Clerk
   - JWT tokens

3. **Pagos**
   - Stripe o Mercado Pago
   - Webhook para confirmación

4. **Admin Mejorado**
   - Dashboard con estadísticas
   - Upload de imágenes
   - Gestión de órdenes

## 📞 Support

Para problemas contacta a: evdev02@gmail.com

---

**Última actualización**: 2026-06-18
**Status**: MVP Listo para Deploy ✅
