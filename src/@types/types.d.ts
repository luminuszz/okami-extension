declare module 'fast-levenshtein' {
  export type Config = {
    useCollator: boolean
  }

  export type Levenshtein = {
    get: (stringRef: string, stringToValue: string, config?: Config) => number
  }

  declare const levenshtein: Levenshtein

  export default levenshtein
}
