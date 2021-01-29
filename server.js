const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 3001;
const moment = require('moment');
const mongoose = require('mongoose');
// const io = require('socket.io')();

// const ioport = 8000;
const app = require('express')();
const http = require('http').createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// httpServer.listen(3000);



var db = require("./models");
var ip = require("ip");

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}

const uri =  process.env.MONGODB_URI;
// const uri = 'mongodb://localhost/jeopardy'
mongoose.connect(uri);

let questionTimers = {}
var Timer = function(callback, delay) {
    var timerId, start, remaining = delay;

    this.pause = function() {
        clearTimeout(timerId);
        remaining -= Date.now() - start;
        console.log(remaining)
    };

    this.resume = function() {
        start = Date.now();
        clearTimeout(timerId);
        timerId = setTimeout(callback, remaining);
    };

    this.resume();
};

io.on('connection', (client) => {
    console.log("we have io connection")
    client.on('subscribeToGame', (gameid) => {
        console.log('client is subscribing to game ' + gameid);
        client.join(gameid);
    })
    client.on('selectQuestion', (questionId, gameid) => {
        io.in(gameid).emit('questionID', questionId);
        db.Games.findOneAndUpdate({ _id: gameid }, { $push: { answered: questionId } }, { new: true }).then(function(result) {
            io.in(gameid).emit('answerUpdate', result.answered);
        })
        questionTimers[gameid] = new Timer(() => { io.in(gameid).emit("questionOver", questionId) }, 8000);

    })
    client.on('closeQuestionSignal', (gameid) => {
        io.in(gameid).emit('gameCloseQuestion');
    })
    client.on('newScores', (gameid, scores, turn, guess, correct, round) => {
        io.in(gameid).emit("scoresUpdate", scores, turn, guess, correct)
        if (round != 3) {
            questionTimers[gameid].resume()
        }
        let newScores = []
        for (const [key, value] of Object.entries(scores)) {
            newScores.push(value)
        }
        db.Games.findOneAndUpdate({ _id: gameid }, { scores: newScores }).then(function(result) {})
    })
    client.on('buzz', (gameid, playerName, questionId) => {
        console.log("buzz received from " + playerName + " on question " + questionId)
        io.in(gameid).emit("buzzUpdate", playerName)
        questionTimers[gameid].pause()
        setTimeout(() => { io.in(gameid).emit("timesUp", playerName, questionId) }, 6000);

    })
    client.on('updateRound', (gameid, round) => {
        db.Games.findOneAndUpdate({ _id: gameid }, {
            $set: { answered: [], round: round }
        }).then(function() {

        })
    })
    client.on('finalWager', (gameid, playerName, wager) => {
        db.Games.findOneAndUpdate({ _id: gameid }, { $inc: { 'wagersReceived': 1 } }).then(function(data) {
            console.log(data)
            console.log(data.wagersReceived)
            console.log(data.players.length)
            if (data.wagersReceived >= data.players.length - 1) {
                console.log("finally")
                io.in(gameid).emit("initFinalQuestion")

            }
        })
    })
    client.on('submitFinal', (gameid, playerName, guess) => {
        io.in(gameid).emit("finalGuess", playerName, guess)
        db.Games.findOneAndUpdate({ _id: gameid }, { $inc: { 'finalAnswersReceived': 1 } }).then(function(data) {
            if (data.finalAnswersReceived >= data.players.length - 1) {
                console.log("finally")
                io.in(gameid).emit("gameOver")
                db.Games.findOneAndUpdate({ _id: gameid }, { $set: { round: 4 } }).then(function(data){
                    console.log(data)
                    console.log("round 4")
                })
            }
        })
    })
});



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

app.post("/api/create-game", (req, res) => {

    var jeopCategories = [];
    var doubleJeopCategories = [];

    db.Categories.count({ type: "Jeopardy" }).then(function(count) {

        let counter = 0;

        for (var i = 0; i < 6; i++) {
            let skipRand = Math.floor(Math.random() * count);
            db.Categories.findOne({ type: "Jeopardy" }).skip(skipRand).populate('questions').limit(1).then(function(result) {
                counter = counter + 1;
                jeopCategories.push(result)
                if (counter == 6) {

                    db.Categories.count({ type: "Double Jeopardy" }).then(function(count) {

                        let counter2 = 0;

                        for (var i = 0; i < 6; i++) {

                            let skipRand = Math.floor(Math.random() * count);
                            db.Categories.findOne({ type: "Double Jeopardy" }).skip(skipRand).populate('questions').limit(1).then(function(result) {
                                counter2 = counter2 + 1;
                                doubleJeopCategories.push(result)
                                if (counter2 == 6) {


                                    db.Categories.count({ type: "Final Jeopardy" }).then(function(count) {
                                        let skipRand = Math.floor(Math.random() * count);
                                        db.Categories.findOne({ type: "Final Jeopardy" }).skip(skipRand).populate('questions').limit(1).then(function(result) {

                                            db.Games.create({
                                                    title: req.body.name,
                                                    doubleCategories: doubleJeopCategories,
                                                    jeopardyCategories: jeopCategories,
                                                    finalJeopardy: result
                                                },
                                                function(err, small) {
                                                    res.send(small)
                                                });

                                        })
                                    })



                                }
                            })
                        }
                    })
                }
            })
        }
    })
})


app.get("/api/categories", (req, res) => {
    // var db = require("./models");
    // console.log(req.query.gameid)
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
    console.log(ip.address());
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

// io.listen(ioport);
// console.log('IO listening on port ', ioport);