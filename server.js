const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve your frontend assets
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('A user entered the chat room');

    // Listen for incoming messages from a user
    socket.on('chat message', (data) => {
        // Broadcast the message + timestamp to all active participants
        io.emit('chat message', {
            username: data.username || 'Anonymous',
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('disconnect', () => {
        console.log('A user left the chat room');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Neon Chat Engine running on port ${PORT}`);
});
