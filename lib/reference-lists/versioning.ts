export type ReferenceListVersionEntry = {
  version: string;
  status: "active" | "archived";
  changedAt: string;
  changedBy: string;
  note: string;
};

export function getDemoReferenceListVersion(name?: string) {
  if (name?.toLowerCase().includes("svhc")) return "v2026.05";
  if (name?.toLowerCase().includes("internal")) return "v2026.05-internal";
  return "v2026.05-demo";
}

export function getDemoReferenceListVersionHistory(name?: string): ReferenceListVersionEntry[] {
  const currentVersion = getDemoReferenceListVersion(name);
  const isInternal = name?.toLowerCase().includes("internal");

  return [
    {
      version: currentVersion,
      status: "active",
      changedAt: "2026-05-13",
      changedBy: "Marta Nowak",
      note: isInternal ? "Demo watch list active for company checks." : "Current demo list used by screening snapshots."
    },
    {
      version: isInternal ? "v2026.01-internal" : "v2026.01",
      status: "archived",
      changedAt: "2026-01-10",
      changedBy: "SuperAdmin",
      note: "Archived version kept read-only for audit and diff preview."
    }
  ];
}
