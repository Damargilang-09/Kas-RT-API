import { prisma } from "../configs/prisma-client.config";
import { Prisma } from "../../generated/prisma";

interface CreateAuditLogParams {
  userId: string | null;
  action: string;
  tableName: string;
  recordId: string;
  oldValue?: Prisma.InputJsonValue | null;
  newValue?: Prisma.InputJsonValue | null;
}

export class AuditLogUtil {
  static async record({
    userId,
    action,
    tableName,
    recordId,
    oldValue = null,
    newValue = null,
  }: CreateAuditLogParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          tableName,
          recordId,
          oldValue: oldValue ?? Prisma.JsonNull,
          newValue: newValue ?? Prisma.JsonNull,
        },
      });
    } catch (error) {
      console.error("Gagal mencatat audit log:", error);
    }
  }
}