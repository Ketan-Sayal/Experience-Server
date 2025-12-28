class ApiError extends Error{
    data : null;
    statusCode:number;
    success:boolean;
    message:string;
    constructor(statusCode:number, message:string, stack?:string | undefined){
        super(message);
        this.data = null;
        this.message = message;
        this.statusCode = statusCode;
        this.success = false;
        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {ApiError};