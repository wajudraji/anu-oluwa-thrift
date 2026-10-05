import { useState } from "react";
import { addMember } from "../lib/db";

export default function AddMember({ onAdded }) {
  const [name, setName] = useState("");
  const [loan, setLoan] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const err = await addMember({ name, loan: Number(loan) || 0, email, password });
    setBusy(false);
    if (err) return setMsg({ err: true, text: err });
    setMsg({ text: email
      ? `${name} added. Give them this email and the temporary password so they can sign in.`
      : `${name} added without a login. You can record payments for them as admin.` });
    setName(""); setLoan(""); setEmail(""); setPassword("");
    onAdded();
  }

  const full = { width: "100%" };
  return (
    <form className="card" onSubmit={submit} style={{ maxWidth: 480 }}>
      <h2>Add member</h2>
      <div className="bar"><input style={full} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div className="bar"><input style={full} type="number" min="0" placeholder="Opening loan balance (leave empty if none)" value={loan} onChange={(e) => setLoan(e.target.value)} /></div>
      <p className="sub">Optional login. Leave both empty if they will not sign in yet.</p>
      <div className="bar"><input style={full} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="bar"><input style={full} type="text" placeholder="Temporary password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      {msg && <div className={"msg" + (msg.err ? " err" : "")}>{msg.text}</div>}
      <button className="p" disabled={busy}>{busy ? "Adding..." : "Add member"}</button>
    </form>
  );
}