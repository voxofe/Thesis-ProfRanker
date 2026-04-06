import React, { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({
  anchorRef,
  open,
  children,
  offset = 8,
  className = "",
  placement = "bottom-left",
}) {
  const [pos, setPos] = useState({ top: 0, left: 0, ready: false });

  useLayoutEffect(() => {
    if (!open || !anchorRef?.current) return;

    const compute = () => {
      const r = anchorRef.current.getBoundingClientRect();
      let top = r.top + r.height + offset;
      let left = r.left + 12;

      if (placement === "top-left") {
        top = r.top - offset;
        left = r.left;
      }

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

  let transform = "translate(0, 0)";
  if (placement === "top-left") {
    transform = "translate(-100%, -100%)";
  }

  return createPortal(
    <div
      role="tooltip"
      className={`fixed z-[9999] font-semibold ${className}`}
      style={{ top: pos.top, left: pos.left, transform }}
    >
      {children}
    </div>,
    document.body
  );
}
