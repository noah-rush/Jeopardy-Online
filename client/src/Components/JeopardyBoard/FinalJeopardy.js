import React, { Component } from "react";
import Speech from 'react-speech';

var FinalJeopardy = (props) => {
    // console.log(props.activeCategor
    // let categories =props.categories 
    return (
        <div className = "final-jeopardy">
            {props.myscore > 0 ?
            <div className = "made-it">
            <h2>Welcome to Final Jeopardy</h2>
            {props.ready ? 
            <div className = "question-stage">
            <h3>{props.question.questions[0].question}</h3>
            {props.answered ?
                <div className = "final-guess">
                {props.guess}
                </div>:
            <form id = "final-answer" onSubmit = {(e) => {props.finalAnswer(e)}} >
                <input  onChange = {(e) => props.handleAnswer(e)} className = "final-answer" type = "text" name = "final-answer"></input>
                <input type = "submit"></input>
                
            </form>
        }
            </div>
            :
            <div className = "wager-stage">
            <h3>The category is <span className ="final-cat">{props.question.name}</span></h3>
            <h3>Place your wager</h3>
            {!props.wagerSubmitted ?
            <form id = "wager" onSubmit = {(e) => {props.placeWager(e)}} >
                <input min = "0" max = {props.myscore} onChange = {(e) => props.handleWager(e)} className = "wager" type = "number" name = "wager"></input>
                <input type = "submit"></input>
            </form>
            :""}
            </div>
        }
<div className = "contestants-table">
            {props.contestants.map((player, index) => (
    
            
            <div className =  "contestant" key = {index}>
            
                   <div className = "player-name">
                      {player.name}
                   </div>
                   <div className = "player-score">
                      {props.scores[player._id]}
                   </div>
            </div>
            ))}
        </div>

            </div>
            :
            <div className ="didnt-make-it">
            <h2>Sorry, you need money to participate in Final Jeopardy</h2>
            </div>
            }
       
        </div>
    )

}

export default FinalJeopardy;