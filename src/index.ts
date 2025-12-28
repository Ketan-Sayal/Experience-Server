import { app } from "./app.js";
import { config } from "./config/index.js";
import { DB } from "./db/index.js";

const PORT = config.port || 3000;

DB().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`Server is running: http://localhost:${PORT}`);
    });
}).catch((err)=>console.log(err));