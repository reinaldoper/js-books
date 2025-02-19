import express from 'express';
import authenticateUser from '../middleware/authenticateUser.js';
import borrowedService from '../service/borrowedService.js';

class BorrowedController {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/borrow', authenticateUser, this.borrowBook);
    this.router.delete('/return/:isbn', authenticateUser, this.returnBook);
    this.router.get('/borrowed', authenticateUser, this.getBorrowedBooks);
  }

  async borrowBook(req, res) {
    const { isbn } = req.body;
    const userId = Number(req.user?.id);

    if (!isbn) {
      return res.status(400).json({ error: 'ISBN is required' });
    }

    try {
      const result = await borrowedService.borrowBook(isbn, userId);
      return res.status(200).json({ isbn: isbn, borrowed_at: result.borrowedAt });
    } catch (error) {
      console.error('Error borrowing book:', error);
      if (!res.headersSent) {
        if (error.message === 'Book not found' || error.message === 'Borrowing limit reached' || error.message === 'Book not available for borrowing' || error.message === 'Book already borrowed by another user') {
          return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  async returnBook(req, res) {
    const isbn = req.params.isbn;
    const userId = Number(req.user?.id);

    try {
      await borrowedService.returnBook(isbn, userId);
      return res.status(204).send();
    } catch (error) {
      console.error('Error returning book:', error);
      if (!res.headersSent) {
        if (error.message === 'Book not found' || error.message === 'Borrowed book not found') {
          return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  async getBorrowedBooks(req, res) {
    const userId = req.user?.id ? Number(req.user.id) : null;

    try {
      const response = await borrowedService.getBorrowedBooks(userId);
      return res.status(200).json({ books: response });
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
}

export default new BorrowedController().router;