import { supabase } from "./supabase";
import { blankMember } from "./ledger";

export async function loadMembers() {
  const { data: ms, error: e1 } = await supabase.from("members").select("*").order("name");
  if (e1) return { error: e1.message };
  const { data: es, error: e2 } = await supabase.from("ledger_entries").select("*").order("week");
  if (e2) return { error: e2.message };
  const { data: st, error: e3 } = await supabase.from("app_state").select("current_week").eq("id", 1).single();
  if (e3) return { error: e3.message };

  const members = ms.map((m) => ({
    ...blankMember(m.name, m.loan),
    id: m.id, userId: m.user_id, role: m.role, shares: m.shares, savings: m.savings, invest: m.invest,
    rows: es.filter((e) => e.member_id === m.id).map((e) => ({
      wk: e.week, paid: e.paid,
      sh: e.sh, shB: e.sh_bal, sv: e.sv, svB: e.sv_bal, dr: e.dr,
      ln: e.ln, lnB: e.ln_bal, inv: e.inv, invB: e.inv_bal, bl: e.bl, blB: e.bl_bal,
    })),
  }));
  return { members, week: st.current_week };
}

// Saves the newest ledger row and the member's new balances. Returns an error message or null.

export async function recordPayment(memberId, amount) {
  const { error } = await supabase.rpc("record_payment", { p_member: memberId, p_amount: amount });
  return error ? error.message : null;
}

export async function closeWeekOnServer() {
  const { error } = await supabase.rpc("close_week");
  return error ? error.message : null;
}

export async function loadRequests() {
  const { data, error } = await supabase
    .from("loan_requests")
    .select("id, member_id, amount, fee_paid, status, members(name)")
    .order("id");
  if (error) return [];
  return data.map((r) => ({
    id: r.id, memberId: r.member_id, name: r.members?.name,
    amount: r.amount, feePaid: r.fee_paid, status: r.status,
  }));
}

const call = async (fn, args) => {
  const { error } = await supabase.rpc(fn, args);
  return error ? error.message : null;
};
export const applyLoan = (memberId, amount) => call("apply_loan", { p_member: memberId, p_amount: amount });
export const payLoanFee = (id) => call("pay_loan_fee", { p_request: id });
export const approveLoan = (id) => call("approve_loan", { p_request: id });
export const rejectLoan = (id) => call("reject_loan", { p_request: id });

export async function addMember({ name, loan, email, password }) {
  const { data, error } = await supabase.functions.invoke("add-member", {
    body: { name, loan, email, password },
  });
  if (error) {
    try {
      const j = await error.context.json();
      return j.error || error.message;
    } catch {
      return error.message;
    }
  }
  return data?.error || null;
}