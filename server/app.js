const express = require('express');
var fs = require('fs');
const app = express();
const session = require('express-session');
const port = 3000;
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const pool = require('./lib/db');
const passport = require('passport');
const http = require("http");
const { Server } = require("socket.io");
const options = {
    key: fs.readFileSync('/home/ec2-user/messagingclientchitchat.gr/messagingPrivate.key'),
    cert: fs.readFileSync('/home/ec2-user/messagingclientchitchat.gr/www.messagingclientchitchat.gr.pem'),
};
const server = http.createServer(app);
const encryptPassword = require('./lib/bcrypt').encryptPassword;

const getRandomColor = require('./lib/random_color');

module.exports = app;

// Logging request and response objects
app.use((req, res, next) => {
    console.log('-----------------------------------------------------')
    console.log('Received request:', req.method, req.url);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('Request session:', req.session);
    console.log('Request cookie:', req.headers.cookie);
    console.log('-----------------------------------------------------');
    next();
});

app.use(
    cors({
        origin: ["http://messagingclientchitchat.gr/", "http://localhost:5173"],
        methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-HTTP-Method-Override", "Accept",],
        exposedHeaders: ["Content-Range", "X-Content-Range", "Content-Length", "Content-Encoding", "Content-Type"],
    })
);

// Initialize Express session
const sessionMiddleware = session({
    store: new pgSession({
        pool: pool,
    }),
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: false, // if true, only transmit cookie over https
        httpOnly: true, // if true, prevent client side JS from reading the cookie
        sameSite: "lax",
    },
})

app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./lib/passport')

app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.send('Login Success');
}
);


app.get('/api/auth', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).send('Authenticated');
    } else {
        res.status(401).send('Not Authenticated');
    }
});

app.get('/api/user_details', (req, res) => {
    if (req.isAuthenticated()) {
        const user = {
            id: req.user.id,
            username: req.user.username,
            profile_color: req.user.profile_color
        }
        res.status(200).send(user);

    } else {
        res.status(401).send('Not Authenticated');
    }
});

app.get('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            res.status(400).send('Error');
            return;
        }
    }

    );
    res.send('Logged Out');
}
);


app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || username.length < 3 || password.length < 3 || username.length > 20 || password.length > 20) {
        res.status(400).send('Username and Password required');
        res.end();
    }
    const seeIfUserExists = async (username) => {
        const query = 'SELECT * FROM users WHERE username = $1 LIMIT 1';
        const values = [username];
        try {
            const result = await pool.query(query, values);
            if (result.rows.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
        }
    };
    const userExists = await seeIfUserExists(username);
    if (userExists) {
        res.status(400).json({ message: 'Username already used' });
        return;
    } else {
        console.log('User does not exist');
    }
    const randomColor = getRandomColor();
    const hashedPassword = await encryptPassword(password);
    const query = 'INSERT INTO users (username, password, profile_color) VALUES ($1, $2, $3)';
    const values = [username, hashedPassword, randomColor];
    pool.query(query, values, (err, result) => {
        if (err) {
            res.status(400).send('Error');
            return;
        }
    });
    res.status(200).send('User Created');
}
);



