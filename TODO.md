# Three Tails Cafe — Booking System To-Do List

## Before Launch
- [x] Replace `123-456-7890` placeholder with real business phone number — (352) 432-8028
- [ ] Set strong admin password and staff PIN (currently using defaults)
- [ ] Add friendly fallback UI if Supabase fails to load
- [ ] Test full booking flow on desktop and mobile one final time
- [ ] Scope down Supabase RLS UPDATE policy — currently `true` for anon; should restrict customer self-serve updates to matching `manage_token`, and move admin status changes behind a server-side function with a secret key

## High Priority (Post-Launch)
- [ ] Move capacity validation to Supabase database level to prevent rare double-booking edge cases
- [ ] Add buffer rules — ability to block or reduce slot capacity for cat rest periods and cleaning
- [ ] Auto-refresh slot availability on booking page when a slot fills mid-booking instead of just showing an error

## Growth Features
- [ ] Add "First visit?" and "Special occasion?" fields to booking form for customer insights
- [ ] Slot holding — temporarily reserve a time slot for 5–10 minutes while user completes booking
- [ ] Waitlist system for fully booked slots
- [ ] Google Calendar sync for daily booking management

## Technical Improvements
- [ ] Date-based availability caching to reduce Supabase load
- [ ] Split JavaScript into separate modules as codebase grows
- [ ] Stop trusting frontend pricing — validate totals server-side

## On Hold / Future
- [ ] Private event booking flow (separate page)
- [ ] Dedicated `bookings@threetailscafe.com` mailbox
- [ ] Admin UI polish session based on co-owner feedback

---

## Completed
- [x] Add booking cancellation and reschedule page (`manage.html`) with unique token link from confirmation email
- [x] Square payment integration — sandbox live, collecting payment at booking time
- [x] Customer self-serve cancel with Square refund (`api/refund.js`)
- [x] Fix capacity queries to exclude cancelled bookings
- [x] Admin: day summary bar, collapsed empty slots, capacity fill bars, contact info on booking rows
- [x] Admin: 60s auto-refresh on staff view
- [x] Admin: Revenue stat card, quick date filters, stats reflect active filter
- [x] Admin: Expandable rows (phone, payment ID, manage link)
- [x] Admin: Cancel & Refund action for owner view
- [x] Admin: Cancelled status badge and filter option
- [x] Supabase RLS UPDATE policy added for anon role
- [x] Font switched from Pacifico to Tenor Sans across all pages
- [x] EmailJS Reply-To — set customer template to `{{business_email}}`, business template to `{{customer_email}}`
