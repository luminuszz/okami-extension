import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
    },
    mutations: {
      retry: 3,
    },
  },
})
