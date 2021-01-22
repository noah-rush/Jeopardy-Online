import React, { Component } from "react";

var JeopardyBoard = (props) => {
	// console.log(props.activeCategory)
    return (
                <div className = "menu-frame">
                <h3>Start a New Game</h3>
                <form onSubmit = {(e) => {props.createNewGame(e)}} >
                    <input onChange = {(e) => props.handleGameTitle(e)} className = "gameTitle" type = "text" name = "gameTitle"></input>
                    <input type = "submit"></input>
                </form>
                <h3>Active Games</h3>
                <ul>
                    {props.games.map((game, index) => (
                        <li className = "active-game" key = {index}>
                        <a onClick = {(e) =>{props.startGame(game._id)}}>
                        {game.title}
                        </a>
                        </li>
                ))}
                
                </ul>
               </div>
                
    )

}

export default JeopardyBoard;