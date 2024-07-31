const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let currentplayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

io.on("connection", function (uniquesockets) {
  console.log("connected");

  if (!players.white) {
    players.white = uniquesockets.id;
    uniquesockets.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniquesockets.id;
    uniquesockets.emit("playerRole", "b");
  } else {
    uniquesockets.emit("spectatorRole");
  }
  uniquesockets.on("disconnect",function(){
    if(uniquesockets.id===players.white){
        delete players.white;
    }
    else if(uniquesockets.id===players.black){
        delete players.black;
    }
  });

  uniquesockets.on("move", (move)=>{
    try{
        if(chess.turn()==='w' && uniquesockets.id !==players.white) return;
        if(chess.turn()==='b' && uniquesockets.id !==players.black) return;

       const result = chess.move(move);
       if(result){
        currentplayer=chess.turn();
        io.emit("move", move);
        io.emit("boardState",chess.fen())
       }
       else{
        console.log("Invalid Move :", move);
        uniquesockets.emit("Invalid move :",move);
       }
    }
    catch(err){
        console.log(err);
        uniquesockets.emit("Invalid move :",move)
    }
  })
});
//koi bhi mere socket me add hoga to usko ye msg jayega ki woh add ho chuka hai mere socket se

server.listen(3000, function () {
  console.log("listening on port 3000");
});
