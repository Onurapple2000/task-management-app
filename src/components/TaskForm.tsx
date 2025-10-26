import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
} from '@mui/material'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useTasks } from '../hooks/useTasks'
import { useSprints } from '../hooks/useSprints'
import type { Database } from '../config/supabase'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

interface TaskFormProps {
  task?: Task
  onClose: () => void
  isEdit?: boolean
  selectedSprintId?: string | null
}

const validationSchema = Yup.object({
  subject: Yup.string().required('Subject is required'),
  description: Yup.string(),
  status: Yup.string().oneOf(['Open', 'Working', 'Completed']).required('Status is required'),
  estimated_hour: Yup.number().min(0, 'Estimated hours must be positive').required('Estimated hours is required'),
  sprint_id: Yup.string().uuid('Invalid sprint ID'),
  assignee_id: Yup.string(),
})

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose, isEdit = false, selectedSprintId = null }) => {
  const { addTask, editTask, tasks } = useTasks()
  const { sprints, loading: sprintsLoading } = useSprints()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parentTasks, setParentTasks] = useState<Task[]>([])
  
  // Dummy users for assignee dropdown
  const dummyUsers = [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'John', surname: 'Doe', email: 'john.doe@example.com' },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Jane', surname: 'Smith', email: 'jane.smith@example.com' }
  ]

  const initialValues = {
    subject: task?.subject || '',
    description: task?.description || '',
    status: task?.status || 'Open',
    estimated_hour: task?.estimated_hour || 0,
    sprint_id: task?.sprint_id || selectedSprintId || '',
    assignee_id: '', // Always empty since we use assignees array
    parent_task_id: task?.parent_task_id || '',
  }

  console.log('TaskForm - selectedSprintId:', selectedSprintId)
  console.log('TaskForm - initialValues.sprint_id:', initialValues.sprint_id)



  useEffect(() => {
    // Filter out tasks that already have children (to prevent child of child)
    const availableParents = tasks.filter(t => !t.parent_task_id)
    setParentTasks(availableParents)
  }, [tasks])


  const handleSubmit = async (values: any) => {
    console.log('handleSubmit called with values:', values)
    try {
      setLoading(true)
      setError(null)

      const taskData = {
        subject: values.subject,
        description: values.description || '',
        status: values.status,
        estimated_hour: Math.max(1, Number(values.estimated_hour)), // En az 1 yapalım
        sprint_id: values.sprint_id || null,
        parent_task_id: values.parent_task_id || null,
        assignees: values.assignee_id ? [values.assignee_id] : [], // assignees array olarak
      }

      console.log('Task data to be sent:', taskData)
      console.log('Available sprints:', sprints)

      if (isEdit && task) {
        await editTask(task.id, taskData as TaskUpdate)
      } else {
        await addTask(taskData as TaskInsert)
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Task' : 'Create Task'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {selectedSprintId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Pre-selected Sprint:</strong> {sprints.find(s => s.id === selectedSprintId)?.name || 'Unknown Sprint'}
            </Typography>
          </Alert>
        )}
        

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ errors, touched, isValid, dirty }) => {
            console.log('Formik render - errors:', errors)
            console.log('Formik render - touched:', touched)
            console.log('Formik render - isValid:', isValid)
            console.log('Formik render - dirty:', dirty)
            return (
            <Form>
              <Field
                as={TextField}
                name="subject"
                label="Subject"
                fullWidth
                margin="normal"
                error={touched.subject && Boolean(errors.subject)}
                helperText={touched.subject && errors.subject}
              />
              <Field
                as={TextField}
                name="description"
                label="Description"
                multiline
                rows={3}
                fullWidth
                margin="normal"
              />
              <Field
                as={TextField}
                name="status"
                label="Status"
                select
                fullWidth
                margin="normal"
                error={touched.status && Boolean(errors.status)}
                helperText={touched.status && errors.status}
              >
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Working">Working</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Field>
              <Field
                as={TextField}
                name="estimated_hour"
                label="Estimated Hours"
                type="number"
                fullWidth
                margin="normal"
                error={touched.estimated_hour && Boolean(errors.estimated_hour)}
                helperText={touched.estimated_hour && errors.estimated_hour}
              />
              <Field
                as={TextField}
                name="sprint_id"
                label="Sprint"
                select
                fullWidth
                margin="normal"
                disabled={sprintsLoading}
                helperText={selectedSprintId ? "Pre-selected from dashboard" : ""}
              >
                <MenuItem value="">Select Sprint</MenuItem>
                {sprints.map((sprint) => (
                  <MenuItem key={sprint.id} value={sprint.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>{sprint.name}</Typography>
                      {selectedSprintId === sprint.id && (
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                          ✓ Selected
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Field>
              <Field
                as={TextField}
                name="assignee_id"
                label="Assignee"
                select
                fullWidth
                margin="normal"
                helperText="Select a team member to assign this task"
              >
                <MenuItem value="">Select Assignee</MenuItem>
                {dummyUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        👤 {user.name} {user.surname}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Field>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Parent Task</InputLabel>
                <Field
                  as={Select}
                  name="parent_task_id"
                  label="Parent Task"
                >
                  <MenuItem value="">No Parent Task</MenuItem>
                  {parentTasks.map((parentTask) => (
                    <MenuItem key={parentTask.id} value={parentTask.id}>
                      {parentTask.subject}
                    </MenuItem>
                  ))}
                </Field>
              </FormControl>
              
                  {task?.parent_task_id && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                      <Typography variant="body2" color="info.contrastText">
                        <strong>Note:</strong> This task is a child task. Changing the parent will affect the task hierarchy.
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      onClick={() => console.log('Create button clicked')}
                    >
                      {loading ? <CircularProgress size={24} /> : (isEdit ? 'Update' : 'Create')}
                    </Button>
                  </Box>
                </Form>
              )
            }}
            </Formik>
          </DialogContent>
    </Dialog>
  )
}

export default TaskForm
