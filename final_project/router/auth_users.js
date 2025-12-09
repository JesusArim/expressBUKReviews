const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  const validUser = users.filter(user =>
    user.username === username
  )

  if (validUser.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username, password) => { //returns boolean
  let authUser = users.filter(user => {
    return (user.username === username && user.password === password)
  })
  if (authUser.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      { username }, 'access', { expiresIn: '1h' });

    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ${isbn} not found...` })
  }

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `Review for book with ${isbn} succesfully added by ${username}`,
    reviews: books[isbn].reviews
  })

});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;

  // 
  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN=${isbn} not found!!` })
  }
  if (!books[isbn].reviews) {
    return res.status(404).json({ message: "No reviews..." });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: `No review by user ${username} for book with isbn=${isbn}` })
  }

  // Delete only the review of the user 
  delete books[isbn].reviews[username];
  return res.status(200).json(
    {
      message: `Review by ${username} deleted successfully`,
      reviews: books[isbn].reviews
    }
  )

})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
