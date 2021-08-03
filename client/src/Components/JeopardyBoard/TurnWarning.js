import React, { Component } from "react";

var TurnWarn = React.forwardRef((props, ref) => {
    return (
        <div className = "turn-warning">
           {props.turn} has control of the board.
           <div className = "close-warning" onClick = {()=>props.close()}></div>
        </div>
    )

})

export default TurnWarn;