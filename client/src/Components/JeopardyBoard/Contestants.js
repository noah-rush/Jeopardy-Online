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
        </div>
    )

}

export default Contestants;