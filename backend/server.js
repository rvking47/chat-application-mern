import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import colors from "colors";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import {notFound,errorHandler} from "./middlewares/errorMiddleware.js";
import path from 'path';

dotenv.config();
connectDB();
const app=express();

app.use(express.json()); //to accept json

app.use('/api/user',userRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/message",messageRoutes);

const __dirname1 = path.resolve();
if(process.env.NODE_ENV === 'producation')
{
app.use(express.static(path.join(__dirname1, "/frontend/build")));

app.get("*",(req,res)=>{
  res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
});
}
else
{
 app.get("/", (req, res) => {
    res.send("API is running..");
  });
}



app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

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