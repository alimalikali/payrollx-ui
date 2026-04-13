import { useState } from "react";
import { format } from "date-fns";
import {
  Megaphone,
  Pin,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  useNotices,
  useCreateNotice,
  useUpdateNotice,
  useDeleteNotice,
  useCurrentUser,
} from "@/hooks";
import type { Notice, CreateNoticeData } from "@/hooks/useNotices";

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const CATEGORY_STYLES: Record<string, string> = {
  general: "bg-blue-500/20 text-blue-400",
  policy: "bg-purple-500/20 text-purple-400",
  event: "bg-green-500/20 text-green-400",
  holiday: "bg-pink-500/20 text-pink-400",
  payroll: "bg-cyan-500/20 text-cyan-400",
};

const EMPTY_FORM: CreateNoticeData = {
  title: "",
  content: "",
  priority: "low",
  category: "general",
  isPinned: false,
  expiresAt: null,
};

export default function NoticeBoard() {
  const { data: user } = useCurrentUser();
  const isHR = user?.role === "admin" || user?.role === "hr";

  const [page, setPage] = useState(1);
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateNoticeData>(EMPTY_FORM);

  const { data, isLoading } = useNotices({
    page,
    limit: 10,
    priority: priorityFilter || undefined,
    category: categoryFilter || undefined,
    search: search || undefined,
  });

  const createMutation = useCreateNotice();
  const updateMutation = useUpdateNotice();
  const deleteMutation = useDeleteNotice();

  const notices = data?.data ?? [];
  const pagination = data?.meta ?? { page: 1, totalPages: 1, total: 0 };

  const openCreate = () => {
    setEditingNotice(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setForm({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
      category: notice.category,
      isPinned: notice.isPinned,
      expiresAt: notice.expiresAt,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    if (editingNotice) {
      updateMutation.mutate(
        { id: editingNotice.id, data: form },
        {
          onSuccess: () => {
            toast.success("Notice updated");
            setDialogOpen(false);
          },
          onError: () => toast.error("Failed to update notice"),
        }
      );
    } else {
      createMutation.mutate(form, {
        onSuccess: () => {
          toast.success("Notice created");
          setDialogOpen(false);
        },
        onError: () => toast.error("Failed to create notice"),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Notice deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete notice"),
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary" />
              Notice Board
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isHR ? "Manage company announcements" : "Company announcements"}
            </p>
          </div>
          {isHR && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Notice
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notices..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="policy">Policy</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="holiday">Holiday</SelectItem>
              <SelectItem value="payroll">Payroll</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notice List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-5 bg-muted rounded w-1/3 mb-3" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notices.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notices found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notices.map((notice: Notice) => (
              <Card key={notice.id} className={notice.isPinned ? "border-primary/30" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {notice.isPinned && (
                          <Pin className="h-4 w-4 text-primary shrink-0" />
                        )}
                        <Badge variant="outline" className={PRIORITY_STYLES[notice.priority]}>
                          {notice.priority}
                        </Badge>
                        <Badge variant="outline" className={CATEGORY_STYLES[notice.category]}>
                          {notice.category}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {notice.title}
                      </h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {notice.content}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span>By {notice.createdByName || "Admin"}</span>
                        <span>&bull;</span>
                        <span>{format(new Date(notice.createdAt), "MMM d, yyyy h:mm a")}</span>
                        {notice.expiresAt && (
                          <>
                            <span>&bull;</span>
                            <span>Expires {format(new Date(notice.expiresAt), "MMM d, yyyy")}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {isHR && (
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(notice)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(notice.id)}>
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingNotice ? "Edit Notice" : "Create Notice"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Notice title"
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Notice content"
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiresAt">Expiry Date (optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={form.expiresAt ? form.expiresAt.split("T")[0] : ""}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value || null })}
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form.isPinned}
                    onCheckedChange={(v) => setForm({ ...form, isPinned: !!v })}
                  />
                  <span className="text-sm">Pin this notice</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingNotice ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notice</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This notice will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
