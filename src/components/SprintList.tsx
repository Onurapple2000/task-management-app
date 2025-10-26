import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'
import { useSprints } from '../hooks/useSprints'
import { useTasks } from '../hooks/useTasks'
import type { Database } from '../config/supabase'

type Sprint = Database['public']['Tables']['sprints']['Row']

interface SprintListProps {
  sprints: Sprint[]
  loading: boolean
  selectedSprintId?: string | null
  onSprintSelect?: (sprintId: string | null) => void
}

const SprintList: React.FC<SprintListProps> = ({ sprints, loading, selectedSprintId, onSprintSelect }) => {
  const { addSprint, editSprint, removeSprint, error } = useSprints()
  const { tasks, loadTasks } = useTasks()
  const [newSprintName, setNewSprintName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null)
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null)
  const [editSprintName, setEditSprintName] = useState('')

  const handleAddSprint = async () => {
    if (!newSprintName.trim()) return

    try {
      setIsAdding(true)
      await addSprint({ name: newSprintName.trim() })
      setNewSprintName('')
    } catch (error) {
      console.error('Failed to add sprint:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleEditClick = (sprint: Sprint) => {
    setSprintToEdit(sprint)
    setEditSprintName(sprint.name)
    setEditDialogOpen(true)
  }

  const handleEditConfirm = async () => {
    if (!sprintToEdit || !editSprintName.trim()) return

    try {
      await editSprint(sprintToEdit.id, { name: editSprintName.trim() })
      setEditDialogOpen(false)
      setSprintToEdit(null)
      setEditSprintName('')
    } catch (error) {
      console.error('Failed to edit sprint:', error)
    }
  }

  const handleEditCancel = () => {
    setEditDialogOpen(false)
    setSprintToEdit(null)
    setEditSprintName('')
  }

  const handleDeleteClick = (sprint: Sprint) => {
    setSprintToDelete(sprint)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!sprintToDelete) return

    try {
      await removeSprint(sprintToDelete.id)
      setDeleteDialogOpen(false)
      setSprintToDelete(null)
      
      // Sprint silindikten sonra kalan sprint'lerden en üstteki seçili hale getir
      const remainingSprints = sprints.filter(s => s.id !== sprintToDelete.id)
      if (remainingSprints.length > 0) {
        const firstSprint = remainingSprints[0]
        onSprintSelect?.(firstSprint.id)
        // Seçili sprint değiştiği için task'ları yeniden yükle
        loadTasks(0, 5, firstSprint.id)
      } else {
        // Hiç sprint kalmadıysa seçimi temizle
        onSprintSelect?.(null)
        loadTasks(0, 5, null)
      }
    } catch (error) {
      console.error('Failed to delete sprint:', error)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSprintToDelete(null)
  }

  const getSprintTasks = (sprintId: string) => {
    return tasks.filter(task => task.sprint_id === sprintId)
  }

  return (
    <Paper sx={{ 
      p: 3,
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
      border: '1px solid rgba(255,255,255,0.2)',
      height: '100%', // Tam yükseklik
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden' // Ana scroll'u engelle
    }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{
          fontWeight: 'bold',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        🚀 Sprints
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Sprint name"
          value={newSprintName}
          onChange={(e) => setNewSprintName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddSprint()}
          disabled={isAdding}
          sx={{
            flexGrow: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleAddSprint}
          disabled={!newSprintName.trim() || isAdding}
          size="small"
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
            },
            minWidth: 80
          }}
        >
          {isAdding ? <CircularProgress size={20} color="inherit" /> : 'Add'}
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ 
          flex: 1, // Kalan alanı kapla
          overflow: 'auto', // İçerik scroll'u etkinleştir
          minHeight: 0 // Flexbox scroll için gerekli
        }}>
          <List>
              {sprints.map((sprint) => {
                const sprintTasks = getSprintTasks(sprint.id)
                const isSelected = selectedSprintId === sprint.id
                return (
                  <ListItem 
                    key={sprint.id} 
                    divider
                    onClick={() => onSprintSelect?.(isSelected ? null : sprint.id)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'primary.light' : 'transparent',
                      '&:hover': {
                        backgroundColor: isSelected ? 'primary.light' : 'action.hover',
                      },
                      borderRadius: 1,
                      mb: 0.5,
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: isSelected ? 'bold' : 'normal',
                              color: isSelected ? 'primary.contrastText' : 'text.primary'
                            }}
                          >
                            {sprint.name}
                          </Typography>
                          {isSelected && (
                            <Typography variant="caption" sx={{ color: 'primary.contrastText' }}>
                              ✓ Selected
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={`${new Date(sprint.created_at).toLocaleDateString()}${sprintTasks.length > 0 ? ` • ${sprintTasks.length} task(s)` : ''}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditClick(sprint)
                        }}
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(sprint)
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                )
              })}
          {sprints.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No sprints yet. Create your first sprint!
            </Typography>
          )}
          </List>
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        aria-labelledby="edit-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="edit-dialog-title">
          Edit Sprint
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Sprint Name"
            fullWidth
            variant="outlined"
            value={editSprintName}
            onChange={(e) => setEditSprintName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleEditConfirm()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleEditConfirm} 
            color="primary" 
            variant="contained"
            disabled={!editSprintName.trim()}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
            <DialogTitle id="delete-dialog-title">
              Sprint Sil
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-dialog-description">
                {sprintToDelete && getSprintTasks(sprintToDelete.id).length > 0 ? (
                  <>
                    Bu sprint'in {getSprintTasks(sprintToDelete.id).length} task'ı bulunmaktadır.
                    <br /><br />
                    Sprint "{sprintToDelete.name}"'i tüm task'larıyla birlikte silmek istediğinizden emin misiniz?
                    <br /><br />
                    <strong>Bu işlem geri alınamaz.</strong>
                  </>
                ) : (
                  `Sprint "${sprintToDelete?.name}"'i silmek istediğinizden emin misiniz?`
                )}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel} color="primary">
                İptal
              </Button>
              <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                Sil
              </Button>
            </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default SprintList


