# Jeopardy Online

## About

Jeopardy Online allows multiple people to play each other in jeopardy over the internet. The questions are pulled from real jeopardy games via the j-archive fan site, and players can even accurately buzz in and use voice control to select categories and respond to answers. The app is currently up and running on (https://secret-ocean-04091.herokuapp.com/). The styling is a little janky, but it works. 

## Gameplay

It works just like regular jeopardy! Create a player name, join or create a game, and then pick a category and answer questions. There is a challenge button for when you think your answer was right, and other players just need to confirm it. 





https://user-images.githubusercontent.com/7725659/128102490-d73282d5-fa2d-4c22-81ae-19c509f4817e.mp4




## Implementation

The app is built using react with an express server backend and mongoDB as the database. The app also uses Socket.IO to manage the multiplayer capability (relay buzzes, update scores, pick cartegories etc.). It uses react packages for speech recognition to listen to the users voice and pick the category, and for speech-to-text to read out the questions just like in realy jeopardy.

## To-Do
The styles are a little strange at the moment, I was focused on getting the gameplay to work when I built it, and the menus and answering interfaces are extremely bare bones at the moment. Would also like to add a more sophisticated system for detecting wrong or right answers. 

