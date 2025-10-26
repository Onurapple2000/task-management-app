import { useSelector } from 'react-redux'
import { useCallback } from 'react'
import { useAppDispatch } from '../store/index'
import { fetchTasks, createTask, updateTask, deleteTask, fetchTaskChildren } from '../store/slices/taskSlice'
import type { RootState } from '../store'
import type { Database } from '../config/supabase'

export const useTasks = () => {
  const dispatch = useAppDispatch()
  const { tasks, loading, error, hasMore, currentPage } = useSelector((state: RootState) => state.tasks)
  
  // Debug bilgisi
  console.log('useTasks - hasMore:', hasMore, 'currentPage:', currentPage, 'loading:', loading, 'tasks.length:', tasks.length)

  const loadTasks = useCallback((page = 0, limit = 5, sprintId?: string | null) => {
    return dispatch(fetchTasks({ page, limit, sprintId }))
  }, [dispatch])

  const loadMoreTasks = useCallback((sprintId?: string | null) => {
    if (hasMore && !loading) {
      return dispatch(fetchTasks({ page: currentPage + 1, limit: 5, sprintId })) // Sonraki yüklemelerde 5'er 5'er
    }
  }, [dispatch, hasMore, loading, currentPage])

  const addTask = useCallback((taskData: Database['public']['Tables']['tasks']['Insert']) => {
    return dispatch(createTask(taskData))
  }, [dispatch])

  const editTask = useCallback((id: string, updates: Database['public']['Tables']['tasks']['Update']) => {
    return dispatch(updateTask({ id, updates }))
  }, [dispatch])

  const removeTask = useCallback((taskId: string) => {
    return dispatch(deleteTask(taskId))
  }, [dispatch])

  const loadTaskChildren = useCallback((parentId: string) => {
    return dispatch(fetchTaskChildren(parentId))
  }, [dispatch])

  return {
    tasks,
    loading,
    error,
    hasMore,
    loadTasks,
    loadMoreTasks,
    addTask,
    editTask,
    removeTask,
    loadTaskChildren,
  }
}
