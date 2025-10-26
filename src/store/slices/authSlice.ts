import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../config/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  needsEmailConfirmation: boolean
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  needsEmailConfirmation: false,
}

// Async thunks
export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name, surname }: { email: string; password: string; name: string; surname: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          surname,
        },
      },
    })
    if (error) throw error
    return data
  }
)

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }
)

export const signOut = createAsyncThunk('auth/signOut', async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
})

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        // Check if email confirmation is needed
        state.needsEmailConfirmation = !action.payload.user?.email_confirmed_at
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Sign up failed'
      })
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false
        const errorMessage = action.error.message || 'Sign in failed'
        
        // Check if it's an email confirmation error
        if (errorMessage.includes('email not confirmed') || errorMessage.includes('Email not confirmed')) {
          state.error = 'Please check your email and confirm your account before signing in.'
          state.needsEmailConfirmation = true
        } else {
          state.error = errorMessage
        }
      })
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null
        state.error = null
      })
      // Get Current User
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
