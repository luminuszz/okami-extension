import { zodResolver } from '@hookform/resolvers/zod'
import { filter, find, map } from 'lodash'
import { Check } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  useFetchWorksWithFilter,
  WorkType,
} from '@/api/fetch-for-works-with-filter'
import { useGetRecentNotifications } from '@/api/get-recent-notifications.ts'
import { markNotificationAsRead } from '@/api/mark-notification-as-read.ts'
import { markWorkAsRead } from '@/api/mark-work-as-read'
import { updateWorkChapterCall } from '@/api/update-work-chapter'
import { useAuth } from '@/components/auth-provider'
import { Container } from '@/components/container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCurrentTab, search } from '@/lib/utils'

const formSchema = z.object({
  workId: z.string(),
  chapter: z.coerce.number(),
  imageUrl: z.string().optional(),
  hasNewChapter: z.boolean().optional(),
})

type FormSchema = z.infer<typeof formSchema>

export function MarkWorkRead() {
  const { isLoading } = useAuth()
  const { notifications } = useGetRecentNotifications()
  const { works } = useFetchWorksWithFilter()

  const {
    register,
    control,
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workId: '',
      chapter: 0,
      imageUrl: '',
    },
  })

  function markNotificationWorkAsRead(workId: string) {
    const work = find(works, { id: workId })

    if (!work) return

    const notification = find(
      notifications,
      ({ content }) => content.name === work.name,
    )

    if (!notification) return

    markNotificationAsRead(notification.id).then(() => {
      console.log('Notification marked as read')
    })
  }

  async function handleMarkWorkUnread({
    workId,
    chapter,
    hasNewChapter,
  }: FormSchema) {
    try {
      if (hasNewChapter) {
        await markWorkAsRead({ workId, chapter })
        markNotificationWorkAsRead(workId)
      } else {
        await updateWorkChapterCall({ chapter, workId })
      }
    } catch (error) {
      console.error('Error marking work as read', error)
    }
  }

  const imageUrl = watch('imageUrl')
  const hasNewChapter = watch('hasNewChapter')

  const resetFormStatusWithNewWork = useCallback(
    (work: WorkType) => {
      reset({
        workId: work?.id || '',
        chapter: work.nextChapter ?? work.chapter,
        imageUrl: work?.imageUrl || '',
        hasNewChapter: work?.hasNewChapter,
      })
    },
    [reset],
  )

  useEffect(() => {
    getCurrentTab().then((tabTitle) => {
      const worksNames = map(filter(works, { isFinished: false }), 'name')

      const firsTWorkMatchToTitle = search(worksNames, tabTitle)

      const work = find(works, { name: firsTWorkMatchToTitle ?? '' }) ?? null

      if (work) {
        resetFormStatusWithNewWork(work)
      }
    })
  }, [resetFormStatusWithNewWork, works])

  if (isLoading) {
    return <Container>Carregando...</Container>
  }

  return (
    <Container>
      <div className="flex flex-col items-center justify-center gap-4 p-4">
        <picture>
          <img
            className="size-[200px] rounded-sm"
            alt="image"
            src={imageUrl ?? '/okami-logo.svg'}
          />
        </picture>

        <form
          className="flex w-[300px] flex-col gap-4 "
          onSubmit={handleSubmit(handleMarkWorkUnread)}
        >
          <Label>Obra</Label>
          <Controller
            control={control}
            name="workId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  const work = find(works, { id: value })
                  if (work) {
                    resetFormStatusWithNewWork(work)
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>

                <SelectContent>
                  {works.map((work) => {
                    return (
                      <SelectItem key={work.id} value={work.id}>
                        {work.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            )}
          />

          <Label>Capitulo/Episodio</Label>
          <Input {...register('chapter')} type="number" placeholder="0" />

          <Button
            data-isSuccess={isSubmitSuccessful}
            type="submit"
            disabled={isSubmitting}
            className="data-[isSuccess=true]:bg-emerald-500 data-[isSuccess=true]:text-gray-100"
          >
            {isSubmitSuccessful ? (
              <>
                <Check className="mr-2 size-4 text-gray-100" /> Obra atualizada
                com sucesso
              </>
            ) : hasNewChapter ? (
              'Marcar como lido'
            ) : (
              'Atualizar capitulo'
            )}
          </Button>
        </form>
      </div>
    </Container>
  )
}
