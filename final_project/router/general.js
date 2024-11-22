const express = require("express");
let books = require("./booksdb.js");
const axios = require("axios");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  if (users.find((user) => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});

// Task 1: Get the book list available in the shop
public_users.get("/", function (req, res) {
  try {
    res.status(200).json({
      books,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 2: Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  try {
    if (books[isbn]) {
      res.status(200).json({
        book: books[isbn],
      });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching book details" });
  }
});

// Task 3: Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  try {
    const booksByAuthor = Object.values(books).filter(
      (book) => book.author.toLowerCase() === author.toLowerCase()
    );

    if (booksByAuthor.length > 0) {
      res.status(200).json({
        books: booksByAuthor,
      });
    } else {
      res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Task 4: Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  try {
    const booksByTitle = Object.values(books).filter((book) =>
      book.title.toLowerCase().includes(title.toLowerCase())
    );

    if (booksByTitle.length > 0) {
      res.status(200).json({
        books: booksByTitle,
      });
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by title" });
  }
});

// Task 5: Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  try {
    if (books[isbn]) {
      res.status(200).json({
        reviews: books[isbn].reviews,
      });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching book reviews" });
  }
});


// Task 10: Get all books using async/await
public_users.get("/async/books", async (req, res) => {
  try {
    const allBooks = await new Promise((resolve) => {
      resolve(books);
    });
    return res.status(200).json({
      status: "success",
      books: allBooks,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching books",
    });
  }
});

// Task 11: Get book by ISBN using Promises
public_users.get("/promise/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found"));
    }
  })
    .then((book) => {
      res.status(200).json({
        status: "success",
        book: book,
      });
    })
    .catch((error) => {
      res.status(404).json({
        status: "error",
        message: error.message,
      });
    });
});

// Task 12: Get books by author using async/await
public_users.get("/async/author/:author", async (req, res) => {
  const author = req.params.author;

  try {
    const booksByAuthor = await new Promise((resolve) => {
      const filtered = Object.values(books).filter(
        (book) => book.author.toLowerCase() === author.toLowerCase()
      );
      resolve(filtered);
    });

    if (booksByAuthor.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No books found for this author",
      });
    }

    return res.status(200).json({
      status: "success",
      books: booksByAuthor, 
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching books by author",
    });
  }
});

// Task 13: Get books by title using async/await
public_users.get("/async/title/:title", async (req, res) => {
  const title = req.params.title;

  try {
    const booksByTitle = await new Promise((resolve) => {
      const filtered = Object.values(books).filter((book) =>
        book.title.toLowerCase().includes(title.toLowerCase())
      );
      resolve(filtered);
    });

    if (booksByTitle.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No books found with this title",
      });
    }

    return res.status(200).json({
      status: "success",
      books: booksByTitle, 
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching books by title",
    });
  }
});

// Test client code for the async operations
const testAsyncOperations = async () => {
  const BASE_URL = "http://localhost:5000";

  try {
    // Test Task 10
    console.log("Testing Task 10 - Get all books");
    const allBooksResponse = await axios.get(`${BASE_URL}/async/books`);
    console.log("All books:", allBooksResponse.data);

    // Test Task 11
    console.log("\nTesting Task 11 - Get book by ISBN");
    const isbnResponse = await axios.get(`${BASE_URL}/promise/isbn/1`);
    console.log("Book by ISBN:", isbnResponse.data);

    // Test Task 12
    console.log("\nTesting Task 12 - Get books by author");
    const authorResponse = await axios.get(
      `${BASE_URL}/async/author/Chinua Achebe`
    );
    console.log("Books by author:", authorResponse.data);

    // Test Task 13
    console.log("\nTesting Task 13 - Get books by title");
    const titleResponse = await axios.get(
      `${BASE_URL}/async/title/Things Fall Apart`
    );
    console.log("Books by title:", titleResponse.data);
  } catch (error) {
    console.error("Error during testing:", error.message);
  }
};

// Export the test function
module.exports.testAsyncOperations = testAsyncOperations;
module.exports.general = public_users;
