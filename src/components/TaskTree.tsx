import React, { useState } from 'react'
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view'
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useTasks } from '../hooks/useTasks'
import TaskForm from './TaskForm'
import type { Database } from '../config/supabase'

type Task = Database['public']['Tables']['tasks']['Row'] & {
  assignee?: { name: string; surname: string } | null
  sprint?: { name: string } | null
  children?: Task[]
  total_estimated_hour?: number
}

interface TaskTreeProps {
  tasks: Task[]
  loading: boolean
  onLoadMore: () => void
  hasMore: boolean
  selectedSprintId?: string | null
  initialTaskCount?: number
}

const TaskTree: React.FC<TaskTreeProps> = ({ tasks, loading, onLoadMore, hasMore, selectedSprintId = null, initialTaskCount }) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number
    mouseY: number
    taskId: string | null
  } | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showSprintWarning, setShowSprintWarning] = useState(false)
  const { removeTask, loadTasks } = useTasks()
  
  // TaskTree yüksekliğini hesapla
  const calculateInitialTaskCount = () => {
    // TaskTree container yüksekliği yaklaşık 600px
    // Header: padding(16px) + content(48px) + border(1px) = 65px
    // SimpleTreeView padding: 16px (top/bottom) = 32px
    // Task item: padding(8px) + content(48px) + margin(8px) = 64px
    // Load More button ilk yüklemede görünmez, hesaba katmıyoruz
    const containerHeight = 600
    const headerHeight = 65
    const treeViewPadding = 32
    const taskItemHeight = 64
    const safetyMargin = 20 // Güvenlik marjı
    
    const availableHeight = containerHeight - headerHeight - treeViewPadding - safetyMargin
    const taskCount = Math.floor(availableHeight / taskItemHeight)
    
    console.log('TaskTree - containerHeight:', containerHeight)
    console.log('TaskTree - headerHeight:', headerHeight)
    console.log('TaskTree - treeViewPadding:', treeViewPadding)
    console.log('TaskTree - safetyMargin:', safetyMargin)
    console.log('TaskTree - availableHeight:', availableHeight)
    console.log('TaskTree - taskItemHeight:', taskItemHeight)
    console.log('TaskTree - calculated task count:', taskCount)
    
    return Math.max(5, taskCount) // En az 5 task
  }
  
  // İlk yükleme için task sayısını hesapla
  const getInitialTaskCount = () => {
    if (initialTaskCount) {
      return initialTaskCount
    }
    return calculateInitialTaskCount()
  }

  console.log('TaskTree - selectedSprintId:', selectedSprintId)
  console.log('TaskTree - showSprintWarning:', showSprintWarning)
  console.log('TaskTree - tasks:', tasks)
  console.log('TaskTree - tasks with children:', tasks.filter(t => t.children && t.children.length > 0))
  console.log('TaskTree - hasMore:', hasMore)
  console.log('TaskTree - loading:', loading)
  
  // Task ID'lerini kontrol et
  const allTaskIds = new Set()
  const getAllTaskIds = (taskList: Task[]) => {
    taskList.forEach(task => {
      if (allTaskIds.has(task.id)) {
        console.error('Duplicate task ID found:', task.id)
      }
      allTaskIds.add(task.id)
      if (task.children && task.children.length > 0) {
        getAllTaskIds(task.children)
      }
    })
  }
  getAllTaskIds(tasks)
  console.log('TaskTree - unique task IDs:', Array.from(allTaskIds))

  const handleAddTaskClick = () => {
    console.log('handleAddTaskClick called, selectedSprintId:', selectedSprintId)
    if (!selectedSprintId) {
      console.log('No sprint selected, showing warning')
      setShowSprintWarning(true)
      return
    }
    console.log('Sprint selected, opening dialog')
    setAddDialogOpen(true)
  }

  const handleContextMenu = (event: React.MouseEvent, taskId: string) => {
    event.preventDefault()
    // Tüm task'ları (parent ve child) içeren flat array oluştur
    const getAllTasks = (taskList: Task[]): Task[] => {
      const allTasks: Task[] = []
      taskList.forEach(task => {
        allTasks.push(task)
        if (task.children && task.children.length > 0) {
          allTasks.push(...getAllTasks(task.children))
        }
      })
      return allTasks
    }
    
    const allTasks = getAllTasks(tasks)
    const task = allTasks.find(t => t.id === taskId)
    if (task) {
      setSelectedTask(task)
    }
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      taskId,
    })
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  const handleEdit = (task: Task) => {
    setSelectedTask(task)
    setEditDialogOpen(true)
    handleCloseContextMenu()
  }

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await removeTask(taskId)
        // Task silindikten sonra listeyi yenile
        await loadTasks(0, getInitialTaskCount(), selectedSprintId)
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
    handleCloseContextMenu()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'default'
      case 'Working':
        return 'warning'
      case 'Completed':
        return 'success'
      default:
        return 'default'
    }
  }

  const renderTaskItem = (task: Task, level: number = 0) => {
    const hasChildren = task.children && task.children.length > 0
    const estimatedHours = hasChildren ? task.total_estimated_hour : task.estimated_hour
    const isParent = hasChildren
    
    // Debug bilgisi
    console.log('Task:', task.subject, 'hasChildren:', hasChildren, 'estimatedHours:', estimatedHours, 'total_estimated_hour:', task.total_estimated_hour)

    return (
      <TreeItem
        key={task.id}
        itemId={task.id}
        label={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1,
              pl: level * 2,
              backgroundColor: isParent ? 'action.hover' : 'transparent',
              borderRadius: 1,
              border: isParent ? '1px solid' : 'none',
              borderColor: 'primary.main',
            }}
            onContextMenu={(e) => handleContextMenu(e, task.id)}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                flexGrow: 1,
                fontWeight: isParent ? 'bold' : 'normal',
                color: isParent ? 'primary.main' : 'text.primary'
              }}
            >
              {task.subject}
              {isParent && (
                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                  ({task.children?.length} child{task.children?.length !== 1 ? 'ren' : ''})
                </Typography>
              )}
            </Typography>
            <Chip
              label={task.status}
              size="small"
              color={getStatusColor(task.status) as any}
              variant={isParent ? 'filled' : 'outlined'}
            />
            <Typography variant="caption" color="text.secondary">
              {estimatedHours}h
            </Typography>
            {task.sprint && (
              <Chip
                label={task.sprint.name}
                size="small"
                variant="outlined"
                color="secondary"
              />
            )}
            {task.assignee && (
              <Typography variant="caption" color="text.secondary">
                👤 {task.assignee.name} {task.assignee.surname}
              </Typography>
            )}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleContextMenu(e, task.id)
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        {hasChildren && task.children?.map((child) => renderTaskItem(child, level + 1))}
      </TreeItem>
    )
  }

  if (loading && tasks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (tasks.length === 0) {
    return (
      <Box>
        <Paper sx={{
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden'
        }}>
          <Box sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flex: 1,
              minWidth: 'fit-content'
            }}>
              📋 Task Tree
            </Typography>
            <IconButton
              onClick={handleAddTaskClick}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                  transform: 'scale(1.1)',
                },
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                ml: 1
              }}
              title="Add Task"
            >
              <AddIcon />
            </IconButton>
          </Box>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No tasks found. Create your first task to get started.
            </Typography>
          </Box>
        </Paper>

        {/* Sprint Warning Dialog */}
        <Dialog
          open={showSprintWarning}
          onClose={() => setShowSprintWarning(false)}
          aria-labelledby="sprint-warning-title"
        >
          <DialogTitle id="sprint-warning-title">
            ⚠️ Sprint Seçimi Gerekli
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Task eklemek için önce bir sprint seçmeniz gerekiyor.
              <br /><br />
              Lütfen Sprint List'ten bir sprint seçin.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSprintWarning(false)} color="primary">
              Tamam
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Task Dialog */}
        {addDialogOpen && (
          <TaskForm
            onClose={async () => {
              setAddDialogOpen(false)
              // Task eklendikten sonra listeyi yenile
              await loadTasks(0, getInitialTaskCount(), selectedSprintId)
            }}
            selectedSprintId={selectedSprintId}
          />
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        border: '1px solid rgba(255,255,255,0.2)',
        overflow: 'hidden',
        height: '100%', // Tam yükseklik
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            flex: 1,
            minWidth: 'fit-content'
          }}>
            📋 Task Tree
          </Typography>
          <IconButton
            onClick={handleAddTaskClick}
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.3)',
                transform: 'scale(1.1)',
              },
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              ml: 1
            }}
            title="Add Task"
          >
            <AddIcon />
          </IconButton>
        </Box>
        <Box sx={{ 
          flex: 1, // Kalan alanı kapla
          overflow: 'auto', // İçerik scroll'u etkinleştir
          minHeight: 0 // Flexbox scroll için gerekli
        }}>
          <SimpleTreeView
            sx={{
              flexGrow: 1,
              maxWidth: '100%',
              p: 2,
              '& .MuiTreeItem-content': {
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                  transform: 'translateX(4px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }
            }}
          >
            {tasks.map((task) => renderTaskItem(task))}
          </SimpleTreeView>
        </Box>
      </Paper>

      {hasMore && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            variant="outlined"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Load More Tasks'}
          </Button>
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => selectedTask && handleEdit(selectedTask)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => contextMenu?.taskId && handleDelete(contextMenu.taskId)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>


      {/* Sprint Warning Dialog */}
      <Dialog
        open={showSprintWarning}
        onClose={() => setShowSprintWarning(false)}
        aria-labelledby="sprint-warning-title"
      >
        <DialogTitle id="sprint-warning-title">
          ⚠️ Sprint Seçimi Gerekli
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Task eklemek için önce bir sprint seçmeniz gerekiyor.
            <br /><br />
            Lütfen Sprint List'ten bir sprint seçin.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSprintWarning(false)} color="primary">
            Tamam
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Task Dialog */}
      {addDialogOpen && (
        <TaskForm
          onClose={async () => {
            setAddDialogOpen(false)
            // Task eklendikten sonra listeyi yenile
            await loadTasks(0, getInitialTaskCount(), selectedSprintId)
          }}
          selectedSprintId={selectedSprintId}
        />
      )}

      {/* Edit Dialog */}
      {editDialogOpen && selectedTask && (
        <TaskForm
          task={selectedTask}
          onClose={async () => {
            setEditDialogOpen(false)
            // Edit tamamlandıktan sonra listeyi yenile
            await loadTasks(0, getInitialTaskCount(), selectedSprintId)
          }}
          isEdit
        />
      )}
    </Box>
  )
}

export default TaskTree
