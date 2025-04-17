const { isAuthenticated } = require("../Middlewares/jwt.middleware");
const BookModel = require("../models/Book.model");
const ParagraphModel = require("../models/Paragraph.model");
const UserModel = require("../models/User.model");

const router = require("express").Router();

//POST to create
router.post("/create-a-book", async (req, res) => {
  try {
    const bookToCreate = {
      title: req.body.title,
      author: req.body.author,
      paragraph: [],
    };

    const newBook = await BookModel.create(bookToCreate);
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.author,
      { $push: { createdBooks: newBook._id } },
      { new: true }
    ).populate("createdBooks borrowedBooks");
    const newParagraph = await ParagraphModel.create({
      text: req.body.text,
      user: req.body.author,
      book: newBook._id,
    });
    const updatedBook = await BookModel.findByIdAndUpdate(
      newBook._id,
      { $push: { paragraph: newParagraph._id } },
      { new: true }
    ).populate("author paragraph");

    console.log(updatedBook, newParagraph);

    res.status(201).json({ book: updatedBook, updatedUser });
  } catch (error) {
    console.log(error);

    res.status(500).json({ errorMessage: "Couldn't create a book!" });
  }

  /*BookModel.create(req.body)
.then((responseFromDb) => {
  
    console.log('Book created!', responseFromDb)
    res.status(201).json(responseFromDb)
})    
 .catch((err) => {
    console.log(err);

    res.status(500).json({ errorMessage: "Couldn't create a book!"})
 });*/
});

//GET LIKE to a book

router.get("/like-book/:bookId/:userId", async (req, res) => {
  const { bookId, userId } = req.params;

  try {
    const updatedBook = await BookModel.findByIdAndUpdate(
      bookId,
      { $push: { likes: userId } },
      { new: true }
    ).populate("author paragraph likes");

    res.status(200).json({ book: updatedBook });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Couldn't like the book!" });
  }
});

//DISLIKE a book

router.get("/dislike-book/:bookId/:userId", async (req, res) => {
  const { bookId, userId } = req.params;

  try {
    const updatedBook = await BookModel.findByIdAndUpdate(
      bookId,
      { $pull: { likes: userId } },
      { new: true }
    ).populate("author paragraph likes");

    res.status(200).json({ book: updatedBook });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Couldn't like the book!" });
  }
});

//GET ALL books

router.get("/books", async (req, res) => {
  try {
    const books = await BookModel.find().populate("author paragraph likes");
    res.status(200).json({ books });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Couldn't fetch books!" });
  }
});

//GET all available books, "Sea of books"
router.get("/available-books", async (req, res) => {
  BookModel.find({ available: true })
    .then((responseFromDb) => {
      console.log("Here are the available books!", responseFromDb);
      res.status(200).json({ allAvailableBooks: responseFromDb });
    })
    .catch((err) => {
      console.log(err);

      res
        .status(500)
        .json({ errorMessage: "Couldn't get all available books!" });
    });
});

//GET users books

router.get("/user-books/:userId", async (req, res) => {
  const { userId } = req.params;

  BookModel.find({ author: userId })
    .then((responseFromDb) => {
      console.log("Here are your books!", responseFromDb);
      res.status(200).json({ userBooks: responseFromDb });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ errorMessage: "Couldn't get your books! Oh no." });
    });
});

//GET book by Id

router.get("/one-book/:bookId", async (req, res) => {
  const { bookId } = req.params;

  BookModel.findById(bookId)
    .populate("author", "username")
    .populate("likes")
    .then((responseFromDb) => {
      console.log("Here are your books!", responseFromDb);
      res.status(200).json(responseFromDb);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ errorMessage: "Couldn't get your books! Oh no." });
    });
});

//UPDATE book

router.patch("/update-book/:bookId", (req, res) => {
  BookModel.findByIdAndUpdate(req.params.bookId, req.body, { new: true })

    .then((updatedBook) => {
      console.log("Book updated!", updatedBook);
      res.status(200).json(updatedBook);
    })
    .catch((err) => {
      console.log(err);

      res
        .status(500)
        .json({ errorMessage: "Couldn't get all available books!" });
    });
});

// BORROW a book

router.patch("/borrow/:bookId", (req, res) => {
  const { bookId } = req.params;
  const { userId } = req.body; //

  UserModel.findByIdAndUpdate(
    userId,
    { $push: { borrowedBooks: bookId } },
    { new: true }
  )
    .then((updatedUser) => {
      return BookModel.findById(bookId);
    })

    .then((oneBook) => {
      res.status(200).json(oneBook);
    })

    .catch((error) => {
      console.log(error);
      res.status(500).json({ errorMessage: "Couldn't borrow the book!" });
    });
});

// RELEASE a book

router.patch("/release/:bookId", async (req, res) => {
  const { bookId } = req.params;
  try {
    const updatedBook = await BookModel.findByIdAndUpdate(
      bookId,
      { available: true },
      { new: true }
    );
    res.status(200).json(updatedBook);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Couldn't release the book!" });
  }
});

//Delete OWNER'S book fom library

router.delete("/delete-book/:bookId", async (req, res) => {
  const { bookId } = req.params;

  try {
    const deletedBook = await BookModel.findByIdAndDelete(bookId);
    console.log("Book deleted!", deletedBook);

    res.status(204).json({ message: "Farenheit 451" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ message: "Couldn't delete your book, kinda sorry." });
  }
});

module.exports = router;
