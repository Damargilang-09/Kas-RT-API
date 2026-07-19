import * as z from "zod";
import { ReportStatus } from "../../../generated/prisma";

export class ReportsValidation {
  static readonly LIST_QUERY = z.object({
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),

      limit: z.coerce.number().int().min(1).max(100).default(10),

      search: z.preprocess(
              (val) => (val === "" ? undefined : val),
              z.string().trim().optional(),
            ),
      

      status: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z
          .enum([ReportStatus.open, ReportStatus.closed, ReportStatus.failed])
          .optional(),
      ),
      month: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.coerce.number().int().min(1).max(12).optional(),
      ),
      year: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.coerce.number().int().min(2000).max(2100).optional(),
      ),
    }),
  });

  static readonly REPORT_DETAIL = z.object({
    params: z.object({
      id: z.string().uuid("format id income invalid"),
    }),
  });

  static readonly APPROVAL_REPORTS = z.object({
    params: z.object({
      id: z.string().uuid("format id income invalid"),
    }),
    body: z.object({
      rejected_reason: z
        .string()
        .min(1, "rejected reason is required field")
        .optional(),
      status: z.enum([ReportStatus.closed, ReportStatus.failed], {
        error: "Report status is invalid",
      }),
    }),
  });
}


export type ReportQueryInput = z.infer<typeof ReportsValidation.LIST_QUERY>;
export type ReportDetailInput = z.infer<typeof ReportsValidation.REPORT_DETAIL>;
export type ReportApprovalInput = z.infer<
  typeof ReportsValidation.APPROVAL_REPORTS
>;
