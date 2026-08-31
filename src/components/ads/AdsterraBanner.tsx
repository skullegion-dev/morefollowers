"use client";

import { useEffect, useRef } from "react";

type Props = {
  adKey: string;
  width: number;
  height: number;
  className?: string;
};

export default function AdsterraBanner({
  adKey,
  width,
  height,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";

    (window as any).atOptions = {
      key: adKey,
      format: "iframe",
      height,
      width,
      params: {},
    };

    const script = document.createElement("script");
    script.src = `https://www.highrevenueformat.com/${adKey}/invoke.js`;
    script.async = true;
    ref.current.appendChild(script);

    return () => {
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [adKey, width, height]);

  return (
    <div
      className={`flex justify-center overflow-hidden ${className || ""}`}
      style={{ minHeight: height }}
    >
      <div ref={ref} />
    </div>
  );
}