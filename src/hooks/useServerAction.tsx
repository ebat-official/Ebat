import { useState, useEffect, useTransition, useRef } from "react";

export const useServerAction = <P extends unknown[], R>(
	action: (...args: P) => Promise<R>,
	onFinished?: (_: R | undefined) => void,
): [(...args: P) => Promise<R>, boolean] => {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<R>();
	const [finished, setFinished] = useState(false);
	const resolver = useRef<{
		resolve: (value: R) => void;
		reject: (reason?: unknown) => void;
	} | null>(null);

	useEffect(() => {
		if (!finished) return;

		// Call the onFinished callback with the result if provided
		if (onFinished) onFinished(result);

		// Resolve the promise with the result if the resolver exists
		if (resolver.current) {
			resolver.current.resolve(result as R);
			resolver.current = null;
		}

		// Reset the finished state for subsequent calls
		setFinished(false);
	}, [result, finished, onFinished]);

	const runAction = async (...args: P): Promise<R> => {
		setFinished(false);

		return new Promise((resolve, reject) => {
			// Store the current resolve and reject functions
			resolver.current = { resolve, reject };

			startTransition(() => {
				action(...args)
					.then((data) => {
						setResult(data);
						setFinished(true);
					})
					.catch((error) => {
						console.error("Action failed:", error);
						// Immediately reject the promise if an error occurs
						if (resolver.current) {
							resolver.current.reject(error);
							resolver.current = null;
						}
						setFinished(true);
					});
			});
		});
	};

	return [runAction, isPending];
};
