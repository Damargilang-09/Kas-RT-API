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
exports.AuthValidation = void 0;
const zod = __importStar(require("zod"));
class AuthValidation {
}
exports.AuthValidation = AuthValidation;
AuthValidation.REGISTER_USER = zod.object({
    body: zod.object({
        name: zod
            .string()
            .min(5, "Nama harus 5-150 karakter")
            .max(150, "Nama harus 10-150 karakter"),
        email: zod
            .string()
            .min(1, "Email wajib diisi")
            .email("Format email tidak valid!")
            .transform((email) => email.trim().toLowerCase()),
        password: zod.string().min(8, "Password minimal 8 karakter"),
        houseNumber: zod.string().min(1, "Blok rumah wajib diisi!"),
        address: zod.string().min(1, "Alamat wajib diisi"),
    }),
});
AuthValidation.LOGIN_USER = zod.object({
    body: zod.object({
        email: zod
            .string()
            .min(1, "Email wajib diisi")
            .email("Format email tidak valid!")
            .transform((email) => email.trim().toLowerCase()),
        password: zod.string().min(8, "Password minimal 8 karakter"),
    }),
});
// kenapa gaada input role dan status, karna memang register user gabisa pilih. hardcode aja nanti
//# sourceMappingURL=auth.validation.js.map