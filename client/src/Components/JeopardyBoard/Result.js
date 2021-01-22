import React, { Component } from "react";

var Result = (props) => {
    return (
        <div className = "answer-result-panel">
           <div className = "result-panel-inner">
                {props.correct ?
                    <div className ="correct-answer">
                    The answer was {props.question.answer}.
                    {props.buzz} gains {props.question.value}.
                    The board is {props.buzz}'s
                    </div>
                :
                <div className ="incorrect-answer">
                    The answer was {props.question.answer}.
                    {props.buzz} guessed {props.guess} and loses {props.question.value}.
                    {props.me == props.buzz ? 
                    <button id = "challenge"> Challenge</button>
                    :""}

                </div>
                }
           </div>
        </div>
    )

}

export default Result;