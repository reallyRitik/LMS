import { app } from "./app";
require("dotenv").config();

app.listen(process.env.PORT, ()=>{
    console.log(`server on the port ${process.env.PORT}`)
})