const io = new Server(server, {
    cors: {
        origin: ["http://messagingclientchitchat.gr", "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true,

    },
    pingTimeout: 60000,
    pingInterval: 25000,
});


function onlyForHandshake(middleware) {
    return (req, res, next) => {
        const isHandshake = req._query.sid === undefined;
        console.log('isHandshake', isHandshake);
        if (isHandshake) {
            middleware(req, res, next);
        } else {
            next();
        }
    };
}

io.engine.use(onlyForHandshake(sessionMiddleware));
io.engine.use(onlyForHandshake(passport.initialize()));
io.engine.use(onlyForHandshake(passport.session()));
io.engine.use(
    onlyForHandshake((req, res, next) => {
        if (req.user) {
            console.log('User is authenticated');
            next();
        } else {
            console.log('User is not authenticated / handshake failed');
            console.log('req.headers', req.headers.cookie);
            res.writeHead(401);
            res.end();
        }
    }),
);

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('find_contacts', async (data) => {
        console.log('Finding contacts for:', socket.id);
        //after finding the contacts will find last message for each room and sort them by the last message created_at
        const query = 'SELECT room_id FROM room_participants WHERE user_id = $1 AND removed = false';
        const values = [socket.request.user.id];
        try {
            const room_ids = await pool.query(query, values);
            const contacts = [];
            //find the user of the room that is not the current user
            for (let i = 0; i < room_ids.rows.length; i++) {
                if (room_ids.rows[i].room_id.includes('pv') === true) {
                    const query = 'SELECT username, profile_color, id FROM users WHERE id = (SELECT user_id FROM room_participants WHERE room_id = $1 AND user_id != $2)';
                    const values = [room_ids.rows[i].room_id, socket.request.user.id];
                    const users = await pool.query(query, values);
                    const lastMessageQuery = 'SELECT created_at FROM messages WHERE room_id = $1 ORDER BY created_at DESC LIMIT 1';
                    const lastMessageValues = [room_ids.rows[i].room_id];
                    const lastMessage = await pool.query(lastMessageQuery, lastMessageValues);
                    const objToSend = {
                        username: users.rows[0].username,
                        profile_color: users.rows[0].profile_color,
                        room_id: room_ids.rows[i].room_id,
                        id: users.rows[0].id,
                        lastMessage: lastMessage.rows[0]
                    }
                    contacts.push(objToSend);
                    socket.join(room_ids.rows[i].room_id);
                }
                console.log('contacts', contacts);
                //if the are no messages in the room then the lastMessage property will be undefined so put it last
                contacts.sort((a, b) => {
                    if (a.lastMessage === undefined) {
                        return 1;
                    }
                    if (b.lastMessage === undefined) {
                        return -1;
                    }
                    if (a.lastMessage.created_at > b.lastMessage.created_at) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
            }
            //remove the lastMessage property from the contacts
            for (let i = 0; i < contacts.length; i++) {
                delete contacts[i].lastMessage;
            }
            io.to(socket.id).emit('contacts', contacts);
        } catch (err) {
            console.log(err);
            return;
        }
    });

    socket.on('remove_contact', async (data) => {
        const room_id = data.room_id;
        const user_id = data.user_id;
        try {
            const updateRoomParticipantProperty = 'UPDATE room_participants SET removed = true WHERE room_id = $1 AND user_id = $2';
            const updateRoomParticipantValues = [room_id, user_id];
            await pool.query(updateRoomParticipantProperty, updateRoomParticipantValues);
            io.to(socket.id).emit('contact_removed');
        } catch (err) {
            console.log(err);
            return;
        }
    })

    socket.on('return_all_users', async () => {
        const query = 'SELECT room_id FROM room_participants WHERE user_id = $1 AND removed = true';
        const values = [socket.request.user.id];
        try {
            const room_ids = await pool.query(query, values);
            const contacts = [];
            //find the user of the room that is not the current user
            for (let i = 0; i < room_ids.rows.length; i++) {
                if (room_ids.rows[i].room_id.includes('pv') === true) {
                    const query = 'SELECT username, profile_color, id FROM users WHERE id = (SELECT user_id FROM room_participants WHERE room_id = $1 AND user_id != $2)';
                    const values = [room_ids.rows[i].room_id, socket.request.user.id];
                    const users = await pool.query(query, values);
                    const objToSend = {
                        username: users.rows[0].username,
                        profile_color: users.rows[0].profile_color,
                        room_id: room_ids.rows[i].room_id,
                        id: users.rows[0].id
                    }
                    contacts.push(objToSend);
                }
            }
            io.to(socket.id).emit('return_all_users', contacts);
        } catch (err) {
            console.log(err);
            return;
        }
    });

    socket.on('join_room', (room_id) => {
        console.log('Joining room:', room_id);
        socket.join(room_id);
    });

    socket.on('search_user', async (search_query) => {
        console.log('Searching for:', search_query);
        const query = 'SELECT id, username, profile_color FROM users WHERE username ILIKE $1 LIMIT 10';

        const values = ['%' + search_query + '%'];

        try {
            const result = await pool.query(query, values);
            if (result.rows.length > 0) {
                console.log('Users found:', result.rows);
            } else {
                console.log('No users found', result.rows);
            }
            for (let i = 0; i < result.rows.length; i++) {
                if (result.rows[i].id === socket.request.user.id) {
                    result.rows.splice(i, 1);
                }
            }
            io.to(socket.id).emit('user_found', result.rows);
        } catch (err) {
            console.log(err);
            return;
        }
    });

    socket.on('find_last_message', async (room_id) => {
        console.log('Finding last message for:', room_id);
        const query = 'SELECT * FROM messages WHERE room_id = $1 ORDER BY created_at DESC LIMIT 1';
        const values = [room_id];
        try {
            const result = await pool.query(query, values);
            if (result.rows.length > 0) {
                //find the user of the message
                const userQuery = 'SELECT username, profile_color, id FROM users WHERE id = $1';
                const userValues = [result.rows[0].user_id];
                const user = await pool.query(userQuery, userValues);
                result.rows[0].user = user.rows[0];
                io.to(socket.id).emit('recieve_last_message', result.rows[0]);
            } else {
                console.log('No messages found');
                io.to(socket.id).emit('recieve_last_message', null);
            }
        } catch (err) {
            console.log(err);
            return;
        }
    })

    socket.on('find_room_messages_and_users', async (room_id) => {
        //find only the 10 latest messages and users and then let the client request more if needed through the load_more_messages event
        const messagesQuery = 'SELECT * FROM messages WHERE room_id = $1 ORDER BY created_at DESC LIMIT 10';
        const values = [room_id];

        const room_participantsQuery = 'SELECT user_id FROM room_participants WHERE room_id = $1';

        try {
            const messages = await pool.query(messagesQuery, values);
            const room_participants = await pool.query(room_participantsQuery, values)

            const users = []
            for (let i = 0; i < room_participants.rows.length; i++) {
                if (room_participants.rows[i].user_id === socket.request.user.id) {
                    continue;
                }
                const usersQuery = 'SELECT username, profile_color, id FROM users WHERE id = $1';
                const userId = [room_participants.rows[i].user_id];
                const user = await pool.query(usersQuery, userId);
                users.push(user.rows[0]);
            }

            //now try to attach the user obj to every message
            for (let i = 0; i < messages.rows.length; i++) {
                for (let j = 0; j < users.length; j++) {
                    if (messages.rows[i].user_id === users[j].id) {
                        messages.rows[i] = {
                            ...messages.rows[i],
                            user: users[j]
                        }
                    }
                }
            }
            io.to(socket.id).emit('recieve_room_messages_and_users', {
                messages: messages.rows,
                users: users,
                room_id: room_id
            });
        } catch (err) {
            console.log(err);
            return;
        }
    }
    );

    socket.on('load_more_messages', async (data) => {
        const messagesQuery = 'SELECT * FROM messages WHERE room_id = $1 ORDER BY created_at DESC LIMIT 10 OFFSET $2';
        const values = [data.room_name, data.messagesPage * 10];
        try {
            const messages = await pool.query(messagesQuery, values);
            const users = data.users;
            for (let i = 0; i < messages.rows.length; i++) {
                for (let j = 0; j < users.length; j++) {
                    if (messages.rows[i].user_id === users[j].id) {
                        messages.rows[i] = {
                            ...messages.rows[i],
                            user: users[j]
                        }
                    }
                }
            }
            io.to(socket.id).emit('load_more_messages', messages.rows);
        } catch (err) {
            console.log(err);
            return;
        }
    })

    socket.on('find_room', async (user_to_start_new_convo_with_id) => {
        console.log('Finding room for:', user_to_start_new_convo_with_id);

        const create_pv_room_name = (user_id_1, user_id_2) => {
            if (user_id_1 < user_id_2) {
                return `pv_${user_id_1}_${user_id_2}`;
            } else {
                return `pv_${user_id_2}_${user_id_1}`;
            }
        };



        const room_name = create_pv_room_name(socket.request.user.id, user_to_start_new_convo_with_id);
        const query = 'SELECT * FROM rooms WHERE id = $1 LIMIT 1';
        const values = [room_name];

        try {
            const result = await pool.query(query, values);
            if (result.rows.length > 0) {
                //first check if the user is not removed from the room
                const checkIfUserIsRemovedQuery = 'SELECT removed FROM room_participants WHERE room_id = $1 AND user_id = $2';
                const checkIfUserIsRemovedValues = [room_name, socket.request.user.id];
                const checkIfUserIsRemoved = await pool.query(checkIfUserIsRemovedQuery, checkIfUserIsRemovedValues);
                if (checkIfUserIsRemoved.rows[0].removed === true) {
                    console.log('User removed himself from the room but now wants to join again');
                    const updateRoomParticipantProperty = 'UPDATE room_participants SET removed = false WHERE room_id = $1 AND user_id = $2';
                    const updateRoomParticipantValues = [room_name, socket.request.user.id];
                    await pool.query(updateRoomParticipantProperty, updateRoomParticipantValues);
                }
                console.log('Room already exists');
                io.to(socket.id).emit('room_found', room_name);
                socket.join(room_name);
                return;
            } else {
                console.log('Room does not exist');
            }

            console.log('Creating room:', room_name);

            const create_room_query = 'INSERT INTO rooms (id, room_type) VALUES ($1, $2)';
            const create_room_values = [room_name, 'pv'];

            await pool.query(create_room_query, create_room_values);

            const add_users_to_room_query = 'INSERT INTO room_participants (room_id, user_id) VALUES ($1, $2), ($1, $3)';
            const add_users_to_room_values = [room_name, socket.request.user.id, user_to_start_new_convo_with_id];

            await pool.query(add_users_to_room_query, add_users_to_room_values);
            socket.join(room_name);

            io.to(socket.id).emit('room_found', room_name);
            console.log('joined room:', room_name);
            return;
        } catch (err) {
            console.log(err);
            return;
        }
    });

    socket.on("send_message", async (data) => {

        //the function has 2 parts
        //1. send the message to the room and store it to the database
        //2. emit an event to the room to signify that a message has been sent
        const userQuery = 'SELECT username, profile_color, id FROM users WHERE id = $1';
        const userValues = [data.user_id];

        const query = 'INSERT INTO messages (room_id, user_id, message) VALUES ($1, $2, $3) RETURNING *';
        const values = [data.room_id, socket.request.user.id, data.message];
        try {
            const user = await pool.query(userQuery, userValues);
            data.user = user.rows[0];
            data.viewed = false;
            const res = await pool.query(query, values);
            data.id = res.rows[0].id;
            socket.to(data.room_id).emit("receive_message", data);
            io.to(data.room_id).emit("recieve_last_message", data);
            io.to(data.room_id).emit("update_contacts", data.room_id);
            console.log()
        } catch (err) {
            console.log(err);
        }
    });

    socket.on('viewed', async (data) => {
        const query = 'UPDATE messages SET viewed = true WHERE id = $1';
        const values = [data.message_id];
        try {
            await pool.query(query, values);
            io.to(data.room_id).emit('viewed', data);
        } catch (err) {
            console.log(err);
        }
    })

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});



server.listen(port, () => {
    console.log(`Example app listening at port ${port}`);
});

