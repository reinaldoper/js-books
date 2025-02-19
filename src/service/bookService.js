import prisma from '../prismaClient.js';

class BookService {
  async createBooks(booksToCreate) {
    const isbnSet = new Set();
    for (const book of booksToCreate) {
      if (isbnSet.has(book.isbn)) {
        throw new Error(`Duplicate ISBN: ${book.isbn}`);
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
      throw new Error(`Duplicate ISBNs: ${existingIsbns.join(', ')}`);
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

    return booksToCreate.map(book => ({
      isbn: book.isbn,
      added_at: new Date(),
    }));
  }

  async getBooks(page, limit) {
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

    return { books, totalPages };
  }

  async updateBook(isbn, bookData) {
    const updatedBook = await prisma.book.update({
      where: { isbn },
      data: {
        ...bookData,
        updatedAt: new Date(),
      },
    });

    return updatedBook;
  }

  async deleteBook(isbn) {
    const deletedBook = await prisma.book.delete({
      where: { isbn },
    });

    return deletedBook;
  }
}

export default new BookService();