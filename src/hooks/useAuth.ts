import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../store/index'
import { supabase } from '../config/supabase'
import { signIn, signUp, signOut, setUser } from '../store/slices/authSlice'
import type { RootState } from '../store'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, loading, error, needsEmailConfirmation } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        dispatch(setUser(session.user))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          dispatch(setUser(session.user))
        } else if (event === 'SIGNED_OUT') {
          dispatch(setUser(null))
          navigate('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [dispatch, navigate])

  const login = async (email: string, password: string) => {
    return dispatch(signIn({ email, password }))
  }

  const register = async (email: string, password: string, name: string, surname: string) => {
    return dispatch(signUp({ email, password, name, surname }))
  }

  const logout = async () => {
    return dispatch(signOut())
  }

  return {
    user,
    loading,
    error,
    needsEmailConfirmation,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }
}
