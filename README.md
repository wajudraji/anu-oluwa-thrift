# Anu-Oluwa Weekly Thrift

A weekly contribution ledger built with React + Vite.

## Run it
```bash
npm install
npm run dev
```
Open the link shown in the terminal (usually http://localhost:5173).

## Where things are
- `src/lib/ledger.js` – all the money rules (the `applyWeek` function). Start here.
- `src/components/` – the ledger table and collector table.
- `src/App.jsx` – the page, payment form and "Close week" button.

## Rules
- Pay any amount before Sunday 12:00am. Minimum ₦500 (₦1,000 with a loan).
- ₦100 goes to the contribution account and ₦100 to building every week.
- The rest is shared equally into shares, savings and investment (investment stops at ₦20,000).
- With a loan, half of the rest goes to the loan.
- A missed week adds ₦200 debt (shown red in Dr). Debt is cleared first from the next payment.

## Next steps
1. Add Supabase (database + login) so data is shared.
2. Move `applyWeek` to a server function.
3. Add Paystack test payments, then deploy to Vercel.
