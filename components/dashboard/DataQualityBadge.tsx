"use client";

export function DataQualityBadge({ status }: { status: "READY" | "LIMITED" | "INVALID" }) {
  const className = status === "READY" ? "success" : status === "LIMITED" ? "warning" : "danger";
  return <span className={`badge ${className}`}>{status}</span>;
}
