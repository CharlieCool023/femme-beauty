# Femme Beauty — the owner's manual

Everything you need to run the site and the studio dashboard, in plain language. No code required.

---

## 1. What you now own

Three pieces work together:

| Piece | What it is | Where |
|---|---|---|
| **The website** | What customers see and book on | `http://localhost:3000` (later, your domain) |
| **The studio dashboard** | Your private back office | `http://localhost:3000/admin` |
| **The database** | All bookings, customers, products, settings | one file: `prisma/dev.db` |

The website and dashboard are the **same app**. There is no separate software to install, no monthly
booking subscription, and the customer data stays in your database.

> Until the site is deployed, it only runs on this computer. To let customers use it, follow
> section 14 (Going live). Everything below works locally today.

---

## 2. The customer journey, end to end

1. A customer lands on the site — from Instagram, WhatsApp or Google.
2. She either:
   - **books a service** (Book an appointment → service → date → time → details → request),
   - **describes something custom** (Book → “Request something custom” → category + brief → date),
     or
   - **orders a product** (Shop → product → variant → “Order on WhatsApp”).
3. Her booking appears in your dashboard as **New request**, holding that slot for 2 hours.
4. You open it and tap **Request deposit** — she gets a pre-written WhatsApp message with your bank
   details and her reference.
5. She transfers the deposit and sends the receipt. You tap **Mark deposit received** → the
   appointment becomes **Confirmed** and a confirmation message is queued.
6. The day before, you send a reminder (or a future automation will).
7. After the appointment you tap **Mark completed**. That is what feeds your reports.
8. If she books a product instead, the enquiry lands in **Orders** so you know what she asked for,
   even though the conversation happens in WhatsApp.

---

## 3. Signing in

- Go to `http://localhost:3000/admin`.
- Email: `femmebeautybysyl@gmail.com`
- Password: the `ADMIN_PASSWORD` you set in `.env` when the site was set up.

**Change it now** — open a terminal in the project folder and run:

```powershell
npm run password -- "Something-Long-And-Private"
```

You stay signed in for 7 days on that device. Use **Sign out** at the bottom of the sidebar on a
shared computer. There is no “forgot password” email — reset it with the command above.

---

## 4. The dashboard (home)

The first screen answers “what needs me right now?”:

- **Today** — how many appointments, and the time of the first one.
- **New requests** — bookings waiting for your confirmation.
- **Deposits due** — total money still outstanding across active bookings.
- **This week** — confirmed appointment value.

Below that:

- **Today's schedule** — every appointment today in time order. Tap one to open it.
- **Needs attention** — new requests with a one-tap **Request deposit** button.
- **This week at a glance** — confirmed value, awaiting deposits, customers on file, sold-out products.
- **Shop enquiries** — the latest WhatsApp product enquiries.
- **Outbox** — messages waiting to be sent.

The sidebar (or the menu button on your phone) is how you reach everything else.

---

## 5. Calendar

`/admin/calendar` shows the week, Monday to Sunday, 9am–7pm by default.

- Each appointment is a coloured block sized to its real duration.
- **Colours:** yellow = new request, pink = awaiting deposit, green = confirmed, grey = completed,
  red = no-show. Cancelled appointments are hidden.
- Tap a block to open the appointment.
- Arrows move a week back or forward; **This week** returns to today.
- On a phone the grid scrolls sideways and a simple list of the week appears underneath.

The grid reads **your opening hours** and **blocked time**. If a day looks empty when it
shouldn't, check Settings → Opening hours first.

---

## 6. Appointments list

`/admin/appointments` is the searchable record of everything.

- Tabs filter by status (All, New, Deposit due, Confirmed, Completed, No-show, Cancelled).
- Search by name, phone, service or reference (`FB-XXXXXX`).
- **Add** creates an appointment for a phone call or walk-in. It checks real availability, so it
  can't double-book, and the client gets a confirmation message queued in the Outbox.
- Newest first. Tap any row to open it.

---

## 7. The appointment screen — the one you'll use most

