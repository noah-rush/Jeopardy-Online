import React, { Component } from "react";
import "./App.css";
import API from "./Utils/API";

import Speech from 'react-speech';
import JeopardyBoard from './Components/JeopardyBoard/JeopardyBoard'
import Contestants from './Components/JeopardyBoard/Contestants'
import Question from './Components/JeopardyBoard/Question'
import Answer from './Components/JeopardyBoard/Answer'
import Result from './Components/JeopardyBoard/Result'

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
        activeCategory: "",
        newGameTitle: "",
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
        triedToAnswer: 0

    }

    loadCookies() {
        // cookies = instanceOf(Cookies).isRequired;
        const cookies = new Cookies();
        // console.log(Cookies)
        // console.log(cookies.get("playerName"));
        // cookies.set("playerName", "juancho")
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
            .then(res => this.setState({
                categories: res.data.jeopardyCategories,
                doubleCategories: res.data.doubleCategories,
                games: [],
                answered: res.data.answered,
                round: res.data.round
            }))
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

        this.setState({ scores: scores })
    }
    handleNewScores = (scores, turn, guess, correct) => {
        // console.log(turn)
        if (turn != 0 && turn != undefined) {
            this.setState({ turn: turn });
        }
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
            if (this.state.triedToAnswer == this.state.contestants.length) {
                this.questionOver(this.state.activeQuestion._id)
            }
        }

    }
    questionOver = (questionid) => {
        if (this.state.activeQuestion._id == questionid) {
            this.setState({
                activeResult: true,
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
            activeAnswer: false,
            activeResult: false,
            questionOver: false
        })
    }

    handleAnswerUpdate = (answers) => {
        this.setState({ answered: answers })
    }
    closeQuestion = () => {
        // clearTimeout(this.state.timer)
        this.setState({
            timer: "",
            // activeQuestion: "",
            activeAnswer: false,
            activeResult: false
        })
    }
    displayQuestion = (questionid, index1, index2) => {
        if (this.state.turn == this.state.playerNum) {
            API.selectQuestion(questionid, this.state.gameID)
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
        this.setState({
            activeAnswer: true,
            buzzedIn: playerName
        })
    }
    answerQuestion = (e) => {
        e.preventDefault();


        let correctAnswer = this.state.activeQuestion.answer
        let answerVal = this.state.activeQuestion.value.replace('$', '');
        let turnChange = false;
        let correct
        // let userScore = this.state.scores[this.state.playerID];
        if (this.state.guess != "") {
            if (this.state.guess.toLowerCase() == correctAnswer.toLowerCase()) {
                console.log("Correct")
                this.state.scores[this.state.playerID] = this.state.scores[this.state.playerID] + parseInt(answerVal)
                turnChange = true;
                correct = true;
            } else {
                this.setState({ canbuzz: false })
                console.log(correctAnswer)
                correct = false;
                this.state.scores[this.state.playerID] = this.state.scores[this.state.playerID] - parseInt(answerVal)
            }
        }
        // API.closeQuestion(this.state.gameID);
        if (turnChange) {
            API.submitScores(this.state.gameID, this.state.scores, this.state.playerNum, this.state.guess, correct)
        } else {
            API.submitScores(this.state.gameID, this.state.scores, 0, this.state.guess, correct)
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
            .then(() => {
                console.log("getting games")
                this.getGames();
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

        if (playerName == this.state.playerName && this.state.playerName == this.state.buzzedIn && this.state.activeAnswer && this.state.activeQuestion._id == questionId) {
            this.setState({ canbuzz: false })
            let correct = false;
            let answerVal = this.state.activeQuestion.value.replace('$', '');
            this.state.scores[this.state.playerID] = this.state.scores[this.state.playerID] - parseInt(answerVal)
            API.submitScores(this.state.gameID, this.state.scores, 0, "", correct)
        }
    }
    startGame = (gameID) => {
        this.setState({ gameID: gameID });
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
            questionOver: this.questionOver
        }

        API.connectToGame(gameID, this.state.playerID, reactFuncs).then(() => {
            this.getGame(this.state.gameID);
            console.log(this.state.contestants)
        })
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


    }
    render() {
        return (
            <div className = "jeopardy-game">
                <div className = "utility-menu">
                {this.state.mainScreen ? <h3 className = "my-name">{this.state.playerName}</h3> : ""}
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
                
                : ""}
                {this.state.activeAnswer ?
                <Answer 
                    handleAnswer = {this.handleAnswer}
                    answerQuestion = {this.answerQuestion}
                    buzzedIn = {this.state.buzzedIn}
                    me = {this.state.playerName}
                />
                : ""}
            {this.state.activeQuestion ? 
                <Question 
                    question = {this.state.activeQuestion}
                    buzz = {this.buzzIn}
                    canbuzz = {this.state.canbuzz}
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
            <div className = "jeopardy-board">
           <JeopardyBoard  
                    answered = {this.state.answered}
                    activeCategory = {this.state.activeCategory} 
                    displayQuestion = {this.displayQuestion} 
                    categories = {this.state.categories}>
            </JeopardyBoard>
            <Contestants
                scores = {this.state.scores}
                contestants = {this.state.contestants} 
                turn = {this.state.turn}
            />
            <SpeechRecognition displayQuestion = {this.displayQuestion} activeCategory = {this.state.activeCategory} categories = {this.state.categories} pickCategory = {this.pickCategory}></SpeechRecognition>
        </div>
    }
         
       </div>


        )


    }
}

export default App;