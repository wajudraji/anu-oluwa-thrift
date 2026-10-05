import { useState, useEffect } from "react";
import { APP_NAME, MIN, MIN_LOAN, CAP, naira, weekDate, paidThisWeek } from "./lib/ledger";
import { loadMembers, recordPayment, closeWeekOnServer, loadRequests } from "./lib/db";
import { supabase } from "./lib/supabase";
import LedgerTable from "./components/LedgerTable";
import CollectorTable from "./components/CollectorTable";
import LoanPanel from "./components/LoanPanel";
import Login from "./components/Login";
import AddMember from "./components/AddMember";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <div className="wrap"><p className="sub">Checking login...</p></div>;
  if (!session) return <Login />;
  return <Thrift session={session} />;
}

function Thrift({ session }) {
  const [members, setMembers] = useState([]);
  const [week, setWeek] = useState(1);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [tab, setTab] = useState("ledger");
  const [sel, setSel] = useState(0);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState(null);

  async function refresh() {
    const r = await loadMembers();
    if (r.error) return setLoadError(r.error);
    setMembers(r.members);
    setWeek(r.week);
    setRequests(await loadRequests());
  }

  useEffect(() => {
    refresh().then(() => setLoading(false));
  }, []);

  const signOut = () => supabase.auth.signOut();

  if (loading) return <div className="wrap"><p className="sub">Loading from Supabase...</p></div>;
  if (loadError) return <div className="wrap"><div className="msg err">Could not load: {loadError}</div><button onClick={signOut}>Sign out</button></div>;

  const me = members.find((x) => x.userId === session.user.id);
  if (!me) return (
    <div className="wrap">
      <div className="msg err">Your login is not linked to a member yet. Ask the admin.</div>
      <button onClick={signOut}>Sign out</button>
    </div>
  );

  const isAdmin = me.role === "admin";
  const m = (isAdmin ? members[sel] : me) || me;
  const minimum = m.loan > 0 ? MIN_LOAN : MIN;

  async function pay() {
    const P = Math.floor(Number(amount));
    if (paidThisWeek(m, week)) return setMsg({ err: true, text: `${m.name} has already paid for week ${week}.` });
    if (!P || P < minimum) return setMsg({ err: true, text: `Minimum for ${m.name} is ${naira(minimum)}.` });
    const err = await recordPayment(m.id, P);
    if (err) return setMsg({ err: true, text: "Server refused: " + err });
    await refresh();
    setMsg({ text: `${naira(P)} recorded for ${m.name}.` });
    setAmount("");
  }

  async function closeWeek() {
    const err = await closeWeekOnServer();
    if (err) return setMsg({ err: true, text: "Server refused: " + err });
    await refresh();
    setMsg({ text: `Week ${week} closed. Anyone who didn't pay now has ₦200 debt (Dr).` });
  }

  const ledgerCard = (
    <div className="card">
      <h2>{m.name}</h2>
      <div className="stat">
        <div><b>{naira(m.shares)}</b><span>shares</span></div>
        <div><b>{naira(m.savings)}</b><span>savings</span></div>
        <div><b>{naira(m.invest)}</b><span>investment (cap {naira(CAP)})</span></div>
        <div><b>{naira(m.building)}</b><span>building fund</span></div>
        <div><b>{naira(m.contrib)}</b><span>contribution account</span></div>
        <div><b className={m.loan ? "red" : ""}>{naira(m.loan)}</b><span>loan balance</span></div>
        <div><b className={m.debt ? "red" : ""}>{naira(m.debt)}</b><span>debt (Dr)</span></div>
      </div>
      <LedgerTable member={m} />
    </div>
  );

  return (
    <div className="wrap">
      <div className="bar" style={{ justifyContent: "space-between" }}>
        <h1>{APP_NAME}</h1>
        <span>{me.name} ({me.role}) <button onClick={signOut}>Sign out</button></span>
      </div>
      <p className="sub">Saved in Supabase. Week {week} is open (Saturday {weekDate(week)}).</p>

      {isAdmin && (
        <>
          <div className="bar">
            <button className={tab === "ledger" ? "on" : ""} onClick={() => setTab("ledger")}>Member ledger</button>
            <button className={tab === "group" ? "on" : ""} onClick={() => setTab("group")}>Collector</button>
            <button className={tab === "loans" ? "on" : ""} onClick={() => setTab("loans")}>Loans</button>
            <button className={tab === "members" ? "on" : ""} onClick={() => setTab("members")}>Add member</button>

          </div>
          <div className="card">
            <div className="bar" style={{ margin: 0 }}>
              <select aria-label="Member" value={sel} onChange={(e) => setSel(+e.target.value)}>
                {members.map((x, i) => <option key={x.id} value={i}>{x.name}</option>)}
              </select>
              <input type="number" placeholder={`Min ${minimum}`} value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Amount" />
              <button className="p" onClick={pay}>Record payment</button>
              <button className="gold" onClick={closeWeek}>Close week {week}</button>
            </div>
            {msg && <div className={"msg" + (msg.err ? " err" : "")}>{msg.text}</div>}
          </div>
        </>
      )}

      {isAdmin && tab === "loans" && (
        <LoanPanel members={members} me={me} isAdmin={true} requests={requests} onChange={refresh} />
      )}
      {isAdmin && tab === "group" && <CollectorTable members={members} week={week} />}
      {isAdmin && tab === "members" && <AddMember onAdded={refresh} />}
      {isAdmin && tab === "ledger" && ledgerCard}

      {!isAdmin && (
        <>
          {ledgerCard}
          <LoanPanel members={members} me={me} isAdmin={false} requests={requests} onChange={refresh} />
        </>
      )}
    </div>
  );
}