This page is the whole relationship with one client.

**Top:** her name, the reference, service, date and status.

**The Appointment card** shows when, how long, price, deposit, payment method, source (website or
added by you), and any note she left when booking.

**Next step** changes with the status:

| Status | What it means | What you do |
|---|---|---|
| **New request** (PENDING) | She booked, slot held for 2 hours | **Request deposit**, or **Confirm without deposit** if she's paying in the studio |
| **Awaiting deposit** | Payment details sent | When the transfer lands, choose the method and **Mark deposit received** |
| **Confirmed** | Slot locked | After the appointment: **Mark completed** (or **No-show**) |
| **Completed / No-show / Cancelled** | Closed | **Reopen as confirmed** if it was a mistake |

**Move this appointment** — pick a new date and time. The dashboard checks your real availability;
you cannot double-book by accident.

**Private note** — cap size, lace type, what she liked, anything. Only staff see it (different from
the note she wrote when booking).

**Right column** — her phone and email, a **WhatsApp client** button pre-filled with her reference,
her saved client card, and every message queued for this booking.

> Rule of thumb: never type a confirmation by hand. Use the buttons — the message, reference and
> bank details are already correct.

**If it is a custom request**, a pink **Custom request** card appears above “Next step” with the
category, her budget (if she gave one) and her brief. Quote it there before asking for a deposit —
see section 8.

---

## 8. Money: deposits and balances

The default deposit is **30%**, set in Settings. Custom wig builds use **50%** (set per service).
You can override the percentage on any single service.

**The flow you chose — no online card payments:**

1. You tap **Request deposit**. A message is queued with the amount, your bank, account number and
   her reference as the narration.
2. You send it from the Outbox (one tap opens WhatsApp).
3. She pays and sends proof.
4. You tap **Mark deposit received** and choose Transfer / Cash / POS.
5. The balance is collected in the studio. The appointment page always shows what is still due.

To change the bank account customers see: **Settings → Bookings & deposits → Deposit account**.
Changing it does not alter bookings already made — their messages were already generated.

### Custom requests and quotes

Not every appointment is on the menu: a custom wig build, a gele-and-makeup combination, a repair,
something she saw on TikTok. She can describe it from **Book → Request something custom**:

1. She picks a category (wig making, wig fixing, lashes, nails, gele, makeup, something else).
2. She writes a brief and, optionally, a budget.
3. She picks a real 90-minute slot — so it holds space in your calendar.
4. You get a **Custom · Wig making** request with the brief and `Quote to fill`.

To quote it:

1. Open the appointment.
2. In the **Custom request** card, enter the **quoted price** and the **deposit** you want.
3. Tap **Save quote & request deposit**.

That moves it to **Awaiting deposit** and queues a WhatsApp message with the price and your bank
details. Nothing is charged before she approves — which is the point of a custom request.

You can resend the quote later from the same card, and the brief stays on the appointment forever.

---

## 9. Services & pricing

`/admin/services` — everything the booking engine can sell.

- **New service**: name, category, duration, price, deposit % (blank = global), buffer, description,
  whether it's bookable and whether it appears on the homepage.
- **Duration** is the real appointment length. The calendar and slots are built from it — be honest
  here, not optimistic.
- **Buffer after** is breathing room before the next client (default 15 minutes). It is blocked in
  the calendar but not shown to customers.
- **Hidden** services disappear from the website and booking flow but stay on old appointments.
- Changes apply to **new** bookings; existing appointments keep the price agreed.

To change a price, open the service, edit the price, save. The website updates immediately.

---

## 10. Products

`/admin/products` — wigs, hair, nails, lashes, accessories.

- **Variants** are written one per line as `label | price`, for example:

  ```
  18" | 265000
  20" | 285000
  22" | 305000
  ```

  Customers see them as selectable buttons and the price follows their choice.
- **Availability**:
  - *In stock* — normal.
  - *Made to order* — shows a 7–14 day note.
  - *Sold out* — keeps the product visible with a “Join the waitlist on WhatsApp” button. Usually
    better than hiding it.
