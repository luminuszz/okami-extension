import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getFetchWorksWithFilterQueryKey,
	type WorkType,
} from "@/api/fetch-for-works-with-filter.ts";
import { useUpdateQueryCache } from "@/hooks/useUpdateQueryCache.ts";
import { okamiHttpGateway } from "@/lib/axios";

interface UpdateWorkInput {
	workId: string;
	chapter: number;
}

export async function updateWorkChapterCall({ chapter, workId }: UpdateWorkInput) {
	await okamiHttpGateway.put(`/work/update-work/${workId}`, {
		chapter,
	});
}

const workListQueryKey = getFetchWorksWithFilterQueryKey();

export function useUpdateWorkChapter() {
	const updateQueryCache = useUpdateQueryCache<WorkType[]>(workListQueryKey);
	const client = useQueryClient();

	const { isPending, mutateAsync } = useMutation({
		mutationKey: ["updateWorkChapter"],
		mutationFn: updateWorkChapterCall,
		retry: 3,
		async onMutate({ workId, chapter }) {
			await client.cancelQueries({ queryKey: workListQueryKey });

			return updateQueryCache((cache) => {
				cache?.forEach((work) => {
					if (work.id === workId) {
						work.chapter = chapter;
					}
				});

				return cache;
			});
		},
		onError(_, __, cache) {
			updateQueryCache(cache);
		},
		onSuccess() {
			void client.invalidateQueries({ queryKey: workListQueryKey });
		},
	});

	return {
		isPending,
		updateWorkChapter: mutateAsync,
	};
}
