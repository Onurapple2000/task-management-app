import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../config/supabase'
import type { Database } from '../../config/supabase'

type Sprint = Database['public']['Tables']['sprints']['Row']

interface SprintState {
  sprints: Sprint[]
  loading: boolean
  error: string | null
}

const initialState: SprintState = {
  sprints: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchSprints = createAsyncThunk('sprints/fetchSprints', async () => {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
})

export const createSprint = createAsyncThunk(
  'sprints/createSprint',
  async (sprintData: Database['public']['Tables']['sprints']['Insert']) => {
    const { data, error } = await supabase
      .from('sprints')
      .insert(sprintData)
      .select()
      .single()

    if (error) throw error
    return data
  }
)

export const updateSprint = createAsyncThunk(
  'sprints/updateSprint',
  async ({ id, updates }: { id: string; updates: Database['public']['Tables']['sprints']['Update'] }) => {
    const { data, error } = await supabase
      .from('sprints')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
)

export const deleteSprint = createAsyncThunk(
  'sprints/deleteSprint',
  async (sprintId: string) => {
    // First delete all tasks associated with this sprint
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('sprint_id', sprintId)

    if (tasksError) throw tasksError

    // Then delete the sprint
    const { error } = await supabase
      .from('sprints')
      .delete()
      .eq('id', sprintId)

    if (error) throw error
    return sprintId
  }
)

const sprintSlice = createSlice({
  name: 'sprints',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addSprint: (state, action: PayloadAction<Sprint>) => {
      state.sprints.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sprints
      .addCase(fetchSprints.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSprints.fulfilled, (state, action) => {
        state.loading = false
        state.sprints = action.payload
      })
      .addCase(fetchSprints.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch sprints'
      })
      // Create Sprint
      .addCase(createSprint.fulfilled, (state, action) => {
        state.sprints.unshift(action.payload)
      })
      .addCase(createSprint.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create sprint'
      })
      // Update Sprint
      .addCase(updateSprint.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSprint.fulfilled, (state, action) => {
        state.loading = false
        const index = state.sprints.findIndex(sprint => sprint.id === action.payload.id)
        if (index !== -1) {
          state.sprints[index] = action.payload
        }
      })
      .addCase(updateSprint.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update sprint'
      })
      // Delete Sprint
      .addCase(deleteSprint.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSprint.fulfilled, (state, action) => {
        state.loading = false
        state.sprints = state.sprints.filter(sprint => sprint.id !== action.payload)
      })
      .addCase(deleteSprint.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete sprint'
      })
  },
})

export const { clearError, addSprint } = sprintSlice.actions
export default sprintSlice.reducer