- **Hidden** removes it from the shop entirely.
- **Compare-at price** shows a strike-through and a “Save ₦X” badge.

There is no cart or checkout: every product page has **Order on WhatsApp**, pre-filled with the
product, variant and price. Each tap is also logged under **Orders**.

---

## 11. Orders

`/admin/orders` lists WhatsApp product enquiries:

- What was asked for, variant, price, when.
- A **Reply** button that opens WhatsApp.
- A status: New → Contacted → Paid → Delivered → Closed. Move it along so the dashboard stays true.

This is deliberately light. The sale happens in chat; this is your record that it happened.

---

## 12. Customers

`/admin/customers` is your CRM, built automatically from bookings.

- Search by name, phone or email.
- Each row shows completed visits, lifetime value and when she was last in.
- Open a customer to see full appointment history and edit her **client card**: name, email and
  notes (cap size, allergies, preferences). Those notes stay with her forever.

A customer record is created the first time she books, matched by phone number. Two people sharing a
phone will share a record — use email or a note to tell them apart.

---

## 13. Outbox

`/admin/outbox` is every message the system has prepared: new-booking confirmations, deposit
requests, confirmations to clients.

- Filter by Queued / Sent / All and by WhatsApp / Email.
- **Read the message** to check the wording before sending.
- **Open in WhatsApp** (or email) launches the message, already written, to the right number.
- **Mark sent** keeps your records honest.

Nothing is sent automatically yet. That is deliberate: no client receives a half-finished message.
When you're ready, a WhatsApp Business API or email provider can be connected to send these
automatically — the messages themselves will not change.

---

## 14. Settings

`/admin/settings` is the control room.

**The business** — name, tagline, phone, WhatsApp, email, Instagram, address, map search, about
story. These feed the website header, footer, contact page and confirmations.

**Bookings & deposits**
- *Deposit %* — the default for all services.
- *Hold window* — how long an unconfirmed request keeps its slot (120 minutes is a good default).
- *Cancellation notice* — the number of hours shown in messages and policies.
- *Bank details* — what customers see on the confirmation page.

**Opening hours** — tick **Closed** for a day, or set the open/close times. Slots are generated in
30-minute steps inside these windows. Closing early on a Saturday? Change it before you leave.

**Time off & blocked time** — block a holiday, a supplier run, or an hour for a personal
appointment. Customers cannot book inside it.

---

## 15. Reports

`/admin/reports` covers the last 30 days:

