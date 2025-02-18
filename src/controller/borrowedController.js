import express from 'express';
import prisma from '../prismaClient.js';
import authenticateUser from '../middleware/authenticateUser.js';

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
      const book = await prisma.book.findUnique({ where: { isbn } });
      if (!book) {
        return res.status(400).json({ error: 'Book not found' });
      }

      const borrowedBooksCount = await prisma.borrowing.count({
        where: { userId, returnedAt: null },
      });
      if (borrowedBooksCount >= 2) {
        return res.status(400).json({ error: 'Borrowing limit reached' });
      }

      if (book.status !== 'available') {
        return res.status(400).json({ error: 'Book not available for borrowing' });
      }

      const existingBorrowing = await prisma.borrowing.findFirst({
        where: {
          bookId: book.id,
          returnedAt: null,
        },
      });

      if (existingBorrowing) {
        return res.status(400).json({ error: 'Book already borrowed by another user' });
      }

      const result = await prisma.$transaction(async (prisma) => {
        const borrowing = await prisma.borrowing.create({
          data: {
            userId,
            bookId: book.id,
            borrowedAt: new Date(),
          },
        });

        await prisma.book.update({
          where: { id: book.id },
          data: { status: 'borrowed' },
        });

        return borrowing;
      });

      return res.status(200).json({ isbn: isbn, borrowed_at: result.borrowedAt });
    } catch (error) {
      console.error('Error borrowing book:', error);
      if (!res.headersSent) {
        if (error.code === 'P2002') {
          return res.status(400).json({ error: 'Book already borrowed by user' });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  async returnBook(req, res) {
    const isbn = req.params.isbn;
    const userId = Number(req.user?.id);

    try {
      await prisma.$transaction(async (prisma) => {
        const book = await prisma.book.findUnique({ where: { isbn } });
        if (!book) {
          return res.status(400).send();
        }

        const borrowedBook = await prisma.borrowing.findFirst({
          where: { userId, bookId: book.id, returnedAt: null },
        });

        if (!borrowedBook) {
          return res.status(400).send();
        }

        await prisma.borrowing.update({
          where: { id: borrowedBook.id },
          data: { returnedAt: new Date() },
        });

        await prisma.book.update({
          where: { id: book.id },
          data: { status: 'available' },
        });
      });

      return res.status(204).send();
    } catch (error) {
      console.error('Error returning book:', error);
      if (!res.headersSent) {
        return res.status(400).json({ error: error.message || 'Internal Server Error' });
      }
    }
  }

  async getBorrowedBooks(req, res) {
    const userId = req.user?.id ? Number(req.user.id) : null;

    try {
      const borrowedBooks = userId
        ? await prisma.borrowing.findMany({
            where: { userId },
            include: { book: { select: { isbn: true } } },
            orderBy: { borrowedAt: 'desc' },
          })
        : await prisma.borrowing.findMany({
            include: { book: { select: { isbn: true } } },
            orderBy: { borrowedAt: 'desc' },
          });

      const response = borrowedBooks.map((borrowedBook) => ({
        isbn: borrowedBook.book.isbn,
        borrowed_at: borrowedBook.borrowedAt,
        returned_at: borrowedBook.returnedAt,
      }));

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