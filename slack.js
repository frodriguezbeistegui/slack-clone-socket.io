const express = require('express');
const app = express();
const socketio = require('socket.io')
let namespaces = require('./data/namespaces')

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(3000);
const io = socketio(expressServer);

// io.on = io.of('/').on
io.on('connection',(socket)=>{
    // build an array to send back with the img and endpoint for each NS
    let nsData = namespaces.map((ns)=>{
        return{
            img: ns.img,
            endpoint: ns.endpoint
        }
    }) 
    console.log(socket.id)
    //  send the nsData back to the clientInformation. we need to use socket, not io because we want it  to go just to this client
    socket.emit('nsList', nsData);
})

// loop through each namespace and listen for a connection
namespaces.forEach(namespace => {
    io.of(namespace.endpoint).on('connection', (nsSocket) => {
        const username = nsSocket.handshake.query.username
        // console.log(`${nsSocket.id} has join ${namespace.endpoint}`)
        // a socket has connected to one of our chat groups namespaces.
        // send that ns group info back
        nsSocket.emit('nsRoomLoad', namespace.rooms)
        nsSocket.on('joinRoom', (roomToJoin, numberOfUsersCallback)=>{
            // deal with history... once we have it
            const roomToLeave = Array.from(nsSocket.rooms)[1]
            nsSocket.leave(roomToLeave)
            updateUsersInRoom(namespace, roomToLeave)
            nsSocket.join(roomToJoin);
            // io.of('/wiki').in(roomToJoin).allSockets().then((clients) => {
            //     numberOfUsersCallback(Array.from(clients).length)
            //   })
              const nsRoom = namespace.rooms.find((room)=>{
                return room.roomTitle === roomToJoin
            })
            nsSocket.emit('historyCatchUp', nsRoom.history)            
            // Send back the number of users in this room to ALL sockets connected to this room
            updateUsersInRoom(namespace, roomToJoin)
        })

        nsSocket.on('newMessageToServer', msg => {
            const fullMsg = {
                text: msg.text,
                time: Date.now(),
                username,
                avatar: 'https://via.placeholder.com/30'
            }
            // console.log(msg)
            // Send this message to all sockets that are in the room that this socket is in
            // the user will be in the 2nd room in the object list because the socket always jouns its own room in connection
            const roomTitle = Array.from(nsSocket.rooms)[1]
            // we need to find the room object for this room
            const nsRoom = namespace.rooms.find((room)=>{
                return room.roomTitle === roomTitle
            })
            // console.log(nsRoom)
            nsRoom.addMessage(fullMsg)
            io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg)
        })
    })
})

function updateUsersInRoom (namespace, roomToJoin) {
    io.of(namespace.endpoint).in(roomToJoin).allSockets().then((clients)=>{
        const clientsNum = Array.from(clients).length
        io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers', clientsNum)
    })
}