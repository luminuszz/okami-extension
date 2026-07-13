import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister'
import {QueryClient} from '@tanstack/react-query'
import {AxiosError} from 'axios'

export const queryClientPersister = createAsyncStoragePersister({
  storage: window.localStorage,
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // never retry 4xx: an expired token would re-enter the refresh flow once
      // per attempt, and a 403 is not going to become a 200
      retry: (failureCount, error) => {
        const status = (error as AxiosError).response?.status

        if (status && status >= 400 && status < 500) return false

        return failureCount < 3
      },
      staleTime: 5000, // 5 seconds
    },
    mutations: {
      // mutations are not idempotent: retrying update-chapter re-sends the write
      retry: 0,
    },
  },
})
