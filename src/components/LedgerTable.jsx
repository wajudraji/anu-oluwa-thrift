import { weekDate } from "../lib/ledger";
import { downloadReceipt } from "../lib/receipt";

const show = (v) => (v > 0 ? v.toLocaleString() : "");

export default function LedgerTable({ member }) {
  return (
    <div className="scroll">
      <table>
        <thead>
          <tr>
            <th rowSpan="2">Date</th><th rowSpan="2">Paid</th>
            <th colSpan="2">Shares</th><th colSpan="3">Savings</th>
            <th colSpan="2">Loans</th><th colSpan="2">Investment</th><th colSpan="2">Building fund</th>
            <th rowSpan="2">Receipt</th>
          </tr>
          <tr>
            <th>Cr</th><th>Bal</th><th>Cr</th><th>Bal</th><th>Dr</th>
            <th>Repaid</th><th>Bal</th><th>Cr</th><th>Bal</th><th>Cr</th><th>Bal</th>
          </tr>
        </thead>
        <tbody>
          {member.rows.length === 0 && <tr><td colSpan="14">No entries yet.</td></tr>}
          {member.rows.map((r) => (
            <tr key={r.wk}>
              <td>{weekDate(r.wk)} (W{r.wk})</td>
              <td>{r.paid ? r.paid.toLocaleString() : <span className="red">Default</span>}</td>
              <td>{show(r.sh)}</td><td>{r.shB.toLocaleString()}</td>
              <td>{show(r.sv)}</td><td>{r.svB.toLocaleString()}</td><td className="red">{show(r.dr)}</td>
              <td className="red">{show(r.ln)}</td><td className="red">{show(r.lnB)}</td>
              <td>{show(r.inv)}</td><td>{r.invB.toLocaleString()}</td>
              <td>{show(r.bl)}</td><td>{r.blB.toLocaleString()}</td>
              <td>
                {r.paid > 0 && (
                  <button onClick={() => downloadReceipt(member, r)} aria-label={`Download receipt for week ${r.wk}`}>PDF</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}