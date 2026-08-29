"use client";

import { useEffect, useState } from "react";
import {
  Video,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface DoubtVideo {
  _id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export default function AdminStenoDoubtVideosPage() {
  const [videos, setVideos] = useState<DoubtVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<DoubtVideo | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    videoUrl: "",
    thumbnailUrl: "",
    description: "",
    order: 0,
    isActive: true,
  });

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/steno/doubt-videos");
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (err) {
      console.error("Failed to fetch videos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleOpenAdd = () => {
    setEditingVideo(null);
    setFormData({
      title: "",
      videoUrl: "",
      thumbnailUrl: "",
      description: "",
      order: videos.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (video: DoubtVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || "",
      description: video.description || "",
      order: video.order || 0,
      isActive: video.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.videoUrl) return;

    try {
      setSaving(true);
      const url = editingVideo
        ? `/api/admin/steno/doubt-videos/${editingVideo._id}`
        : `/api/admin/steno/doubt-videos`;
      const method = editingVideo ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchVideos();
      }
    } catch (err) {
      console.error("Failed to save video", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doubt video?")) return;
    try {
      const res = await fetch(`/api/admin/steno/doubt-videos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchVideos();
      }
    } catch (err) {
      console.error("Failed to delete video", err);
    }
  };

  const handleToggleActive = async (video: DoubtVideo) => {
    try {
      const res = await fetch(`/api/admin/steno/doubt-videos/${video._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !video.isActive }),
      });
      if (res.ok) {
        fetchVideos();
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleSeed = async () => {
    if (
      !confirm(
        "Seed 6 default Doubt Solution videos into database? This will populate the 2 rows of 3 videos format."
      )
    )
      return;
    try {
      setLoading(true);
      const res = await fetch("/api/admin/steno/doubt-videos?action=seed", {
        method: "POST",
      });
      if (res.ok) {
        fetchVideos();
      }
    } catch (err) {
      console.error("Failed to seed default videos", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" /> Steno Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Steno Doubt Solution Videos
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage video tutorials, doubt clearance sessions, and shorthand speed tips shown on the public Steno page (3 videos per row format).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSeed}
            className="font-bold rounded-2xl border-slate-200 text-slate-700 text-xs gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> Seed Default Videos
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Doubt Video
          </Button>
        </div>
      </div>

      {/* Video Grid List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading doubt videos...
        </div>
      ) : videos.length === 0 ? (
        <Card className="p-12 text-center space-y-4 rounded-3xl border-dashed border-2 border-slate-200 bg-white">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <Video className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              No Doubt Solution Videos Found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click &quot;Add Doubt Video&quot; or &quot;Seed Default Videos&quot; to populate 6 initial videos (3 per row).
            </p>
          </div>
          <Button onClick={handleSeed} className="bg-indigo-600 text-white font-bold rounded-xl text-xs">
            Seed 6 Default Videos
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, idx) => (
            <Card
              key={video._id}
              className="p-0 rounded-3xl overflow-hidden border-slate-200 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden group">
                  <img
                    src={
                      video.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
                    }
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white/90 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md">
                    Row {Math.floor(idx / 3) + 1} • Item {(idx % 3) + 1}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(video)}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1 ${
                        video.isActive
                          ? "bg-emerald-500/90 text-white"
                          : "bg-slate-500/90 text-white"
                      }`}
                    >
                      {video.isActive ? (
                        <>
                          <Eye className="w-3 h-3" /> Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> Hidden
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                    <span>Order: #{video.order}</span>
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Open Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <h3 className="font-black text-slate-900 text-base leading-snug line-clamp-2">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-xs text-slate-500 font-medium line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(video)}
                  className="flex-1 rounded-xl text-xs font-bold gap-1.5 text-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-600" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(video._id)}
                  className="rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border-red-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog for Add/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-6 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              {editingVideo ? "Edit Doubt Solution Video" : "Add Doubt Solution Video"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Enter video title, YouTube URL or video link, and details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Video Title *</Label>
              <Input
                required
                placeholder="e.g. How to Increase Steno Speed from 60 to 80 WPM"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Video URL / YouTube Link *</Label>
              <Input
                required
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Thumbnail Image URL (Optional - Auto generated for YouTube)
              </Label>
              <Input
                placeholder="https://..."
                value={formData.thumbnailUrl}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Short Description</Label>
              <Textarea
                rows={2}
                placeholder="Brief summary of what is taught in this video..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-xl resize-none text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Display Order</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-center">
                <Label className="text-xs font-bold text-slate-700 mb-1">Status</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <span className="text-xs font-semibold text-slate-600">
                    {formData.isActive ? "Active (Visible)" : "Hidden"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
              >
                {saving ? "Saving..." : editingVideo ? "Update Video" : "Add Video"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
