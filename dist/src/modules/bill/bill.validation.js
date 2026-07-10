"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillValidation = void 0;
const zod = __importStar(require("zod"));
const prisma_1 = require("../../../generated/prisma");
class BillValidation {
}
exports.BillValidation = BillValidation;
BillValidation.GENERATE = zod.object({
    body: zod.object({
        feeTypeId: zod.string().min(1, "Jenis tagihan wajib diisi"),
        periodMonth: zod.coerce.number().int().min(1).max(12).optional(),
        periodYear: zod.coerce.number().int().min(2000).optional(),
        dueDate: zod.coerce.date(),
    }),
});
BillValidation.LIST_QUERY = zod.object({
    query: zod.object({
        page: zod.coerce.number().int().min(1).default(1),
        limit: zod.coerce.number().int().min(1).max(100).default(10),
        status: zod.nativeEnum(prisma_1.BillStatus).optional(),
        feeTypeId: zod.string().optional(),
        batchId: zod.string().optional(),
        periodMonth: zod.coerce.number().int().min(1).max(12).optional(),
        periodYear: zod.coerce.number().int().min(2000).optional(),
    }),
});
BillValidation.DETAIL = zod.object({
    params: zod.object({
        id: zod.string().min(1, "ID Bill wajib diisi"),
    }),
});
BillValidation.CANCEL_BATCH = zod.object({
    body: zod.object({
        batchId: zod.string().min(1, "Batch ID wajib diisi"),
    }),
});
BillValidation.MY_BILL_DETAIL = BillValidation.DETAIL;
//# sourceMappingURL=bill.validation.js.map