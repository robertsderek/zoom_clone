const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
app.set('view engine', 'ejs');
app.use(express.static('public'));


app.use('/peerjs', peerServer);

// what URL is the application going to live on
//uuid function to generate and send the user to a room
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room' , (roomId, userId) => {
        socket.join(roomId); 
        socket.to(roomId).emit('user-connected', userId);

        //listens for chat messages and sends them to the from. Also makes sure to only send to correct room
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message)
        });

        socket.on("disconnect", () => { // When a user disconnects or leaves
            socket.to(roomId).emit("user-disconnected", userId);
        });
        
    }) 
})

// the server is going to be local host and the port is going to be 3030
server.listen(process.env.PORT||3030);