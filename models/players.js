var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var PlayersSchema = new Schema({
  name:String
});

// This creates our model from the above schema, using mongoose's model method
var Players = mongoose.model("Players", PlayersSchema);

// Export the Note model
module.exports = Players;