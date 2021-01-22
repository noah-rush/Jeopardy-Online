var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
var GamesSchema = new Schema({
  // `title` must be of type String
  title:String,
  round:{type:Number, default:1},
  jeopardyCategories: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Categories'}],
  doubleCategories: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Categories'}],
  players: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Players'}],
  scores: [{type:Number}],
  turn: {type:Number, default:1},
  finalJeopardy: {type: mongoose.Schema.Types.ObjectId, ref: 'Questions'},
  answered: [{type: mongoose.Schema.Types.ObjectId, ref: 'Questions'}]
});

// This creates our model from the above schema, using mongoose's model method
var Games = mongoose.model("Games", GamesSchema);

// Export the Note model
module.exports = Games;