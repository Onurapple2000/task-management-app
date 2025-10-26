import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 2
      },
    },
  },
})

// Query Keys for consistent caching
export const queryKeys = {
  tasks: ['tasks'] as const,
  sprints: ['sprints'] as const,
  task: (id: string) => ['tasks', id] as const,
  sprint: (id: string) => ['sprints', id] as const,
  tasksBySprint: (sprintId: string) => ['tasks', 'sprint', sprintId] as const,
  tasksByParent: (parentId: string) => ['tasks', 'parent', parentId] as const,
}


