const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const isRegisterUser = (username) => {
  const targetUser = users.filter(user => user.username === username);
  if (targetUser.length > 0) {
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isRegisterUser(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User succesfully register. Now you can Login..." })
    } else {
      return res.status(404).json({ message: "User already registered..." })
    }
  }
  return res.status(404).json({ message: "Unable to register user" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (isbn) {
    const targetBook = books[isbn];
    if (targetBook) {
      return res.send(JSON.stringify(targetBook, null, 4));
    } else {
      return res.status(404).json({ message: "Book not found in the bookStore" })
    }
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  let targetBooks = [];
  for (let key of Object.keys(books)) {
    if (books[key]["author"] === author) {
      targetBooks.push(books[key]);
    }
  }
  if (targetBooks.length > 0) {
    return res.send(JSON.stringify(targetBooks, null, 4));
  }
  return res.status(404).json({ message: `Author ${author} not found!` });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  let booksByTitle = [];
  for (let key of Object.keys(books)) {
    if (books[key]["title"] === title) {
      booksByTitle.push(books[key]);
    }
  }

  if (booksByTitle.length > 0) {
    return res.send(JSON.stringify(booksByTitle, 4, null));
  }
  return res.status(404).json({ message: `Book with title=${title} not found...` });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.send(JSON.stringify(book.reviews, 4, null));
  } else {
    return res.status(404).json({ message: `Book ISBN=${isbn} not found therefore has no reviews` });
  }
});

module.exports.general = public_users;
