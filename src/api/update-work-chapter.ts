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
