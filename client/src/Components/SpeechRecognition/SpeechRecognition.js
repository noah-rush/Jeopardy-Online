import React, { Component } from "react";
import PropTypes from "prop-types";
import SpeechRecognition from "react-speech-recognition";

const propTypes = {
    // Props injected by SpeechRecognition
    transcript: PropTypes.string,
    resetTranscript: PropTypes.func,
    browserSupportsSpeechRecognition: PropTypes.bool
};

const Dictaphone = ({
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    categories,
    pickCategory,
    activeCategory,
    displayQuestion
}) => {
    if (!browserSupportsSpeechRecognition) {
        return null;
    }
    console.log(transcript);
    for (var i = 0; i < categories.length; i++) {
        if (transcript != ""){
        if (transcript.toLowerCase() == categories[i].name.toLowerCase()) {
            // console.log("categoryMatch")
            pickCategory(i);
            resetTranscript();
        }
    }
    }
    if (activeCategory != "") {
        for (var i = 0; i < categories[activeCategory].questions.length; i++) {
            // console.log(categories[activeCategory].questions[i].value.replace("$", ""))
            if (transcript == categories[activeCategory].questions[i].value.replace("$", "")) {
                // console.log("valueMatch")
                // pic/kCategory(i);
                // resetTranscript();
                resetTranscript();

                displayQuestion(activeCategory, i)
            }
        }
    }
    return (
        <div>
      <button onClick={resetTranscript}>Reset</button>
      <span>{transcript}</span>
    </div>
    );
};

Dictaphone.propTypes = propTypes;

export default SpeechRecognition(Dictaphone);