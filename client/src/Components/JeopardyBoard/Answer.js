import React, { Component } from "react";

var Answer = React.forwardRef((props, ref) => {
    return (
        <div className = "active-answer-panel">
            {props.buzzedIn == props.me ?

            <form id = "answer-field" onSubmit = {(e) => {props.answerQuestion(e)}} >
                <input ref={ref} onFocus={() => console.log('focus')} onChange = {(e) => props.handleAnswer(e)} className = "answer" type = "text" name = "answer"></input>
                <input type = "submit"></input>
                
            </form>
            :
            <div className = "waiting">
            {props.buzzedIn} is currently answering
            </div>
          }
          <div style ={{width:(80 - 80/6* (6-props.seconds) ) + "%"}} className = "answerTimer">

          </div>
        </div>
    )

})

export default Answer;