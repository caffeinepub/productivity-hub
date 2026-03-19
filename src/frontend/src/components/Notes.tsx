import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Note } from "../backend.d";
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNote,
} from "../hooks/useQueries";

export default function Notes() {
  const { data: notes, isLoading } = useNotes();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const updateNote = useUpdateNote();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await createNote.mutateAsync({ title: title.trim(), content });
      setTitle("");
      setContent("");
      setOpen(false);
      toast.success("Note created!");
    } catch {
      toast.error("Failed to create note");
    }
  };

  const openNoteDetail = (note: Note, startEditing = false) => {
    setSelectedNote(note);
    if (startEditing) {
      setEditTitle(note.title);
      setEditContent(note.content);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedNote(null);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (!selectedNote) return;
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle("");
    setEditContent("");
  };

  const handleSaveEdit = async () => {
    if (!selectedNote || !editTitle.trim()) return;
    try {
      await updateNote.mutateAsync({
        id: selectedNote.id,
        title: editTitle.trim(),
        content: editContent,
      });
      toast.success("Note updated");
      setIsEditing(false);
      handleCloseDetail();
    } catch {
      toast.error("Failed to update note");
    }
  };

  return (
    <div className="p-8 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Notes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="rounded-full"
              data-ocid="notes.open_modal_button"
            >
              <Plus className="w-4 h-4 mr-2" /> New Note
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="notes.dialog">
            <DialogHeader>
              <DialogTitle>Create Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="note-title" className="text-xs font-medium">
                  Title
                </Label>
                <Input
                  id="note-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title"
                  className="mt-1"
                  data-ocid="notes.input"
                />
              </div>
              <div>
                <Label htmlFor="note-content" className="text-xs font-medium">
                  Content
                </Label>
                <Textarea
                  id="note-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your thoughts..."
                  rows={6}
                  className="mt-1"
                  data-ocid="notes.textarea"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="notes.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!title.trim() || createNote.isPending}
                  data-ocid="notes.submit_button"
                >
                  {createNote.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Save Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4" data-ocid="notes.loading_state">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : !notes || notes.length === 0 ? (
        <div className="text-center py-20" data-ocid="notes.empty_state">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-muted-foreground">
            No notes yet — create your first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {notes.map((note, i) => (
            <Card
              key={String(note.id)}
              className="shadow-card border-border hover:shadow-card-hover transition-shadow cursor-pointer group"
              data-ocid={`notes.item.${i + 1}`}
              onClick={() => openNoteDetail(note)}
            >
              <CardHeader className="pb-2 flex-row items-start justify-between">
                <CardTitle className="text-sm font-semibold flex-1 pr-2">
                  {note.title}
                </CardTitle>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNoteDetail(note, true);
                    }}
                    data-ocid={`notes.edit_button.${i + 1}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote.mutate(note.id);
                      toast.success("Note deleted");
                    }}
                    data-ocid={`notes.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-4">
                  {note.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Note detail / edit dialog */}
      {selectedNote && (
        <Dialog
          open={!!selectedNote}
          onOpenChange={(o) => {
            if (!o) handleCloseDetail();
          }}
        >
          <DialogContent className="max-w-lg" data-ocid="notes.modal">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                {isEditing ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-lg font-semibold"
                    placeholder="Note title"
                    data-ocid="notes.edit_input"
                  />
                ) : (
                  <DialogTitle className="flex-1">
                    {selectedNote.title}
                  </DialogTitle>
                )}
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
                    onClick={handleStartEdit}
                    data-ocid="notes.edit_button"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </DialogHeader>

            {isEditing ? (
              <div className="space-y-3 pt-1">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={8}
                  placeholder="Write your thoughts..."
                  data-ocid="notes.edit_textarea"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    data-ocid="notes.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={!editTitle.trim() || updateNote.isPending}
                    data-ocid="notes.save_button"
                  >
                    {updateNote.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground whitespace-pre-wrap pt-2">
                  {selectedNote.content}
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={handleCloseDetail}
                  data-ocid="notes.close_button"
                >
                  <X className="w-4 h-4 mr-2" /> Close
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
