const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (isValid(username)) {
    users.push({username, password});
    return res.status(200).json({message: "User registered successfully"});
  } else {
    return res.status(400).json({message: "Username already exists"});
  } 
  
});

// Get the book list available in the shop
public_users.get('/books',function (req, res) {
  //Write your code here
  return books ? res.status(200).json(books) : res.status(404).json({message: "Books not found"});
});

public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch books" });
  }
});

// Get book details based on ISBN
public_users.get('/books/:isbn',function (req, res) {

  let isbn = req.params.isbn;
  return books[isbn] ? res.status(200).json(books[isbn]) : res.status(404).json({message: "Book not found"});

 });

public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books/' + req.params.isbn);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching book details:", error);
    return res.status(500).json({ message: "Unable to fetch book" });
  }
});


  
// Get book details based on author
public_users.get('/books/author/:author',function (req, res) {
  let author = req.params.author;
  let filtered_books = Object.values(books).filter(book => book.author === author);
  return filtered_books.length > 0 ? res.status(200).json(filtered_books) : res.status(404).json({message: "Books not found"});
});

public_users.get('/author/:author', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books/author/' + req.params.author);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching book details:", error);
    return res.status(500).json({ message: "Unable to fetch book" });
  }
});

// Get all books based on title
public_users.get('/books/title/:title',function (req, res) {
  let title = req.params.title;
  let filtered_books = Object.values(books).filter(book => book.title === title);
  return filtered_books.length > 0 ? res.status(200).json(filtered_books) : res.status(404).json({message: "Books not found"});

});

public_users.get('/title/:title', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books/title/' + req.params.title);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching book details:", error);
    return res.status(500).json({ message: "Unable to fetch book" });
  }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  return books[isbn] ? res.status(200).json(books[isbn].reviews) : res.status(404).json({message: "Book not found"});

});

module.exports.general = public_users;