- Completed revenue and average ticket.
- New customers.
- No-show rate (watch this — it's the clearest signal your deposit policy is working).
- Top services by revenue, and which weekdays are busiest.

Use it to decide what to promote and when to open extra hours. Product sales are tracked in Orders,
not here, because payment happens in WhatsApp.

---

## 16. The website itself

| Page | What it does |
|---|---|
| **Home** | Hero, featured services, featured products, custom wig story, lookbook strip, reviews, booking call-to-action |
| **Shop** | Category filters, search, sort, product cards |
| **Product** | Description, variants, price, WhatsApp order, details, delivery, related items |
| **Services** | Full menu grouped by category with prices and durations; every row books that service |
| **Book** | The 4-step booking flow with real availability — or the custom-request path with category and brief |
| **Gallery** | The lookbook grid |
| **About** | Story, values, studio details |
| **Contact** | Address, phone, WhatsApp, email, Instagram, map, opening hours, FAQs |
| **Policies** | Booking/cancellation, delivery & returns, privacy, terms |
| **Confirmation** | Each customer's private page: reference, date, deposit instructions, calendar download |

Copy that changes often (services, products, prices, business details, story) lives in the dashboard.
Long-form marketing copy (hero headline, policy wording) lives in the code — ask for a change, or
edit `src/lib/content.ts` and `src/app/(site)/page.tsx` carefully.

### On a phone

The site is built mobile-first. Where there are more items than fit — featured products, the
lookbook, reviews, related products, date pickers — the row **swipes sideways** and snaps to each
card. Look for “Swipe to see more →”. The WhatsApp button floats bottom-right, and the booking flow
is a single column so the next step is always under your thumb. The dashboard tables scroll
sideways rather than squashing, and the calendar can be dragged sideways too.

---

## 17. How availability is calculated (so you can predict it)

For a chosen service and date:

1. Are you open that weekday? If not, no slots.
2. Take your opening window (e.g. 9:00–19:00).
3. Step through it every 30 minutes.
4. Keep a slot only if the **service duration + buffer** fits inside the window.
5. Remove slots that overlap an existing appointment (plus its buffer) or blocked time.
6. Remove slots less than **90 minutes** from now.
7. Remove anything more than **60 days** ahead.

That's why a 4-hour braiding appointment has fewer start times than a 45-minute press-on set — and
why the last start time for a long service is early in the afternoon.

---

## 18. Your daily routine

**Morning (2 minutes)**
1. Open the dashboard.
2. Check **Needs attention** — request deposits, or quote a custom request.
3. Check today's schedule. Send any outstanding deposit requests from the Outbox.

**After each client**
4. Open the appointment → **Mark completed**.
5. If she booked the next one, fine. If she paid a balance, note the method.
6. Add a private note while it's fresh (what worked, what she asked for next time).

**End of day**
7. Clear the Outbox (mark messages sent).
8. Glance at tomorrow.
9. If someone didn't show, mark **No-show** — it protects your reports and your deposit policy.

**Weekly**
10. Check Reports: no-show rate, top services, busiest days.
11. Update sold-out products.

---

## 19. Backups (do this weekly)

Your entire studio is one file:

```
femme-beauty\prisma\dev.db
```

Copy it to a USB drive or a cloud folder (OneDrive/Google Drive) every week, and before any big
change. To restore, close the app and copy the file back.

When the site moves to hosted Postgres, the host keeps daily backups — still export a CSV of
appointments once a month as a second safety net.

---

## 20. Troubleshooting

**"No slots available" on a day that looks free**
Check Settings → Opening hours, then Time off. Also check the service's duration — a 5-hour service
can't start at 4pm.

**Two customers at the same time**
Cannot happen through the website: booking re-checks the slot in a transaction. It can only happen
if you add appointments manually without checking the calendar.

**A customer says she didn't get a message**
Messages are not sent automatically. Open the Outbox and send it. Check the number on the
appointment — one wrong digit is the usual culprit.

**"That slot was just taken"**
Someone booked it seconds earlier. Pick another time; this is the system protecting you.

**I can't sign in**
Reset the password with `npm run password -- "new-password"`. Check the email is exactly
`femmebeautybysyl@gmail.com`.

**The site looks broken after an update**
Stop the server (Ctrl+C), run `npm install`, `npm run db:push`, `npm run dev`.

**A booking is stuck as New**
New requests hold their slot for 2 hours then release automatically. If you still want it, reopen it
and confirm.

---

## 21. Going live — the short checklist

1. Change the admin password and `AUTH_SECRET`.
2. Replace the placeholder bank account number in Settings.
3. Get a domain, create a Postgres database (Neon/Supabase), switch the Prisma provider, deploy to
   Vercel, add environment variables.
4. Replace the generated product art with real photos.
5. Read the policy pages with a lawyer; adjust the privacy wording for NDPR.
6. Test one real booking end to end on your phone.
7. Add the link to your Instagram bio.

The technical steps are written out in `README.md` (Going live). This is a one-evening job once the
accounts exist.

---

## 22. What's next (in a sensible order)

1. **Real photography** — the single biggest upgrade to conversion.
2. **Automatic WhatsApp/email** — stop tapping through the Outbox.
3. **Paystack deposits** — fewer no-shows, less back-and-forth.
4. **A second stylist** — the database is already built for it; the UI needs a switcher.
5. **Customer accounts** — booking history and repeat bookings in one tap.
6. **Reviews & loyalty** — ask for a review after a completed appointment.

None of these require rebuilding. The foundation was designed for them.
