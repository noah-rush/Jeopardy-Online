import React, { Component } from "react";

var Answer = (props) => {
    return (
        <div className = "active-answer-panel">
            {props.buzzedIn == props.me ?

            <form id = "answer-field" onSubmit = {(e) => {props.answerQuestion(e)}} >
                <input onChange = {(e) => props.handleAnswer(e)} className = "answer" type = "text" name = "answer"></input>
                <input type = "submit"></input>
                
            </form>
            :
            <div className = "waiting">
            {props.buzz} is currently answering
            </div>
          }
        </div>
    )

}

export default Answer;