export class ResponseError extends Error {
    private statusCode: number; 
    private isExpose: boolean = true;

    constructor(statusCode: number, message: string){
        super(message);
        this.statusCode = statusCode;
    }
}