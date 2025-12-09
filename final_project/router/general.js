const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User succesfully register. Now you can Login..." })
    } else {
      return res.status(404).json({ message: "User already registered..." })
    }
  }
  return res.status(404).json({ message: "Unable to register user" });
});

// Get the book list available in the shop

public_users.get("/", function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});


// Using Promise callbacks
public_users.get('/promise', function (req, res) {
  axios.get("http://localhost:5000/")
    .then(response => {
      return res.send(response.data)
    })
    .catch(error => {
      return res.status(500).json({ message: "Error fetching books", error: error.message })
    })
});




public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.send(JSON.stringify(book, null, 4));
  }

  return res.status(404).json({ message: "Book not found!!" })
})




// Get book details based on ISBN
public_users.get('/async/:isbn', async function (req, res) {
  //Write your code here
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`http://localhost/5000/isbn/${isbn}`);
    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error: error.message })
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


public_users.get("/async-author/:author", async function (req, res) {
  try {
    const author = req.params.author;
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return res.send(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
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
    return res.send(JSON.stringify(booksByTitle, null, 4));
  }
  return res.status(404).json({ message: `Book with title=${title} not found...` });
});

public_users.get("/async-title/:title", async function (req, res) {
  try {
    const title = req.params.title;
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    return res.send(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
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
