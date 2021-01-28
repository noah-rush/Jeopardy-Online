// const NBA = require("nba");
const mongoose = require('mongoose');
const moment = require('moment');
const axios = require('axios')
const cheerio = require('cheerio')
// var db = require("./models");



mongoose.connect('mongodb://localhost/jeopardy');

var db = require("./models");



url = "http://www.j-archive.com/showseason.php?season=35"
axios.get(url).then(function(data) {
    const $ = cheerio.load(data.data);
    $('table td[align="left"]').find("a").each(function() {
        var game = $(this).attr("href")
        // var game = 'http://www.j-archive.com/showgame.php?game_id=6464'
        console.log(game)
        axios.get(game).then(function(gamedata) {
            const $ = cheerio.load(gamedata.data);

            let category = {};
            category.type = "Final Jeopardy"
            var clue = {}


            $('#final_jeopardy_round > .final_round > tbody > tr > td').each(function(e) {
                // var clue = {}

                if ($(this).hasClass("category")) {
                    category.name = $(this).find('.category_name').text()
                    var rawAnswer = $(this).find('div').attr("onmouseover");
                    // console.log(rawAnswer)
                    if (rawAnswer) {
                        var answer = rawAnswer.substring(rawAnswer.indexOf('<em'), rawAnswer.indexOf('</em>'))
                        answer = answer.substring(answer.indexOf('>') + 1)
                        answer = answer.replace(/<[^>]*>?/gm, '');
                        clue.answer = answer

                    }
                }
                if ($(this).hasClass("clue")) {
                    // var clue = {}
                    clue.question = $(this).find('.clue_text').text()
                    category.question= clue
                }
                // category.questions.push(clue)
                // console.log(clue)
                // console.log(category)
            })
                // console.log(category)

            db.Questions.create(category.question).then(function(data) {
                // console.log(data)
                category.questions = [data._id]
                console.log(category)
                db.Categories.create(category).then(function(data) {
                    console.log(data)
                })
            })





        })


    })
})