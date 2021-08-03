const Timer = require('./timer')
const questionTime = 8
const guessTime = 6



ioFunc = (io, db, timers) => {

    let questionTimers = {}

    io.on('connection', (client) => {

        client.on('subscribeToGame', (gameid) => {
            client.join(gameid);
        })

        client.on('unsubscribeFromGame', (gameid) => {
            client.leave(gameid)
        })

        client.on('selectQuestion', (questionId, gameid) => {
            io.in(gameid).emit('questionID', questionId);
            db.Games.findOneAndUpdate({ _id: gameid }, 
                { $push: { answered: questionId } }, 
                { new: true })
            .then(function(result) {
                io.in(gameid).emit('answerUpdate', result.answered);
            })
            questionTimers[gameid] = new Timer(() => { io.in(gameid).emit("questionOver", questionId) }, questionTime*1000);

        })

        client.on('buzz', (gameid, playerName, questionId) => {
            io.in(gameid).emit("buzzUpdate", playerName)
            questionTimers[gameid].pause()
            setTimeout(() => { io.in(gameid).emit("timesUp", playerName, questionId) }, guessTime*1000);
        })

        client.on('closeQuestionSignal', (gameid) => {
            io.in(gameid).emit('gameCloseQuestion');
        })

        client.on('newScores', (gameid, scores, turn, guess, correct, round) => {
            io.in(gameid).emit("scoresUpdate", scores, turn, guess, correct)
            if (round != 3 && !correct) {
                questionTimers[gameid].resume()
            }
            if(correct){
                questionTimers[gameid] = ""
            }
            let newScores = []
            for (const [key, value] of Object.entries(scores)) {
                newScores.push(value)
            }
            db.Games.findOneAndUpdate({ _id: gameid }, { scores: newScores }).then(function(result) {})
        })
        
        client.on('updateRound', (gameid, round) => {
            db.Games.findOneAndUpdate({ _id: gameid }, {
                $set: { answered: [], round: round }
            }).then(function() {

            })
        })

        client.on('finalWager', (gameid, playerName, wager) => {
            db.Games.findOneAndUpdate({ _id: gameid },
                                      { $inc: { 'wagersReceived': 1 } 
            }).then(function(data) {

                if (data.wagersReceived >= data.players.length - 1) {
                    io.in(gameid).emit("initFinalQuestion")
                }
                
            })
        })

        client.on('submitFinal', (gameid, playerName, guess) => {
            io.in(gameid).emit("finalGuess", playerName, guess)

            db.Games.findOneAndUpdate({ _id: gameid },
                                      { $inc: { 'finalAnswersReceived': 1 } 
            }).then(function(data) {

                if (data.finalAnswersReceived >= data.players.length - 1) {
                    io.in(gameid).emit("gameOver")

                    db.Games.findOneAndUpdate({ _id: gameid },
                     { $set: { round: 4 } 
                    }).then(function(data) {})

                }
            })
        })

    });
}

module.exports = ioFunc;