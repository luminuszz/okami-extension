import {QueryClient} from '@tanstack/react-query'

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
