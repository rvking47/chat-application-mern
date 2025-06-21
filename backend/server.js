import express from "express";
import dotenv from "dotenv";
import chats from "./data/data.js";
import connectDB from "./config/db.js";
import colors from "colors";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import {notFound,errorHandler} from "./middlewares/errorMiddleware.js";
import path from "path";
dotenv.config();

connectDB();
const app=express();

app.use(express.json()); //to accept json

app.get('/',(req,res)=>{
  res.send("API is Running SuccessFully!!");
})

app.use('/api/user',userRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/message",messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
const server=app.listen(4000,()=>{
    console.log(`Server Starting https://localhost:${PORT}`.yellow.bold);
})

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket)=>{
console.log('connected to socket.io');

socket.on('setup', (userData)=>{
  socket.join(userData._id);
  socket.emit("connected");
});

socket.on('join chat', (room)=>{
socket.join(room);
console.log("User Join Roon" + room);
});

socket.on("typing", (room) => socket.in(room).emit("typing"));
socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

socket.on('new message', (newMessageRecieved)=>{
  var chat=newMessageRecieved.chat;
  if(!chat.users) return console.log('chat.users not defined');

  chat.users.forEach(user=>{
    if(user._id == newMessageRecieved.sender._id) return;
    socket.in(user._id).emit("message recieved", newMessageRecieved);
  })
});

socket.off("setup", ()=>{
  console.log("USER DISCONNECTED");
  socket.leave(userData._id);
});
});