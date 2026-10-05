import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
    setBusy(false);
  }

  return (
    <div className="wrap" style={{ maxWidth: 420 }}>
      <h1>Anu-Oluwa Weekly Thrift</h1>
      <p className="sub">Sign in to continue.</p>
      <form className="card" onSubmit={submit}>
        <div className="bar"><input style={{ width: "100%" }} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="bar"><input style={{ width: "100%" }} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {err && <div className="msg err">{err}</div>}
        <button className="p" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
      </form>
    </div>
  );
}