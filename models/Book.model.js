const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User', 
      required: [true, 'Author is required']
    },
    paragraph: [  
      {
        type: Schema.Types.ObjectId,
        ref: 'Paragraph', 
      },
    ],
    available: {
      type: Boolean,
      default: false,
    },

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    bookImage: {
      type: String,
      default: 'https://img.freepik.com/vector-gratis/libro-cubierta-marron_1110-771.jpg?t=st=1744634312~exp=1744637912~hmac=dcaf7672212877614dc23149acbd402cc9bb3e203e85eee16cf6b0190e3bf27a&w=826',
    },
  },
  {timestamps: true}  
);

const BookModel = model('Book', bookSchema);

module.exports = BookModel;
