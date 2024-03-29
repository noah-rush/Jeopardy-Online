import React, { Component } from "react";

var Result = (props) => {
    let answerClass = 'answer-result-panel'
    if (props.correct){
    answerClass = 'answer-result-panel answer-correct'
    }
    if (!props.correct && !props.questionOver){
    answerClass = 'answer-result-panel answer-incorrect'
    }
    return (
        <div className = {answerClass}>
           <div className = "result-panel-inner">
                {
                    props.questionOver ?
                    <div className ="question-over">
                    The answer was {props.question.answer}. 
                    </div>
                    : 
                    props.correct ?
                    <div className ="correct-answer">
                    The answer was {props.question.answer}.
                     {props.buzz} gains {props.question.value}.
                    The board is {props.buzz}'s
                    </div>
                :
                props.guess == "" ?
                <div className ="times-up">
                Times Up! Board is still open.

                </div>
                :
                <div className ="incorrect-answer">
                    {/*The answer was {props.question.answer}.*/}
                    {props.buzz} guessed {props.guess} and loses {props.question.value}.
                {/*    {props.me == props.buzz ? 
                    <button id = "challenge"> Challenge</button>
                    :""}*/}

                </div>
                }
           </div>
        </div>
    )

}

export default Result;