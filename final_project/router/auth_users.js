const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper utility to check if username exists
const isValid = (username) => {
  let filtered_users = users.filter((user) => user.username === username);
  return filtered_users.length > 0;
}

// Helper utility to check if username matches credentials password
const authenticatedUser = (username, password) => {
  let filtered_users = users.filter((user) => user.username === username && user.password === password);
  return filtered_users.length > 0;
}

// Task 7: Login as a registered user
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (authenticatedUser(username, password)) {
    // Sign an access token valid for 1 hour
    let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });
    
    // Store in session context
    req.session.authorization = { accessToken, username };
    
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(208).json({ message: "Invalid Login Credentials. Check username and password" });
  }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewContent = req.query.review;
  const username = req.user.data; // Retrieved from decoded JWT within custom auth middleware

  if (!reviewContent) {
    return res.status(400).json({ message: "Review text content query parameter missing." });
  }

  if (books[isbn]) {
    // Inserts review under user's key or overwrites if it already exists
    books[isbn].reviews[username] = reviewContent;
    return res.status(200).json({ message: `Review for book ISBN ${isbn} successfully added/updated.` });
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.data; // Retrieved from decoded JWT within custom auth middleware

  if (books[isbn]) {
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: `Your review for book ISBN ${isbn} has been deleted.` });
    } else {
      return res.status(404).json({ message: "No review found for this user under this book." });
    }
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

module.exports = {
  authenticated: regd_users,
  isValid: isValid,
  users: users
};