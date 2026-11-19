
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initial books
let books = [
  {
    bookID: '101',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    price: 39.99
  },
  {
    bookID: '102',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    price: 42.50
  },
  {
    bookID: '103',
    title: "You Don't Know JS",
    author: 'Kyle Simpson',
    price: 28.00
  }
];

// Validation function
function validateBook(body) {
  const errors = [];

  if (
    !body.bookID ||
    typeof body.bookID !== 'string' ||
    !body.bookID.trim()
  ) {
    errors.push('Book ID is required');
  }

  if (
    !body.title ||
    typeof body.title !== 'string' ||
    !body.title.trim()
  ) {
    errors.push('Title is required');
  }

  if (
    !body.author ||
    typeof body.author !== 'string' ||
    !body.author.trim()
  ) {
    errors.push('Author is required');
  }

  if (
    body.price === undefined ||
    typeof body.price !== 'number' ||
    !Number.isFinite(body.price) ||
    body.price < 0
  ) {
    errors.push('Price must be a valid non-negative number');
  }

  return errors;
}

// GET: Display all books
app.get('/books', (req, res) => {
  res.status(200).json(books);
});

// GET: Display book by ID
app.get('/books/:id', (req, res) => {
  const book = books.find(
    b => b.bookID === req.params.id
  );

  if (!book) {
    return res.status(404).json({
      message: `Book with ID ${req.params.id} not found`
    });
  }

  res.status(200).json(book);
});

// POST: Add a new book with manual Book ID
app.post('/books', (req, res) => {

  const errors = validateBook(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  const bookID = req.body.bookID.trim();

  const title = req.body.title.trim();
  const author = req.body.author.trim();
  const price = req.body.price;

  // Check duplicate Book ID
  const existingBook = books.find(
    b => b.bookID === bookID
  );

  if (existingBook) {
    return res.status(409).json({
      message: `Book ID ${bookID} already exists`
    });
  }

  // Create new book
  const newBook = {
    bookID,
    title,
    author,
    price
  };

  books.push(newBook);

  res.status(201).json({
    message: 'Book added successfully',
    book: newBook
  });

});

// PUT: Update existing book
app.put('/books/:id', (req, res) => {

  const index = books.findIndex(
    b => b.bookID === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: `Book with ID ${req.params.id} not found`
    });
  }

  const errors = validateBook(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  // Prevent changing the Book ID
  if (req.body.bookID.trim() !== req.params.id) {
    return res.status(400).json({
      message: 'Book ID cannot be changed'
    });
  }

  // Update book details
  books[index] = {
    bookID: req.params.id,
    title: req.body.title.trim(),
    author: req.body.author.trim(),
    price: req.body.price
  };

  res.status(200).json({
    message: 'Book updated successfully',
    book: books[index]
  });

});

// DELETE: Delete book by ID
app.delete('/books/:id', (req, res) => {

  const index = books.findIndex(
    b => b.bookID === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: `Book with ID ${req.params.id} not found`
    });
  }

  const deleted = books.splice(index, 1)[0];

  res.status(200).json({
    message: 'Book deleted successfully',
    book: deleted
  });

});

// Handle invalid routes under /books
app.use('/books', (req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {

  console.error(err.stack);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'Invalid JSON in request body'
    });
  }

  res.status(500).json({
    message: 'Internal server error'
  });

});

// Start server
app.listen(PORT, () => {
  console.log(
    `📚 Book Manager server running at http://localhost:${PORT}`
  );
});
