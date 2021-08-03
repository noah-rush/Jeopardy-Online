import React, { Component } from "react";

var Contestants = (props) => {
    return (
        <div className = "contestants-table">
            {props.contestants.map((player, index) => (
    
            
            <div className = {props.turn == (index+1) ? "contestant-item contestant-active" : "contestant"} key = {index}>
            
                   <div className = "player-name">
                      {player.name}
                   </div>
                   <div className = "player-score">
                      {props.scores[player._id]}
                   </div>
            </div>
            ))}
            <a onClick = {(e) =>{props.backToMenu(e)}} className = "backToMenu">Back to Menu</a>
        </div>
    )

}

export default Contestants;