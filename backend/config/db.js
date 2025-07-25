import mongoose from "mongoose";
const connectDB= async()=>{
    try{
        const conn= await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoBD Connected: ${conn.connection.host}`.cyan.underline);
    }
    catch (error){
        console.log(`Error: ${error.message}`.red.bold);
        process.exit();
    }
};
export default connectDB;