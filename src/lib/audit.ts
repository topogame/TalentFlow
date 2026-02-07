import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ─── Types ───

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "stage_change"
  | "deactivate";

export type AuditEntityType =
  | "Candidate"
  | "Firm"
  | "Position"
  | "Process"
  | "EmailTemplate"
  | "User"
  | "Interview";

export type CreateAuditLogParams = {
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  changes?: Record<string, unknown> | null;
  ipAddress?: string | null;
};

// ─── Audit Log Helper ───

/**
 * Creates an audit log entry. Fire-and-forget — errors are caught
 * and logged to console so audit failures never break business operations.
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: `${params.entityType.toLowerCase()}.${params.action}`,
        entityType: params.entityType,
        entityId: params.entityId,
        changes: (params.changes as Prisma.InputJsonValue) ?? undefined,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (error) {
    console.error("[AuditLog] Failed to create audit log:", error);
  }
}

// ─── Change Diff Utility ───

const DEFAULT_EXCLUDE_FIELDS = [
  "updatedAt",
  "createdAt",
  "passwordHash",
  "id",
];

/**
 * Computes a diff between before and after objects.
 * Returns only fields that actually changed, or null if nothing changed.
 */
export function computeChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  excludeFields: string[] = DEFAULT_EXCLUDE_FIELDS
): { before: Record<string, unknown>; after: Record<string, unknown> } | null {
  const changedBefore: Record<string, unknown> = {};
  const changedAfter: Record<string, unknown> = {};

  for (const key of Object.keys(after)) {
    if (excludeFields.includes(key)) continue;
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changedBefore[key] = before[key];
      changedAfter[key] = after[key];
    }
  }

  if (Object.keys(changedAfter).length === 0) return null;

  return { before: changedBefore, after: changedAfter };
}
