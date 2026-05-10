import { useState } from 'react'
import { Code, Plus, Trash2, Edit, Eye, Calendar } from 'lucide-react'
import { useSnippets } from '@/hooks/useSnippets'
import { useToast } from '@/hooks/useToast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

export default function Snippets() {
  const { snippets, loading, createSnippet, updateSnippet, deleteSnippet } = useSnippets()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  
  function handleNew() {
    setEditingId(null)
    setTitle('')
    setContent('')
    setPreviewMode(false)
    setIsEditing(true)
  }
  
  function handleEdit(snippet: typeof snippets[0]) {
    setEditingId(snippet.id)
    setTitle(snippet.title)
    setContent(snippet.content_markdown)
    setPreviewMode(false)
    setIsEditing(true)
  }
  
  async function handleSave() {
    if (!title.trim()) {
      toast('Title is required', 'error')
      return
    }
    
    try {
      if (editingId) {
        await updateSnippet(editingId, title, content)
        toast('Snippet updated', 'success')
      } else {
        await createSnippet(title, content)
        toast('Snippet created and added to flashcard queue', 'success')
      }
      setIsEditing(false)
    } catch (err) {
      toast('Failed to save snippet', 'error')
    }
  }
  
  async function handleDelete(id: string) {
    if (!confirm('Delete this snippet? This cannot be undone.')) return
    
    try {
      await deleteSnippet(id)
      toast('Snippet deleted', 'success')
    } catch (err) {
      toast('Failed to delete snippet', 'error')
    }
  }
  
  if (isEditing) {
    return (
      <div className="min-h-screen w-full bg-background p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              {editingId ? 'Edit Snippet' : 'New Snippet'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
              >
                {previewMode ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </div>
          
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Snippet title..."
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          />
          
          {/* Editor / Preview */}
          <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ minHeight: '500px' }}>
            {previewMode ? (
              <div className="p-6 prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content || '*No content yet*'}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your snippet in markdown... Use ```python for code blocks"
                className="w-full h-full min-h-[500px] p-6 bg-transparent text-foreground font-mono text-sm focus:outline-none resize-none"
              />
            )}
          </div>
          
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen w-full bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Code Snippets</h1>
              <p className="text-muted-foreground text-sm mt-1">Your personal library of reusable patterns and utilities</p>
            </div>
          </div>
          <button
            onClick={handleNew}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Snippet
          </button>
        </div>
        
        {/* Snippets Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading snippets...</div>
        ) : snippets.length === 0 ? (
          <div className="bg-card border border-dashed rounded-xl p-12 text-center">
            <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No snippets yet</p>
            <button
              onClick={handleNew}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Create your first snippet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snippets.map(snippet => (
              <div key={snippet.id} className="bg-card border rounded-xl p-4 hover:border-primary/50 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground line-clamp-2 flex-1">{snippet.title}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(snippet)}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(snippet.id)}
                      className="p-1.5 hover:bg-chart-1/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-chart-1" />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground font-mono bg-muted/20 rounded-lg p-3 mb-3 line-clamp-3">
                  {snippet.content_markdown.split('\n').slice(0, 3).join('\n') || 'No content'}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(snippet.created_at).toLocaleDateString()}
                  </div>
                  <div className={cn(
                    'px-2 py-1 rounded-md',
                    snippet.touch_number === 3 ? 'bg-chart-2/10 text-chart-2' : 'bg-muted text-muted-foreground'
                  )}>
                    Touch {snippet.touch_number}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  )
}
