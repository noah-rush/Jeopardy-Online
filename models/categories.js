var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
var CategoriesSchema = new Schema({
  // `title` must be of type String
  type:String,
  name:String,
  questions: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Questions'}]
});

// This creates our model from the above schema, using mongoose's model method
var Categories = mongoose.model("Categories", CategoriesSchema);

// Export the Note model
module.exports = Categories;