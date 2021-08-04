import React, { Component } from "react";
import "./App.css";
import API from "./Utils/API";
import GAME from "./Utils/game";

import Speech from 'react-speech';
import JeopardyBoard from './Components/JeopardyBoard/JeopardyBoard'
import Contestants from './Components/JeopardyBoard/Contestants'
import Question from './Components/JeopardyBoard/Question'
import Answer from './Components/JeopardyBoard/Answer'
import Result from './Components/JeopardyBoard/Result'
import FinalJeopardy from './Components/JeopardyBoard/FinalJeopardy'
import GameOver from './Components/JeopardyBoard/GameOver'
import TurnWarning from './Components/JeopardyBoard/TurnWarning'
import MainMenu from './Components/MainMenu'
import Welcome from './Components/WelcomeScreen'
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';

import SpeechRecognition from './Components/SpeechRecognition/SpeechRecognition';



class App extends Component {


    state = {

        categories: [],
        activeQuestion: "",
        activeAnswer: false,
        activeResult: false,
        timer: "",
        userScore: 0,
        mainScreen: true,
        activeCategory: -1,
        newGameTitle: "",
        game: "",
        games: [],
        answered: [],
        gameID: "",
        round: 0,
        timestamp: "No Timestamp yet",
        playerID: "",
        playerName: '',
        playerNum: 0,
        contestants: [],
        scores: [],
        turn: 1,
        buzzedIn: "",
        canbuzz: true,
        correct: false,
        resultTimer: "",
        questionOver: false,
        triedToAnswer: 0,
        totalQuestionsInRound: 0,
        finalWager: 0,
        finalWagerSubmitted: false,
        finalQuestion: false,
        finalQuestionAnswered: false,
        finalResults: false,
        finalGuesses: {},
        gameOver: false,
        activeAnswerTimer: "",
        guess: "",
        resetSpeechTimer: setInterval(() => { this.resetSpeechRecog() }, 5000),
        turnWarning: false,
        questionTimer:8
    }

    loadCookies() {
        const cookies = new Cookies();
        this.setState({
            playerName: cookies.get("playerName") || "",
            playerID: cookies.get("playerID") || "",

        })
    }

    componentDidMount() {

        API.getSocketIP().then(
            (res) => {
                console.log(res);
                API.initSocket(res.data)
            })
        this.loadCookies()
        this.getGames();
        this.buzzButton = React.createRef();
        this.answerField = React.createRef();
    }
    componentWillUnmount(){
        API.disconnectFromGame(this.state.gameID)
        clearInterval(this.state.resetSpeechTimer)
        clearInterval(this.state.resultTimer)
        
    }
    getGames = () => {
        API.getGames()
            .then(res => this.setState({
                games: res.data
            }))
            .catch(err => console.log(err))
    }

