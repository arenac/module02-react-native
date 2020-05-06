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
    async (product: Omit<Product, 'quantity'>) => {
      const index = products.findIndex(prod => prod.id === product.id);
      if (index !== -1) {
        const newProducts = [...products];
        newProducts[index] = {
          ...newProducts[index],
          quantity: newProducts[index].quantity + 1,
        };
        setProducts(newProducts);
        AsyncStorage.setItem('@Products', JSON.stringify(newProducts));
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
        AsyncStorage.setItem(
          '@Products',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const index = products.findIndex(product => product.id === id);
      if (index !== -1) {
        const newProducts = [...products];
        newProducts[index] = {
          ...newProducts[index],
          quantity: newProducts[index].quantity + 1,
        };
        setProducts(newProducts);
        await AsyncStorage.setItem('@Products:', JSON.stringify(products));
      } else {
        await AsyncStorage.setItem('@Products:', JSON.stringify(products));
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(product => product.id === id);
      if (index !== -1) {
        const newProducts = [...products];
        if (newProducts[index].quantity === 1) {
          const deleteProduct = products.filter(product => product.id !== id);
          setProducts(deleteProduct);
          await AsyncStorage.setItem(
            '@Products:',
            JSON.stringify(deleteProduct),
          );
        } else {
          newProducts[index] = {
            ...newProducts[index],
            quantity: newProducts[index].quantity - 1,
          };
          setProducts(newProducts);
          await AsyncStorage.setItem('@Products:', JSON.stringify(newProducts));
        }
      } else {
        await AsyncStorage.setItem('@Products:', JSON.stringify(products));
      }
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
