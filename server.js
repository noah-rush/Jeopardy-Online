require('dotenv').config(); // Allows use of environmental variables from the .env file

const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 3001;
const app = require('express')();
const http = require('http').createServer(app);


const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var db = require("./models");
var ip = require("ip");

const io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}

const uri = process.env.MONGODB_URI;
mongoose.connect(uri);



const ioFunc = require('./routes/io');
ioFunc(io, db)



app.post("/api/updateAnswers", (req, res) => {
    let game = req.body.game;
    let answered = req.body.answered;
    db.Games.findOneAndUpdate({ _id: game }, { $push: { answered: answered } }).then(function() {

    })

})

app.post("/api/create-player", (req, res) => {
    db.Players.create({ name: req.body.name }, function(err, small) {
        res.send(small)
    });
})

app.post("/api/add-to-game", (req, res) => {
    let game = req.body.game;
    let player = req.body.player;
    db.Games.findOneAndUpdate({ _id: game }, { $addToSet: { players: player }, $push: { scores: 0 } }, { new: true }).populate('players').then(function(result) {
        io.in(game).emit('contestantUpdate', result.players)
        let scores = {};
        for (let i = 0; i < result.players.length; i++) {
            scores[result.players[i]['_id']] = result.scores[i];
        }
        io.in(game).emit('scoresInit', scores)

        res.send(result)
    })
})

getCategories = function(round, num) {
    return new Promise((resolve, reject) => {
        db.Categories.aggregate([{
                $match: { type: round }
            }, {
                $sample: { size: num }
            }])
            .then(function(result) {
                db.Categories.populate(result, { path: "questions" })
                    .then(function(result) {
                        // console.log(result)
                        resolve(result)
                    })
            })
    })
}



app.post("/api/create-game", (req, res) => {

    getCategories("Jeopardy", 6).then(function(results) {
        jeopCategories = results
        // console.log(results)
        getCategories("Double Jeopardy", 6).then(function(results) {
            doubleJeopCategories = results
            getCategories("Final Jeopardy", 1).then(function(results) {
                final = results
                db.Games.create({
                        title: req.body.name,
                        doubleCategories: doubleJeopCategories,
                        jeopardyCategories: jeopCategories,
                        finalJeopardy: final[0]
                    },
                    function(err, small) {
                        res.send(small)
                    });
            })
        })
    });

})


app.get("/api/categories", (req, res) => {
    var categories = [];
    db.Games.findOne({ _id: req.query.gameid }).populate({
        path: 'jeopardyCategories',
        populate: { path: 'questions' }
    }).populate({
        path: 'doubleCategories',
        populate: { path: 'questions' }
    }).populate({
        path: 'finalJeopardy',
        populate: { path: 'questions' }
    }).populate('players').then(function(result) {
        res.send(result);
    })

});
app.get("/api/games", (req, res) => {
    db.Games.find().then(function(result) {
        res.send(result);
    })
})

app.get("/api/ip", (req, res) => {
    res.send(ip.address())

})


// Send every other request to the React app
// Define any API routes before this runs
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

http.listen(PORT, () => {
    console.log(`🌎 ==> Server now on port ${PORT}!`);
});