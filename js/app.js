var socket = io();

new Vue({
    el: '#app',
    data: {
        connectedUsers: [],
        messages: [],
        message: {
            type: '',
            action: '',
            user: '',
            text: '',
            timestamp: ''
        },
        areTyping: [],
    },

    created() {
        //Si el servidor emite un 'user joined', actualizamos el array connectedUsers.
        socket.on('user joined', (socketID) => { 
            axios.get('/onlineusers').then( (response) => {
                for(var key in response.data) {
                    if(this.connectedUsers.indexOf(key) <= -1) {
                        this.connectedUsers.push(key); 
                    }
                }
                console.log(this.connectedUsers);
            });
            //this.connectedUsers.push(socketID); 
        });

        socket.on('user left', (socketID) => {
            let index = this.connectedUsers.indexOf(socketID);

            if(index >= 0) {
                this.connectedUsers.splice(index, 1);
            }
        });

        socket.on('chat messages', (message) => {
            this.messages.push(message);
        });

        socket.on('user typing', (username) => {
            this.areTyping.push(username);
        });

        socket.on('stopped typing', (id) => {
            let index = this.areTyping.indexOf(id);

            if(index >= 0) {
                this.areTyping.splice(index, 1);
            }
        });
    },

    methods: {
        send() {
            this.message.type = 'chat';
            this.message.user = socket.id;
            this.message.timestamp = moment().calendar();

            socket.emit('chat_message', this.message);

            this.message.type = '';
            this.message.user = '';
            this.message.text = '';
            this.message.timestamp = '';
        },

        userIsTyping(username) {
            if(this.areTyping.indexOf(username) >= 0) {
                return true;
            }
            return false;
        },

        usersAreTyping() {
            if(this.areTyping.indexOf(socket.id) <= -1) {
                this.areTyping.push(socket.id);
                socket.emit('user typing', socket.id);
            }
        },

        stoppedTyping(keycode) {
            if(keycode == '13') {
                let index = this.areTyping.indexOf(socket.id);
                if(index >= 0) {
                    this.areTyping.splice(index, 1);
                    socket.emit('stopped typing', socket.id);
                }
            }
        },
    }
});