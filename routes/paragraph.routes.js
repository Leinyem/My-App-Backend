const ParagraphModel = require("../models/Paragraph.model");
const UserModel = require("../models/User.model");
const BookModel = require("../models/Book.model");
const { isAuthenticated } = require("../Middlewares/jwt.middleware");

const router = require("express").Router();

// GET one paragraph by ID

router.get("/one-paragraph/:paragraphId", async (req, res) => {
  const { paragraphId } = req.params;

  try {
    const paragraph = await ParagraphModel.findById(paragraphId).populate(
      "user book likes"
    );

    if (!paragraph) {
      return res.status(404).json({ message: "Paragraph not found" });
    }

    res.status(200).json(paragraph);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error getting the paragraph" });
  }
});

//POST new paragraph

router.post("/add-paragraph/", async (req, res) => {
  try {
    const newParagraph = await ParagraphModel.create({
      text: req.body.text,
      user: req.body.user,
      book: req.body.bookId,
    });

    const updatedBook = await BookModel.findByIdAndUpdate(
      req.body.bookId,
      { $push: { paragraph: newParagraph._id } },
      { new: true }
    ).populate("author paragraph");
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.owner,
      { $push: { hostingBooks: updatedBook._id } },
      { new: true }
    ).populate("ownedBooks");

    console.log(updatedBook, newParagraph);

    res.status(201).json({ book: updatedBook, updatedUser });
  } catch (error) {
    console.log(error);

    res.status(500).json({ errorMessage: "Couldn't create a paragraph!" });
  }
});

//UPDATE paragraph (edit)

router.patch(
  "/edit-paragraph/:paragraphId",
  isAuthenticated,
  async (req, res) => {
    const { paragraphId } = req.params;
    const { text } = req.body; // Just the text, ID from AuthContext

    try {
      // LOOK for ID of paragraph
      const paragraph = await ParagraphModel.findById(paragraphId);

      // verify user and if not,chao.
      if (paragraph.user.toString() !== req.payload._id.toString()) {
        return res.status(403).json({
          errorMessage: "You are not authorized to edit this paragraph",
        });
      }

      //If it is the USER, then we update:

      const updatedParagraph = await ParagraphModel.findByIdAndUpdate(
        paragraphId,
        { text },
        { new: true }
      ).populate("user book likes");

      console.log("Paragraph updated:", updatedParagraph);

      res.status(200).json(updatedParagraph);
    } catch (err) {
      console.log(err);
      res.status(500).json({ errorMessage: "Couldn't update the paragraph" });
    }
  }
);

//GET like to paragraph

router.get("/like-paragraph/:paragraphId/:userId", async (req, res) => {
  const { paragraphId, userId } = req.params;

  try {
    const updatedParagraph = await ParagraphModel.findByIdAndUpdate(
      paragraphId,
      { $push: { likes: userId } },
      { new: true }
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
    const updatedParagraph = await ParagraphModel.findByIdAndUpdate(
      paragraphId,
      { $pull: { likes: userId } },
      { new: true }
    ).populate("user book likes");

    res.status(200).json({ paragraph: updatedParagraph });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Couldn't like the paragraph!" });
  }
});

//DELETE PARAGRAPH

router.delete("/delete-paragraph/:bookId/:paragraphId", async (req, res) => {
  const { paragraphId, bookId } = req.params;

  try {
    const deletedParagraph = await ParagraphModel.findByIdAndDelete(
      paragraphId
    );

    const updatedBook = await BookModel.findByIdAndUpdate(
      bookId,
      { $pull: { paragraph: paragraphId } },
      { new: true }
    ).populate("author book likes");

    console.log("Paragraph deleted!", deletedParagraph);

    res
      .status(204)
      .json({ message: "Paragraph deleted", deletedParagraph, updatedBook });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Couldn't delete your paragraph." });
  }
});

module.exports = router;
