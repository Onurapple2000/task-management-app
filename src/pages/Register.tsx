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
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  surname: Yup.string()
    .min(2, 'Surname must be at least 2 characters')
    .required('Surname is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
})

const Register: React.FC = () => {
  const navigate = useNavigate()
  const { register, loading, error, needsEmailConfirmation } = useAuth()
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false)

  const handleSubmit = async (values: {
    name: string
    surname: string
    email: string
    password: string
  }) => {
    try {
      setRegisterError(null)
      setShowConfirmationMessage(false)
      const result = await register(values.email, values.password, values.name, values.surname)
      
      if (result.type.endsWith('/fulfilled')) {
        if (needsEmailConfirmation) {
          setShowConfirmationMessage(true)
        } else {
          navigate('/dashboard')
        }
      } else {
        setRegisterError('Registration failed. Please try again.')
      }
    } catch (error) {
      setRegisterError('Registration failed. Please try again.')
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Sign Up
          </Typography>
          
          {(error || registerError) && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error || registerError}
            </Alert>
          )}

          {showConfirmationMessage && (
            <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
              Please check your email and click the confirmation link to activate your account. 
              You can then sign in with your credentials.
            </Alert>
          )}

          <Formik
            initialValues={{
              name: '',
              surname: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form style={{ width: '100%' }}>
                <Field
                  as={TextField}
                  name="name"
                  label="Name"
                  fullWidth
                  margin="normal"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
                <Field
                  as={TextField}
                  name="surname"
                  label="Surname"
                  fullWidth
                  margin="normal"
                  error={touched.surname && Boolean(errors.surname)}
                  helperText={touched.surname && errors.surname}
                />
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
                <Field
                  as={TextField}
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting || loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                </Button>
                <Box textAlign="center">
                  <Link component={RouterLink} to="/login" variant="body2">
                    Already have an account? Sign In
                  </Link>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  )
}

export default Register


