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
  nextChapter: z.coerce.number(),
  imageUrl: z.string().optional(),
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
      nextChapter: 0,
      imageUrl: '',
    },
  })

  async function handleMarkWorkUnread({ workId, nextChapter }: FormSchema) {
    try {
      await markWorkAsRead({ workId, chapter: nextChapter })
    } catch (error) {
      console.error('Error marking work as read', error)
    }
  }

  const imageUrl = watch('imageUrl')

  useEffect(() => {
    fetchWorksWithFilter({ status: 'unread' })
      .then((works) => {
        setWorks(works)
      })
      .catch((error) => {
        console.error('Error fetching works', error)
      })
  }, [])

  useEffect(() => {
    getCurrentTab().then((tab) => {
      const data = map(works, (work) => ({ id: work.id, name: work.name }))

      const firsTWorkMatchToTitle = search(data, tab)

      const work = find(works, { name: firsTWorkMatchToTitle ?? '' }) ?? null

      reset({
        workId: work?.id || '',
        nextChapter: work?.nextChapter || 0,
        imageUrl: work?.imageUrl || '',
      })
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
                    reset({
                      imageUrl: work?.imageUrl ?? '',
                      nextChapter: work?.nextChapter ?? 0,
                      workId: work.id,
                    })
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={'Selecione a obra'} />
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
          <Input {...register('nextChapter')} type="number" placeholder="0" />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitSuccessful ? (
              <>
                <Check className="mr-2 size-4 text-muted-foreground" /> Obra
                marcada como lida !
              </>
            ) : (
              'Marcar como lida'
            )}
          </Button>
        </form>
      </div>
    </Container>
  )
}