    getGame = (gameID) => {
        API.getCategories(gameID)
            .then((res) => {
                let categories = res.data.jeopardyCategories
                let gameOver = false
                if (res.data.round == 2) {
                    categories = res.data.doubleCategories
                }
                if (res.data.round == 4) {
                    gameOver = true
                }
                if (res.data.round == 3) {
                    let preFinalScores = { ...this.state.scores }
                    this.setState({ preFinalScores: preFinalScores })
                }
                this.setState({
                    categories: categories,
                    doubleCategories: res.data.doubleCategories,
                    finalJeopardy: res.data.finalJeopardy,
                    games: [],
                    answered: res.data.answered,
                    round: res.data.round,
                    gameOver: gameOver
                })

                let qsInRound = 0;
                for (var i = 0; i < categories.length; i++) {
                    qsInRound += categories[i].questions.length
                }
                this.setState({ totalQuestionsInRound: qsInRound })
                if (res.data.answered.length == qsInRound) {
                    this.startNextRound()
                }
            })
            .catch(err => console.log(err));

    }
    handleNewContestant = (players) => {
        this.setState({ contestants: players })
        for (var i = 0; i < players.length; i++) {
            if (this.state.playerID == players[i]._id) {
                this.state.playerNum = i + 1;
            }
        }
    }
    handleScoresInit = (scores) => {

        this.setState({ scores: scores, preFinalScores: scores })

    }
    handleNewScores = (scores, turn, guess, correct) => {
        clearInterval(this.state.activeAnswerTimer)
        if (this.state.round != 3) {
            if (turn != 0 && turn != undefined) {
                this.setState({ turn: turn });
            }
            if (!this.state.activeResult) {
                if (correct) {
                    this.setState({
                        scores: scores,
                        guess: guess,
                        correct: correct,
                        activeResult: true,
                        resultTimer: setTimeout(() => {
                            this.closeQuestionFinal()
                        }, 1500)
                    })
                } else {

                    this.setState({
                        scores: scores,
                        guess: guess,
                        correct: correct,
                        activeResult: true,
                        triedToAnswer: this.state.triedToAnswer + 1,
                        resultTimer: setTimeout(() => {
                            this.closeQuestion()
                        }, 1500)
                    })

                }
            }
        } else {
            this.setState({
                scores: scores
            })
        }

    }
    endQuestion = (questionid) => {
        if (this.state.activeQuestion._id == questionid) {
            this.setState({
                activeResult: true,
                triedToAnswer: 0,
                questionTimer:0,
                questionOver: true,
                resultTimer: setTimeout(() => {
                    this.closeQuestionFinal()
                }, 1500)
            })
        }
    }
    closeQuestionFinal = () => {
        this.setState({
            timer: "",
            activeQuestion: "",
            guess: "",
            activeAnswer: false,
            activeResult: false,
            questionOver: false,
            questionTimer:8
        })
        API.closeQuestion(this.state.gameID)
        if (this.state.totalQuestionsInRound == this.state.answered.length) {
            this.startNextRound()

        }
    }
    startNextRound = () => {
        if (this.state.round == 2) {
            this.setState({ preFinalScores: this.state.scores, round: 3, answered: [], categories: this.state.doubleCategories })
            API.updateRound(this.state.gameID, 3)

        }
        if (this.state.round == 1) {
            this.setState({ round: 2, answered: [], categories: this.state.doubleCategories })
            API.updateRound(this.state.gameID, 2)
            let qsInRound = 0;
            for (var i = 0; i < this.state.categories.length; i++) {
                qsInRound += this.state.categories[i].questions.length
            }
            this.setState({ totalQuestionsInRound: qsInRound })
        }

    }
    handleAnswerUpdate = (answers) => {
        this.setState({ answered: answers })
    }
    closeQuestion = () => {
        this.setState({
            timer: "",
            guess: "",
            activeAnswer: false,
            activeResult: false
        })
        if (this.state.triedToAnswer == this.state.contestants.length) {

            this.endQuestion(this.state.activeQuestion._id)

        }
    }
    displayQuestion = (questionid) => {
        clearInterval(this.state.activeAnswerTimer)
        if (this.state.turn == this.state.playerNum) {
            API.selectQuestion(questionid, this.state.gameID)
        } else {
            this.setState({ turnWarning: true })
        }
    }
    pickCategory = (index1) => {
        console.log(index1)
        this.setState({
            activeCategory: index1
        })

    }
    buzzIn = () => {
        API.buzz(this.state.gameID, this.state.playerName, this.state.activeQuestion._id)
    }
    handleBuzzUpdate = (playerName) => {
        console.log(playerName)
        if (!this.state.activeAnswer) {


            this.setState({
                activeAnswer: true,
                buzzedIn: playerName,
                answerSeconds: 6,
                activeAnswerTimer: setInterval(() => {
                    this.setState({ answerSeconds: this.state.answerSeconds - 1 })
                }, 1000)
            })
            this.answerField.current.focus()
        }
    }
    answerFinalQuestion = (e) => {
        e.preventDefault();

        let correctAnswer = this.state.finalJeopardy.questions[0].answer
        let correct = false
        this.setState({ finalQuestionAnswered: true })
        if (this.state.guess != "") {
            if (this.state.guess.toLowerCase() == correctAnswer.toLowerCase()) {
                console.log("Correct")
                this.state.scores[this.state.playerID] = this.state.scores[this.state.playerID] + parseInt(this.state.finalWager)
            } else {
                this.state.scores[this.state.playerID] = this.state.scores[this.state.playerID] - parseInt(this.state.finalWager)
            }
        }
        API.submitFinal(this.state.gameID, this.state.playerName, this.state.guess)
        API.submitScores(this.state.gameID, this.state.scores, this.state.playerNum, this.state.guess, correct, this.state.round)
    }
    answerQuestion = (e) => {
        e.preventDefault();
        if (this.state.guess != "") {

            clearInterval(this.state.activeAnswerTimer)
            let answerVal = this.state.activeQuestion.value.replace('$', '');
            let turnChange = false;

            let correct = GAME.correctAnswer(this.state.guess, this.state.activeQuestion.answer.toLowerCase())


            if (correct) {
                this.state.scores[this.state.playerID] = this.state.scores[this.state.playerID] + parseInt(answerVal)
                turnChange = true;
            } else {
                this.setState({ canbuzz: false })
                this.state.scores[this.state.playerID] = this.state.scores[this.state.playerID] - parseInt(answerVal)
            }

            if (turnChange) {
                API.submitScores(this.state.gameID, this.state.scores, this.state.playerNum, this.state.guess, correct, this.state.round)
            } else {
                API.submitScores(this.state.gameID, this.state.scores, 0, this.state.guess, correct, this.state.round)
            }
        }
    }

