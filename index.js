const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const User = require("./models/User.model");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require("mongoose");
const Class = require("./models/Class.model");

//Socket programming
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/faceRecog')

app.post('/api/register', async (req, res) => {
    console.log(req.body)
    try {
        const newPassword = await bcrypt.hash(req.body.password, 10)
        let user = await User.create({
            name: req.body.name,
            age: req.body.age,
            userName: req.body.userName,
            contact: req.body.contact,
            password: newPassword,
            registerNo: req.body.registerNo,
        })
        res.json({ status: 'ok', id: user._id })
    } catch (err) {
        res.json({ status: 'error', error: 'Duplicate email' })
    }
})

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        userName: req.body.userName,
    })

    if (!user) {
        return { status: 'error', error: 'Invalid login' }
    }

    const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
    )

    if (isPasswordValid) {
        const token = jwt.sign(
            {
                name: user.name,
                email: user.email,
            },
            'secret123'
        )

        return res.json({ status: 'ok', user: token })
    } else {
        return res.json({ status: 'error', user: false })
    }
})


app.get('/api/viewprofile/:id', async (req, res) => {
    const user = await User.findById(req.params.id)
    res.json({ status: 'ok', user })
})

app.post('/api/addclass', async (req, res) => {
    console.log(req.body)
    try {
        let class1 = await Class.create({
            name: req.body.name,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
        })
        res.json({ status: 'ok', id: class1._id })
    } catch (err) {
        res.json({ status: 'error', error: 'Duplicate email' })
    }
})


app.get('/api/viewclasses', async (req, res) => {
    Class.find((err, data) => {
        if (!err) {
            return res.json(data);

        }
        else {
            return res.json(`Something went wrong, please try again. ${err}`);
        }
    }
    )
})

app.get('/api/viewstudents', async (req, res) => {
    User.find((err, data) => {
        if (!err) {
            return res.json(data);
        }
        else {
            return res.json(`Something went wrong, please try again. ${err}`);
        }

    }
    )
})





const PORT = process.env.PORT || 5000;

app.get("/video", (req, res) => {
    res.send("Running");
});

io.on("connection", (socket) => {
    socket.emit("me", socket.id);

    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
        io.to(userToCall).emit("callUser", {
            signal: signalData,
            from,
            name,
        });
    });

    socket.on("updateMyMedia", ({ type, currentMediaStatus }) => {
        console.log("updateMyMedia");
        socket.broadcast.emit("updateUserMedia", { type, currentMediaStatus });
    });

    socket.on("msgUser", ({ name, to, msg, sender }) => {
        io.to(to).emit("msgRcv", { name, msg, sender });
    });

    socket.on("answerCall", (data) => {
        socket.broadcast.emit("updateUserMedia", {
            type: data.type,
            currentMediaStatus: data.myMediaStatus,
        });
        io.to(data.to).emit("callAccepted", data);
    });
    socket.on("endCall", ({ id }) => {
        io.to(id).emit("endCall");
    });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));