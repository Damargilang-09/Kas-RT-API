import type { Request, Response } from "express";
export declare class FeeController {
    static getFeeTypes(_req: Request, res: Response): Promise<void>;
    static createFeetype(req: Request, res: Response): Promise<void>;
    static getFeeTypeDetail(req: Request, res: Response): Promise<void>;
    static updateFeeType(req: Request, res: Response): Promise<void>;
    static deleteFeeType(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=fee.controller.d.ts.map