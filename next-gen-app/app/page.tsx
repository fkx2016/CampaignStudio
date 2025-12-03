"use client";

import { useState, useEffect } from "react";
import { CampaignPost } from "@/types/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, RefreshCw, CheckCircle, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import ModeSwitcher from "@/components/mode-switcher/ModeSwitcher";

export default function CampaignDashboard() {
  const [posts, setPosts] = useState<CampaignPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // EDIT STATE
  const [editedTitle, setEditedTitle] = useState("");
  const [editedHook, setEditedHook] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // FETCH DATA FROM BACKEND
  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("http://localhost:8001/api/posts");
        const data = await res.json();
        setPosts(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const post = posts[currentIndex];

  // SYNC EDIT STATE WHEN POST CHANGES
  useEffect(() => {
    if (post) {
      setEditedTitle(post.title);
      setEditedHook(post.hook_text);
      setEditedImageUrl(post.media_image_url || "");
    }
  }, [currentIndex, posts]);

  // SAVE FUNCTION
  const savePost = async () => {
    setIsSaving(true);
    try {
      const updatedPost = {
        ...post,
        title: editedTitle,
        hook_text: editedHook,
        media_image_url: editedImageUrl
      };

      const res = await fetch(`http://localhost:8001/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPost),
      });

      if (res.ok) {
        // Update local state
        const newPosts = [...posts];
        newPosts[currentIndex] = updatedPost;
        setPosts(newPosts);
        alert("Saved successfully!");
      } else {
        alert("Failed to save.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving post.");
    } finally {
      setIsSaving(false);
    }
  };

  // PASTE HANDLER
  const handlePaste = async (e: React.ClipboardEvent) => {
    console.log("Paste detected");
    const items = e.clipboardData.items;

    // 1. Check for Image File
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) return;

        console.log("Uploading file...", file.name);
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("http://localhost:8001/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          setEditedImageUrl(data.url);
          alert("Image uploaded successfully!");
        } catch (err) {
          console.error("Upload failed", err);
          alert("Upload failed.");
        }
        return; // Stop if image found
      }
    }

    // 2. Check for Text (URL) - Auto-Ingest!
    if ((e.target as HTMLElement).tagName === "DIV" || (e.target as HTMLElement).tagName === "INPUT") {
      const text = e.clipboardData.getData("text");
      if (text && (text.startsWith("http"))) {
        e.preventDefault();
        console.log("URL detected, auto-ingesting...", text);

        // Optimistic update (show remote while downloading)
        setEditedImageUrl(text);

        try {
          const res = await fetch("http://localhost:8001/api/ingest-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: text }),
          });
          if (res.ok) {
            const data = await res.json();
            console.log("Ingest success:", data.url);
            setEditedImageUrl(data.url); // Swap with local URL
          } else {
            console.warn("Ingest failed, keeping remote URL");
          }
        } catch (err) {
          console.error("Ingest error", err);
        }
      }
    }
  };

  const handleLaunchAI = (url: string) => {
    // 1. Copy Prompt
    if (post.image_prompt) {
      navigator.clipboard.writeText(post.image_prompt);
      alert("Prompt copied to clipboard! Opening tool...");
    }
    // 2. Open Tool
    window.open(url, "_blank");
  };

  const nextPost = () => setCurrentIndex((prev) => (prev + 1) % posts.length);
  const prevPost = () => setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);

  const handleCopyImage = async (e: React.ClipboardEvent) => {
    if (!editedImageUrl) return;
    e.preventDefault();

    try {
      const response = await fetch(editedImageUrl);
      const blob = await response.blob();

      // Create a ClipboardItem with the image blob
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      alert("Image copied to clipboard! Ready to paste into LinkedIn/X.");
    } catch (err) {
      console.error("Copy failed", err);
      alert("Failed to copy image. Is it a local file?");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Campaign Data...</div>;
  if (!post) return <div className="p-10 text-center">No posts found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      {/* ... (Header remains same) ... */}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Content & Controls */}
        <div className="lg:col-span-7 space-y-6">

          {/* MODE SWITCHER (New) */}
          <ModeSwitcher />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Campaign Studio</h1>
              <p className="text-slate-500">Connected to FastAPI Backend</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => alert("Settings coming in v0.2!")}>
                ⚙️ Settings
              </Button>
              <div className="h-6 w-px bg-slate-300 mx-2"></div>
              <Button variant="outline" onClick={prevPost}>
                ← Prev
              </Button>
              <span className="text-sm font-mono text-slate-500 min-w-[60px] text-center">
                {currentIndex + 1} / {posts.length}
              </span>
              <Button variant="outline" onClick={nextPost}>
                Next →
              </Button>
            </div>
          </div>

          {/* Main Card */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-700">Post ID: {post.id}</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold border-transparent"
                  onClick={savePost}
                  disabled={isSaving}
                  style={{ backgroundColor: "#16a34a" }} // Force Green
                >
                  <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Badge variant={post.status === "Posted" ? "success" : "warning"}>
                  {post.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</label>
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="mt-1 font-semibold text-lg"
                />
              </div>

              <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Hook Text</label>
                <Textarea
                  value={editedHook}
                  onChange={(e) => setEditedHook(e.target.value)}
                  className="min-h-[100px] text-slate-700 font-mono text-sm"
                />
              </div>

              {/* Action Bar */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" /> Generate New
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  <Copy className="w-4 h-4 mr-2" /> Copy Content
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Platform Tabs */}
          <Tabs defaultValue="substack" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-200/50">
              <TabsTrigger value="substack">Substack</TabsTrigger>
              <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
              <TabsTrigger value="x">X (Twitter)</TabsTrigger>
            </TabsList>
            <TabsContent value="substack" className="mt-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200 text-sm text-slate-600 space-y-4">
                <div>
                  <h3 className="font-bold mb-2 text-slate-900">{post.title}</h3>
                  <p>{post.hook_text}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="italic text-slate-400">Draft Preview</span>
                  <Button
                    className="text-white hover:opacity-90 border-transparent font-bold"
                    style={{ backgroundColor: "#FF6719" }}
                    onClick={() => window.open("https://substack.com/dashboard/post/new", "_blank")}
                  >
                    Open Substack <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="linkedin" className="mt-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200 text-sm text-slate-600 space-y-4">
                <div>
                  <p>{post.hook_text}</p>
                  <p className="mt-2 text-blue-600">#AI #TechLife #Campaign</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="italic text-slate-400">Draft Preview</span>
                  <Button
                    className="text-white hover:opacity-90 border-transparent font-bold"
                    style={{ backgroundColor: "#0077b5" }}
                    onClick={() => window.open("https://www.linkedin.com/feed/", "_blank")}
                  >
                    Open LinkedIn <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="x" className="mt-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200 text-sm text-slate-600 space-y-4">
                <div>
                  <p>{post.hook_text.substring(0, 280)}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="italic text-slate-400">Draft Preview</span>
                  <Button
                    className="text-white hover:opacity-90 border-transparent font-bold"
                    style={{ backgroundColor: "#000000" }}
                    onClick={() => window.open("https://twitter.com/compose/tweet", "_blank")}
                  >
                    Open X <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT COLUMN: Media Studio */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-white shadow-sm border-slate-200 h-full">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <span>🎨</span> Media Studio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">

              {/* Social Card Preview */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700">Social Card</label>
                  <span className="text-xs text-slate-400">1200x630px</span>
                </div>

                {editedImageUrl && editedImageUrl.length > 5 ? (
                  <div
                    className="bg-slate-100 rounded-lg border border-slate-200 overflow-hidden relative group focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    tabIndex={0}
                    onPaste={handlePaste}
                    onCopy={handleCopyImage}
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant={editedImageUrl.includes("localhost") ? "success" : "secondary"}>
                        {editedImageUrl.includes("localhost") ? "Local File" : "Remote URL"}
                      </Badge>
                    </div>
                    <img
                      src={editedImageUrl}
                      alt="Social Card"
                      className="w-full h-auto max-h-[600px] object-contain bg-slate-50"
                      onError={(e) => {
                        // Just hide the image, don't delete the text!
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement?.classList.add('bg-red-50');
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="sm" onClick={() => setEditedImageUrl("")}>Remove Image</Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="aspect-video bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 hover:border-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    tabIndex={0}
                    onPaste={handlePaste}
                  >
                    <div className="text-center pointer-events-none">
                      <div className="mb-2 text-2xl">🖼️</div>
                      <span className="text-sm font-medium">Click & Paste Image (Ctrl+V)</span>
                    </div>
                  </div>
                )}

                {/* Image URL Input */}
                <div className="pt-2">
                  <Input
                    id="image-url-input"
                    placeholder="Or paste Image URL here..."
                    value={editedImageUrl}
                    onChange={(e) => setEditedImageUrl(e.target.value)}
                    onPaste={handlePaste}
                    className="text-xs bg-white text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              {/* AI Image Tools */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">AI Image Generation</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="secondary"
                    className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200"
                    onClick={() => handleLaunchAI("https://aistudio.google.com/")}
                  >
                    Gemini
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-xs bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                    onClick={() => handleLaunchAI("https://chat.openai.com/")}
                  >
                    ChatGPT
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-xs bg-slate-800 text-white hover:bg-slate-900 border border-slate-900"
                    onClick={() => handleLaunchAI("https://twitter.com/i/grok")}
                  >
                    Grok 🌶️
                  </Button>
                </div>
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-200 font-mono">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-400">PROMPT</span>
                    <Copy className="w-3 h-3 cursor-pointer hover:text-blue-500" onClick={() => navigator.clipboard.writeText(post.image_prompt || "")} />
                  </div>
                  {post.image_prompt ? post.image_prompt.substring(0, 100) + "..." : "No prompt available."}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

// --- Minimal UI Components (Inline for Prototype Speed) ---

function Button({ className, variant = "default", size = "default", children, ...props }: any) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background shadow-sm";
  const sizes: any = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  };
  const variants: any = {
    default: "bg-blue-600 text-white hover:bg-blue-700 border border-transparent", // High contrast blue
    outline: "border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400", // Darker text, thicker border
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
  };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props}>{children}</button>;
}

function Badge({ children, variant }: any) {
  const colors = variant === "success" ? "bg-green-100 text-green-800 border border-green-200" : "bg-amber-100 text-amber-800 border border-amber-200";
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors}`}>{children}</span>;
}
