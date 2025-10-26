import React, { useEffect, useState } from 'react'
import { Box, Typography, Fab } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { useTasks } from '../hooks/useTasks'
import { useSprints } from '../hooks/useSprints'
import SprintList from '../components/SprintList'
import TaskTree from '../components/TaskTree'
import TaskForm from '../components/TaskForm'

const Dashboard: React.FC = () => {
  const { tasks, loading: tasksLoading, hasMore, loadTasks, loadMoreTasks } = useTasks()
  const { sprints, loading: sprintsLoading, loadSprints } = useSprints()
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)

  console.log('Dashboard - selectedSprintId:', selectedSprintId)


  useEffect(() => {
    console.log('Dashboard useEffect - loading tasks for sprint:', selectedSprintId)
    loadTasks(0, 7, selectedSprintId) // İlk yüklemede 7 task yükle (ekrana sığan kadar)
    loadSprints()
  }, [loadTasks, loadSprints, selectedSprintId]) // Sprint seçimi değiştiğinde task'ları yeniden yükle

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%', // Sayfa yüksekliğinin %90'ı
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
      px: { xs: 2, sm: 3, md: 4 },
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overflow: 'hidden' // Ana scroll'u engelle
    }}>
      <Box sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        p: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '1400px',
        height: '100%', // İçerik box'ının tam yükseklik
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' // İçerik scroll'u engelle
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold', 
            mb: 4,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
          }}
        >
          Task Management Dashboard
        </Typography>
      
        <Box sx={{ 
          display: 'flex', 
          gap: 4, 
          pb: 4,
          flexWrap: 'wrap',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'flex-start',
          flex: 1, // Kalan alanı kapla
          overflow: 'hidden' // Ana container scroll'u engelle
        }}>
          <Box sx={{ 
            flex: '0 1 400px',
            minWidth: '300px',
            width: '100%',
            maxWidth: '400px',
            height: '100%', // Tam yükseklik
            display: 'flex',
            flexDirection: 'column'
          }}>
            <SprintList 
              sprints={sprints} 
              loading={sprintsLoading}
              selectedSprintId={selectedSprintId}
              onSprintSelect={setSelectedSprintId}
            />
          </Box>
          <Box sx={{ 
            flex: '0 1 800px',
            minWidth: '600px',
            width: '100%',
            maxWidth: '800px',
            height: '100%', // Tam yükseklik
            display: 'flex',
            flexDirection: 'column'
          }}>
            <TaskTree 
              tasks={tasks} 
              loading={tasksLoading} 
              onLoadMore={() => loadMoreTasks(selectedSprintId)}
              hasMore={hasMore}
              selectedSprintId={selectedSprintId}
              initialTaskCount={7}
            />
          </Box>
        </Box>
      </Box>

      {/* Floating Action Button for Add Task */}
     {/*  <Fab
        color="primary"
        aria-label="add task"
        onClick={() => setTaskFormOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease-in-out',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
        }}
      >
        <AddIcon />
      </Fab> */}

      {/* Task Form Dialog */}
      {taskFormOpen && (
        <TaskForm
          onClose={() => setTaskFormOpen(false)}
          selectedSprintId={selectedSprintId}
        />
      )}
    </Box>
  )
}

export default Dashboard
