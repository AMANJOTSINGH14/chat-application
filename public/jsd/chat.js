const socket = io()
// socket.on('helo',(count)=>{
//     console.log(' aara count is',count)
// })

// document.querySelector('#one').addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('inc')
// })
messageForm = document.querySelector('#message-form');
locationButton = document.querySelector('#location');
messageInput = messageForm.querySelector('input')
messageButton = messageForm.querySelector('button')
messageTemplate = document.querySelector('#messageTemplate').innerHTML
LocationTemplate = document.querySelector('#LocationTemplate').innerHTML
sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML
messages = document.querySelector('#messages')

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
   
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin
    
    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight
    console.log(containerHeight)
    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight
    console.log(scrollOffset)
    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
        console.log(messages.scrollTop)
    }
}
socket.on('message', (helo) => {
    console.log(helo)
    const html = Mustache.render(messageTemplate, {
       username:helo.username,
        helo: helo.text,
        times: moment(helo.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    messageButton.setAttribute('disabled', 'disabled')
    const messaged = e.target.elements.message.value
    socket.emit('sendmessage', messaged, (error) => {
        console.log('18')
        messageButton.removeAttribute('disabled')
        messageInput.value = ""
        messageInput.focus();
        if (error) {
            return alert(error)
        }

        console.log('Message delivered!')
    })

})
locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('your device dont support location sending')
    }
    locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('location', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {console.log('s')
            locationButton.removeAttribute('disabled')
            console.log('Location shared!')

        })
    })
})

socket.on('LocationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(LocationTemplate, {
       username:url.username,
        url:url.url,
        ltimes: moment(url.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error);
        location.href='/'
    }
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate, {
       room,
       users
     })
     document.querySelector('#sidebar').innerHTML=html
})
document.querySelector('#leave-btn').addEventListener('click', () => {
 const c=confirm('Are you sure you want to leave the room ?')
 if(c){  location.href='/'
}
else{}
  });