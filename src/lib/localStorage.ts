export const getLocalStorage = <T>(key: string | null): T | null => {
	if (!key) return null;
	try {
	  const item = window.localStorage.getItem(key);
	  return item ? JSON.parse(item) : null;
	} catch (error) {
	  console.error(`Error reading localStorage key "${key}":`, error);
	  return null;
	}
  };
  
  export const setLocalStorage = <T>(key: string | null, value: T): void => {
	if (!key) return;
	try {
	  if (value === null) {
		window.localStorage.removeItem(key);
	  } else {
		window.localStorage.setItem(key, JSON.stringify(value));
	  }
	} catch (error) {
	  console.error(`Error writing to localStorage key "${key}":`, error);
	}
  };