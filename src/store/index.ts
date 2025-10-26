import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import authSlice from './slices/authSlice'
import taskSlice from './slices/taskSlice'
import sprintSlice from './slices/sprintSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    tasks: taskSlice,
    sprints: sprintSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
