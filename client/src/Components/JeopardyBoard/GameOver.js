import React, { Component } from "react";
import Speech from 'react-speech';

var GameOver = (props) => {
    // let categories =props.categories 
    return (
        <div className = "game-over">
           
            {props.contestants.map((player, index) => (
    
            
            <div className = "final-results" key = {index}>
                <div className = "final-answer">Final Answer: {props.finalAnswer}</div>
                {Object.keys(props.finalGuesses).length === 0 ? 
                <div className = "past-game-readout">
                <span className = "player-name"> {player.name}</span> finished with {props.finalScores[player._id]}
              
                </div> 
                : 
                
                <div className = "readout">
                   <span className = "player-name"> {player.name}</span> guessed {props.finalGuesses[player.name]} and wagered $ 
                    {Math.abs(props.scores[player._id] - props.finalScores[player._id])}. For a final score of ${props.finalScores[player._id]}
                   </div>
                }
            </div>
            ))}
        </div>
        
    )
}

export default GameOver;