import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ConnectionTest() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.from("members").select("name, loan").then(({ data, error }) => {
      if (error) setError(error.message);
      else setRows(data);
    });
  }, []);

  if (error) return <div className="msg err">Supabase error: {error}</div>;
  if (!rows) return <div className="msg">Connecting...</div>;
  return <div className="msg">Connected. Members from the database: {rows.map((r) => r.name).join(", ")}</div>;
}