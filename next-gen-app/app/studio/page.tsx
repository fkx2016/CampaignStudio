"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Twitter, Facebook, Linkedin, Instagram, Youtube, MessageCircle, Cloud, Flame, AlertCircle, Check, PlusCircle, X as XIcon, Globe, Mail, Zap, Rocket, Copy, Smartphone, FileText, Building, Calculator, Hash, User, Plus, Music, ChevronLeft, ChevronRight, Heart, Coffee, CreditCard, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import ModeSwitcher from "@/components/mode-switcher/ModeSwitcher";
import MusicPlayer from "@/components/MusicPlayer";
import MediaEditor from "@/components/MediaEditor";
import AITextOptimizer from "@/components/AITextOptimizer";
import CampaignEditModal from "@/components/CampaignEditModal";
import { CampaignPost } from "@/types/schema";

// --- TYPES ---
interface MockCampaign {
    id: number;
    title: string;
    mode: string;
    description: string;
}

interface MockPlatform {
    name: string;
    slug: string;
    base_url: string;
    intent_url: string;
    icon: string;
    category: string;
    description: string;
    path_label: string;
}

// --- MOCK DATA (CLASSIC CAMPAIGN STUDIO) ---
const MOCK_PLATFORMS: MockPlatform[] = [
    // --- SOCIAL (8) ---
    { name: "X (Twitter)", slug: "x", base_url: "https://twitter.com/compose/tweet", intent_url: "https://twitter.com/intent/tweet?text={text}", icon: "Twitter", category: "Social", description: "Short-form updates", path_label: "/intent/tweet" },
    { name: "LinkedIn", slug: "linkedin", base_url: "https://www.linkedin.com/feed/", intent_url: "https://www.linkedin.com/feed/?shareActive=true&text={text}", icon: "Linkedin", category: "Professional", description: "B2B & Networking", path_label: "/feed?share" },
    { name: "Facebook", slug: "facebook", base_url: "https://www.facebook.com/", intent_url: "", icon: "Facebook", category: "Social", description: "Community & Groups", path_label: "/home" },
    { name: "Instagram", slug: "instagram", base_url: "https://www.instagram.com/", intent_url: "", icon: "Instagram", category: "Social", description: "Photo & Reels", path_label: "/create" },
    { name: "Reddit", slug: "reddit", base_url: "https://www.reddit.com/submit", intent_url: "https://www.reddit.com/submit?title={title}&text={text}", icon: "MessageCircle", category: "Social", description: "Niche Communities", path_label: "/submit" },
    { name: "Pinterest", slug: "pinterest", base_url: "https://www.pinterest.com/", intent_url: "", icon: "Globe", category: "Social", description: "Inspiration & DIY", path_label: "/pin/create" },
    { name: "TikTok", slug: "tiktok", base_url: "https://www.tiktok.com/", intent_url: "", icon: "Smartphone", category: "Social", description: "Viral Video", path_label: "/upload" },
    { name: "Snapchat", slug: "snapchat", base_url: "https://www.snapchat.com/", intent_url: "", icon: "Smartphone", category: "Social", description: "Ephemeral Content", path_label: "/story" },

    // --- VIDEO (4) ---
    { name: "YouTube", slug: "youtube", base_url: "https://studio.youtube.com/", intent_url: "", icon: "Youtube", category: "Video", description: "Long-form Video", path_label: "/upload" },
    { name: "Twitch", slug: "twitch", base_url: "https://dashboard.twitch.tv/", intent_url: "", icon: "Globe", category: "Video", description: "Live Streaming", path_label: "/stream" },
    { name: "Vimeo", slug: "vimeo", base_url: "https://vimeo.com/upload", intent_url: "", icon: "Globe", category: "Video", description: "Professional Video", path_label: "/upload" },
    { name: "Rumble", slug: "rumble", base_url: "https://rumble.com/upload.php", intent_url: "", icon: "Globe", category: "Video", description: "Alt Video Platform", path_label: "/upload" },

    // --- BLOGGING / TEXT (4) ---
    { name: "Medium", slug: "medium", base_url: "https://medium.com/new-story", intent_url: "", icon: "FileText", category: "Blogging", description: "Long-form Articles", path_label: "/new-story" },
    { name: "Substack", slug: "substack", base_url: "https://substack.com/publish", intent_url: "", icon: "FileText", category: "Blogging", description: "Newsletters", path_label: "/publish" },
    { name: "WordPress", slug: "wordpress", base_url: "https://wordpress.com/post", intent_url: "", icon: "Globe", category: "Blogging", description: "CMS & Blogs", path_label: "/post" },
    { name: "Ghost", slug: "ghost", base_url: "https://ghost.org/", intent_url: "", icon: "Globe", category: "Blogging", description: "Indie Publishing", path_label: "/admin" },

    // --- MESSAGING & COMMUNITY (4) ---
    { name: "Discord", slug: "discord", base_url: "https://discord.com/app", intent_url: "", icon: "MessageCircle", category: "Community", description: "Chat & Servers", path_label: "/app" },
    { name: "Telegram", slug: "telegram", base_url: "https://web.telegram.org/k/", intent_url: "https://t.me/share/url?url={url}&text={text}", icon: "Send", category: "Messaging", description: "Direct Broadcasts", path_label: "/share" },
    { name: "WhatsApp", slug: "whatsapp", base_url: "https://web.whatsapp.com/", intent_url: "https://wa.me/?text={text}", icon: "MessageCircle", category: "Messaging", description: "Global Chat", path_label: "/send" },
    { name: "Slack", slug: "slack", base_url: "https://slack.com/", intent_url: "", icon: "Hash", category: "Messaging", description: "Team Updates", path_label: "/app" },

    // --- TECH & DEV (5) ---
    { name: "GitHub", slug: "github", base_url: "https://github.com/", intent_url: "", icon: "Globe", category: "Tech", description: "Code & Open Source", path_label: "/new" },
    { name: "ProductHunt", slug: "producthunt", base_url: "https://www.producthunt.com/", intent_url: "", icon: "Flame", category: "Tech", description: "Launches", path_label: "/submit" },
    { name: "HackerNews", slug: "hackernews", base_url: "https://news.ycombinator.com/submit", intent_url: "", icon: "Globe", category: "Tech", description: "Tech News", path_label: "/submit" },
    { name: "Dev.to", slug: "devto", base_url: "https://dev.to/new", intent_url: "", icon: "Globe", category: "Tech", description: "Dev Blogging", path_label: "/new" },
    { name: "IndieHackers", slug: "indiehackers", base_url: "https://www.indiehackers.com/", intent_url: "", icon: "Globe", category: "Tech", description: "Founders", path_label: "/submit" },

    // --- OPERATIONS (Techs) (5) ---
    { name: "Email Client", slug: "email", base_url: "mailto:", intent_url: "mailto:?subject={title}&body={text}", icon: "Mail", category: "Operations", description: "Direct Communication", path_label: "mailto:" },
    { name: "QuickBooks", slug: "quickbooks", base_url: "https://quickbooks.intuit.com/login", intent_url: "https://qbo.intuit.com/app/invoice?memo={text}", icon: "Calculator", category: "Operations", description: "Invoicing", path_label: "/invoice" },
    { name: "Gov Portal", slug: "gov", base_url: "https://www.foia.gov/", intent_url: "", icon: "Building", category: "Operations", description: "FOIA / Compliance", path_label: "/request" },
    { name: "Google Drive", slug: "drive", base_url: "https://drive.google.com/", intent_url: "", icon: "Cloud", category: "Operations", description: "File Storage", path_label: "/drive" },
    { name: "Trello/Jira", slug: "kanban", base_url: "https://trello.com/", intent_url: "", icon: "FileText", category: "Operations", description: "Project Mgmt", path_label: "/boards" },
];

