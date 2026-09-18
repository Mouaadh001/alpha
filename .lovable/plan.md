# Admin Dashboard Redesign — Alpha Store

This is a large multi-part rebuild. I'll deliver it in phases so nothing regresses. Confirm the scope before I start.

## Phase 1 — Foundation & Shell
- New admin shell: collapsible desktop sidebar + mobile slide-in drawer (hamburger).
- Sticky top bar on every admin page with: hamburger (mobile), Back button, breadcrumbs, notifications bell, admin menu.
- Unified page primitives: `AdminPage`, `AdminSection`, `AdminCard`, `AdminEmptyState`, `ConfirmDialog` — consistent spacing, typography, dark violet/obsidian theme.
- Mobile-first: no horizontal overflow, sticky action bar with Save/Cancel on all editors.

Sidebar sections:
- Dashboard
- Products (All, Add, Inventory)
- Categories (Categories, Subcategories)
- Orders (All / Pending / Confirmed / Preparing / Shipped / Delivered / Cancelled — status filter deep-links)
- Customers
- Homepage (CMS)
- Announcement
- Settings

Note: "Analytics", "Brands", and a separate "Customers" table aren't in the current schema. I'll build:
- **Customers**: a derived view aggregated from `orders` (name, phone, wilaya, total orders, total spent, last order, history) — no new table needed.
- **Brands** & **Analytics**: out of scope for this pass (would need schema + real data pipeline). I'll add stubs marked "Bientôt" instead of fake data.

## Phase 2 — Dashboard
- KPI cards: Revenue (30j), Orders (30j), Products, Categories — with trend deltas.
- Recent Orders (last 10) with status pills.
- Low Stock alerts (stock ≤ 5).
- Quick Actions (New product, New category, View orders, Homepage).
- Recent Activity feed (latest orders + latest products).

## Phase 3 — Products
- Sticky search bar + collapsible filter panel (category, subcategory, status, stock).
- Responsive: table on desktop, cards on mobile.
- Row actions: Edit, Duplicate, Delete (with ConfirmDialog).
- Bulk selection + bulk delete/activate/deactivate.
- Pagination (20/page).
- Floating "New Product" FAB on mobile.

### Product Editor (new + edit unified)
Collapsible sections: General • Images • Pricing • Inventory • SEO • Specifications.
- Images: drag-and-drop multi-upload to `product-images` bucket, preview grid, reorder (drag), delete, set cover.
- Sticky footer: Cancel • Save. Sticky top: Back + breadcrumb.
- Toasts on every action.

## Phase 4 — Categories & Subcategories
- Card grid (2-col mobile, 3-4 desktop): cover thumb, banner strip, name, product count, subcategory count, Edit / Delete.
- Editor: **image uploader** (preview → replace → delete) for both `image_url` (cover) and `banner_url`, uploaded to a new public `category-images` bucket. Same for subcategories.
- Ordering (position up/down).

## Phase 5 — Orders
- Table (desktop) / cards (mobile) with filters: search, status, date range, wilaya.
- Status quick-filter tabs (All / Pending / Confirmed / Preparing / Shipped / Delivered / Cancelled).
- Add "confirmed" to the status set (currently: pending, preparing, shipped, delivered, cancelled).
- Order detail: full customer info, items, totals, **status timeline** (Pending → Confirmed → Preparing → Shipped → Delivered), status changer, Call/WhatsApp/Copy/Print/Delete.
- Realtime: subscribe to `orders` INSERT → bell badge + toast "🔔 Nouvelle commande".

## Phase 6 — Customers (derived)
- Aggregated list from orders: name, phone, wilaya, total orders, total spent, last order date.
- Detail view: full order history.

## Phase 7 — Receipt / Invoice
The existing `order.$id.tsx` already has PDF/Print. I'll polish: Alpha Store wordmark header, thank-you message, "Retour à la boutique" button, ensure mobile-clean.

## Phase 8 — Audit & Fixes
- Fix "New Product" button routing.
- Wire every delete through ConfirmDialog.
- Toasts on every mutation success/failure.
- Verify every admin route mounts and every link resolves.
- Mobile pass on all admin pages (no overflow, sticky actions visible).

## Database changes
1. New public storage bucket `category-images` (for category + subcategory covers/banners).
2. Add `confirmed` to the orders status vocabulary (currently a free-text column — I'll add a CHECK-less validation trigger + update UI enum).
3. No new tables needed for customers/brands/analytics in this pass.

## Explicit non-goals (call these out so you know what I'm NOT doing)
- No brand entity / brand management (schema not present).
- No real analytics dashboards beyond KPI cards (would need event tracking).
- No email notifications (would need email provider setup).
- Not touching storefront pages except where an admin change forces a shared component update.

## Delivery
Given the size, I'll ship this in one large batch (multiple parallel file writes per phase). Expect ~30-50 files changed/created. Typecheck must stay clean at the end.

**Ready to proceed?** Reply "go" and I'll start with the DB migration + Phase 1 shell, then continue through all phases in order.
