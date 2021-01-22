import axios from "axios";
import openSocket from 'socket.io-client';
// const socket = openSocket('http://10.0.0.209:8000');
let socket;

export default {
  getSocketIP(){
    return axios.get("/api/ip");
  },
  initSocket(serverIP){
    socket = openSocket("http://" + serverIP + ":8000");
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
  connectToGame(gameID, playerId, handleQuestion, handleNewContestant, handleNewScores, handleAnswerUpdate, closeQuestion, handleBuzzUpdate, handleScoresInit){
    socket.emit('subscribeToGame', gameID);
    socket.on('questionID', questionID =>  handleQuestion( questionID) );
    socket.on('contestantUpdate', player =>  handleNewContestant(player) );
    socket.on('scoresUpdate', (scores, turn, guess, correct) =>  handleNewScores(scores, turn, guess, correct) );
    socket.on('scoresInit', (scores) =>  handleScoresInit(scores) );

    socket.on('answerUpdate', answers =>  handleAnswerUpdate(answers) );
    socket.on('gameCloseQuestion', () => {closeQuestion()} );
    socket.on('buzzUpdate', (playerName) => {handleBuzzUpdate(playerName)} );

    return axios.post("/api/add-to-game", {
      game:gameID,
      player:playerId
    })

  },
  selectQuestion(questionID, gameid){
    socket.emit('selectQuestion', questionID, gameid)
  },
  closeQuestion(gameID){
    socket.emit('closeQuestionSignal', gameID);
  },
  submitScores(gameid, scores, turn, answer, correct){
    socket.emit('newScores', gameid, scores, turn, answer, correct)
  },
  buzz(gameID, playerName){
    socket.emit('buzz', gameID, playerName)
  }
  
};
