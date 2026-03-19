import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddQuickLink,
  useDeleteQuickLink,
  useQuickLinks,
} from "../hooks/useQueries";

const EMOJI_SUGGESTIONS = [
  "🔗",
  "📖",
  "🎯",
  "💼",
  "🎵",
  "📧",
  "🛒",
  "⚙️",
  "🏠",
  "🌐",
  "🎮",
  "📊",
];

export default function QuickLinks() {
  const { data: links, isLoading } = useQuickLinks();
  const addLink = useAddQuickLink();
  const deleteLink = useDeleteQuickLink();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [emoji, setEmoji] = useState("🔗");

  const handleAdd = async () => {
    if (!title.trim() || !url.trim()) return;
    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }
    try {
      await addLink.mutateAsync({ title: title.trim(), url: finalUrl, emoji });
      setTitle("");
      setUrl("");
      setEmoji("🔗");
      setOpen(false);
      toast.success("Link added!");
    } catch {
      toast.error("Failed to add link");
    }
  };

  return (
    <div className="p-8 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Quick Links</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="rounded-full"
              data-ocid="links.open_modal_button"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Link
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="links.dialog">
            <DialogHeader>
              <DialogTitle>Add Quick Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-medium">Emoji</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EMOJI_SUGGESTIONS.map((e) => (
                    <button
                      type="button"
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                        emoji === e
                          ? "bg-primary text-white scale-110"
                          : "bg-muted hover:bg-accent"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="link-title" className="text-xs font-medium">
                  Title
                </Label>
                <Input
                  id="link-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. GitHub, Gmail"
                  className="mt-1"
                  data-ocid="links.input"
                />
              </div>
              <div>
                <Label htmlFor="link-url" className="text-xs font-medium">
                  URL
                </Label>
                <Input
                  id="link-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="https://..."
                  className="mt-1"
                  data-ocid="links.url.input"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="links.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={!title.trim() || !url.trim() || addLink.isPending}
                  data-ocid="links.submit_button"
                >
                  {addLink.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Add Link
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-4" data-ocid="links.loading_state">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : !links || links.length === 0 ? (
        <div className="text-center py-20" data-ocid="links.empty_state">
          <p className="text-4xl mb-3">🔗</p>
          <p className="text-muted-foreground">
            No links yet — add your favorites!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {links.map((link, i) => (
            <Card
              key={String(link.id)}
              className="shadow-card border-border hover:shadow-card-hover transition-all group cursor-pointer"
              data-ocid={`links.item.${i + 1}`}
            >
              <CardContent className="p-4 flex flex-col items-center gap-2 relative">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-3xl">{link.emoji}</span>
                  <span className="text-sm font-semibold text-foreground text-center">
                    {link.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-full flex items-center gap-1">
                    <ExternalLink className="w-2.5 h-2.5" />
                    {link.url.replace(/^https?:\/\//, "").slice(0, 20)}
                    {link.url.length > 20 ? "..." : ""}
                  </span>
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    deleteLink.mutate(link.id);
                    toast.success("Link removed");
                  }}
                  data-ocid={`links.delete_button.${i + 1}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
