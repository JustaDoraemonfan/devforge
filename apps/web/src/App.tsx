import { useEffect, useState } from "react";
import { healthResponseSchema } from "@devforge/shared";

export default function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => setStatus(healthResponseSchema.parse(data).status))
      .catch(() => setStatus("api unreachable"));
  }, []);

  return <h1>DevForge API: {status}</h1>;
}
