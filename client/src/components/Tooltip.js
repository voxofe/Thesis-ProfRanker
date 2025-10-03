import React, { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({ anchorRef, open, children, offset = 8, className = "" }) {
  const [pos, setPos] = useState({ top: 0, left: 0, ready: false });

  useLayoutEffect(() => {
    if (!open || !anchorRef?.current) return;

    const compute = () => {
      const r = anchorRef.current.getBoundingClientRect();
      // Position below and slightly right of the anchor
      const top = r.top + r.height + offset;
      const left = r.left + 12;
      setPos({ top, left, ready: true });
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [open, anchorRef, offset]);

  if (!open || !pos.ready) return null;

  return createPortal(
    <div
      role="tooltip"
      className={`fixed z-[9999] font-semibold ${className}`}
      style={{ top: pos.top, left: pos.left }}
    >
      {children}
    </div>,
    document.body
  );
}
