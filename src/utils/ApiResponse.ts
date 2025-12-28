class ApiResponse{
    data:any;
    message:string;
    statusCode:number;
    success:boolean;

    constructor(statusCode:number, data:any, message:string){
        this.message = message;
        this.statusCode = statusCode;
        this.success = statusCode<400;
        this.data = data;
    }
}

export {ApiResponse};