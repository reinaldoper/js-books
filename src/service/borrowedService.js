import prisma from '../prismaClient.js';

class BorrowedService {
  async borrowBook(isbn, userId) {
    const book = await prisma.book.findUnique({ where: { isbn } });
    if (!book) {
      throw new Error('Book not found');
    }

    const borrowedBooksCount = await prisma.borrowing.count({
      where: { userId, returnedAt: null },
    });
    if (borrowedBooksCount >= 2) {
      throw new Error('Borrowing limit reached');
    }

    if (book.status !== 'available') {
      throw new Error('Book not available for borrowing');
    }

    const existingBorrowing = await prisma.borrowing.findFirst({
      where: {
        bookId: book.id,
        returnedAt: null,
      },
    });

    if (existingBorrowing) {
      throw new Error('Book already borrowed by another user');
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

    return result;
  }

  async returnBook(isbn, userId) {
    await prisma.$transaction(async (prisma) => {
      const book = await prisma.book.findUnique({ where: { isbn } });
      if (!book) {
        throw new Error('Book not found');
      }

      const borrowedBook = await prisma.borrowing.findFirst({
        where: { userId, bookId: book.id, returnedAt: null },
      });

      if (!borrowedBook) {
        throw new Error('Borrowed book not found');
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
  }

  async getBorrowedBooks(userId) {
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

    return borrowedBooks.map((borrowedBook) => ({
      isbn: borrowedBook.book.isbn,
      borrowed_at: borrowedBook.borrowedAt,
      returned_at: borrowedBook.returnedAt,
    }));
  }
}

export default new BorrowedService();