    handleAnswer = (event) => {
        this.setState({
            guess: event.target.value
        })
    }
    handleGameTitle = (event) => {
        this.setState({
            newGameTitle: event.target.value
        })
    }
    handlePlayerName = (event) => {
        this.setState({
            newPlayerName: event.target.value
        })
    }
    createNewGame = (e) => {
        e.preventDefault();
        API.createNewGame(this.state.newGameTitle)
            .then((data) => {
                // console.log(data)
                // console.log("getting games")
                // this.getGames();
                this.startGame(data.data._id, data.data.title)
            })
            .catch(err => console.log(err));
    }
    createNewPlayer = (e) => {
        e.preventDefault();
        API.createNewPlayer(this.state.newPlayerName)
            .then((player) => {
                const cookies = new Cookies();
                cookies.set("playerID", player.data._id);
                cookies.set("playerName", player.data.name);
                this.setState({ playerID: player.data._id })
                this.setState({ playerName: player.data.name })

            })
            .catch(err => console.log(err));
    }
    timesUp = (playerName, questionId) => {
        clearInterval(this.state.activeAnswerTimer)

        if (!this.state.activeResult && playerName == this.state.playerName && this.state.playerName == this.state.buzzedIn && this.state.activeAnswer && this.state.activeQuestion._id == questionId) {
            this.setState({ canbuzz: false })
            let correct = false;
            let answerVal = this.state.activeQuestion.value.replace('$', '');
            this.state.scores[this.state.playerID] = this.state.scores[this.state.playerID] - parseInt(answerVal)
            API.submitScores(this.state.gameID, this.state.scores, 0, "", correct, this.state.round)

        }
    }
    finalGuess = (player, answer) => {
        this.state.finalGuesses[player] = answer

        console.log(this.state.finalGuesses)
    }
    gameOver = () => {
        console.log("game Over")
        this.setState({ gameOver: true })
    }
    backToMain = (e) => {
        e.preventDefault()
        this.setState({ mainScreen: true });
        API.disconnectFromGame(this.state.gameID);
        this.setState({ gameID: "", game: "", turnWarning: false });
        this.getGames()



    }
    timerUpdate = (time) =>{
        this.setState({questionTimer:time})
    }
    startGame = (gameID, gameName) => {


        this.setState({ gameID: gameID, game: gameName });
        this.setState({ mainScreen: false });
        let reactFuncs = {
            handleQuestion: this.handleQuestion,
            handleNewContestant: this.handleNewContestant,
            handleNewScores: this.handleNewScores,
            handleBuzzUpdate: this.handleBuzzUpdate,
            handleScoresInit: this.handleScoresInit,
            handleAnswerUpdate: this.handleAnswerUpdate,
            closeQuestion: this.closeQuestion,
            timesUp: this.timesUp,
            questionOver: this.endQuestion,
            initFinalQuestion: this.initFinalQuestion,
            finalGuess: this.finalGuess,
            gameOver: this.gameOver,
            timerUpdate:this.timerUpdate
        }

        API.connectToGame(gameID, this.state.playerID, reactFuncs).then(() => {
            this.getGame(this.state.gameID);
            console.log(this.state.contestants)
        })
    }
    initFinalQuestion = () => {
        console.log("final question ready")
        this.setState({ finalQuestion: true })
    }
    handleQuestion = (questionID) => {

        let activeCategory = this.state.categories.filter((x, index) => {
            return x.questions.some((element) => element._id == questionID);
        })
        let activeQuestion = activeCategory[0].questions.filter((x) => x._id == questionID);
        this.setState({
            activeQuestion: activeQuestion[0],
            canbuzz: true

        })
        const mouseClickEvents = ['click'];

        function simulateMouseClick(element) {
            mouseClickEvents.forEach(mouseEventType =>
                element.dispatchEvent(
                    new MouseEvent(mouseEventType, {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                        buttons: 1
                    })
                )
            );
        }

        var element = document.querySelector('.question-name[id="' + questionID + '"] + .rs-container button');
        simulateMouseClick(element);
        this.buzzButton.current.focus()


    }
    resetSpeechRecog = () => {
        if (this.state.gameID != "" && this.state.round < 3) {
            const mouseClickEvents = ['click'];


            function simulateMouseClick(element) {
                mouseClickEvents.forEach(mouseEventType =>
                    element.dispatchEvent(
                        new MouseEvent(mouseEventType, {
                            view: window,
                            bubbles: true,
                            cancelable: true,
                            buttons: 1
                        })
                    )
                );
            }

            var element = document.querySelector('#resetSpeech');
            simulateMouseClick(element);
        }
    }
    handleFinalWager = (wager) => {
        // console.log(wager.target.value)
        this.setState({ finalWager: wager.target.value })
    }
    placeFinalWager = (wager) => {
        wager.preventDefault();
        this.setState({ finalWagerSubmitted: true })
        API.placeFinalWager(this.state.gameID, this.state.playerName, this.state.finalWager)
    }

