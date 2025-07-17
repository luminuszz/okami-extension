import {zodResolver} from "@hookform/resolvers/zod";
import {clsx} from "clsx";
import {find} from "lodash";
import {useCallback} from "react";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";

import {useFetchWorksWithFilter, type WorkType} from "@/api/fetch-for-works-with-filter";

import {useMarkWorkAsRead} from "@/api/mark-work-as-read.ts";
import {useUpdateWorkChapter} from "@/api/update-work-chapter";
import {useAuth} from "@/components/auth-provider";
import {Container} from "@/components/container";
import {useToast} from "@/components/toast-provider.tsx";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {useFindWorkByTabTitle} from "@/hooks/useFindWorkByTabTitle.ts";
import {hasExceededMaxFractionDigits} from "@/lib/utils";

const chapterNumberSchema = z.coerce
	.number({
		invalid_type_error: "Informe um número válido",
		required_error: "O capitulo/episodio é obrigatório",
	})
	.min(0, "O capitulo/episodio não pode ser menor que 0")
	.refine((value) => !hasExceededMaxFractionDigits(value, 2), {
		message: "O capitulo/episodio não pode ter mais de 2 casas decimais",
	});

const formSchema = z.object({
	workId: z.string(),
	chapter: chapterNumberSchema,
	imageUrl: z.string().optional().default("/okami.png"),
	hasNewChapter: z.boolean().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export function MarkWorkRead() {
	const { showToast } = useToast();

	const { isLoading } = useAuth();
	const { works: worksOnGoing, isLoading: isLoadingWorks } = useFetchWorksWithFilter();

	const { updateWorkChapter } = useUpdateWorkChapter();

	const { markWorkAsRead } = useMarkWorkAsRead();

	const workByTabTitle = useFindWorkByTabTitle(worksOnGoing);

	const {
		control,
		reset,
		watch,
		handleSubmit,
		formState: { isSubmitting, errors },
	} = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		values: {
			workId: workByTabTitle?.id ?? "",
			chapter: workByTabTitle?.nextChapter ?? workByTabTitle?.chapter ?? 0,
			imageUrl: workByTabTitle?.imageUrl ?? "",
			hasNewChapter: workByTabTitle?.hasNewChapter ?? false,
		},
	});

	async function onSubmit({ workId, chapter, hasNewChapter }: FormSchema) {
		try {
			if (hasNewChapter) {
				await markWorkAsRead({ workId, chapter });
			} else {
				await updateWorkChapter({ chapter, workId });
			}

			showToast("Obra atualizada com sucesso!", "success");
		} catch {
			showToast("Ocorreu um erro ao atualizar a obra", "error");
		}
	}

	const [imageUrl, hasNewChapter] = watch(["imageUrl", "hasNewChapter"]);

	const setCurrentWorkToFormState = useCallback(
		(work: WorkType) => {
			reset({
				workId: work?.id || "",
				chapter: work.nextChapter ?? work.chapter,
				imageUrl: work?.imageUrl || "",
				hasNewChapter: work?.hasNewChapter,
			});
		},
		[reset],
	);

	const buttonMessage = hasNewChapter ? "Marcar como lido" : "Atualizar capitulo";

	if (isLoading) {
		return <Container>Carregando...</Container>;
	}

	return (
		<Container>
			<div className="flex flex-col items-center justify-center gap-4 p-4">
				<picture>
					<img
						className="size-[200px] rounded-sm"
						alt={`work ${workByTabTitle?.name}`}
						src={imageUrl || "/okami.png"}
					/>
				</picture>

				<form className="flex w-[300px] flex-col gap-4 " onSubmit={handleSubmit(onSubmit)}>
					<Label>Obra</Label>
					<Controller
						control={control}
						name="workId"
						render={({ field }) => (
							<Select
								value={field.value}
								onValueChange={(id) => {
									const work = find(worksOnGoing, { id });
									if (work) {
										setCurrentWorkToFormState(work);
									}
								}}
							>
								<SelectTrigger
									className={clsx("w-full", {
										"animate-pulse": isLoadingWorks,
									})}
								>
									<SelectValue placeholder="Selecione a obra" />
								</SelectTrigger>

								<SelectContent>
									{worksOnGoing.map((work) => (
										<SelectItem key={work.id} value={work.id}>
											{work.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>

					<Label>Capitulo/Episodio</Label>

					<Controller
						render={({ field }) => (
							<>
								<Input {...field} disabled={isLoadingWorks} type="number" />
								{errors.chapter && (
									<span className="mt-1 text-red-600">{errors.chapter.message}</span>
								)}
							</>
						)}
						name="chapter"
						control={control}
					/>

					<Button type="submit" disabled={isSubmitting}>
						{buttonMessage}
					</Button>
				</form>
			</div>
		</Container>
	);
}
