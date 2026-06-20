import dotenv from 'dotenv';
import path from 'path';

// Load environmental parameters
dotenv.config({ path: path.join(__dirname, '../../../.env') });

import mongoose from 'mongoose';
import User from '../models/User';
import Book from '../models/Book';
import Reader from '../models/Reader';
import Lending from '../models/Lending';
import AuditLog from '../models/AuditLog';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book_club';

const seedDatabase = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB for database seeding.');

    // 1. Purge existing collections
    console.log('Purging existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Book.deleteMany({}),
      Reader.deleteMany({}),
      Lending.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('Cleared all collections.');

    // 2. Seed Default Administrator Staff
    console.log('Seeding default administrator user account...');
    const adminUser = new User({
      username: 'admin',
      name: 'Admin Librarian',
      password: 'admin123', // Automatically hashed by the Mongoose user pre-save hook
    });
    await adminUser.save();
    console.log('Seed success: Admin Staff registered (username: "admin", password: "admin123").');

    // 3. Seed Mock Book Catalogue
    console.log('Seeding initial classic books catalog...');
    const sampleBooks = [
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        isbn: '9780261102217',
        genre: 'Fantasy',
        totalCopies: 5,
        availableCopies: 5,
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        genre: 'Dystopian',
        totalCopies: 4,
        availableCopies: 4,
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780446310789',
        genre: 'Classic',
        totalCopies: 3,
        availableCopies: 3,
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        genre: 'Classic Fiction',
        totalCopies: 6,
        availableCopies: 6,
      },
      {
        title: 'Brave New World',
        author: 'Aldous Huxley',
        isbn: '9780060850524',
        genre: 'Science Fiction',
        totalCopies: 2,
        availableCopies: 2,
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '9780141439518',
        genre: 'Romance Classic',
        totalCopies: 4,
        availableCopies: 4,
      },
    ];

    const seededBooks = await Book.insertMany(sampleBooks);
    console.log(`Seed success: ${seededBooks.length} books successfully written.`);

    // 4. Seed Mock Reader Registry Patrons
    console.log('Seeding initial reader patrons list...');
    const sampleReaders = [
      {
        readerId: 'R202601',
        name: 'Alice Cooper',
        email: 'alice.cooper@example.com',
        phone: '+1 555 0101',
      },
      {
        readerId: 'R202602',
        name: 'Bob Marley',
        email: 'bob.marley@example.com',
        phone: '+1 555 0102',
      },
      {
        readerId: 'R202603',
        name: 'Charlie Chaplin',
        email: 'charlie.chaplin@example.com',
        phone: '+1 555 0103',
      },
      {
        readerId: 'R202604',
        name: 'Diana Prince',
        email: 'diana.prince@example.com',
        phone: '+1 555 0104',
      },
    ];

    const seededReaders = await Reader.insertMany(sampleReaders);
    console.log(`Seed success: ${seededReaders.length} reader profiles written.`);

    // 5. Seed Database Initialization Audit Log
    console.log('Registering database initialization audit log...');
    const initLog = new AuditLog({
      action: 'SYSTEM_INIT',
      collectionName: 'User',
      documentId: adminUser._id.toString(),
      performedBy: adminUser._id,
      details: 'System database initialized and loaded with core seed documents.',
    });
    await initLog.save();
    console.log('Seed success: Audit initialization logged.');

    console.log('Database seeding process completed successfully!');
  } catch (error) {
    console.error('Error during database seeding process:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Mongoose connection closed. Exiting seeding script.');
    process.exit(0);
  }
};

// Execute seeder
seedDatabase();
