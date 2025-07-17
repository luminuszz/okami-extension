import {useMutation, useQueryClient} from "@tanstack/react-query";
import {z} from "zod";
import {getFetchWorksWithFilterQueryKey, type WorkType,} from "@/api/fetch-for-works-with-filter.ts";
import {useMarkNotificationAsRead} from "@/api/mark-notification-as-read.ts";
import {useUpdateQueryCache} from "@/hooks/useUpdateQueryCache.ts";
import {okamiHttpGateway} from "@/lib/axios";

const markWorkAsReadInputSchema = z.object({
    workId: z.string(),
    chapter: z.number(),
});

type MarkWorkAsReadInput = z.infer<typeof markWorkAsReadInputSchema>;

export async function markWorkAsRead(params: MarkWorkAsReadInput) {
    const {chapter, workId} = markWorkAsReadInputSchema.parse(params);

    await okamiHttpGateway.patch(`/work/${workId}/update-chapter`, {
        chapter,
    });
}

const workListQueryKey = getFetchWorksWithFilterQueryKey();

export function useMarkWorkAsRead() {
    const {markAsRead: markNotificationAsRead} = useMarkNotificationAsRead();

    const updateQueryCache = useUpdateQueryCache<WorkType[]>(getFetchWorksWithFilterQueryKey());
    const client = useQueryClient();

    const {mutateAsync, isPending} = useMutation({
        mutationKey: ["markWorkAsRead"],
        mutationFn: markWorkAsRead,
        retry: 3,
        onMutate({chapter, workId}) {
            void client.cancelQueries({queryKey: workListQueryKey});

            return updateQueryCache((cache) => {
				
                cache?.forEach((item) => {
                    if (item.id === workId) {
                        item.chapter = chapter;
                        item.nextChapter = null;
                        item.nextChapterUpdatedAt = null;
                        item.hasNewChapter = false;
                    }
                });

                return cache;
            });
        },
        onError(_, __, cache) {
            updateQueryCache(cache);
        },
        onSuccess(_, {workId}) {
            void client.invalidateQueries({queryKey: workListQueryKey});
            markNotificationAsRead(workId);
        },
    });

    return {
        isPending,
        markWorkAsRead: mutateAsync,
    };
}
