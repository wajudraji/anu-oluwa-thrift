// THE LEDGER ENGINE: payment in, new balances out.
// Keep this file free of React so it can later move to the server (Supabase function).
export const APP_NAME = "Anu-Oluwa Weekly Thrift";
export const MIN = 500;        // minimum weekly payment, no loan
export const MIN_LOAN = 1000;  // minimum weekly payment, with loan
export const CAP = 20000;      // yearly investment target
export const FIX = 100;        // ₦100 contribution + ₦100 building every week

export const naira = (n) => "₦" + Math.round(n).toLocaleString("en-NG");
// Week 1 = Saturday 12 Sep 2026
export const weekDate = (w) =>
  new Date(2026, 8, 12 + 7 * (w - 1)).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });

export const blankMember = (name, loan = 0) => ({
  name, loan, shares: 0, savings: 0, invest: 0, building: 0, contrib: 0, debt: 0, rows: [],
});

// P = amount paid this week (0 means the member defaulted)
export function applyWeek(m, P, wk) {
  let { shares, savings, invest, building, contrib, loan, debt } = m;
  let sh = 0, sv = 0, inv = 0, bl = 0, ln = 0;

  if (P === 0) {
    debt += 2 * FIX; // default: debt goes to Dr, building not recorded
  } else {
    let R = P;
    const cleared = Math.min(R, debt); // 1) clear old debt first
    debt -= cleared; R -= cleared;
    contrib += Math.floor(cleared / 2); // half to contribution, half is the building fine

    const covered = Math.min(R, 2 * FIX); // 2) this week's fixed ₦200
    R -= covered;
    const cc = Math.min(covered, FIX);
    contrib += cc; bl = covered - cc;
    debt += 2 * FIX - covered; // shortfall becomes debt

    if (R > 0) { // 3) share the rest
      const half = Math.floor(R / 2);
      let three = R, extra = 0;
      if (loan > 0) { ln = Math.min(loan, half); extra = half - ln; three = R - half; }
      inv = Math.min(Math.max(0, CAP - invest), Math.floor(three / 3));
      const rest = three - inv + extra;
      sh = Math.floor(rest / 2);
      sv = rest - sh; // leftover goes to savings
    }
  }

  shares += sh; savings += sv; invest += inv; building += bl; loan -= ln;
  const row = { wk, paid: P, sh, shB: shares, sv, svB: savings, dr: debt, ln, lnB: loan, inv, invB: invest, bl, blB: building };
  return { ...m, shares, savings, invest, building, contrib, loan, debt, rows: [...m.rows, row] };
}

export const paidThisWeek = (m, wk) => m.rows.length > 0 && m.rows[m.rows.length - 1].wk === wk;



// LOANS 
export const LOAN_MULT = 3;   // max loan = 3 x contribution account
export const LOAN_FEE = 200;  // form fee, goes to contribution account

export const maxLoan = (m) => m.contrib * LOAN_MULT;

export function canApplyForLoan(m, amount, hasPending) {
  if (!amount || amount <= 0) return { ok: false, reason: "Enter a loan amount." };
  if (hasPending) return { ok: false, reason: "You already have a pending request." };
  if (m.loan > 0) return { ok: false, reason: "Finish your current loan first." };
  if (m.debt > 0) return { ok: false, reason: "Clear your debt first." };
  if (amount > maxLoan(m)) return { ok: false, reason: `Maximum is ${naira(maxLoan(m))} (3 x contribution account).` };
  return { ok: true };
}

export const payLoanFee = (m) => ({ ...m, contrib: m.contrib + LOAN_FEE });

// Checked again at approval time, because things may have changed since the request
export function approveLoan(m, amount) {
  const c = canApplyForLoan(m, amount, false);
  if (!c.ok) return c;
  return { ok: true, member: { ...m, loan: amount } };
}
