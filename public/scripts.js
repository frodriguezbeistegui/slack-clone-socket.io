const username = prompt('What is your username?')
// const socket = io('http://localhost:3000'); // the "/" namespace
const socket = io('http://localhost:3000', {
    query: {
        username
    }
});

let nsSocket = '';
// listen for nsList, which is a list of all namespaces.
socket.on('nsList', (nsData)=>{
    console.log('The list of namespaces has arrived!!')
    let namespacesDiv = document.querySelector('.namespaces');
    namespacesDiv.innerHTML = ''
    nsData.forEach((ns)=>{
        namespacesDiv.innerHTML += `<div class='namespace' ns=${ns.endpoint}><img src='${ns.img}' /></div>`
    })

    // Add a click listener for each NS
    Array.from(document.getElementsByClassName('namespace')).forEach((elem)=>{
        // console.log(elem)
        elem.addEventListener('click',(e)=>{
            const nsEndpoint = elem.getAttribute('ns');
            // console.log(`${nsEndpoint} I should go to now`);
            joinNs(nsEndpoint)
        })
    })
    joinNs('/wiki')
   
})



// socket.on('ping',()=>{
//     console.log('Ping was received from the server.');
//     console.log(io.protocol)
// })

// socket.on('pong',(latency)=>{
//     console.log(latency);
//     console.log("Pong was sent to the server.")
// })