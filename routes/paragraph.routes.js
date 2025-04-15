
const ParagraphModel = require("../models/Paragraph.model");
const UserModel = require("../models/User.model");
const BookModel = require("../models/Book.model");

const router = require("express").Router();

//POST new paragraph

router.post("/create/paragraph/", async (req, res) => {


    try {
       const newParagraph = await ParagraphModel.create(

        {text:req.body.text, user: req.body.owner, book:req.body.bookId}

       )

 const updatedBook = await BookModel.findByIdAndUpdate(req.body.bookId, {$push:{paragraph:newParagraph._id}}, {new:true} ).populate("owner paragraph")
 const updatedUser = await UserModel.findByIdAndUpdate(req.body.owner, {$push:{hostingBooks:updatedBook._id}}, {new:true} ).populate("ownedBooks hostingBooks")

console.log(updatedBook, newParagraph)

 res.status(201).json({book:updatedBook, updatedUser})

    } catch (error) {
        console.log(error);

        res.status(500).json({ errorMessage: "Couldn't create a book!"})
    }

});

//GET like to paragraph

router.get("/like-paragraph/:paragraphId/:userId", async (req, res) => {

    const { paragraphId, userId } = req.params;

    try {

        const updatedParagraph = await ParagraphModel.findByIdAndUpdate( paragraphId, { $push: { likes: userId } }, { new: true }
        ).populate("user book likes");

        res.status(200).json({ paragraph: updatedParagraph });

    } catch (error) {
        console.log(error);
        res.status(500).json({ errorMessage: "Couldn't like the paragraph!" });
    }

});

//DISLIKE a paragraph:

router.get("/dislike-paragraph/:paragraphId/:userId", async (req, res) => {

    const { paragraphId, userId } = req.params;

    try {

        const updatedParagraph = await ParagraphModel.findByIdAndUpdate( paragraphId, { $pull: { likes: userId } }, { new: true }
        ).populate("user book likes");

        res.status(200).json({ paragraph: updatedParagraph });

    } catch (error) {
        console.log(error);
        res.status(500).json({ errorMessage: "Couldn't like the paragraph!" });
    }

});

//DELETE PARAGRAPH

router.delete("/delete-paragraph/:bookId/:paragraphId", async (req,res) => {

    const {paragraphId, bookId} = req.params;

    try {
          const deletedParagraph = await ParagraphModel.findByIdAndDelete(paragraphId);

          const updatedBook = await BookModel.findByIdAndUpdate( bookId, { $pull: { paragraph: paragraphId } }, { new: true }
          ).populate("author book likes");

          console.log("Paragraph deleted!", deletedParagraph);

          res.status(204).json({ message: "Paragraph deleted", deletedParagraph, updatedBook});

    } catch(error) {

        console.log(error);

        res.status(500).json({message: "Couldn't delete your paragraph."});
    }
});





module.exports = router