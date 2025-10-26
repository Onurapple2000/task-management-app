import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useAuth } from '../hooks/useAuth'

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
})

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, loading, error, needsEmailConfirmation } = useAuth()
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      setLoginError(null)
      const result = await login(values.email, values.password)
      
      if (result.type.endsWith('/fulfilled')) {
        navigate('/dashboard')
      } else {
        setLoginError('Invalid email or password')
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 1, sm: 2, md: 3 },
        boxSizing: 'border-box',
      }}
    >
      <Container 
        component="main" 
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: { xs: 3, sm: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Sign In
          </Typography>
          
          {(error || loginError) && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error || loginError}
            </Alert>
          )}

          {needsEmailConfirmation && (
            <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
              Please check your email and confirm your account before signing in.
            </Alert>
          )}

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form style={{ width: '100%' }}>
                <Field
                  as={TextField}
                  name="email"
                  label="Email Address"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
                <Field
                  as={TextField}
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting || loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
                <Box textAlign="center">
                  <Link component={RouterLink} to="/register" variant="body2">
                    Don't have an account? Sign Up
                  </Link>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login

