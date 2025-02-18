import { Router } from 'express';
import prisma from '../prismaClient.js';
import authenticateAdmin from '../middleware/auth.js';

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

      const isbnSet = new Set();
      for (const book of booksToCreate) {
        if (isbnSet.has(book.isbn)) {
          return res.status(400).json({ error: `Duplicate ISBN: ${book.isbn}` });
        }
        isbnSet.add(book.isbn);
      }

      const existingBooks = await prisma.book.findMany({
        where: {
          isbn: {
            in: booksToCreate.map(book => book.isbn),
          },
        },
      });

      if (existingBooks.length > 0) {
        const existingIsbns = existingBooks.map(book => book.isbn);
        return res.status(400).json({ error: `Duplicate ISBNs: ${existingIsbns.join(', ')}` });
      }

      await prisma.book.createMany({
        data: booksToCreate.map(book => ({
          title: book.title,
          author: book.author,
          edition: book.edition,
          publisher: book.publisher,
          isbn: book.isbn,
          genre: book.genre,
          page_count: book.page_count,
          language: book.language,
          publicationYear: book.publication_year,
        })),
        skipDuplicates: true,
      });

      const response = booksToCreate.map(book => ({
        isbn: book.isbn,
        added_at: new Date()
      }));
      return res.status(201).json(response);
    } catch (error) {
      console.error("Error creating books:", error);
      if (error instanceof Error && error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
        return res.status(400).json({ error: 'Duplicate ISBN' });
      } else {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  async getBooks(req, res) {
    try {
      const page = parseInt(req.query.page) || 0;
      const limit = 7;
      const offset = page * limit;
      const books = await prisma.book.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          isbn: 'desc',
        },
      });

      const count = await prisma.book.count();
      const totalPages = Math.ceil(count / limit);

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
      const { title, author, edition, publisher, genre, page_count, language, publication_year } = req.body;
      const updatedBook = await prisma.book.update({
        where: { isbn },
        data: {
          title,
          author,
          edition,
          publisher,
          genre,
          page_count,
          language,
          publicationYear: publication_year,
          updatedAt: new Date(),
        },
      });

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
      const deletedBook = await prisma.book.delete({
        where: { isbn },
      });

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