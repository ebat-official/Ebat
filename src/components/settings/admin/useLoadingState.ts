"use client";

import { useCallback, useState } from "react";

interface UseLoadingStateReturn {
	loading: boolean;
	setLoading: (loading: boolean) => void;
	withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

export function useLoadingState(): UseLoadingStateReturn {
	const [loading, setLoading] = useState(false);

	const withLoading = useCallback(
		async <T>(fn: () => Promise<T>): Promise<T> => {
			setLoading(true);
			try {
				return await fn();
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	return {
		loading,
		setLoading,
		withLoading,
	};
}

interface UseMultiLoadingStateReturn {
	loading: Record<string, boolean>;
	isAnyLoading: boolean;
	setLoading: (key: string, loading: boolean) => void;
	withLoading: <T>(key: string, fn: () => Promise<T>) => Promise<T>;
}

export function useMultiLoadingState(): UseMultiLoadingStateReturn {
	const [loading, setLoadingState] = useState<Record<string, boolean>>({});

	const setLoading = useCallback((key: string, isLoading: boolean) => {
		setLoadingState((prev) => ({
			...prev,
			[key]: isLoading,
		}));
	}, []);

	const withLoading = useCallback(
		async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
			setLoading(key, true);
			try {
				return await fn();
			} finally {
				setLoading(key, false);
			}
		},
		[setLoading],
	);

	const isAnyLoading = Object.values(loading).some(Boolean);

	return {
		loading,
		isAnyLoading,
		setLoading,
		withLoading,
	};
}
