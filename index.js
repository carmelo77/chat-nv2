var express = require('express');
var app = express();

var port = process.env.PORT || 3000;
var server = require('http').Server(app);

server.listen(port, function () {
    console.log('Port ready in: ' + port);
});

const socketIO = require('socket.io');
const io = socketIO(server);

app.use(express.static(__dirname));

app.get('/', function(request, response) {
    console.log(io.sockets.adapter.rooms);
    response.sendFile(__dirname + '/index.html');
});

app.get('/onlineusers', (request, response) => {
    console.log(io.sockets.adapter.rooms);
    response.send(io.sockets.adapter.rooms);
});

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    //Cuando un usuario se conecta, enviamos su id.
    io.emit('user joined', socket.id)

    //Recibimos los mensages escritos en chat_message.
    socket.on('chat_message', (message) => {
        //Luego lo enviamos de nuevo, con io.emit. Recordando q esto significa que lo verán todos los usuarios.
        io.emit('chat messages', message);
    });

    //Enviar cliente 'user typing' al servidor para señalar q está escribiendo
    socket.on('user typing', (username) =>  {
        io.emit('user typing', username);
    });
    //Enviar cliente 'stopped typing' al servidor para detener la escritura.
    socket.on('stopped typing', (socketID) => {
        io.emit('stopped typing', socketID);
    });

    socket.on('disconnect', () => {
        console.log('User left: ' + socket.id);

        //Cuando un usuario se desconecta o se sale del chat con socket.broadcas, solo emitirá el mensaje a todos menos al que emitió el evento.
        socket.broadcast.emit('user left', socket.id);

    });
});