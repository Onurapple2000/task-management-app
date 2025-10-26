import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material'
import { useAuth } from '../hooks/useAuth'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <AppBar 
        position="static" 
        sx={{ 
          width: '100%',
          flexShrink: 0
        }}
      >
        <Toolbar sx={{ width: '100%' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Management
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.user_metadata?.name || user?.email}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ 
        flexGrow: 1, 
        width: '100%',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center'
      }}>
        {children}
      </Box>
    </Box>
  )
}

export default Layout


