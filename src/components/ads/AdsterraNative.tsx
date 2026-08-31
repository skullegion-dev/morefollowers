"use client";

import { useEffect, useRef } from "react";

const CONTAINER_ID = "container-f07c1e4d8ad63a084bee8db0083b70ce";
const SCRIPT_SRC =
  "https://pl31106143.profitableratecpmnetwork.com/f07c1e4d8ad63a084bee8db0083b70ce/invoke.js";

export default function AdsterraNative() {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) return;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = SCRIPT_SRC;
    document.body.appendChild(script);
  }, []);

  return <div id={CONTAINER_ID} className="my-8 w-full" />;
}