"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createUpdate,
  deleteUpdate,
  fetchAdminUpdates,
  updateUpdate,
  type UpdateItem,
} from "@/lib/updates";
import { toast } from "sonner";

export function AdminUpdatesManagement() {
  const { token } = useAuth();
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    active: true,
    expiryDate: "",
  });

  useEffect(() => {
    if (!token) return;
    loadUpdates();
  }, [token]);

  const loadUpdates = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUpdates(token);
      setUpdates(data);
    } catch (err: unknown) {
      console.error("Failed to load updates", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load updates";
      setError(errorMessage);
      toast.error("Failed to load updates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!token || !formData.title || !formData.message) {
      toast.error("Title and message are required");
      return;
    }

    try {
      await createUpdate(
        {
          title: formData.title,
          message: formData.message,
          active: formData.active,
          expiryDate: formData.expiryDate || null,
        },
        token
      );
      toast.success("Update created successfully");
      setIsCreateDialogOpen(false);
      setFormData({ title: "", message: "", active: true, expiryDate: "" });
      loadUpdates();
    } catch (err: unknown) {
      console.error("Failed to create update", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create update";
      toast.error(errorMessage);
    }
  };

  const handleEdit = async () => {
    if (!token || !selectedUpdate || !formData.title || !formData.message) {
      toast.error("Title and message are required");
      return;
    }

    try {
      await updateUpdate(
        selectedUpdate._id,
        {
          title: formData.title,
          message: formData.message,
          active: formData.active,
          expiryDate: formData.expiryDate || null,
        },
        token
      );
      toast.success("Update updated successfully");
      setIsEditDialogOpen(false);
      setSelectedUpdate(null);
      setFormData({ title: "", message: "", active: true, expiryDate: "" });
      loadUpdates();
    } catch (err: unknown) {
      console.error("Failed to update update", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update update";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!token || !selectedUpdate) return;

    try {
      await deleteUpdate(selectedUpdate._id, token);
      toast.success("Update deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedUpdate(null);
      loadUpdates();
    } catch (err: unknown) {
      console.error("Failed to delete update", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete update";
      toast.error(errorMessage);
    }
  };

  const openEditDialog = (update: UpdateItem) => {
    setSelectedUpdate(update);
    setFormData({
      title: update.title,
      message: update.message,
      active: update.active !== undefined ? update.active : true,
      expiryDate: update.expiryDate
        ? new Date(update.expiryDate).toISOString().split("T")[0]
        : "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (update: UpdateItem) => {
    setSelectedUpdate(update);
    setIsDeleteDialogOpen(true);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Updates Management</h1>
          <p className="text-muted-foreground">
            Create and manage site-wide updates and announcements for all users.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          Create Update
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading updates...
        </div>
      ) : updates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No updates found. Create your first update to get started.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {updates.map((update) => (
                  <TableRow key={update._id}>
                    <TableCell className="font-medium">{update.title}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate">{update.message}</p>
                    </TableCell>
                    <TableCell>
                      {update.active ? (
                        <Badge variant="default" className="bg-green-500">
                          <Check className="size-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <X className="size-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(update.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {update.expiryDate
                        ? new Date(update.expiryDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "No expiry"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(update)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(update)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog - Custom Modal like Booking */}
      {isCreateDialogOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ 
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'auto',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.95)'
          }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0"
            onClick={() => {
              setIsCreateDialogOpen(false);
              setFormData({ title: "", message: "", active: true, expiryDate: "" });
            }}
            style={{ pointerEvents: 'auto' }}
          />
          
          {/* Dialog Content */}
          <div 
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-4 flex flex-col overflow-hidden border border-slate-700/50"
            style={{ 
              zIndex: 10000,
              pointerEvents: 'auto',
              position: 'relative',
              maxHeight: '90vh',
              width: '90%',
              maxWidth: '42rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <h2 className="text-xl font-semibold dark:text-white">Create New Update</h2>
              <button 
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({ title: "", message: "", active: true, expiryDate: "" });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div 
              className="overflow-y-auto p-6"
              style={{ flex: '1 1 auto', minHeight: 0 }}
            >
              <p className="text-sm text-muted-foreground mb-4">
                Create a new update that will be visible to all users.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-title">Title *</Label>
                  <Input
                    id="create-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter update title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-message">Message *</Label>
                  <Textarea
                    id="create-message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Enter update message"
                    rows={6}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="create-active"
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, active: checked })
                    }
                  />
                  <Label htmlFor="create-active">Active</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-expiry">Expiry Date (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="create-expiry"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryDate: e.target.value })
                      }
                      className="pr-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({ title: "", message: "", active: true, expiryDate: "" });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog - Custom Modal like Booking */}
      {isEditDialogOpen && selectedUpdate && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ 
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'auto',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.95)'
          }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0"
            onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedUpdate(null);
              setFormData({ title: "", message: "", active: true, expiryDate: "" });
            }}
            style={{ pointerEvents: 'auto' }}
          />
          
          {/* Dialog Content */}
          <div 
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-4 flex flex-col overflow-hidden border border-slate-700/50"
            style={{ 
              zIndex: 10000,
              pointerEvents: 'auto',
              position: 'relative',
              maxHeight: '90vh',
              width: '90%',
              maxWidth: '42rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <h2 className="text-xl font-semibold dark:text-white">Edit Update</h2>
              <button 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedUpdate(null);
                  setFormData({ title: "", message: "", active: true, expiryDate: "" });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div 
              className="overflow-y-auto p-6"
              style={{ flex: '1 1 auto', minHeight: 0 }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter update title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-message">Message *</Label>
                  <Textarea
                    id="edit-message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Enter update message"
                    rows={6}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-active"
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, active: checked })
                    }
                  />
                  <Label htmlFor="edit-active">Active</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-expiry">Expiry Date (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="edit-expiry"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryDate: e.target.value })
                      }
                      className="pr-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedUpdate(null);
                  setFormData({ title: "", message: "", active: true, expiryDate: "" });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog - Custom Modal like Booking */}
      {isDeleteDialogOpen && selectedUpdate && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ 
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'auto',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.95)'
          }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0"
            onClick={() => {
              setIsDeleteDialogOpen(false);
              setSelectedUpdate(null);
            }}
            style={{ pointerEvents: 'auto' }}
          />
          
          {/* Dialog Content */}
          <div 
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-4 flex flex-col overflow-hidden border border-slate-700/50"
            style={{ 
              zIndex: 10000,
              pointerEvents: 'auto',
              position: 'relative',
              maxHeight: '90vh',
              width: '90%',
              maxWidth: '28rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <h2 className="text-xl font-semibold dark:text-white">Delete Update</h2>
              <button 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedUpdate(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete this update? This action cannot be undone.
              </p>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="text-sm font-medium">{selectedUpdate.title}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                This will permanently delete the update &quot;{selectedUpdate.title}&quot; and all associated read records.
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedUpdate(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

