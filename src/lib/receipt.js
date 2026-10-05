import { jsPDF } from "jspdf";
import { APP_NAME, weekDate } from "./ledger";

// The PDF font can't draw the ₦ sign, so receipts use "NGN"
const money = (n) => "NGN " + Math.round(n).toLocaleString("en-NG");

export function downloadReceipt(member, row) {
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const ref = `ATW-${String(row.wk).padStart(3, "0")}-${String(member.id).slice(0, 4).toUpperCase()}`;

  // Everything that was not shared into the other pots went to the contribution account or to clearing debt
  const contribAndDebt = row.paid - (row.sh + row.sv + row.inv + row.bl + row.ln);

  let y = 18;
  const line = (label, value, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(label, 14, y);
    doc.text(String(value), 134, y, { align: "right" });
    y += 7;
  };
  const rule = () => { doc.line(14, y - 4, 134, y - 4); y += 2; };
  const heading = (t) => { doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.text(t.toUpperCase(), 14, y); doc.setFontSize(11); y += 7; };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(APP_NAME, 14, y); y += 7;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Payment receipt", 14, y); y += 10;

  line("Receipt no.", ref);
  line("Member", member.name);
  line("Week", `${row.wk} (Saturday ${weekDate(row.wk)})`);
  rule();
  line("Amount paid", money(row.paid), true);
  rule();

  heading("Where it went");
  line("Contribution account and debt", money(contribAndDebt));
  line("Building fund", money(row.bl));
  line("Shares", money(row.sh));
  line("Savings", money(row.sv));
  line("Investment", money(row.inv));
  line("Loan repayment", money(row.ln));
  rule();

  heading("Balances after this payment");
  line("Shares", money(row.shB));
  line("Savings", money(row.svB));
  line("Investment", money(row.invB));
  line("Building fund", money(row.blB));
  line("Loan balance", money(row.lnB));
  line("Debt (Dr)", money(row.dr));

  y += 4;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Computer-generated from the saved ledger. No signature required.", 14, y);

  doc.save(`${ref}.pdf`);
}