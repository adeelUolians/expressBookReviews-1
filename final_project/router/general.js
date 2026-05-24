const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists." });
  }

  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User successfully registered. Now you can login." });
});

// Task 1 & 10: Get the list of books available in the shop (Using Asynchronous Promise/Callback)
public_users.get('/', function (req, res) {
  const getBooksPromise = new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject("Books dataset not found");
    }
  });

  getBooksPromise
    .then((booksList) => {
      res.status(200).send(JSON.stringify(booksList, null, 4));
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});

// Task 2 & 11: Get book details based on ISBN (Using Async/Await)
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  
  try {
    const bookDetails = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book not found for this ISBN");
      }
    });
    res.status(200).json(bookDetails);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});
  
// Task 3 & 12: Get book details based on author (Using Promises)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  
  const getBooksByAuthor = new Promise((resolve) => {
    let results = {};
    const keys = Object.keys(books);
    keys.forEach(key => {
      if (books[key].author.toLowerCase() === author) {
        results[key] = books[key];
      }
    });
    resolve(results);
  });

  getBooksByAuthor.then((matchedBooks) => {
    if (Object.keys(matchedBooks).length > 0) {
      res.status(200).json(matchedBooks);
    } else {
      res.status(404).json({ message: "No books found by this author" });
    }
  });
});

// Task 4 & 13: Get all books details based on title (Using Async/Await)
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();

  try {
    const matchedBooks = await new Promise((resolve) => {
      let results = {};
      const keys = Object.keys(books);
      keys.forEach(key => {
        if (books[key].title.toLowerCase() === title) {
          results[key] = books[key];
        }
      });
      resolve(results);
    });

    if (Object.keys(matchedBooks).length > 0) {
      res.status(200).json(matchedBooks);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    res.status(500).json({ message: "An error occurred while fetching data." });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.status(200).json(books[isbn].reviews);
  } else {
    res.status(404).json({ message: "Book not found." });
  }
});

module.exports = { general: public_users };