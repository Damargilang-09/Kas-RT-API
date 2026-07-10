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
exports.FeeValidation = void 0;
const zod = __importStar(require("zod"));
const prisma_1 = require("../../../generated/prisma");
class FeeValidation {
}
exports.FeeValidation = FeeValidation;
FeeValidation.CREATE = zod.object({
    body: zod.object({
        name: zod.string().trim().min(1, "Nama jenis tagihan wajib diisi"),
        amount: zod.coerce.number().positive("Nominal harus lebih dari 0"),
        description: zod.string().trim().optional(),
        billingPeriod: zod.enum([prisma_1.BillingPeriod.monthly, prisma_1.BillingPeriod.once]),
        dueDay: zod.coerce.number().int().min(1).max(31).optional(),
    }),
});
FeeValidation.DETAIL = zod.object({
    params: zod.object({
        id: zod.string().min(1, "ID jenis tagihan wajib diisi"),
    }),
});
FeeValidation.UPDATE = zod.object({
    params: zod.object({
        id: zod.string().min(1, "ID jenis tagihan wajib diisi"),
    }),
    body: zod
        .object({
        name: zod.string().trim().min(1).optional(),
        amount: zod.coerce.number().positive().optional(),
        description: zod.string().trim().optional(),
        billingPeriod: zod
            .enum([prisma_1.BillingPeriod.monthly, prisma_1.BillingPeriod.once])
            .optional(),
        dueDay: zod.coerce.number().int().min(1).max(31).optional(),
    })
        .refine((body) => body.name ||
        body.amount ||
        body.description ||
        body.billingPeriod ||
        body.dueDay, { message: "Minimal salah satu field harus diisi!" }),
});
FeeValidation.DELETE = zod.object({
    params: zod.object({
        id: zod.string().min(1, "ID jenis tagihan wajib diisi"),
    }),
});
//# sourceMappingURL=fee.validation.js.map