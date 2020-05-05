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
      // eslint-disable-next-line no-underscore-dangle
      let _products: Product[];

      const isProduct = products.find(p => p.id === product.id);
      if (isProduct) {
        const extractProducts = products.filter(p => p.id !== product.id);
        _products = [
          ...extractProducts,
          { ...isProduct, quantity: isProduct.quantity + 1 },
        ];
      } else {
        _products = [...products, product];
      }
      await AsyncStorage.setItem('@Products', JSON.stringify(_products));
      setProducts(_products);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const product = products.filter(p => p.id === id)[0];
      const extractProducts = products.filter(p => p.id !== id);
      // eslint-disable-next-line no-underscore-dangle
      const _products = [
        ...extractProducts,
        { ...product, quantity: product.quantity + 1 },
      ];
      await AsyncStorage.setItem('@Products', JSON.stringify(_products));
      setProducts(_products);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // eslint-disable-next-line no-underscore-dangle
      let _products: Product[];
      const product = products.filter(p => p.id === id)[0];
      const extractProducts = products.filter(p => p.id !== id);
      if (product.quantity === 1) {
        _products = [...extractProducts];
        console.log('zero', _products);
      } else {
        _products = [
          ...extractProducts,
          { ...product, quantity: product.quantity - 1 },
        ];
        console.log('no zero', _products);
      }
      await AsyncStorage.setItem('@Products', JSON.stringify(_products));
      setProducts(_products);
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
