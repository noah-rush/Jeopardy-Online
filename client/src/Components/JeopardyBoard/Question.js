import React, { Component } from "react";

var Question = (props) => {
    return (
        <div className = "active-question">
           	<div className = "question-text">
           		{props.question.question}
           	</div>
            {props.canbuzz ?
            <button onClick = {() => props.buzz()} id = "buzzer">BUZZ IN!</button>
            :""}
        </div>
    )

}

export default Question;