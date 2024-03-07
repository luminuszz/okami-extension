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

export function MarkWorkRead() {
  return (
    <main className="m-auto mt-4 flex  w-[400px] items-center justify-center">
      <div className=" flex  flex-col items-center justify-center gap-4 p-4">
        <picture>
          <img
            className="size-[200px] rounded-sm"
            alt="image"
            src="https://pub-d20dc7998c32429b955ad704e864815b.r2.dev/work-images/651b0aa5c68658ee975a02ab-c1d11b16-84f5-4d80-9c86-0565668ae997.png"
          />
        </picture>

        <form className="flex flex-col gap-4">
          <Label>Obra</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a obra" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="id1">Obra 1</SelectItem>
            </SelectContent>
          </Select>

          <Label>Capitulo/Episodio</Label>
          <Input type="number" placeholder="0" />

          <Button>Marcar como lido</Button>
        </form>
      </div>
    </main>
  )
}
