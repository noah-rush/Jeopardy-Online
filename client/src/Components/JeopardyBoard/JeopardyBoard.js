import React, { Component } from "react";
import Speech from 'react-speech';

var JeopardyBoard = (props) => {
    // console.log(props.activeCategor
    let categories =props.categories 
    return (
        <div className = "jeopardy-table">

              {categories.map((cat, index) => (
                <div className = "category-column" key = {index}>
                    {index === props.activeCategory ? 
                    <div className ="cat-name cat-name-active ">{cat.name}</div>
                    :
                    <div className ="cat-name ">{cat.name}</div>
                    }
                    {cat.questions.map((question, index2) =>(
                        props.answered.includes(question._id) ? 
                            <div id = {question._id} key = {index2} className ="question-name" >
                            </div> 
                            :
                            <div key = {index2}>
                    <div id = {question._id} className ="question-name" 
                    onClick = {() =>{props.displayQuestion(question._id)}}>
                     {question.value}
                     </div>
                    <Speech className = {question._id} text={question.question} ></Speech>
                    </div>
                        )
                    )
                }
                    </div>

                ))}
       
            </div>
    )

}

export default JeopardyBoard;