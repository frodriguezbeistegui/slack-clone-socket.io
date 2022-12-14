function joinNs(endpoint) {
    if(nsSocket) {
        // check to see if ns socket is actually a socket 
        nsSocket.disconnect();
        // remove the event listener bafore it's added again
        document.querySelector('#user-input').removeEventListener('submit', formSubmition)
    }
    nsSocket = io(`http://localhost:3000${endpoint}`)
    nsSocket.on('nsRoomLoad', (nsRooms)=> {
        // console.log(nsRooms)
        let roomList = document.querySelector('.room-list');
        roomList.innerHTML = ''
        nsRooms.forEach((room)=>{
            let glyph;
            if(room.privateRoom){
                glyph = 'lock'
            }else{
                glyph = 'globe'
            }
            roomList.innerHTML += `<li class='room'><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`
        }) 
        // add a click listener to each room
        let roomNodes = document.getElementsByClassName('room');
        Array.from(roomNodes).forEach((elem)=>{
            elem.addEventListener('click', (e)=>{
                // console.log("Someone clicked on ", e.target.innerHTML);
                joinRoom(e.target.innerText)
            })
        })
        // add room automatically... first time here
        const topRoom = document.querySelector('.room');
        const topRoomName = topRoom.innerText
        joinRoom(topRoomName)

    })

    nsSocket.on('messageToClients',(msg)=>{
        const newMsg = buildHTML(msg)
        document.querySelector('#messages').innerHTML += newMsg
    })

    document.querySelector('.message-form').addEventListener('submit', formSubmition)
}

function formSubmition(event) {
    event.preventDefault();
    const newMessage = document.querySelector('#user-message').value;
    nsSocket.emit('newMessageToServer',{text: newMessage})
    
}

function buildHTML (msg) {
    const convertedDate = new Date(msg.time).toLocaleString()
    const newHTML = ` 
    <li>
        <div class="user-image">
            <img src="${msg.avatar}" />
        </div>
        <div class="user-message">
            <div class="user-name-time">${msg.username} <span>${convertedDate}</span></div>
            <div class="message-text">${msg.text}</div>
        </div>
    </li>`
    return newHTML;
}

// module.exports.joinNs