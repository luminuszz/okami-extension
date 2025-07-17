import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useCallback } from "react";

type UpdateCacheHandlerOptions = {
	useImmer: boolean;
};

type ValueOrFalsy<Type> = Type | null | undefined;

type UpdateCacheHandler<CacheType> = (cache: CacheType) => CacheType;

type UpdateCacheParam<CacheType> = CacheType | UpdateCacheHandler<CacheType>;

const isFunctionUpdateCacheHandler = (value: unknown): value is UpdateCacheHandler<unknown> =>
	typeof value === "function";

const defaultCacheHandlerOptions = {
	useImmer: true,
} satisfies UpdateCacheHandlerOptions;

function useUpdateQueryCache<CacheType>(key: QueryKey) {
	const queryClient = useQueryClient();

	return useCallback(
		(
			resolve: UpdateCacheParam<ValueOrFalsy<CacheType>>,
			options: UpdateCacheHandlerOptions = defaultCacheHandlerOptions,
		) => {
			const originalCache = queryClient.getQueryData<CacheType>(key) ?? null;

			const isFunctionUpdatedCache = isFunctionUpdateCacheHandler(resolve);

			if (isFunctionUpdatedCache) {
				let nextState: any;

				if (options.useImmer) {
					nextState = produce(originalCache, (draft) => {
						resolve(draft);

						return draft;
					});
				} else {
					nextState = resolve(originalCache);
				}

				queryClient.setQueryData(key, nextState);
			} else {
				const newCache = resolve as CacheType;

				if (newCache !== undefined) {
					queryClient.setQueryData(key, newCache);
				}
			}

			return originalCache;
		},
		[key, queryClient],
	);
}

export type { ValueOrFalsy, UpdateCacheHandler, UpdateCacheParam };

export { useUpdateQueryCache };
