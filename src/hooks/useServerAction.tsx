import { useState, useEffect, useTransition, useRef } from "react";

export const useServerAction = <P extends unknown[], R>(
	action: (...args: P) => Promise<R>,
	onFinished?: (_: R | undefined) => void,
): [(...args: P) => Promise<R | undefined>, boolean] => {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<R>();
	const [finished, setFinished] = useState(false);
	const resolver = useRef<(value?: R | PromiseLike<R>) => void>(undefined);

	useEffect(() => {
		if (!finished) return;

		if (onFinished) onFinished(result);
		resolver.current?.(result);
		resolver.current = undefined; // Reset the resolver after resolving
	}, [result, finished]);

	const runAction = async (...args: P): Promise<R | undefined> => {
		setFinished(false); // Reset finished state before starting a new transition

		startTransition(() => {
			action(...args).then((data) => {
				setResult(data);
				setFinished(true);
			});
		});

		return new Promise((resolve) => {
			resolver.current = resolve;
		});
	};

	return [runAction, isPending];
};
