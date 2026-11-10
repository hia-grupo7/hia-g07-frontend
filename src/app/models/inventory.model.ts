import { Book } from './book.model';

export interface Inventory {
  id: number;
  bookId: number;
  book: Book;
  entryDate: string;
  stock: number;
  price: number;
  reserved: number;
}