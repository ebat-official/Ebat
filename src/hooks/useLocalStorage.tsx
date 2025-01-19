import { useState, useEffect } from 'react';

/**
 * A custom hook for interacting with localStorage.
 * 
 * @param key - The key to store and retrieve from localStorage.
 * @param initialValue - The initial value if the key doesn't exist in localStorage.
 * 
 * @returns An array containing the value from localStorage and a setter function.
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Get the item from localStorage when the component mounts
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Check if the item exists in localStorage
      const item = window.localStorage.getItem(key);
      // If the item exists, parse it, otherwise return the initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  // Update localStorage whenever storedValue changes
  useEffect(() => {
    try {
      // Save the value to localStorage in serialized format
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error writing to localStorage key:', key, error);
    }
  }, [key, storedValue]);

  // Return the value and setter function to update the value in localStorage
  return [storedValue, setStoredValue];
}

export default useLocalStorage;
