import {zodResolver} from '@hookform/resolvers/zod'
import {find} from 'lodash'
import {useCallback} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {z} from 'zod'

import {useFetchWorkList, WorkForExtensionType} from '@/api/fetch-work-list.ts'
import {useMarkWorkAsRead} from '@/api/mark-work-as-read.ts'
import {useUpdateWorkChapter} from '@/api/update-work-chapter'
import {useAuth} from '@/components/auth-provider'
import {Container} from '@/components/container'
import {useToast} from '@/components/toast-provider.tsx'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input.tsx'
import {Label} from '@/components/ui/label'
import {WorkSelect} from '@/components/work-select.tsx'
import {useFindWorkByTabTitle} from '@/hooks/useFindWorkByTabTitle.ts'
import {hasExceededMaxFractionDigits} from '@/lib/utils'
import {Loader2} from 'lucide-react'

const chapterNumberSchema = z.coerce
  .number({
    invalid_type_error: 'Informe um número válido',
    required_error: 'O capitulo/episodio é obrigatório',
  })
  .min(0, 'O capitulo/episodio não pode ser menor que 0')
  .refine((value) => !hasExceededMaxFractionDigits(value, 2), {
    message: 'O capitulo/episodio não pode ter mais de 2 casas decimais',
  })

const formSchema = z.object({
  workId: z.string(),
  chapter: chapterNumberSchema,
  imageUrl: z.string().optional().default('/okami.png'),
  hasNewChapter: z.boolean().optional(),
})

type FormSchema = z.infer<typeof formSchema>

export function MarkWorkRead() {
  const { showToast } = useToast()
  const { isLoading } = useAuth()
  const { data: worksOnGoing = [], isLoading: isLoadingWorks } = useFetchWorkList()

  const { updateWorkChapter, isPending: isPendingUpdateChapter } = useUpdateWorkChapter()
  const { markWorkAsRead, isPending: isPendingMarkWorkAsRead } = useMarkWorkAsRead()

  const workByTabTitle = useFindWorkByTabTitle(worksOnGoing)

  const {
    control,
    reset,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    values: {
      workId: workByTabTitle?.id ?? '',
      chapter: workByTabTitle?.nextChapter ?? workByTabTitle?.chapter ?? 0,
      imageUrl: workByTabTitle?.imageUrl ?? '',
      hasNewChapter: workByTabTitle?.hasNewChapter ?? false,
    },
  })

  const [imageUrl, hasNewChapter, workId] = watch(['imageUrl', 'hasNewChapter', 'workId'])

  function onWorkUpdated(chapterValue: number) {
    const work = find(worksOnGoing, { id: workId })

    if (work) {
      setCurrentWorkToFormState({
        ...work,
        hasNewChapter: false,
        nextChapter: null,
        chapter: chapterValue,
      })
    }
  }

  async function onSubmit({ workId, chapter, hasNewChapter }: FormSchema) {
    try {
      if (hasNewChapter) {
        await markWorkAsRead({ workId, chapter })
      } else {
        await updateWorkChapter({ chapter, workId })
      }

      onWorkUpdated(chapter)

      showToast('Obra atualizada com sucesso!', 'success')
    } catch {
      showToast('Ocorreu um erro ao atualizar a obra', 'error')
    }
  }

  const setCurrentWorkToFormState = useCallback((work: WorkForExtensionType) => {
    reset({
      workId: work?.id || '',
      chapter: work.nextChapter ?? work.chapter,
      imageUrl: work?.imageUrl || '',
      hasNewChapter: work?.hasNewChapter,
    })
  }, [])

  const buttonMessage = hasNewChapter ? 'Marcar como lido' : 'Atualizar capitulo'
  const canDisableButton = isPendingUpdateChapter || isPendingMarkWorkAsRead || !workId || isLoadingWorks

  if (isLoading) {
    return <Container>Carregando...</Container>
  }

  return (
    <Container>
      <div className="flex flex-col items-center justify-center gap-4 p-4" id="mark-work-read">
        <picture>
          <img
            className="size-[200px] rounded-sm"
            alt={`work ${workByTabTitle?.name}`}
            src={imageUrl || '/okami.png'}
          />
        </picture>

        <form className="flex w-[300px] flex-col gap-4 " onSubmit={handleSubmit(onSubmit)}>
          <Label>Obra</Label>
          <Controller
            control={control}
            name="workId"
            render={({ field }) => (
              <WorkSelect
                value={field.value}
                onSelected={(id) => {
                  const work = find(worksOnGoing, { id })
                  if (work) {
                    setCurrentWorkToFormState(work)
                  }
                }}
                works={worksOnGoing.map((item) => ({
                  id: item.id,
                  label: item.name,
                }))}
              />
            )}
          />

          <Label>Capitulo/Episodio</Label>

          <Controller
            render={({ field }) => (
              <>
                <Input {...field} disabled={isLoadingWorks} type="number" />
                {errors.chapter && <span className="mt-1 text-red-600">{errors.chapter.message}</span>}
              </>
            )}
            name="chapter"
            control={control}
          />

          <Button type="submit" disabled={canDisableButton}>
            {canDisableButton ? (
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            ) : (
              buttonMessage
            )}
          </Button>
        </form>
      </div>
    </Container>
  )
}
