# Three Tails Cafe — Booking System

A custom-built cat café booking system hosted on Vercel, connected to Supabase, and embedded into the Three Tails Cafe Squarespace website.

---

## Live URLs

| | |
|---|---|
| Booking page | https://book.threetailscafe.com |
| Admin dashboard | https://book.threetailscafe.com/admin.html |
| GitHub repo | https://github.com/diese-tech/threetails-booking |

---

## Stack

| Layer | Tool |
|---|---|
| Frontend | Static HTML / CSS / JS |
| Hosting | Vercel (auto-deploy from GitHub main branch) |
| Database | Supabase (PostgreSQL) |
| Emails | EmailJS |
| DNS | Squarespace → book.threetailscafe.com |

---

## File Structure

```
threetails-booking/
├── index.html       # Customer-facing booking flow
├── admin.html       # Password-protected admin dashboard
└── README.md        # This file
```

---

## Booking Flow

4-step process:

1. **Rules & Waiver** — Guest agrees to café rules before proceeding
2. **Date & Time** — Custom calendar with live availability from Supabase
3. **Guests & Pricing** — Adult/child counters, capacity bar, discount codes
4. **Your Info** — Name, email, phone → confirmation screen

---

## Pricing

| Guest Type | Price |
|---|---|
| Adult (14+) | $15 |
| Child (13 & under) | $9 |

**Discount codes (20% off):** `VET`, `SHELTER`, `DVM`

Payment is collected at the café upon arrival. This system is reservation-only.

---

## Capacity Rules

- Max **10 capacity units** per time slot
- Adults = 1 unit, Children = 0.5 units
- Slots display live availability and lock when full
- Final capacity check runs server-side before insert to prevent race conditions

---

## Time Slots

9 hourly slots per day: **9:00 AM – 6:00 PM**

---

## Supabase

**Project URL:** https://ggckzydfipyvnkwqnpfo.supabase.co

### `bookings` Table Schema

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key, auto-generated |
| name | text | Guest full name |
| email | text | Guest email |
| phone | text | Optional |
| date | date | Booking date (YYYY-MM-DD) |
| time | text | e.g. "1:00 PM – 2:00 PM" |
| adults | int | Number of adult guests |
| children | int | Number of child guests |
| discount_code | text | VET, SHELTER, or DVM (nullable) |
| total | numeric | Calculated total in USD |
| created_at | timestamp | Auto-generated |

> **Security note:** RLS is currently disabled for development. Before going live, re-enable RLS and add the following policies:
> ```sql
> ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
>
> CREATE POLICY "Allow public inserts" ON bookings
>   FOR INSERT TO anon WITH CHECK (true);
>
> CREATE POLICY "Allow public reads" ON bookings
>   FOR SELECT TO anon USING (true);
>
> GRANT INSERT, SELECT ON bookings TO anon;
> ```

---

## EmailJS

Two templates are configured:

| Template | ID |
|---|---|
| Customer confirmation | template_5pipgqs |
| Business notification | template_fxs6tv5 |

Business notifications go to: `dustin.nieves@threetailscafe.com`

To update EmailJS credentials, edit the config block at the top of `index.html`:

```js
const EMAILJS_PUBLIC_KEY        = "YOUR_KEY";
const EMAILJS_SERVICE_ID        = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_CUSTOMER = "template_5pipgqs";
const EMAILJS_TEMPLATE_BUSINESS = "template_fxs6tv5";
```

---

## Admin Dashboard

**URL:** https://book.threetailscafe.com/admin.html

- Password protected (set in `admin.html` config block)
- Displays all bookings in a filterable table
- Filter by date or search by name/email
- Stats row: total bookings, today's count, total guests, estimated revenue

---

## Squarespace Embed

Add a **Code Block** to your Squarespace reservations page with:

```html
<iframe src="https://book.threetailscafe.com" width="99%" height="800px" frameborder="0" style="border:none;"></iframe>
```

Adjust `height` if content appears cut off on desktop.

Recommended header block above the iframe:

```html
<p style="font-family:'Nunito',sans-serif; font-size:15px; font-weight:700; color:#9c7c7c; text-align:center; padding:10px 0;">
  Reservations are highly recommended, walk-ins are never guaranteed.
</p>
```

---

## Pre-Launch Checklist

- [x] Replace `123-456-7890` placeholder with real phone number — (352) 432-8028
- [ ] Replace EmailJS placeholder keys with real credentials
- [ ] Re-enable RLS in Supabase with correct policies
- [ ] Set a strong admin password in `admin.html`
- [ ] Test full booking flow on mobile
- [ ] Embed iframe in Squarespace
- [ ] Set up `bookings@threetailscafe.com` dedicated mailbox (optional)

---

## Planned Features

- Payment processing (Stripe)
- Private event booking flow
- Closed dates / holiday blocking
- Cancellation / rescheduling self-service
- Membership or loyalty discounts

## Environment Variables

Set these in Vercel Project Settings before deploying:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_CUSTOMER`
- `EMAILJS_TEMPLATE_BUSINESS`
- `BUSINESS_EMAIL`
- `SQUARE_APP_ID`
- `SQUARE_LOCATION`
- `SQUARE_ACCESS_TOKEN` (server-side only)
- `ADMIN_OWNER_PASSWORD` (server-side only)
- `ADMIN_STAFF_PIN` (server-side only)
