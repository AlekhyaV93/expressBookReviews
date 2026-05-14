const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  let user = users.find(user => user.username === username);
  return !user; //returns true if user is not found, false if user exists
}

const authenticatedUser = (username,password)=>{ 
  let user = users.find(user => user.username === username && user.password === password);
  console.log("Authenticated user:", user);
  return user ? true : false; //returns true if user is found, false if user is not found
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  
  const {username, password} = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (authenticatedUser(username, password)) {
    // Generate a JWT token
    const token = jwt.sign({ username }, "access", { expiresIn: "1h" });
    console.log("Generated token:", token);
    // Store the token in the session
    req.session.authorization = { accessToken: token };
    console.log("Session after login:", req.session.authorization);
    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }  
    }    
    )
   console.log("Session saved successfully");
    return res.status(200).json({ message: "User logged in successfully" });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user.username; // Get the username from the authenticated user

  // Find the book by ISBN
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  console.log("Book found:", book);
  // Check if the user has already reviewed this book
  const existingReview = book.reviews.find(r => r.username === username);
  if (existingReview) {
    existingReview.review = review;
  } else {
    book.reviews.push({ username, review });
  }

  return res.status(200).json({ message: "Review updated successfully" });  
  
});

// Delete a book review

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username; // Get the username from the authenticated user

  // Find the book by ISBN
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  console.log("Book found:", book);
  // Remove the review by the user
  book.reviews = book.reviews.filter(r => r.username !== username);
  return res.status(200).json({ message: "Review deleted successfully" });  
}); 
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
