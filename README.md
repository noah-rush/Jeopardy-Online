# Jeopardy Online

## About

Jeopardy Online allows multiple people to play each other in jeopardy over the internet. The questions are pulled from real jeopardy games via the j-archive fan site, and players can even accurately buzz in and use voice control to select categories and respond to answers. The app is currently up and running on (https://secret-ocean-04091.herokuapp.com/). The styling is a little janky, but it works. 

## Gameplay

It works just like regular jeopardy! Create a player name, join or create a game, and then pick a category and answer questions. There is a challenge button for when you think your answer was right, and other players just need to confirm it. 



https://user-images.githubusercontent.com/7725659/127913760-303bff9a-b431-49dc-96e1-3c595213c284.mp4



## Implementation

The app is built using react with an express server backend and mongoDB as the database. The app also uses Socket.IO to manage the multiplayer capability (relay buzzes, update scores, pick cartegories etc.).
