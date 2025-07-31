import {Button} from '@/components/ui/button.tsx'
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from '@/components/ui/command'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {cn} from '@/lib/utils.ts'
import {find} from 'lodash'
import {Check, ChevronDown, ChevronUp} from 'lucide-react'
import {useState} from 'react'

export interface WorkSelect {
  value: string
  onSelected: (value: string) => void
  works: { label: string; id: string }[]
}

export function WorkSelect({ works, onSelected, value }: WorkSelect) {
  const [open, setOpen] = useState(false)

  function handleSelected(currentValue: string) {
    const work = find(works, { label: currentValue })

    if (work) {
      onSelected(work.id)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between">
          {value ? works.find((work) => work.id === value)?.label : 'Pesquise a obra...'}
          {open ? <ChevronUp className="opacity-50" /> : <ChevronDown className="opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command
          filter={(value, search) => {
            return value.toLowerCase().trim().normalize('NFD').includes(search.toLowerCase()) ? 1 : 0
          }}
        >
          <CommandInput placeholder="Pesquise a obra..." className="h-9" />
          <CommandList className="max-h-[200px] max-w-[380px] overflow-y-auto">
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {works.map((work) => (
                <CommandItem key={work.id} value={work.label} onSelect={handleSelected}>
                  {work.label}
                  <Check className={cn('ml-auto', value === work.id ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
