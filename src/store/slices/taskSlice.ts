import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../config/supabase'
import type { Database } from '../../config/supabase'

// Task'ları parent-child ilişkisine göre organize et
const organizeTasks = (tasks: any[]) => {
  console.log('organizeTasks - input tasks:', tasks)
  const taskMap = new Map()
  const rootTasks: any[] = []
  const processedTasks = new Set() // İşlenmiş task'ları takip et
  
  // Tüm task'ları map'e ekle
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, children: [] })
  })
  
  // Parent-child ilişkilerini kur
  tasks.forEach(task => {
    console.log('Processing task:', task.id, 'parent_task_id:', task.parent_task_id)
    if (task.parent_task_id) {
      const parent = taskMap.get(task.parent_task_id)
      if (parent) {
        parent.children.push(taskMap.get(task.id))
        processedTasks.add(task.id) // Child olarak işlendi
        console.log('Added child to parent:', task.parent_task_id)
      } else {
        console.log('Parent not found:', task.parent_task_id)
        // Parent bulunamazsa root olarak ekle
        if (!processedTasks.has(task.id)) {
          rootTasks.push(taskMap.get(task.id))
          processedTasks.add(task.id)
        }
      }
    } else {
      // Root task
      if (!processedTasks.has(task.id)) {
        rootTasks.push(taskMap.get(task.id))
        processedTasks.add(task.id)
      }
    }
  })
  
  // Total estimated hours hesapla
  const calculateTotalEstimatedHours = (task: any): number => {
    if (!task.children || task.children.length === 0) {
      return task.estimated_hour || 0
    }
    
    const childrenTotal = task.children.reduce((sum: number, child: any) => {
      return sum + calculateTotalEstimatedHours(child)
    }, 0)
    
    return childrenTotal
  }
  
  // Her task için total_estimated_hour hesapla
  const addTotalEstimatedHours = (task: any) => {
    task.total_estimated_hour = calculateTotalEstimatedHours(task)
    
    if (task.children && task.children.length > 0) {
      task.children.forEach((child: any) => addTotalEstimatedHours(child))
    }
  }
  
  // Root task'lar için total_estimated_hour hesapla
  rootTasks.forEach(addTotalEstimatedHours)
  
  console.log('organizeTasks - processedTasks:', Array.from(processedTasks))
  console.log('organizeTasks - rootTasks count:', rootTasks.length)
  console.log('organizeTasks - result:', rootTasks)
  return rootTasks
}

type Task = Database['public']['Tables']['tasks']['Row'] & {
  assignee?: { name: string; surname: string } | null
  sprint?: { name: string } | null
  children?: Task[]
  total_estimated_hour?: number
}

interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
  hasMore: boolean
  currentPage: number
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 0,
}

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ page = 0, limit = 5, sprintId }: { page?: number; limit?: number; sprintId?: string | null } = {}) => {
    // İlk sayfa için daha büyük limit, sonraki sayfalar için 5
    const actualLimit = page === 0 ? limit : 5
    
    // İlk sayfa: 0'dan başla, sonraki sayfalar: önceki toplam + 5'er
    let from: number
    if (page === 0) {
      from = 0
    } else {
      // İlk sayfa limit'i + (sayfa-1) * 5
      from = limit + (page - 1) * 5
    }
    const to = from + actualLimit - 1

    let query = supabase
      .from('tasks')
      .select(`
        *,
        sprint:sprint_id (id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Sprint filtreleme ekle
    if (sprintId) {
      query = query.eq('sprint_id', sprintId)
    }

    // Pagination ekle
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    // Task'ları parent-child ilişkisine göre organize et
    const organizedTasks = organizeTasks(data || [])
    
    // Debug bilgisi
    console.log('fetchTasks - page:', page, 'limit:', limit, 'actualLimit:', actualLimit, 'count:', count, 'from:', from, 'to:', to)
    console.log('fetchTasks - hasMore calculation:', (count || 0), '>', to + 1, '=', (count || 0) > to + 1)
    console.log('fetchTasks - organizedTasks length:', organizedTasks.length)
    console.log('fetchTasks - data length:', data?.length)
    
    return {
      tasks: organizedTasks,
      hasMore: (count || 0) > to + 1,
      currentPage: page,
    }
  }
)

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Database['public']['Tables']['tasks']['Insert']) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select(`
        *,
        sprint:sprint_id (id, name)
      `)
      .single()

    if (error) throw error
    return data
  }
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }: { id: string; updates: Database['public']['Tables']['tasks']['Update'] }) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        sprint:sprint_id (id, name)
      `)
      .single()

    if (error) throw error
    return data
  }
)

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error
    return taskId
  }
)

export const fetchTaskChildren = createAsyncThunk(
  'tasks/fetchTaskChildren',
  async (parentId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        sprint:sprint_id (id, name)
      `)
      .eq('parent_task_id', parentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { parentId, children: data || [] }
  }
)

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload)
    },
    updateTaskInList: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = action.payload
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload)
    },
    addTaskChildren: (state, action: PayloadAction<{ parentId: string; children: Task[] }>) => {
      const parentIndex = state.tasks.findIndex(task => task.id === action.payload.parentId)
      if (parentIndex !== -1) {
        state.tasks[parentIndex].children = action.payload.children
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.currentPage === 0) {
          // İlk yükleme - tüm task'ları değiştir
          state.tasks = action.payload.tasks
        } else {
          // Load more - yeni task'ları ekle (duplicate kontrolü ile)
          const existingTaskIds = new Set(state.tasks.map(task => task.id))
          const newTasks = action.payload.tasks.filter(task => !existingTaskIds.has(task.id))
          
          console.log('Load more - existing tasks:', state.tasks.length)
          console.log('Load more - new tasks:', action.payload.tasks.length)
          console.log('Load more - filtered new tasks:', newTasks.length)
          
          state.tasks.push(...newTasks)
        }
        state.hasMore = action.payload.hasMore
        state.currentPage = action.payload.currentPage
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch tasks'
      })
      // Create Task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload)
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create task'
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update task'
      })
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload)
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete task'
      })
      // Fetch Task Children
      .addCase(fetchTaskChildren.fulfilled, (state, action) => {
        const parentIndex = state.tasks.findIndex(task => task.id === action.payload.parentId)
        if (parentIndex !== -1) {
          state.tasks[parentIndex].children = action.payload.children
        }
      })
  },
})

export const { clearError, addTask, updateTaskInList, removeTask, addTaskChildren } = taskSlice.actions
export default taskSlice.reducer
