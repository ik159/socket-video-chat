

const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const PORT = process.env.PORT || 8800;

app.get('/', (req, res) => {
	res.send('Running');
});

let users = [];

const addUser = (userId,socketId) =>{
 !users.some(user=>user.userId ===userId) &&

 users.push({userId,socketId});


};
const removeUser = (socketId) =>{
   users =users.filter(user =>user.socketId !==socketId)

};
const getUser =(userId) =>{
   return users.find(user=>user.userId === userId);


}
   io.on("connection",(socket)=>{
    
       //adding web rtc shit 
       socket.emit("me", socket.id);


   socket.on("callUser", ({ userToCall, signalData, from, name }) => {
       io.to(userToCall).emit("callUser", { signal: signalData, from, name });
   });

   socket.on("answerCall", (data) => {
       io.to(data.to).emit("callAccepted", data.signal)
   });

       //when connect 
       console.log("a user connected.")
       //take userId and socketId from user 
       socket.on("addUser",userId =>{
           addUser(userId,socket.id);

        io.emit("getUsers",users);
       });
       //send and get message
       socket.on("sendMessage",({senderId,receiverId,text})=>{
          const user = getUser(receiverId);
          io.to(user.socketId).emit("getMessage",{
              senderId,
              text,


          });

       })

//when disconnect
       socket.on("disconnect",() =>{
           socket.broadcast.emit("callEnded")

           console.log("for chat log : below");
           console.log("a user disconnected");
           removeUser(socket.id);
           io.emit("getUsers",users);


       });
       
   });

server.listen(process.env.PORT || 8800, () => console.log(`Server is running on port ${PORT}`));