import { zodResolver } from '@hookform/resolvers/zod'
import { filter, find, flatMap } from 'lodash'
import { Check } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  useFetchWorksWithFilter,
  WorkType,
} from '@/api/fetch-for-works-with-filter'
import { useGetRecentNotifications } from '@/api/get-recent-notifications.ts'
import { markNotificationAsRead } from '@/api/mark-notification-as-read.ts'
import { markWorkAsRead } from '@/api/mark-work-as-read.ts'
import { updateWorkChapterCall } from '@/api/update-work-chapter'
import { useAuth } from '@/components/auth-provider'
import { Container } from '@/components/container'
import { NumberInput } from '@/components/number-input.tsx'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getCurrentTab,
  hasExceededMaxFractionDigits,
  search,
} from '@/lib/utils'

const formSchema = z.object({
  workId: z.string(),
  chapter: z.coerce
    .number({
      invalid_type_error: 'Informe um número válido',
      required_error: 'O capitulo/episodio é obrigatório',
    })
    .min(0, 'O capitulo/episodio não pode ser menor que 0')
    .refine((value) => !hasExceededMaxFractionDigits(value, 2), {
      message: 'O capitulo/episodio não pode ter mais de 2 casas decimais',
    }),
  imageUrl: z.string().optional().default('/okami.png'),
  hasNewChapter: z.boolean().optional(),
})

type FormSchema = z.infer<typeof formSchema>

export function MarkWorkRead() {
  const { isLoading } = useAuth()
  const { notifications } = useGetRecentNotifications()
  const { works } = useFetchWorksWithFilter()

  const worksOnGoing = useMemo(
    () => filter(works, { isFinished: false }),
    [works],
  )

  const {
    control,
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful, errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workId: '',
      chapter: 0,
      imageUrl: '',
    },
  })

  function markNotificationWorkAsRead(workId: string) {
    const work = find(worksOnGoing, { id: workId })

    if (!work) return

    const notification = find(
      notifications,
      ({ content }) => content.workId === workId,
    )

    if (!notification) return

    markNotificationAsRead(notification.id)
      .then(() => {
        console.log('Notification marked as read')
      })
      .catch((error) => {
        console.log('Error marking notification as read', error)
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

  const [imageUrl, workId] = watch(['imageUrl', 'workId'])
  const hasNewChapter = watch('hasNewChapter')

  const setCurrentWorkToFormState = useCallback(
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
      const worksNames = flatMap(worksOnGoing, (work) => [
        work.name,
        work.alternativeName ?? '',
      ])

      const firsTWorkMatchToTitle = search(worksNames, tabTitle)

      const work =
        find(worksOnGoing, (work) => {
          return [work.name, work.alternativeName].includes(
            firsTWorkMatchToTitle,
          )
        }) ?? null

      if (work) {
        setCurrentWorkToFormState(work)
      }
    })
  }, [setCurrentWorkToFormState, worksOnGoing])

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
            src={imageUrl || '/okami.png'}
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
                  const work = find(worksOnGoing, { id: value })

                  if (work) {
                    setCurrentWorkToFormState(work)
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>

                <SelectContent>
                  {worksOnGoing.map((work) => {
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

          <Controller
            render={({ field }) => (
              <>
                <NumberInput
                  onChange={field.onChange}
                  value={field.value}
                  min={0}
                  onBlur={field.onBlur}
                  disabled={field.disabled}
                  placeholder="120"
                />

                {errors.chapter && (
                  <span className="mt-1 text-red-600">
                    {errors.chapter.message}
                  </span>
                )}
              </>
            )}
            name="chapter"
            control={control}
          />

          <Button
            data-isSuccess={isSubmitSuccessful}
            type="submit"
            disabled={isSubmitting || !workId}
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
