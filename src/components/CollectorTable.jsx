import { naira, paidThisWeek } from "../lib/ledger";

export default function CollectorTable({ members, week }) {
  const total = (k) => members.reduce((s, m) => s + m[k], 0);
  return (
    <div className="card">
      <h2>Week {week} payments</h2>
      <div className="scroll">
        <table>
          <thead>
            <tr><th>Member</th><th>This week</th><th>Loan</th><th>Debt (Dr)</th><th>Contribution account</th></tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.name}>
                <td>{m.name}</td>
                <td>{paidThisWeek(m, week) ? "Paid " + naira(m.rows[m.rows.length - 1].paid) : "Not yet"}</td>
                <td className={m.loan ? "red" : ""}>{naira(m.loan)}</td>
                <td className={m.debt ? "red" : ""}>{naira(m.debt)}</td>
                <td>{naira(m.contrib)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td><b>Total</b></td><td></td><td>{naira(total("loan"))}</td><td>{naira(total("debt"))}</td><td><b>{naira(total("contrib"))}</b></td></tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
