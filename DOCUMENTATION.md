# Linkqs TurfPulse: Technical Documentation

## 1. Project Overview
**Linkqs TurfPulse** is a world-class, premium SaaS platform designed for turf facility owners to manage their operations, assets, and athletes with precision. The platform features a high-fidelity "Mossy Obsidian" aesthetic, emphasizing luxury, efficiency, and real-time intelligence.

---

## 2. Technology Stack
- **Frontend**: React (Vite) + TypeScript
- **Styling**: Tailwind CSS (v4) with custom Mossy Obsidian design tokens
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Backend/Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React

---

## 3. Core Features
### 📊 Intelligence Dashboard
- Real-time KPIs (Scheduled Bookings, Net Yield, Athlete Count, System Velocity).
- Performance Vector: 7-day revenue analytics visualization.
- Activity Log: Live stream of system-wide booking events.

### 🏟 Asset Management (Turfs)
- Facility Node configuration (Name, Type, Location, Premium Pricing).
- Visual facility grid with status indicators (Active/Maintenance).
- Image asset management.

### 📅 Inventory Control (Slots)
- Dynamic slot generation with time normalization (HH:MM:SS).
- Pricing index configuration per window.
- Real-time availability tracking (Locked/Available).

### 📑 Transaction Ledger (Bookings)
- Comprehensive booking lifecycle management (Pending -> Confirmed/Cancelled).
- Manual entry override for direct administrative control.
- Automated slot-locking integration.

### 🎟 Growth Engine (Coupons)
- Promotional campaign deployment (Percentage vs. Fixed Amount).
- Redemption tracking and lifecycle (Expiry) management.
- Campaign status toggling.

### 👥 Athlete Database (Customers)
- Centralized customer profiles with engagement metrics.
- Lifetime Value (LTV) tracking (Total Spent).
- Automated customer creation during booking workflows.

---

## 4. Database Schema (Supabase)
The database is built on PostgreSQL via Supabase. For your mobile app integration, ensure you use the following UUID-based relationships:

### `turfs`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `name` | TEXT | Display name of the turf |
| `type` | TEXT | Sport category (e.g., Football, Cricket) |
| `location` | TEXT | Physical address/coordinates |
| `price_per_hour` | DECIMAL | Base hourly rate |
| `image_url` | TEXT | Asset URI |

### `slots`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `turf_id` | UUID | Foreign Key (turfs.id) |
| `slot_date` | DATE | Format: YYYY-MM-DD |
| `start_time` | TIME | Format: HH:MM:SS |
| `end_time` | TIME | Format: HH:MM:SS |
| `is_booked` | BOOLEAN | Availability flag |

### `bookings`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `booking_ref` | TEXT | Human-readable reference (e.g., BK-1234) |
| `customer_id` | UUID | Foreign Key (customers.id) |
| `slot_id` | UUID | Foreign Key (slots.id) |
| `status` | TEXT | Pending, Confirmed, Cancelled |

---

## 5. Mobile App Integration Guide
When building your mobile application, follow these guidelines to ensure compatibility:

### Connection Settings
1.  **URL**: Use the Supabase Project URL found in `.env`.
2.  **Anon Key**: Use the Public Anon Key for user-side interactions.
3.  **Authentication**: Implement Supabase Auth (OTP or Social) to identify users.

### User Flow
1.  **Browse**: Fetch from `turfs` to show available facilities.
2.  **Search**: Fetch from `slots` where `is_booked = false` and `slot_date >= today`.
3.  **Book**:
    -   Insert a record into `bookings`.
    -   Update `slots.is_booked = true` for the corresponding `slot_id`.
    -   (Optional) Use a Database Function or Edge Function to ensure atomicity.

### Design Alignment
To match the premium feel, use the following colors:
- **Primary**: `#34d399` (Emerald)
- **Background**: `#050706` (Obsidian Black)
- **Typography**: Inter / Plus Jakarta Sans

---

## 6. Developer Notes
- **State Sync**: The admin panel uses Zustand for local state, which is re-synchronized with Supabase on every page load via `DashboardLayout.tsx`.
- **Time Normalization**: Always send times to the backend in `HH:MM:SS` format. The admin panel handles this automatically via the `normalizeTime` helper in `useStore.ts`.
- **Theming**: The theme (Light/Dark) is managed via the `dark` class on the root HTML element and persisted in `localStorage`.
