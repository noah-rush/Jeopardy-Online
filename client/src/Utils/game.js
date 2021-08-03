export default {
    correctAnswer(guess, correctAnswer) {
        let possibleAnswers = []
        var matcher = /[a-z]+/gi;
        correctAnswer = correctAnswer.match(matcher);
        if (correctAnswer[0].toLowerCase() == "the" || correctAnswer[0].toLowerCase() == "a") {
            possibleAnswers.push(correctAnswer.join('').toLowerCase())
            correctAnswer.splice(0, 1)
        }
        correctAnswer = correctAnswer.join('').toLowerCase();
        possibleAnswers.push(correctAnswer)


        guess = guess.match(matcher);
        guess = guess.join('').toLowerCase();
        if (possibleAnswers.includes(guess)) {
            return true
        }
        return false

    }

};