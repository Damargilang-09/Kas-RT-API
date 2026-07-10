import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
export declare const prisma: PrismaClient<{
    adapter: PrismaPg;
}, never, import("../../generated/prisma/runtime/library").DefaultArgs>;
//# sourceMappingURL=prisma-client.config.d.ts.map