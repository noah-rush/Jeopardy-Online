import React, { Component } from "react";

var WelcomeScreen = (props) => {
    return (
            <div className = "welcome-frame">
                <h1>Welcome to Jeopardy!</h1>
                <h2>Enter your player name</h2>
                <form onSubmit = {(e) => {props.createNewPlayer(e)}} >
                    <input onChange = {(e) => props.handlePlayerName(e)} className = "playernName" type = "text" name = "playernName"></input>
                    <input type = "submit"></input>
                </form>
            </div>
                
    )

}

export default WelcomeScreen;