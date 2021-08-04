import React, { Component } from "react";

var Question = React.forwardRef((props, ref) => {
    return (
        <div className = "active-question">
           	<div className = "question-text">
           		{props.question.question}
           	</div>
            {props.canbuzz ?
            <button ref={ref} onFocus={() => console.log('focus')} onClick = {() => props.buzz()} id = "buzzer">BUZZ IN!</button>
            :""}
            <div style ={{width:(80 - 80/8* (8-props.seconds) ) + "%"}} className = "questionTimer"></div>
        </div>
    )

})

export default Question;