    closeWarning = () => {
        this.setState({ turnWarning: false })
    }
    render() {
        return (
            <div className = "jeopardy-game">
                {this.state.turnWarning ? 
                    <TurnWarning close = {this.closeWarning} turn = {this.state.contestants[this.state.turn -1].name}></TurnWarning> :""}
                
                <div className = "utility-menu">
                {this.state.playerID != "" ? 
                <div className ="game-info">
                <h3 className = "my-name">{this.state.playerName}
                {this.state.game !="" ? "  |  " + this.state.game : ""}
                </h3> 
                </div>
                : ""}
                </div>


                 {this.state.activeResult ? 
                <Result 
                questionOver = {this.state.questionOver}
                    buzz = {this.state.buzzedIn}
                    correct = {this.state.correct}
                    question = {this.state.activeQuestion}
                    guess = {this.state.guess}
                    me = {this.state.playerName}

                />
                
                : 
                this.state.activeAnswer ?
                <Answer 
                    handleAnswer = {this.handleAnswer}
                    answerQuestion = {this.answerQuestion}
                    buzzedIn = {this.state.buzzedIn}
                    me = {this.state.playerName}
                    ref = {this.answerField}
                    seconds = {this.state.answerSeconds}
                />
                : ""}


            {this.state.activeQuestion ? 
                <Question 
                    seconds = {this.state.questionTimer}
                    question = {this.state.activeQuestion}
                    buzz = {this.buzzIn}
                    canbuzz = {this.state.canbuzz}
                    ref = {this.buzzButton}
                    // handleAnswer = {this.handleAnswer}
                    // answerQuestion = {this.answerQuestion}
                />
                
            : ""}


            {this.state.mainScreen ? 
                this.state.playerID == "" ?
                <div className = "player-reg">
                    <Welcome handlePlayerName = {this.handlePlayerName}
                            createNewPlayer = {this.createNewPlayer}/>
                </div>
                :
                <div className = "main-menu">

                <MainMenu   
                    startGame ={this.startGame}
                    createNewGame = {this.createNewGame} 
                    handleGameTitle = {this.handleGameTitle} 
                    games = {this.state.games}>
                </MainMenu>
                </div>
                :
                this.state.round >= 3 ?

                this.state.gameOver ?
                <div>
                <GameOver
                finalGuesses = {this.state.finalGuesses}
                scores = {this.state.preFinalScores}
                finalScores = {this.state.scores}
                contestants = {this.state.contestants} 
                finalAnswer = {this.state.finalJeopardy.questions[0].answer}

                />
                <Contestants
                scores = {this.state.scores}
                contestants = {this.state.contestants} 
                turn = '9'
                backToMenu = {this.backToMain}
            />
            </div>
                :
                <div className = "jeopardy-board">
                <Contestants
                scores = {this.state.scores}
                contestants = {this.state.contestants} 
                turn = '9'
                backToMenu = {this.backToMain}
            />
                <FinalJeopardy
        
                wagerSubmitted = {this.state.finalWagerSubmitted}
                wager = {this.state.finalWager}
                handleWager = {this.handleFinalWager}
                placeWager = {this.placeFinalWager}
                ready = {this.state.finalQuestion}
                myscore = {this.state.preFinalScores[this.state.playerID]}
                question = {this.state.finalJeopardy}
                handleAnswer = {this.handleAnswer}
                finalAnswer = {this.answerFinalQuestion}
                scores = {this.state.preFinalScores}
                finalScores = {this.state.scores}
                contestants = {this.state.contestants} 
                turn = {this.state.turn}
                answered={this.state.finalQuestionAnswered}
                guess = {this.state.guess}

                />
                </div>
                :
            <div className = "jeopardy-board">
            <div className = "just-the-board">

           <JeopardyBoard  
                    endRound= {this.state.totalQuestionsInRound}
                    answered = {this.state.answered}
                    activeCategory = {this.state.activeCategory} 
                    displayQuestion = {this.displayQuestion} 
                    categories = {this.state.categories}
                    doubleCat = {this.state.doubleCategories}
                    round = {this.state.round}/>
            </div>
            <Contestants
                scores = {this.state.scores}
                contestants = {this.state.contestants} 
                turn = {this.state.turn}
                backToMenu = {this.backToMain}
            />
            <SpeechRecognition 
            displayQuestion = {this.displayQuestion} 
            activeCategory = {this.state.activeCategory} 
            categories = {this.state.categories} 
            pickCategory = {this.pickCategory}
        ></SpeechRecognition>
        </div>
    }
         
       </div>


        )


    }
}

export default App;