import type { Response, Request } from "express";
export declare class BillController {
    static generateBills(req: Request, res: Response): Promise<void>;
    static getBills(req: Request, res: Response): Promise<void>;
    static getBillDetail(req: Request, res: Response): Promise<void>;
    static cancelBillBatch(req: Request, res: Response): Promise<void>;
    static getMyBills(_req: Request, res: Response): Promise<void>;
    static getMyBillDetail(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=bill.controller.d.ts.map