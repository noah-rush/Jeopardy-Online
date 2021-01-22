var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
var QuestionSchema = new Schema({
  // `title` must be of type String
  question:String,
  answer:String,
  value:String
});

// This creates our model from the above schema, using mongoose's model method
var Questions = mongoose.model("Questions", QuestionSchema);

// Export the Note model
module.exports = Questions;