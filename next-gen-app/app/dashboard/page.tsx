"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/NewAuthContext";
import { useRouter } from "next/navigation";
import { CampaignPost, Campaign, Mode, Platform } from "@/types/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, RefreshCw, CheckCircle, ChevronLeft, ChevronRight, Save, Settings, Music, Plus, LogOut, User, FolderInput } from "lucide-react";
import { cn } from "@/lib/utils";
import ModeSwitcher from "@/components/mode-switcher/ModeSwitcher";
import MusicPlayer from "@/components/MusicPlayer";
import MediaEditor from "@/components/MediaEditor";
import SettingsModal from "@/components/settings/SettingsModal";
import AITextOptimizer from "@/components/AITextOptimizer";
import CreateCampaignModal from "@/components/campaign/CreateCampaignModal";
// Removed Button/Slider imports as we use native/inline for now to avoid errors

export default function CampaignDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Protect Route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const [posts, setPosts] = useState<CampaignPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [postsLoading, setPostsLoading] = useState(true); // Renamed to avoid conflict with authLoading
  const [currentMode, setCurrentMode] = useState("ebeg"); // Default mode
  const [showMusic, setShowMusic] = useState(false); // State for Music Player
  const [showSettings, setShowSettings] = useState(false); // State for Settings
  const [showCreateCampaign, setShowCreateCampaign] = useState(false); // State for Create Campaign Modal
  const [systemInfo, setSystemInfo] = useState<{ version: string, database_type: string } | null>(null);

  // Fetch System Info
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/system-info`)
      .then(res => res.json())
      .then(data => setSystemInfo(data))
      .catch(err => console.error("Failed to fetch system info", err));
  }, []);
  const [isEditingMedia, setIsEditingMedia] = useState(false); // State for Media Editor
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [activePlatforms, setActivePlatforms] = useState<Platform[]>([]);

  // FETCH PLATFORMS
  const fetchActivePlatforms = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/platforms`);
      const data = await res.json();
      setActivePlatforms(data.filter((p: Platform) => p.is_active).sort((a: Platform, b: Platform) => (a.id || 0) - (b.id || 0)));
    } catch (err) {
      console.error("Failed to fetch platforms", err);
    }
  };

  useEffect(() => {
    fetchActivePlatforms();
  }, [showSettings]); // Refetch when settings close

  // EDIT STATE
  const [editedTitle, setEditedTitle] = useState("");
  const [editedHook, setEditedHook] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // FETCH DATA FROM BACKEND
  useEffect(() => {
    async function fetchData() {
      setPostsLoading(true);
      try {
        // 1. Fetch Campaigns for this Mode
        const campRes = await fetch(`${API_BASE_URL}/api/campaigns?mode_slug=${currentMode}`);
        if (campRes.ok) {
          const campData = await campRes.json();
          console.log("DEBUG: Fetched Campaigns:", campData);
          setCampaigns(campData);

          // Auto-select first campaign if none selected or invalid
          if (campData.length > 0) {
            console.log("DEBUG: Auto-selecting Campaign ID:", campData[0].id);
            setSelectedCampaignId(campData[0].id);
          } else {
            setSelectedCampaignId(null);
          }
        } else {
          console.error("Failed to fetch campaigns");
          setCampaigns([]);
          setSelectedCampaignId(null);
        }

        // 2. Fetch All Posts for this Mode (we will filter client-side for now for speed)
        const res = await fetch(`${API_BASE_URL}/api/posts?mode=${currentMode}`);
        if (res.ok) {
          const data = await res.json();
          console.log("DEBUG: Fetched Posts:", data);
          setPosts(data);
        } else {
          setPosts([]);
        }

        setCurrentIndex(0);
        setPostsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setPostsLoading(false);
      }
    }
    fetchData();
  }, [currentMode]);

  // Filter Posts by Selected Campaign
  const filteredPosts = posts.filter(p => selectedCampaignId ? p.campaign_id === selectedCampaignId : true);
  const post = filteredPosts[currentIndex];

  // CREATE NEW CAMPAIGN
  const handleCreateCampaign = async (name: string) => {
    try {
      // We need the mode_id, but we only have slug. 
      // Ideally backend handles this lookup, but for now we can rely on the backend route we made?
      // Actually, our backend route `create_campaign` expects a full Campaign object.
      // Let's fetch the mode object first or just send the ID if we had it.
      // Quick hack: We will fetch modes to find the ID.
      const modeRes = await fetch(`${API_BASE_URL}/api/modes`);
      const modes = await modeRes.json();
      const modeObj = modes.find((m: Mode) => m.slug === currentMode);

      if (!modeObj) {
        alert("Error: Could not find mode ID");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          mode_id: modeObj.id,
          status: "Active"
        })
      });

      if (res.ok) {
        const newCamp = await res.json();
        setCampaigns([...campaigns, newCamp]);
        setSelectedCampaignId(newCamp.id);
        // alert(`Campaign "${name}" created!`); // Modal closes automatically, no need for alert
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create campaign");
    }
  };

  // SYNC EDIT STATE WHEN POST CHANGES
  useEffect(() => {
    if (post) {
      setEditedTitle(post.title);
      setEditedHook(post.hook_text);
      setEditedImageUrl(post.media_image_url || "");
    }
  }, [post]);

  // SAVE FUNCTION
  const savePost = async () => {
    setIsSaving(true);
    try {
      const updatedPost = {
        ...post,
        title: editedTitle,
        hook_text: editedHook,
        media_image_url: editedImageUrl,
        mode: currentMode, // Ensure mode is saved
        campaign_id: selectedCampaignId // Ensure it's linked to current campaign
      };

      let res;
      if (post.id) {
        // UPDATE existing post
        res = await fetch(`${API_BASE_URL}/api/posts/${post.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPost),
        });
      } else {
        // CREATE new post
        res = await fetch(`${API_BASE_URL}/api/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPost),
        });
      }

      if (res.ok) {
        const savedData = await res.json();
        // Update local state
        const newPosts = [...posts];
        newPosts[currentIndex] = savedData;
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
          const res = await fetch(`${API_BASE_URL}/api/upload`, {
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
          const res = await fetch(`${API_BASE_URL}/api/ingest-url`, {
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("File selected:", file.name);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
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

  const nextPost = () => setCurrentIndex((prev) => (prev + 1) % filteredPosts.length);
  const prevPost = () => setCurrentIndex((prev) => (prev - 1 + filteredPosts.length) % filteredPosts.length);

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

  const [isStarSpinning, setIsStarSpinning] = useState(false);

  const handleStarClick = () => {
    setIsStarSpinning(true);
    setTimeout(() => setIsStarSpinning(false), 600); // Reset after animation
  };

  if (authLoading || postsLoading) return <div className="p-10 text-center">Loading Campaign Data...</div>;

  // EMPTY STATE (When no posts exist for this mode)
  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ChristmasStar.png" alt="Logo" className="w-8 h-8 object-contain" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">CampaignStudio</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowMusic(!showMusic)} className={showMusic ? "bg-blue-50 border-blue-200 text-blue-600" : ""}>
                <Music className="w-4 h-4 mr-2" />
                {showMusic ? "Hide Player" : "Focus Music"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Mode Switcher is ALWAYS visible so user can backtrack */}
          <ModeSwitcher currentMode={currentMode} onModeChange={setCurrentMode} />

          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-lg bg-white/50 text-center">
            <div className="max-w-2xl mx-auto space-y-8">

              {/* Mission Statement */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-slate-900">
                  Welcome, <span className="text-blue-600">{user?.full_name || "Creator"}</span>.
                </h2>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-slate-700 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <p className="text-lg italic font-medium leading-relaxed">
                    "We are here to help you deal with the complexity of modern online life.
                    AI is your friend, your assistant, and your force multiplier.
                    Let's use it to take care of you and help you build abundance."
                  </p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="space-y-6">
                <p className="text-slate-500">
                  You are currently in <strong>{currentMode.toUpperCase()}</strong> mode.
                  Ready to start your first campaign?
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={async () => {
                      // Trigger Auto-Seed
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/seed-samples`, { method: "POST" });
                        if (res.ok) {
                          window.location.reload();
                        } else {
                          alert("Failed to load demo data.");
                        }
                      } catch (e) {
                        alert("Network error loading demo.");
                      }
                    }}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <FolderInput className="w-6 h-6 mr-2" />
                    Launch Demo Studio 🚀
                  </Button>

                  <Button
                    onClick={() => {
                      // Create blank
                      const newPost = {
                        title: "My First Campaign",
                        hook_text: "Target Audience: Who are we talking to?\nGoal: What do we want them to do?\n\n(AI will help you write the rest...)",
                        status: "Pending",
                        mode: currentMode,
                        category_primary: "General",
                        campaign_id: selectedCampaignId
                      };
                      setPosts([newPost as CampaignPost]);
                      setCurrentIndex(0);
                    }}
                    variant="outline"
                    className="text-slate-500 hover:bg-slate-100"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Start Blank
                  </Button>


                </div>

                {/* Quick Process Guide */}
                <div className="grid grid-cols-3 gap-4 text-xs text-slate-400 font-medium pt-8 border-t border-slate-200 mt-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">1</div>
                    <span>Create & Plan</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">2</div>
                    <span>AI Generate</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">3</div>
                    <span>Review & Post</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">

      {/* HEADER BAR */}
      <div className="max-w-[1800px] mx-auto mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ChristmasStar.png"
            alt="Logo"
            className="w-8 h-8 object-contain cursor-pointer transition-transform duration-500 ease-in-out hover:scale-110"
            style={{
              transform: isStarSpinning ? 'rotate(360deg) scale(1.2)' : 'rotate(0deg) scale(1)',
            }}
            onClick={handleStarClick}
            title="Click me! ⭐"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">Campaign Studio</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 font-mono">v{systemInfo?.version || "2.0"}</span>
              <span className="text-xs text-slate-300">|</span>
              <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                <User className="w-3 h-3" />
                Hi and welcome, {user?.full_name || "Guest"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-sm"
            onClick={() => alert("🚀 Creator Hub\n\nYour AI-Powered Monetization Center\n\nComing soon:\n💰 Monetization Opportunities\n   • Affiliate programs\n   • Sponsorship matching\n   • Ad revenue optimization\n\n📚 Creator Academy\n   • AI training & tutorials\n   • Best practices library\n   • Live workshops\n\n📈 Influence Builder\n   • Audience growth strategies\n   • Engagement optimization\n   • Personal brand development\n\n🤝 Partnership Marketplace\n   • Brand connections\n   • Creator collaborations\n   • Revenue sharing deals\n\n💡 AI Success Assistant\n   • Personalized recommendations\n   • Automated opportunity alerts\n   • Performance insights\n\nMission: Make AI work for YOU, not the platforms!")}
          >
            <span className="mr-1.5">🚀</span>
            Creator Hub
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowMusic(!showMusic)} className={showMusic ? "bg-blue-50 border-blue-200 text-blue-600" : ""}>
            <Music className="w-4 h-4 mr-2" />
            {showMusic ? "Hide Player" : "Focus Music"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* 3-COLUMN LAYOUT */}
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* COL 1: LEFT PANEL (Mode & Navigation) - Span 3 */}
        <div className="lg:col-span-3 space-y-4">

          {/* 1. Mode Switcher */}
          <ModeSwitcher currentMode={currentMode} onModeChange={setCurrentMode} />

          {/* 2. Campaign Selector */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <select
                  className="flex-1 text-sm border-slate-300 rounded-md p-2 bg-white"
                  value={selectedCampaignId || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSelectedCampaignId(val);
                    setCurrentIndex(0);
                  }}
                >
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  {campaigns.length === 0 && <option value="">No Campaigns</option>}
                </select>
                <Button size="icon" variant="outline" onClick={() => setShowCreateCampaign(true)} title="New Campaign">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 3. Active Campaign Info */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">Active Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <p className="text-sm font-medium text-slate-700">
                  {campaigns.find(c => c.id === selectedCampaignId)?.name || "No campaign selected"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} in this campaign
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-2">
                <Button variant="outline" onClick={prevPost} className="flex-1" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <span className="text-sm font-mono font-bold text-slate-700 min-w-[60px] text-center bg-white border border-slate-200 py-1.5 px-2 rounded-md">
                  {filteredPosts.length > 0 ? currentIndex + 1 : 0} / {filteredPosts.length}
                </span>
                <Button variant="outline" onClick={nextPost} className="flex-1" size="sm">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 4. Workspace Tools */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">Workspace Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">

              {/* Standard Tools */}
              <Button variant="secondary" className="w-full justify-start text-sm" onClick={() => alert(`Database: ${systemInfo?.database_type || "PostgreSQL"}\nStatus: Connected ✓\nVersion: ${systemInfo?.version || "2.0"}`)}>
                🗄️ Database Info
              </Button>
              <Button variant="secondary" className="w-full justify-start text-sm" onClick={() => alert("Analytics Dashboard\n\nComing soon:\n• Post performance metrics\n• Engagement tracking\n• Campaign ROI analysis\n• A/B testing results")}>
                📊 Analytics
              </Button>
              <Button variant="secondary" className="w-full justify-start text-sm" onClick={() => alert("API Keys & Integrations\n\nComing soon:\n• Platform API keys\n• Webhook configurations\n• Third-party integrations\n• OAuth connections")}>
                🔑 API Keys
              </Button>
              <Button variant="secondary" className="w-full justify-start text-sm" onClick={() => alert("Campaign Sharing\n\nComing soon:\n• Share with team members\n• Public campaign links\n• Embed widgets\n• Collaboration permissions")}>
                🔗 Share Campaign
              </Button>
              <Button variant="secondary" className="w-full justify-start text-sm" onClick={() => alert("Team Messaging\n\nComing soon:\n• Campaign comments\n• @mentions\n• Activity feed\n• Real-time notifications")}>
                💬 Team Chat
              </Button>
              <Button variant="secondary" className="w-full justify-start text-sm" onClick={() => alert("Export Campaign\n\nComing soon:\n• Export to CSV/JSON\n• PDF reports\n• Media archive\n• Analytics export")}>
                📤 Export
              </Button>
              <Button variant="secondary" className="w-full justify-start text-sm" onClick={() => alert("Import Posts\n\nComing soon:\n• CSV/JSON import\n• Bulk post creation\n• Template library\n• Content migration")}>
                📥 Import
              </Button>
              <Button variant="secondary" className="w-full justify-start text-sm" onClick={() => alert("Backup & Restore\n\nComing soon:\n• Automated backups\n• Campaign snapshots\n• Version history\n• Disaster recovery")}>
                💾 Backup
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* COL 2: MIDDLE PANEL (Editor Studio) - Span 5 */}
        <div className="lg:col-span-5 space-y-6">

          {/* Main Editor Card */}
          <Card className="shadow-sm border-slate-200 h-full">
            <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✍️</span>
                <CardTitle className="text-lg text-slate-800">Content Studio</CardTitle>
              </div>
              <div className="flex gap-2">
                <Badge variant={post.status === "Posted" ? "success" : "warning"}>
                  {post.status}
                </Badge>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold border-transparent shadow-sm"
                  onClick={savePost}
                  disabled={isSaving}
                  style={{ backgroundColor: "#16a34a" }}
                >
                  <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold border-transparent shadow-sm ml-2"
                  onClick={async () => {
                    if (confirm("Are you sure you want to finalize this post? This will mark it as 'Posted'.")) {
                      // 1. Update Status locally
                      const updatedPost = { ...post, status: "Posted" as const };
                      // 2. Save via API (re-using logic but forcing status)
                      setIsSaving(true);
                      try {
                        const payload = {
                          ...updatedPost,
                          title: editedTitle,
                          hook_text: editedHook,
                          media_image_url: editedImageUrl,
                          mode: currentMode,
                          campaign_id: selectedCampaignId
                        };
                        const res = await fetch(`${API_BASE_URL}/api/posts/${post.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });
                        if (res.ok) {
                          const savedData = await res.json();
                          const newPosts = [...posts];
                          newPosts[currentIndex] = savedData;
                          setPosts(newPosts);
                          alert("Post Accepted & Finalized! 🚀");
                        }
                      } catch (e) {
                        console.error(e);
                        alert("Error finalizing post.");
                      } finally {
                        setIsSaving(false);
                      }
                    }
                  }}
                  disabled={isSaving || post.status === "Posted"}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Accept & Finalize
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">

              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posting Title</label>
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="font-semibold text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter posting title..."
                />
              </div>

              {/* Hook Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hook / Content</label>
                  <AITextOptimizer text={editedHook} mode={currentMode} onOptimized={setEditedHook} />
                </div>
                <div className="relative">
                  <Textarea
                    value={editedHook}
                    onChange={(e) => setEditedHook(e.target.value)}
                    className="min-h-[200px] text-slate-700 font-mono text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-y p-4 leading-relaxed"
                    placeholder="Write your hook here..."
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-slate-400">
                    {editedHook.length} chars
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" /> AI Rewrite
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Copy className="w-4 h-4 mr-2" /> Copy Text
                </Button>
              </div>

              {/* Platform Previews (Tabs) */}
              <div className="pt-6 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">Platform Preview</label>

                {activePlatforms.length > 0 ? (
                  <Tabs defaultValue={activePlatforms[0].slug} className="w-full">
                    <TabsList className="flex flex-wrap h-auto gap-2 bg-slate-100 p-2 rounded-lg justify-start">
                      {activePlatforms.map((p) => (
                        <TabsTrigger
                          key={p.id}
                          value={p.slug}
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-1 text-xs"
                        >
                          {p.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {activePlatforms.map((p) => (
                      <TabsContent key={p.id} value={p.slug} className="mt-4">
                        <div className="p-4 bg-white rounded-lg border border-slate-200 text-sm text-slate-600 space-y-2">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-slate-900">{p.name} Preview</h3>
                            <span className="text-xs text-slate-400">{editedHook.length} / {p.char_limit} chars</span>
                          </div>

                          {/* Preview Content */}
                          <p className={cn("whitespace-pre-wrap", editedHook.length > p.char_limit ? "text-red-600" : "")}>
                            {editedHook.substring(0, p.char_limit) || "No content..."}
                          </p>

                          {/* Suffix/Hashtags */}
                          {(p.default_hashtags || p.post_suffix) && (
                            <div className="pt-2 text-blue-600 text-xs">
                              {p.default_hashtags} {p.post_suffix}
                            </div>
                          )}

                          <Button size="sm" variant="outline" className="w-full mt-4 text-xs" onClick={() => window.open(p.base_url, "_blank")}>
                            Open {p.name} <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No active platforms. Check Settings ⚙️
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </div>

        {/* COL 3: RIGHT PANEL (Media Studio) - Span 4 */}
        <div className="lg:col-span-4 space-y-6">
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

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*"
                />

                {isEditingMedia && editedImageUrl ? (
                  <div className="h-[400px] bg-slate-100 rounded-lg border border-slate-200 p-2">
                    <MediaEditor
                      imageUrl={editedImageUrl}
                      onCancel={() => setIsEditingMedia(false)}
                      onSave={async (blob) => {
                        try {
                          await navigator.clipboard.write([
                            new ClipboardItem({ "image/png": blob })
                          ]);
                          alert("Image copied to clipboard! Ready to paste.");
                          setIsEditingMedia(false);
                        } catch (err) {
                          console.error("Copy failed", err);
                          alert("Failed to copy image.");
                        }
                      }}
                    />
                  </div>
                ) : (
                  editedImageUrl && editedImageUrl.length > 5 ? (
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editedImageUrl}
                        alt="Social Card"
                        className="w-full h-auto max-h-[600px] object-contain bg-slate-50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement?.classList.add('bg-red-50');
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setIsEditingMedia(true)}>✨ Edit / Overlay</Button>
                        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>Change</Button>
                        <Button variant="destructive" size="sm" onClick={() => setEditedImageUrl("")}>Remove</Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="aspect-video bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 hover:border-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      tabIndex={0}
                      onPaste={handlePaste}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-center pointer-events-none">
                        <div className="mb-2 text-2xl">🖼️</div>
                        <span className="text-sm font-medium">Click to Browse or Paste (Ctrl+V)</span>
                      </div>
                    </div>
                  )
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

      {/* Floating Music Player */}
      {showMusic && (
        <div className="fixed bottom-24 right-6 z-[9999]">
          <MusicPlayer onClose={() => setShowMusic(false)} />
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        open={showCreateCampaign}
        onOpenChange={setShowCreateCampaign}
        onCreate={handleCreateCampaign}
      />
    </div>
  );
}

// --- Minimal UI Components (Inline for Prototype Speed) ---
// Button component removed as it is now imported from @/components/ui/button

function Badge({ children, variant }: { children: React.ReactNode, variant?: string }) {
  const colors = variant === "success" ? "bg-green-100 text-green-800 border border-green-200" : "bg-amber-100 text-amber-800 border border-amber-200";
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors}`}>{children}</span>;
}
