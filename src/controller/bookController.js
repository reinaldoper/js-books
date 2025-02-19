import { Router } from 'express';
import authenticateAdmin from '../middleware/auth.js';
import bookService from '../service/bookService.js';

class BookController {
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/', authenticateAdmin, this.createBooks);
    this.router.get('/', this.getBooks);
    this.router.put('/:isbn', authenticateAdmin, this.updateBook);
    this.router.delete('/:isbn', authenticateAdmin, this.deleteBook);
  }

  async createBooks(req, res) {
    try {
      const booksToCreate = req.body.books;
      if (!booksToCreate || booksToCreate.length === 0) {
        return res.status(400).json({ error: 'No books provided' });
      }

      const response = await bookService.createBooks(booksToCreate);
      return res.status(201).json(response);
    } catch (error) {
      console.error("Error creating books:", error);
      if (error.message.startsWith('Duplicate ISBN')) {
        return res.status(400).json({ error: error.message });
      } else {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  async getBooks(req, res) {
    try {
      const page = parseInt(req.query.page) || 0;
      const limit = 7;

      const { books, totalPages } = await bookService.getBooks(page, limit);

      if (page >= totalPages) {
        return res.status(200).json({ total_pages: totalPages, page: page, books: [] });
      }

      return res.status(200).json({
        total_pages: totalPages,
        page,
        books: books.map(book => ({
          title: book.title,
          author: book.author,
          edition: book.edition,
          publisher: book.publisher,
          isbn: book.isbn,
          genre: book.genre,
          page_count: book.page_count,
          language: book.language,
          publication_year: book.publicationYear,
          added_at: book.addedAt.toISOString(),
          updated_at: book.updatedAt ? book.updatedAt.toISOString() : null,
        })),
      });
    } catch (error) {
      console.error("Error fetching books:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateBook(req, res) {
    try {
      const isbn = req.params.isbn;
      const bookData = req.body;

      const updatedBook = await bookService.updateBook(isbn, bookData);

      if (!updatedBook) {
        return res.status(400).json({ error: 'Book not found' });
      }
      return res.status(200).json({ isbn: isbn, updated_at: updatedBook.updatedAt ? updatedBook.updatedAt.toISOString() : null });
    } catch (error) {
      console.error("Error updating book:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async deleteBook(req, res) {
    try {
      const isbn = req.params.isbn;

      const deletedBook = await bookService.deleteBook(isbn);

      if (!deletedBook) {
        return res.status(400).json({ error: 'Book not found' });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting book:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new BookController().router;