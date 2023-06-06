const { Server } = require("socket.io");

const io = new Server({ 
    cors: {
        origin: "http://localhost:5174",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("A client has connected");

    /*
    This is 2 way, i.e we can both emit and listen to an event in this connection.
    */

    // socket.emit("hello", "yes connected!");
    socket.on("markTile", (x, y) => {
        console.log("received tile position of opponent", x, y);
        socket.broadcast.emit("markTile", x, y)
    })
});

io.listen(3000);
