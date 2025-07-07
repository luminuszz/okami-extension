import * as numberInput from '@zag-js/number-input'
import { normalizeProps, useMachine } from '@zag-js/react'
import { useEffect } from 'react'

import { Input } from '@/components/ui/input.tsx'

export type NumberInputProps = {
  value?: number
  onChange: (value: number) => void
  min?: number
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
}

export function NumberInput({
  onChange,
  min,
  value,
  onBlur,
  disabled,
  placeholder,
}: NumberInputProps) {
  const [state, setState] = useMachine(
    numberInput.machine({
      onValueChange: ({ valueAsNumber }) => onChange(valueAsNumber),
      min: min ?? 0,
      id: NumberInput.name,
      inputMode: 'decimal',
      formatOptions: {
        maximumFractionDigits: 2,
        style: 'decimal',
      },
      disabled,
    }),
  )

  const api = numberInput.connect(state, setState, normalizeProps)

  useEffect(() => {
    if (value) {
      api.setValue(value ?? 0)
    }
  }, [api, value])

  return (
    <Input
      {...api.getInputProps()}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}
