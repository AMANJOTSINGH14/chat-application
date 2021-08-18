const path = require('path')
const http = require('http')
const Filter = require('bad-words')
const express = require('express')
const app = express()
const server = http.createServer(app)
const socket = require('socket.io')
const { addUser,
    removeUser,
    getUser,
    getUsersInRoom } = require('./util/user')
const io = socket(server)
const port = process.env.PORT || 3000
const { generateTime, generateLocation } = require('./util/other')
const { Socket } = require('dgram')
const { emit } = require('process')
const publicDirectory = path.join(__dirname, '../public')
app.use(express.static(publicDirectory))


let cout = 0;
io.on('connection', (socket) => {

    console.log('new web socket')
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateTime('Chat team', `Welcome ${user.username} to the infamous chat Club`))
        socket.broadcast.to(user.room).emit('message', generateTime('Chat team', `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    // io.emit('helo',cout);
    // socket.on('inc',()=>{
    // cout++
    // io.emit('helo',cout)
    // })
    // socket.broadcast.emit('message',generateTime('New user joined'))
    socket.on('sendmessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        console.log('1')
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
       if(message.trim()===''){
           return callback('Cannot send empty message!!')
       }
        io.to(user.room).emit('message', generateTime(user.username, message))
        callback()
    })
    socket.on('location', (cord, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('LocationMessage', generateLocation(user.username, `https://www.google.com/maps?q=${cord.latitude},${cord.longitude}`))
        callback()
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateTime('Chat team', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
      
    })
})
server.listen(port, () => {
    console.log(`Server is up on ${port}`)
})