import { zodResolver } from '@hookform/resolvers/zod'
import { find, map } from 'lodash'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  fetchWorksWithFilter,
  WorkType,
} from '@/api/fetch-for-works-with-filter'
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
  const [works, setWorks] = useState<WorkType[]>([])

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

  async function handleMarkWorkUnread({
    workId,
    chapter,
    hasNewChapter,
  }: FormSchema) {
    try {
      if (hasNewChapter) {
        await markWorkAsRead({ workId, chapter })
      } else {
        await updateWorkChapterCall({ chapter, workId })
      }
    } catch (error) {
      console.error('Error marking work as read', error)
    }
  }

  const imageUrl = watch('imageUrl')

  const hasNewChapter = watch('hasNewChapter')

  function resetFormStatusWithNewWork(work: WorkType) {
    reset({
      workId: work?.id || '',
      chapter: work.nextChapter ?? work.chapter,
      imageUrl: work?.imageUrl || '',
      hasNewChapter: work?.hasNewChapter,
    })
  }

  useEffect(() => {
    fetchWorksWithFilter()
      .then((works) => setWorks(works))
      .catch((error) => {
        console.error('Error fetching works', error)
      })
  }, [])

  useEffect(() => {
    getCurrentTab().then((tab) => {
      const data = map(works, (work) => ({ id: work.id, name: work.name }))

      const firsTWorkMatchToTitle = search(data, tab)

      const work = find(works, { name: firsTWorkMatchToTitle ?? '' }) ?? null

      if (work) {
        resetFormStatusWithNewWork(work)
      }
    })
  }, [works])

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
