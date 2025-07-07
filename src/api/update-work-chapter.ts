import { useMutation } from '@tanstack/react-query'

import { okamiHttpGateway } from '@/lib/axios'

interface UpdateWorkInput {
  workId: string
  chapter: number
}

export async function updateWorkChapterCall({
  chapter,
  workId,
}: UpdateWorkInput) {
  await okamiHttpGateway.put(`/work/update-work/${workId}`, {
    chapter,
  })
}

export function useUpdateWorkChapter() {
  const { isPending, mutateAsync } = useMutation({
    mutationKey: ['updateWorkChapter'],
    mutationFn: updateWorkChapterCall,
    retry: 3,
  })

  return {
    isPending,
    updateWorkChapter: mutateAsync,
  }
}
