import { useEffect, useState } from "react";

/**
 * A custom hook for interacting with localStorage.
 *
 * @param key - The key to store and retrieve from localStorage.
 * @param initialValue - The initial value if the key doesn't exist in localStorage.
 *
 * @returns An array containing the value from localStorage and a setter function.
 */
function useLocalStorage<T>(
	key: string | null,
	initialValue: T,
): [T, (value: T) => void] {
	const [storedValue, setStoredValue] = useState<T>(initializer());

	function initializer() {
		if (!key) return initialValue; // Prevent reading localStorage when key is null

		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			return initialValue;
		}
	}

	useEffect(() => {
		setStoredValue(initializer());
	}, [key]);

	useEffect(() => {
		if (!key) return; // Prevent setting localStorage if key is null

		try {
			if (storedValue === null) {
				window.localStorage.removeItem(key);
			} else {
				window.localStorage.setItem(key, JSON.stringify(storedValue));
			}
		} catch (error) {
			console.error(`Error writing to localStorage key: ${key}`, error);
		}
	}, [storedValue]);

	return [storedValue, setStoredValue];
}

export default useLocalStorage;
