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
    if (transcript != "") {

        var matcher = /[a-z]+/gi;
        console.log(transcript);
        let guess = transcript.toLowerCase().match(matcher)
        if (guess != null) {
            guess = guess.join('')
        }
        console.log(guess)
        console.log(activeCategory)
        for (var i = 0; i < categories.length; i++) {
            // var matcher = /[a-z]+/gi;
            let category = categories[i].name.toLowerCase().match(matcher);
            category = category.join('');


            // console.log(category)
            // console.log(guess)
            if (guess == category) {
                // console.log("categoryMatch")
                pickCategory(i);
                resetTranscript();

            }
        }
        if (activeCategory >-1 ) {
            for (var i = 0; i < categories[activeCategory].questions.length; i++) {
                // console.log(categories[activeCategory].questions[i].value.replace("$", ""))
                if (transcript == categories[activeCategory].questions[i].value.replace("$", "")) {
                    // console.log("valueMatch")
                    // pic/kCategory(i);
                    // resetTranscript();
                    resetTranscript();

                    displayQuestion(categories[activeCategory].questions[i]._id)
                }
            }
        }
    }
    return (
        <div>
      <button id ="resetSpeech" onClick={resetTranscript}>Reset</button>
      <span>{transcript}</span>
    </div>
    );
};

Dictaphone.propTypes = propTypes;

export default SpeechRecognition(Dictaphone);