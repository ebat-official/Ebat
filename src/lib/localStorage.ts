export const getLocalStorage = <T>(key: string | undefined): T | undefined => {
	if (!key) return undefined;
	try {
	  const item = window.localStorage.getItem(key);
	  return item ? JSON.parse(item) : undefined;
	} catch (error) {
	  console.error(`Error reading localStorage key "${key}":`, error);
	  return undefined;
	}
  };
  
  export const setLocalStorage = <T>(key: string | undefined, value: T): void => {
	if (!key) return;
	try {
	  if (value === undefined) {
		window.localStorage.removeItem(key);
	  } else {
		window.localStorage.setItem(key, JSON.stringify(value));
	  }
	} catch (error) {
	  console.error(`Error writing to localStorage key "${key}":`, error);
	}
  };