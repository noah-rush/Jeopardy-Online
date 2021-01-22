const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 3001;
const app = express();
const moment = require('moment');
const mongoose = require('mongoose');
const io = require('socket.io')();

const ioport = 8000;


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
// const uri = 'mongodb://localhost/basketball-reference'
mongoose.connect(uri);

io.on('connection', (client) => {

    client.on('subscribeToGame', (gameid) => {
        console.log('client is subscribing to game ' + gameid);
        client.join(gameid);
    })
    client.on('selectQuestion', (questionId, gameid) => {
        io.in(gameid).emit('questionID', questionId);
        db.Games.findOneAndUpdate({ _id: gameid }, { $push: { answered: questionId } }, {new:true}).then(function(result) {
            io.in(gameid).emit('answerUpdate', result.answered);
        })
    })
    client.on('closeQuestionSignal', (gameid) =>{
        io.in(gameid).emit('gameCloseQuestion');      
    })
    client.on('newScores', (gameid, scores, turn, guess, correct) => {

        io.in(gameid).emit("scoresUpdate", scores, turn, guess, correct)
        let newScores = []
        for (const [key, value] of Object.entries(scores)) {
            newScores.push(value)
        }
        db.Games.findOneAndUpdate({ _id: gameid }, { scores:newScores  }).then(function(result) {
        })
    })
    client.on('buzz', (gameid, playerName) =>{
        console.log("buzz received from " + playerName)
        io.in(gameid).emit("buzzUpdate",  playerName)

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
    db.Games.findOneAndUpdate({ _id: game }, { $addToSet: { players: player }, $push: {scores: 0}  }, {new:true}).populate('players').then(function(result) {
        io.in(game).emit('contestantUpdate', result.players)
        let scores = {};
        for(let i = 0; i<result.players.length; i++){
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

                                    db.Games.create({ title: req.body.name, doubleCategories: doubleJeopCategories, jeopardyCategories: jeopCategories }, function(err, small) {
                                        res.send(small)
                                    });
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
   console.log ( ip.address() );
   res.send(ip.address())

})


// Send every other request to the React app
// Define any API routes before this runs
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

app.listen(PORT, () => {
    console.log(`🌎 ==> Server now on port ${PORT}!`);
});

io.listen(ioport);
console.log('IO listening on port ', ioport);