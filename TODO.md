Here you go:

---

# Three Tails Cafe — Booking System To-Do List

## Before Launch
- [ ] Replace `123-456-7890` placeholder with real business phone number
- [ ] Set strong admin password and staff PIN (currently using defaults)
- [ ] Add friendly fallback UI if Supabase fails to load
- [ ] Test full booking flow on desktop and mobile one final time

## High Priority (Post-Launch)
- [ ] Move capacity validation to Supabase database level to prevent rare double-booking edge cases
- [ ] Add booking cancellation and reschedule page using unique booking ID from confirmation email
- [ ] Add buffer rules — ability to block or reduce slot capacity for cat rest periods and cleaning
- [ ] Auto-refresh slot availability when a slot fills mid-booking instead of just showing an error

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
- [ ] Payment processing (Stripe) — payments currently collected on-site
- [ ] Dedicated `bookings@threetailscafe.com` mailbox
- [ ] Admin UI polish session based on co-owner feedback

---

Paste this into your GitHub project description or a `TODO.md` file in the repo — I'll be able to reference it in future sessions when you bring it up!
