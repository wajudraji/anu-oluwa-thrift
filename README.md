# Anu-Oluwa Weekly Thrift

A weekly savings, loan and fine ledger for a cooperative group, built with React, Vite and Supabase.

I built this because many thrift (ajo/esusu) groups still keep their ledger on paper or in spreadsheets, where mistakes and disputes are common. This app records every payment, applies the group's rules automatically, and lets each member see only their own records.

**Live demo:** <anu-oluwa-thrift.vercel.app>

## Try it

| Role | Email | Password |
|------|-------|----------|
| Admin | demo-admin@example.com | <123456> |
| Member | demo-member@example.com | <135799> |

All demo data is fake. Things to try:

1. As admin, record a ₦500 payment, then click **Close week** and see who gets a ₦200 debt.
2. As admin, open **Loans**, pay the form fee and approve a request.
3. As member, check that you only see your own ledger, and download a PDF receipt.
4. As member, apply for a loan above the limit and see it rejected.

## Screenshots

<add 3 or 4 images here: admin ledger, collector tab, loan request, PDF receipt>

## How the thrift works

- Members pay every Saturday. Any amount is allowed, with a minimum of ₦500 (₦1,000 if they have a loan).
- Each week ₦100 goes to the contribution account and ₦100 to the building fund.
- The rest is shared equally into shares, savings and investment. Investment stops at ₦20,000 a year, and the overflow goes to shares and savings.
- If a member has a loan, half of the remaining money repays the loan.
- Missing the Sunday 12:00am deadline adds ₦200 debt. Debt is cleared first from the next payment.
- Loan applications need a ₦200 form fee, are limited to 3 times the contribution account balance, and are blocked while a member has debt or an unfinished loan. The admin approves them.

## Features

- Admin and member roles
- Weekly ledger with shares, savings, loans, investment and building fund
- Automatic default and debt handling
- Loan requests with fee, limit checks and admin approval
- PDF receipts for each payment
- Admin screen to add members and create their logins

## How it is built

- **React + Vite** for the frontend.
- **Supabase** for the Postgres database and login.
- **Row Level Security** so a member can only read their own records.
- **Ledger rules run in Postgres functions** (`record_payment`, `close_week`, `approve_loan` and others), not in the browser. The browser can only ask the server to do these actions, so balances can't be changed from the client.
- **An Edge Function** (`add-member`) creates logins using the service key, which never reaches the browser. It first checks that the caller is the admin.
- `src/lib/ledger.js` holds the same rules in JavaScript. It is used for the tests and acts as the written specification.
- **Vitest** tests cover the rules, including examples from a real ledger, the investment cap and loan limits.

## Run it locally

```bash
npm install
npm run dev
```

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=<your project url>
VITE_SUPABASE_ANON_KEY=<your publishable key>
```

Run the tests:

```bash
npm test
```

You will also need your own Supabase project with the tables, policies and functions set up.

## Decisions and what I learned

- **Why server-side rules:** hiding a button in React doesn't stop a determined user. The database enforces the rules instead.
- **Why the admin records payments:** the group collects cash and transfers, so the collector records what was paid.
- **Rounding:** amounts are rounded to the nearest naira, and the leftover goes to savings.
- <add your own: a problem you hit and how you solved it>

## Limitations and next steps

- Online payments (for example Paystack) are not included. Payments are recorded by the admin.
- A "reverse payment" action for wrong entries.
- An automatic Sunday-midnight close with a scheduled function.
- A password-change screen for members.
- Database-level tests for the SQL functions.

## Credits

Built with help from Claude (an AI assistant) for code generation and debugging. The idea, the thrift rules and the design decisions are mine, from my own group's ledger.