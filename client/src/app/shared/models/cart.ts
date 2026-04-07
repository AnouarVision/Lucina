import { CartItem } from './cart-item';

export interface Cart {
  userId: string;
  items: CartItem[];
}
