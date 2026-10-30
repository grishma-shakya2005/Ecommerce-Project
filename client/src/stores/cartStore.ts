import { create } from 'zustand';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: JSON.parse(localStorage.getItem('cart') || '[]'),
  
  addItem: (item: CartItem) => set((state) => {
    const existingItem = state.items.find(i => i._id === item._id);
    const newItems = existingItem
      ? state.items.map(i => i._id === item._id ? { ...i, quantity: i.quantity + item.quantity } : i)
      : [...state.items, item];
    localStorage.setItem('cart', JSON.stringify(newItems));
    return { items: newItems };
  }),
  
  removeItem: (id: string) => set((state) => {
    const newItems = state.items.filter(item => item._id !== id);
    localStorage.setItem('cart', JSON.stringify(newItems));
    return { items: newItems };
  }),
  
  updateQuantity: (id: string, quantity: number) => set((state) => {
    const newItems = state.items.map(item =>
      item._id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    localStorage.setItem('cart', JSON.stringify(newItems));
    return { items: newItems };
  }),
  
  clearCart: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },
  
  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));
