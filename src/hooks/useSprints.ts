import { useSelector } from 'react-redux'
import { useCallback } from 'react'
import { useAppDispatch } from '../store/index'
import { fetchSprints, createSprint, updateSprint, deleteSprint } from '../store/slices/sprintSlice'
import type { RootState } from '../store'
import type { Database } from '../config/supabase'

export const useSprints = () => {
  const dispatch = useAppDispatch()
  const { sprints, loading, error } = useSelector((state: RootState) => state.sprints)

  const loadSprints = useCallback(() => {
    return dispatch(fetchSprints())
  }, [dispatch])

  const addSprint = useCallback((sprintData: Database['public']['Tables']['sprints']['Insert']) => {
    return dispatch(createSprint(sprintData))
  }, [dispatch])

  const editSprint = useCallback((id: string, updates: Database['public']['Tables']['sprints']['Update']) => {
    return dispatch(updateSprint({ id, updates }))
  }, [dispatch])

  const removeSprint = useCallback((sprintId: string) => {
    return dispatch(deleteSprint(sprintId))
  }, [dispatch])

  return {
    sprints,
    loading,
    error,
    loadSprints,
    addSprint,
    editSprint,
    removeSprint,
  }
}