// --- CAMPAIGNS (New Hierarchy Layer) ---
const INITAL_CAMPAIGNS: MockCampaign[] = [
    // E-BEG
    { id: 1, title: "Emergency Surgery Fund", mode: "ebeg", description: "Medical emergency fundraising for family." },
    { id: 2, title: "Community Garden Project", mode: "ebeg", description: "Local green space initiative." },
    // POLITICAL
    { id: 3, title: "Save Our Park", mode: "political", description: "Local advocacy against development." },
    { id: 4, title: "Voter Registration", mode: "political", description: "Get out the vote drive." },
    // CONTENT
    { id: 5, title: "Productivity Series", mode: "content", description: "Tips giving advice on remote work." },
    { id: 6, title: "Learn to Code", mode: "content", description: "Educational thread for beginners." },
    // PROMOTION
    { id: 7, title: "BFCM Sale", mode: "promotion", description: "Black Friday Cyber Monday push." },
    { id: 8, title: "Spring Collection", mode: "promotion", description: "New seasonal product launch." },
    // OPERATIONS
    { id: 9, title: "Q3 Financials", mode: "operations", description: "Quarterly closing tasks." },
    { id: 10, title: "IT Infrastructure", mode: "operations", description: "Server and security maintenance." },
];

const MOCK_POSTS: Partial<CampaignPost>[] = [
    // --- E-BEG (Campaign 1: Surgery) ---
    { id: 1, title: "The Diagnosis", hook_text: "I never thought I'd ask for help. But we are $5k short for the operation. Please help us reach our goal.", mode: "ebeg", category_primary: "Medical", campaign_id: 1, status: "Pending", media_image_url: "https://images.unsplash.com/photo-1584515933487-779824d29309" },
    { id: 2, title: "Surgery Update", hook_text: "The date is set. We are halfway to the goal. Thank you all.", mode: "ebeg", category_primary: "Medical", campaign_id: 1, status: "Pending", media_image_url: "" },
    { id: 3, title: "Thank You / Recovery", hook_text: "Max is out of surgery and doing well! Here is a pic of him resting.", mode: "ebeg", category_primary: "Medical", campaign_id: 1, status: "Posted", media_image_url: "" },

    // --- E-BEG (Campaign 2: Garden) ---
    { id: 4, title: "We Need Seeds", hook_text: "Help us buy seeds and tools for the new downtown community garden. Green spaces matter!", mode: "ebeg", category_primary: "Community", campaign_id: 2, status: "Pending", media_image_url: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735" },
    { id: 5, title: "Volunteers Needed", hook_text: "Digging day is Saturday! Who can bring a shovel?", mode: "ebeg", category_primary: "Community", campaign_id: 2, status: "Posted", media_image_url: "" },

    // --- POLITICAL (Campaign 3: Park) ---
    { id: 6, title: "Stop the Bulldozers", hook_text: "They want to pave our park. Sign the petition now and call the mayor.", mode: "political", category_primary: "Local", campaign_id: 3, status: "Pending", media_image_url: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735" },
    { id: 7, title: "Town Hall Alert", hook_text: "Show up tonight at 7PM. Our kids' playground is on the ballot.", mode: "political", category_primary: "Local", campaign_id: 3, status: "Posted", media_image_url: "" },
    { id: 8, title: "Victory!", hook_text: "We did it! The council voted NO on the development. The park is safe.", mode: "political", category_primary: "Local", campaign_id: 3, status: "Pending", media_image_url: "" },

    // --- POLITICAL (Campaign 4: Voter) ---
    { id: 9, title: "Registration Deadline", hook_text: "Are you registered? The deadline is tomorrow. Check your status here.", mode: "political", category_primary: "National", campaign_id: 4, status: "Posted", media_image_url: "" },
    { id: 10, title: "Early Voting Starts", hook_text: "Lines are short today! Go cast your ballot early.", mode: "political", category_primary: "National", campaign_id: 4, status: "Pending", media_image_url: "" },

    // --- CONTENT (Campaign 5: Productivity) ---
    { id: 11, title: "5 Remote Work Tips", hook_text: "Stop working from bed. Here's how to triple your output with deep work blocks. 🧵", mode: "content", category_primary: "Productivity", campaign_id: 5, status: "Posted", media_image_url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174" },
    { id: 12, title: "My Morning Routine", hook_text: "5AM Club: Cold plunge, journal, and deep work. Try it for a week.", mode: "content", category_primary: "Lifestyle", campaign_id: 5, status: "Pending", media_image_url: "" },
    { id: 13, title: "Focus Tool Stack", hook_text: "The 3 apps I use to block distractions and stay in flow.", mode: "content", category_primary: "Productivity", campaign_id: 5, status: "Pending", media_image_url: "" },

    // --- CONTENT (Campaign 6: Code) ---
    { id: 14, title: "Coding for Beginners", hook_text: "You don't need a math degree to code. Here is the roadmap I used.", mode: "content", category_primary: "Tech", campaign_id: 6, status: "Posted", media_image_url: "" },
    { id: 15, title: "Best VS Code Extensions", hook_text: "Prettier, ESLint, and GitLens. Install these immediately.", mode: "content", category_primary: "Tech", campaign_id: 6, status: "Pending", media_image_url: "" },

    // --- PROMOTION (Campaign 7: BFCM) ---
    { id: 16, title: "Black Friday Teaser", hook_text: "Something big is coming. Turn on notifications.", mode: "promotion", category_primary: "Retail", campaign_id: 7, status: "Pending", media_image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da" },
    { id: 17, title: "Sale is Live!", hook_text: "50% OFF everything! Go go go! 🚨", mode: "promotion", category_primary: "Retail", campaign_id: 7, status: "Posted", media_image_url: "" },
    { id: 18, title: "Last Chance", hook_text: "Only 4 hours left. Cart expires at midnight.", mode: "promotion", category_primary: "Retail", campaign_id: 7, status: "Pending", media_image_url: "" },

    // --- PROMOTION (Campaign 8: Spring) ---
    { id: 19, title: "Spring Collection Drop", hook_text: "Fresh florals and pastels. The Spring Collection drops tomorrow.", mode: "promotion", category_primary: "Retail", campaign_id: 8, status: "Pending", media_image_url: "" },
    { id: 20, title: "Lookbook Video", hook_text: "Watch the BTS of our spring shoot. 🌸", mode: "promotion", category_primary: "Retail", campaign_id: 8, status: "Posted", media_image_url: "" },

    // --- OPERATIONS (Campaign 9: Q3) ---
    { id: 21, title: "Q3 Vendor Payments", hook_text: "Invoice #4402 attached. Please process by Friday.", mode: "operations", category_primary: "Finance", campaign_id: 9, status: "Pending", media_image_url: "" },
    { id: 22, title: "Tax Deduction List", hook_text: "Charitable contributions summary for Q3.", mode: "operations", category_primary: "Accounting", campaign_id: 9, status: "Posted", media_image_url: "" },
    { id: 23, title: "Budget Review Meeting", hook_text: "Slides for Monday's budget review are ready.", mode: "operations", category_primary: "Finance", campaign_id: 9, status: "Pending", media_image_url: "" },

    // --- OPERATIONS (Campaign 10: IT) ---
    { id: 24, title: "Server Maintenance", hook_text: "Downtime expected Sunday 2AM-4AM for patching.", mode: "operations", category_primary: "IT", campaign_id: 10, status: "Pending", media_image_url: "" },
    { id: 25, title: "Security Audit", hook_text: "Please enable 2FA on all admin accounts by EOD.", mode: "operations", category_primary: "IT", campaign_id: 10, status: "Posted", media_image_url: "" },
];

export default function StudioPage() {
    const router = useRouter();

    // STATE - MASTER LISTS (In-Memory Database)
    const [allCampaigns, setAllCampaigns] = useState(INITAL_CAMPAIGNS);
    const [allPosts, setAllPosts] = useState(MOCK_POSTS);

    // STATE - SELECTION & FILTERING
    const [currentMode, setCurrentMode] = useState("ebeg");
    const [currentCampaignId, setCurrentCampaignId] = useState<number>(1);

    // Derived State (Filtered)
    const posts = allPosts.filter(p => p.campaign_id === currentCampaignId);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showMusic, setShowMusic] = useState(false);
    const [isEditingMedia, setIsEditingMedia] = useState(false);
    const [isEditingCampaign, setIsEditingCampaign] = useState(false); // State for Campaign Edit Modal
    const [editingCampaignData, setEditingCampaignData] = useState<{ id: number, title: string } | undefined>(undefined); // Data for the modal
    const [showDonate, setShowDonate] = useState(false);

    // Platform Selection State - Initialize with varied categories
    const [activePlatformSlugs, setActivePlatformSlugs] = useState<string[]>(["x", "linkedin", "email"]);
    const [showPlatformSelector, setShowPlatformSelector] = useState(false);

    // Fake User
    const user = { full_name: "Visitor" };

    // Update Campaign Selection when Mode Changes
    useEffect(() => {
        // Find first campaign for this mode
        const modeCampaigns = allCampaigns.filter(c => c.mode === currentMode);
        if (modeCampaigns.length > 0) {
            setCurrentCampaignId(modeCampaigns[0].id);
        } else {
            setCurrentCampaignId(0);
        }
    }, [currentMode, allCampaigns]);

    // Ensure Current Index is Valid when Posts Change
    useEffect(() => {
        if (posts.length > 0 && currentIndex >= posts.length) {
            setCurrentIndex(0);
        }
    }, [posts.length, currentIndex]);

    const post = posts[currentIndex]; // Safe derived value
    const activeCampaign = allCampaigns.find(c => c.id === currentCampaignId); // Get current campaign details

    // LOCAL STATE HANDLERS (with Auto-Save Buffer)
    const [editedTitle, setEditedTitle] = useState("");
    const [editedHook, setEditedHook] = useState("");
    const [editedImageUrl, setEditedImageUrl] = useState("");

    // Sync Local State from Post when Post Changes
    useEffect(() => {
        if (post) {
            setEditedTitle(post.title || "");
            setEditedHook(post.hook_text || "");
            setEditedImageUrl(post.media_image_url || "");
        }
    }, [post]);

    // HANDLERS
    const handleUpdatePost = (updates: Partial<CampaignPost>) => {
        if (!post) return;
        setAllPosts(prev => prev.map(p => p.id === post.id ? { ...p, ...updates } : p));
    };

    const handleUpdateCampaign = (updates: Partial<MockCampaign>) => {
        if (!activeCampaign) return;
        setAllCampaigns(prev => prev.map(c => c.id === activeCampaign.id ? { ...c, ...updates } : c));
    };

    // NOTE: handleNewCampaign logic moved to Modal onSave


    const handleNewPost = () => {
        const newP: Partial<CampaignPost> = {
            id: Date.now(),
            title: "New Task",
            hook_text: "",
            mode: currentMode,
            status: "Pending",
            campaign_id: currentCampaignId,
            category_primary: "General",
            media_image_url: ""
        };
        setAllPosts([...allPosts, newP as CampaignPost]);
        // Auto-select the new post (it will be at the end of the filtered list)
        setTimeout(() => setCurrentIndex(posts.length), 0);
    };

    const handleNextPost = () => {
        if (posts.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % posts.length);
    };

    const handlePrevPost = () => {
        if (posts.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
    };

    // SMART LAUNCH LOGIC
    const handleLaunch = (plat: MockPlatform) => {
        if (plat.intent_url) {
            const encodedText = encodeURIComponent(editedHook);
            const encodedTitle = encodeURIComponent(editedTitle);
            const finalUrl = plat.intent_url
                .replace("{text}", encodedText)
                .replace("{title}", encodedTitle)
                .replace("{url}", "https://campaign.studio");
            window.open(finalUrl, "_blank");
        } else {
            navigator.clipboard.writeText(editedHook).then(() => {
                window.open(plat.base_url, "_blank");
            }).catch(err => {
                window.open(plat.base_url, "_blank");
            });
        }
    };

    const togglePlatform = (slug: string) => {
        if (activePlatformSlugs.includes(slug)) {
            setActivePlatformSlugs(activePlatformSlugs.filter(s => s !== slug));
        } else {
            setActivePlatformSlugs([...activePlatformSlugs, slug]);
        }
    };

    const activePlatforms = MOCK_PLATFORMS.filter(p => activePlatformSlugs.includes(p.slug));
    const postCount = posts.length;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

            {/* HEADER */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/ChristmasStar.png" alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">CampaignStudio</span>
                    </Link>
                    <span className="hidden sm:inline-flex px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full border border-green-200">Pro Studio</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="hidden md:inline text-sm font-medium text-slate-600">
                        Hi, <span className="text-slate-900 font-bold">{user.full_name}</span>
                    </span>
                    <Link href="/pricing">
                        <Button size="sm" className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 font-bold shadow-md hover:shadow-lg hover:from-amber-500 hover:to-orange-600">
                            <Zap className="w-4 h-4 mr-1 fill-current" /> Upgrade to Pro
                        </Button>
                    </Link>
                    <div className="h-8 w-1 bg-slate-200 rounded-full" />
                    <Button variant="ghost" size="sm" onClick={() => router.push("/login")} className="text-slate-500 hover:text-blue-600">
                        Log Out
                    </Button>
                </div>
            </header>

            {/* MAIN LAYOUT */}
            <div className="pt-20 px-6 max-w-[1600px] mx-auto grid grid-cols-12 gap-6 h-[calc(100vh-2rem)]">

                {/* LEFT: MODE SELECTOR & CAMPAIGNS (COMPACT) */}
                <aside className="col-span-12 md:col-span-3 lg:col-span-3 flex flex-col gap-4 overflow-hidden">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-md">1</div>
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select</h2>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Select / Create Modes</label>
                        <ModeSwitcher currentMode={currentMode} onModeChange={setCurrentMode} />
                    </div>

                    {/* CAMPAIGN SELECTOR */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <select
                                    className="flex-1 bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                                    value={currentCampaignId}
                                    onChange={(e) => setCurrentCampaignId(Number(e.target.value))}
                                >
                                    {allCampaigns.filter(c => c.mode === currentMode).map(campaign => (
                                        <option key={campaign.id} value={campaign.id}>
                                            {campaign.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                        setEditingCampaignData(activeCampaign);
                                        setIsEditingCampaign(true);
                                    }}
                                    title="Edit Campaign Name"
                                    disabled={!activeCampaign}
                                >
                                    <FileText className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                        setEditingCampaignData({ id: 0, title: "" });
                                        setIsEditingCampaign(true);
                                    }}
                                    title="New Campaign"
                                >
                                    <Plus className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
                        <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-500 uppercase tracking-wider flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span>Select / Create Posts</span>
                                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{postCount}/50</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                onClick={handleNewPost}
                                title="New Post"
                            >
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>

                        <div className="p-2 space-y-1 overflow-y-auto flex-1 bg-slate-50/30">
                            {posts.map((p, idx) => (
                                <div
                                    key={p.id}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={cn(
                                        "flex items-center gap-2 p-2 rounded border cursor-pointer transition-all group",
                                        idx === currentIndex
                                            ? "bg-white border-blue-400 shadow-sm ring-1 ring-blue-400/20"
                                            : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30"
                                    )}>
                                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0", p.status === "Posted" ? "bg-green-500" : "bg-slate-300")} />
                                    <div className="flex-1 min-w-0">
                                        <h4 className={cn("font-bold text-xs truncate", idx === currentIndex ? "text-slate-900" : "text-slate-700")}>
                                            {p.title || "Untitled"}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                            <span className="truncate">{p.category_primary}</span>
                                            {p.media_image_url && <span className="text-blue-500 flex items-center gap-0.5">● Media</span>}
                                        </div>
                                    </div>
                                    {idx === currentIndex && <div className="w-1 h-6 bg-blue-500 rounded-full mr-[-4px]"></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* CENTER: EDITOR */}
                <main className="col-span-12 md:col-span-6 lg:col-span-6 flex flex-col gap-4 pb-20 overflow-y-auto no-scrollbar">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-md">2</div>
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Create Content</h2>
                    </div>

                    <div className="px-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select / Create / Edit / Save / a POST</label>
                    </div>



                    {post ? (
                        <>
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 relative hover:shadow-md transition-shadow">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject / Title</label>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={handlePrevPost} className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                            <ChevronLeft className="w-5 h-5" />
                                        </Button>
                                        <Input
                                            value={editedTitle}
                                            onChange={(e) => {
                                                setEditedTitle(e.target.value);
                                                handleUpdatePost({ title: e.target.value });
                                            }}
                                            className="text-xl font-bold border-none px-2 shadow-none focus-visible:ring-0 placeholder:text-slate-300 flex-1 text-center"
                                            placeholder="Enter subject..."
                                        />
                                        <Button variant="ghost" size="icon" onClick={handleNextPost} className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message Body</label>
                                        <AITextOptimizer
                                            text={editedHook}
                                            mode={currentMode}
                                            onOptimized={(text) => {
                                                setEditedHook(text);
                                                handleUpdatePost({ hook_text: text });
                                            }}
                                        />
                                    </div>
                                    <Textarea
                                        value={editedHook}
                                        onChange={(e) => {
                                            setEditedHook(e.target.value);
                                            handleUpdatePost({ hook_text: e.target.value });
                                        }}
                                        className="min-h-[200px] text-lg leading-relaxed border-slate-200 focus-visible:ring-blue-500/20 resize-none p-4"
                                        placeholder="Draft your message..."
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visual Assets</span>
                                    <Button variant="outline" size="sm" onClick={() => setIsEditingMedia(!isEditingMedia)}>
                                        {isEditingMedia ? "Close Studio" : "Open Studio"}
                                    </Button>
                                </div>
                                {isEditingMedia ? (
                                    <div className="p-0 animate-in slide-in-from-top-4 duration-300">
                                        <MediaEditor
                                            imageUrl={editedImageUrl}
                                            onSave={(blob: Blob) => {
                                                // Handle blob -> url conversion here ideally, or strictly just mock it
                                                setIsEditingMedia(false);
                                            }}
                                            onCancel={() => setIsEditingMedia(false)}
                                        />
                                    </div>
                                ) : (
                                    <div className="p-8 flex justify-center items-center bg-slate-50 min-h-[200px] cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => setIsEditingMedia(true)}>
                                        {editedImageUrl ? (
                                            <div className="relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={editedImageUrl} alt="Campaign Visual" className="rounded-lg shadow-md max-h-[300px] object-cover" />
                                            </div>
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto mb-3 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    <ExternalLink className="w-6 h-6" />
                                                </div>
                                                <p>Add Attachments</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">Select a task to edit</div>
                    )}
                </main>

                {/* RIGHT: CHANNELS (Deployment) */}
                <aside className="col-span-12 md:col-span-3 lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
                    <div className="flex items-center gap-2 px-1 justify-between w-full">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-md">3</div>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">POST the Post to a Platform</h2>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowPlatformSelector(true)}>
                            <PlusCircle className="w-3 h-3 mr-1" /> Add
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {activePlatforms.length === 0 && (
                            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                                No operations selected.
                                <Button variant="link" onClick={() => setShowPlatformSelector(true)}>Add Destinations</Button>
                            </div>
                        )}

                        {activePlatforms.map((plat) => (
                            <div key={plat.slug} className="bg-white rounded border border-slate-200 p-1.5 shadow-sm hover:shadow-md transition-all group relative flex items-center justify-between gap-2">
                                {/* Remove Button (Hover only) */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); togglePlatform(plat.slug); }}
                                    className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-slate-200 rounded-full p-0.5 text-slate-400 hover:text-red-500 transition-all z-10"
                                    title="Remove"
                                >
                                    <XIcon className="w-3 h-3" />
                                </button>

                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {/* DYNAMIC ICON RENDERER WITH NEW ICONS */}
                                    <div className={cn("w-6 h-6 rounded bg-slate-50 flex-shrink-0 flex items-center justify-center transition-colors", plat.category === "Operations" ? "text-purple-600 group-hover:bg-purple-50" : "text-slate-600 group-hover:bg-blue-50")}>
                                        {plat.icon === 'Twitter' && <Twitter className="w-3 h-3" />}
                                        {plat.icon === 'Linkedin' && <Linkedin className="w-3 h-3" />}
                                        {plat.icon === 'Facebook' && <Facebook className="w-3 h-3" />}
                                        {plat.icon === 'Instagram' && <Instagram className="w-3 h-3" />}
                                        {plat.icon === 'Youtube' && <Youtube className="w-3 h-3" />}
                                        {plat.icon === 'Mail' && <Mail className="w-3 h-3" />}
                                        {plat.icon === 'Calculator' && <Calculator className="w-3 h-3" />}
                                        {plat.icon === 'Building' && <Building className="w-3 h-3" />}
                                        {plat.icon === 'FileText' && <FileText className="w-3 h-3" />}
                                        {plat.icon === 'Hash' && <Hash className="w-3 h-3" />}
                                        {plat.icon === 'MessageCircle' && <MessageCircle className="w-3 h-3" />}
                                        {plat.icon === 'Zap' && <Zap className="w-3 h-3" />}
                                        {!['Twitter', 'Linkedin', 'Facebook', 'Instagram', 'Youtube', 'Mail', 'Calculator', 'Building', 'FileText', 'Hash', 'MessageCircle', 'Zap'].includes(plat.icon) && <Globe className="w-3 h-3" />}
                                    </div>
                                    <div className="flex items-baseline gap-2 min-w-0 overflow-hidden">
                                        <h4 className="font-bold text-slate-800 text-xs whitespace-nowrap">{plat.name}</h4>
                                    </div>
                                </div>

                                <Button
                                    className={cn(
                                        "flex-shrink-0 text-white transition-colors shadow-sm text-[10px] h-6 px-2.5",
                                        plat.intent_url ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-900 hover:bg-slate-700"
                                    )}
                                    onClick={() => handleLaunch(plat)}
                                >
                                    {plat.intent_url ? <Rocket className="w-3 h-3 mr-1.5" /> : <Copy className="w-3 h-3 mr-1.5" />}
                                    {plat.intent_url ? "Launch" : "Copy"}
                                </Button>
                            </div>
                        ))}
                    </div>
                </aside>

            </div>

            {/* PLATFORM SELECTOR MODAL */}
            {
                showPlatformSelector && (
                    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Configure Destinations</h2>
                                    <p className="text-slate-500 text-sm">Select platforms, portals, or tools to act upon.</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowPlatformSelector(false)}>
                                    <XIcon className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {MOCK_PLATFORMS.map((plat) => {
                                        const isActive = activePlatformSlugs.includes(plat.slug);
                                        return (
                                            <div
                                                key={plat.slug}
                                                onClick={() => togglePlatform(plat.slug)}
                                                className={cn(
                                                    "relative flex flex-col items-start p-4 rounded-xl border-2 cursor-pointer transition-all",
                                                    isActive
                                                        ? "bg-white border-blue-600 shadow-md ring-1 ring-blue-600/20"
                                                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                )}
                                            >
                                                {isActive && (
                                                    <div className="absolute top-3 right-3 text-blue-600">
                                                        <Check className="w-5 h-5 bg-blue-100 rounded-full p-0.5" />
                                                    </div>
                                                )}

                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-slate-100 text-slate-400">
                                                    <Globe className="w-5 h-5" />
                                                </div>

                                                <h3 className="font-bold text-slate-900 text-sm">{plat.name}</h3>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{plat.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
                                <Link href="/pricing">
                                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-bold">
                                        <Zap className="w-3 h-3 mr-1 fill-current" /> Upgrade to Pro to Save
                                    </Button>
                                </Link>
                                <Button onClick={() => setShowPlatformSelector(false)} className="px-8">
                                    Done
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* CAMPAIGN EDIT MODAL */}
            <CampaignEditModal
                open={isEditingCampaign}
                onOpenChange={setIsEditingCampaign}
                campaign={editingCampaignData}
                onSave={(id, newTitle) => {
                    if (id === 0) {
                        // CREATE
                        const newId = Date.now();
                        const newCamp: MockCampaign = {
                            id: newId,
                            title: newTitle,
                            mode: currentMode,
                            description: "New Campaign"
                        };
                        setAllCampaigns([...allCampaigns, newCamp]);
                        setCurrentCampaignId(newId);
                    } else {
                        // UPDATE
                        setAllCampaigns(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
                    }
                }}
            />

            {/* FLOATING MUSIC PLAYER */}
            {showMusic && (
                <div className="fixed bottom-24 right-6 z-[9999]">
                    <MusicPlayer onClose={() => setShowMusic(false)} />
                </div>
            )}

            {/* FLOATING ACTION BAR */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-full shadow-2xl border border-slate-200 p-2 flex items-center gap-2 z-40">
                <Button variant={showMusic ? "secondary" : "ghost"} size="icon" className="rounded-full text-slate-600" onClick={() => setShowMusic(!showMusic)}>
                    <Music className="w-5 h-5" />
                </Button>
                <div className="w-px h-6 bg-slate-200" />
                <a href="mailto:fkurka@gmail.com?subject=Campaign Studio Feedback">
                    <Button variant="ghost" className="rounded-full text-slate-600 px-4 gap-2">
                        <Mail className="w-5 h-5" />
                        <span className="text-xs font-bold">Email the Developer</span>
                    </Button>
                </a>
                <div className="w-px h-6 bg-slate-200" />
                <Button variant="ghost" className="rounded-full text-slate-600 px-4 gap-2 hover:text-pink-600 hover:bg-pink-50" onClick={() => setShowDonate(true)}>
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="text-xs font-bold">Donate?</span>
                </Button>
            </div>

            {/* DONATE MODAL */}
            {showDonate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
                        <button onClick={() => setShowDonate(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 bg-white/50 rounded-full p-1">
                            <XIcon className="w-5 h-5" />
                        </button>

                        <div className="p-8 pb-4 text-center space-y-2">
                            <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 fill-current" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Support the Dev</h2>
                            <p className="text-slate-500 text-sm">If this tool saves you time, consider buying me a coffee! ☕</p>
                        </div>

                        <div className="p-6 space-y-3">
                            <a href="https://buymeacoffee.com/tttb" target="_blank" rel="noopener noreferrer" className="block transform transition-transform hover:scale-[1.02]">
                                <div className="bg-[#FFDD00] text-slate-900 font-bold p-3 rounded-xl flex items-center justify-between px-4 hover:shadow-lg hover:bg-[#FFEA40] transition-all">
                                    <div className="flex items-center gap-3">
                                        <Coffee className="w-5 h-5" />
                                        <span>Buy Me a Coffee</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4 opacity-50" />
                                </div>
                            </a>

                            <a href="https://www.paypal.com/biz/profile/talktothebook" target="_blank" rel="noopener noreferrer" className="block transform transition-transform hover:scale-[1.02]">
                                <div className="bg-[#0070BA] text-white font-bold p-3 rounded-xl flex items-center justify-between px-4 hover:shadow-lg hover:bg-[#005EA6] transition-all">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-5 h-5" />
                                        <span>PayPal</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4 opacity-50" />
                                </div>
                            </a>

                            <a href="https://cash.app/$fkxcash" target="_blank" rel="noopener noreferrer" className="block transform transition-transform hover:scale-[1.02]">
                                <div className="bg-[#00D632] text-white font-bold p-3 rounded-xl flex items-center justify-between px-4 hover:shadow-lg hover:bg-[#00C22D] transition-all">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="w-5 h-5" />
                                        <span>Cash App</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4 opacity-50" />
                                </div>
                            </a>
                        </div>
                        <div className="bg-slate-50 p-3 text-center text-xs text-slate-400">
                            Thank you for your support! ❤️
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
