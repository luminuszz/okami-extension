import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister'
import {QueryClient} from '@tanstack/react-query'

export const queryClientPersister = createAsyncStoragePersister({
  storage: window.localStorage,
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5000, // 5 seconds
    },
    mutations: {
      retry: 3,
    },
  },
})
