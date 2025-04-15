const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const paragraphSchema = new Schema({

    text: {
        type: String,
        required: [true, 'Paragraph text is required']
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: [true, 'User is required']
      },

      book: {
        type: Schema.Types.ObjectId,
        ref: 'Book', 
        required: [true, 'Book is required']

      },

      likes: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User'
        }
      ]
    }, 

    { timestamps: true },
  
  );

      

const ParagraphModel = model('Paragraph', paragraphSchema);
module.exports = ParagraphModel;