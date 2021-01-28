import axios from "axios";
import io from 'socket.io-client';
// const socket = openSocket('http://10.0.0.209:8000');
let socket;

export default {
  getSocketIP(){
    return axios.get("/api/ip");
  },
  initSocket(serverIP){
    socket = io();
    // socket = io();
  },
  getCategories: function(gameid) {
    return axios.get("/api/categories",
      {params:{gameid:gameid}}
      );
  },
  getGames: function() {
    return axios.get("/api/games");
  },
  updateGameAnswers: function(answered, game){
    return axios.post("/api/updateAnswers", {
      game:game,
      answered: answered
    })
  },
  createNewGame: (name) =>{
    // console.log(name)
    return axios.post("/api/create-game", {
      name: name
    })
  },
  createNewPlayer: (name) =>{
    // console.log(name)
    return axios.post("/api/create-player", {
      name: name
    })
  },
  subscribeToTimer(cb) {
    socket.on('timer', timestamp => cb(null, timestamp));
    socket.emit('subscribeToTimer', 5000);
  },
  connectToGame(gameID, playerId, reactFuncs){
    socket.emit('subscribeToGame', gameID);
    socket.on('questionID', questionID =>  reactFuncs['handleQuestion']( questionID) );
    socket.on('contestantUpdate', player =>  reactFuncs['handleNewContestant'](player) );
    socket.on('scoresUpdate', (scores, turn, guess, correct) =>  reactFuncs['handleNewScores'](scores, turn, guess, correct) );
    socket.on('scoresInit', (scores) =>  reactFuncs['handleScoresInit'](scores) );

    socket.on('answerUpdate', answers =>  reactFuncs['handleAnswerUpdate'](answers) );
    socket.on('gameCloseQuestion', () => {reactFuncs['closeQuestion']()} );
    socket.on('buzzUpdate', (playerName) => {reactFuncs['handleBuzzUpdate'](playerName)} );
    socket.on('timesUp', (playerName, questionId) => {reactFuncs['timesUp'](playerName, questionId)} );
    socket.on('questionOver', (questionId) => {reactFuncs['questionOver'](questionId)} );
    socket.on('initFinalQuestion', () => reactFuncs['initFinalQuestion']());
    socket.on('gameOver', () => reactFuncs['gameOver']());
    socket.on('finalGuess', (player,guess) => reactFuncs['finalGuess'](player,guess));

    return axios.post("/api/add-to-game", {
      game:gameID,
      player:playerId
    })

  },
  updateRound(gameID, newRound){
    socket.emit("updateRound", gameID, newRound)
  },
  selectQuestion(questionID, gameid){
    socket.emit('selectQuestion', questionID, gameid)
  },
  closeQuestion(gameID){
    socket.emit('closeQuestionSignal', gameID);
  },
  submitScores(gameid, scores, turn, answer, correct, round){
    socket.emit('newScores', gameid, scores, turn, answer, correct,round)
  },
  buzz(gameID, playerName, question){
    socket.emit('buzz', gameID, playerName, question)
  },
  placeFinalWager(gameID, playerName, wager){
    socket.emit('finalWager', gameID, playerName, wager)
  },
   submitFinal(gameID, playerName, guess){
    socket.emit('submitFinal', gameID, playerName, guess)
  }
  
};
