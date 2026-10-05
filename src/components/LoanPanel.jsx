import { useState } from "react";
import { naira, maxLoan, LOAN_FEE } from "../lib/ledger";
import { applyLoan, payLoanFee, approveLoan, rejectLoan } from "../lib/db";

export default function LoanPanel({ members, me, isAdmin, requests, onChange }) {
  const [sel, setSel] = useState(0);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState(null);
  const m = isAdmin ? members[sel] : me;

  async function run(fn, okText) {
    const err = await fn();
    if (err) return setMsg({ err: true, text: err });
    setMsg({ text: okText });
    await onChange();
  }

  const apply = () => {
    const A = Math.floor(Number(amount));
    run(() => applyLoan(m.id, A), `Request sent. The ${naira(LOAN_FEE)} form fee must be paid before approval.`);
    setAmount("");
  };

  return (
    <div className="card">
      <h2>Loans</h2>
      <div className="bar">
        {isAdmin && (
          <select aria-label="Member" value={sel} onChange={(e) => setSel(+e.target.value)}>
            {members.map((x, i) => <option key={x.id} value={i}>{x.name}</option>)}
          </select>
        )}
        <input type="number" placeholder="Loan amount" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Loan amount" />
        <button className="p" onClick={apply}>Apply for loan</button>
      </div>
      <p className="sub">{m.name}: contribution account {naira(m.contrib)}, maximum loan {naira(maxLoan(m))}.</p>
      {msg && <div className={"msg" + (msg.err ? " err" : "")}>{msg.text}</div>}

      <h2>{isAdmin ? "Requests (admin)" : "Your requests"}</h2>
      <div className="scroll">
        <table>
          <thead><tr><th>Member</th><th>Amount</th><th>Form fee</th><th>Status</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>
            {requests.length === 0 && <tr><td colSpan="5">No requests yet.</td></tr>}
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td><td>{naira(r.amount)}</td>
                <td>{r.feePaid ? "Paid" : "Not paid"}</td><td>{r.status}</td>
                {isAdmin && (
                  <td>
                    {r.status === "Pending" && (
                      <>
                        {!r.feePaid && <button onClick={() => run(() => payLoanFee(r.id), "Fee recorded.")}>Pay {naira(LOAN_FEE)} fee</button>}{" "}
                        <button className="p" disabled={!r.feePaid} onClick={() => run(() => approveLoan(r.id), `${naira(r.amount)} approved for ${r.name}.`)}>Approve</button>{" "}
                        <button onClick={() => run(() => rejectLoan(r.id), "Request rejected.")}>Reject</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}