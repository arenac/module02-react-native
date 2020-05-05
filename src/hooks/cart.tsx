import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsFromStorage = await AsyncStorage.getItem('@Products');
      if (productsFromStorage) {
        setProducts(JSON.parse(productsFromStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const isProduct = products.find(p => p.id === product.id);
      if (isProduct) {
        const extractProducts = products.filter(p => p.id !== product.id);
        setProducts([
          ...extractProducts,
          { ...isProduct, quantity: isProduct.quantity + 1 },
        ]);
      } else {
        setProducts([...products, product]);
      }
      await AsyncStorage.removeItem('@Products');
      await AsyncStorage.setItem('@Products', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const product = products.filter(p => p.id === id)[0];
      const extractProducts = products.filter(p => p.id !== id);
      setProducts([
        ...extractProducts,
        { ...product, quantity: product.quantity + 1 },
      ]);
      await AsyncStorage.setItem('@Products', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.filter(p => p.id === id)[0];
      const extractProducts = products.filter(p => p.id !== id);
      if (product.quantity === 1) {
        setProducts([...extractProducts]);
      } else {
        setProducts([
          ...extractProducts,
          { ...product, quantity: product.quantity - 1 },
        ]);
      }
      await AsyncStorage.setItem('@Products', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
