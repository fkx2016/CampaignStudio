"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    ExternalLink, Twitter, Facebook, Linkedin, Instagram, Youtube,
    Send, MessageCircle, Cloud, Flame, AlertCircle, Check, PlusCircle,
    X as XIcon, Globe, Mail, Zap, Rocket, Copy, Smartphone, FileText,
    Building, Calculator, Hash, User, Plus, Music,
    Folder, FolderOpen, ChevronRight, ChevronDown, Scale, Users, Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import MusicPlayer from "@/components/MusicPlayer";
import MediaEditor from "@/components/MediaEditor";
import AITextOptimizer from "@/components/AITextOptimizer";

// --- MOCK DATA ---

const MOCK_DOMAINS = [
    { id: "accounting", name: "Accounting", icon: "Calculator" },
    { id: "government", name: "Government", icon: "Building" },
    { id: "social", name: "Social", icon: "Users" },
    { id: "legal", name: "Legal", icon: "Scale" },
];

const MOCK_PLATFORMS = [
    // SOCIAL
    { name: "X (Twitter)", slug: "x", domain: "social", base_url: "https://twitter.com/compose/tweet", intent_url: "https://twitter.com/intent/tweet?text={text}", icon: "Twitter", description: "Short-form updates" },
    { name: "LinkedIn", slug: "linkedin", domain: "social", base_url: "https://www.linkedin.com/feed/", intent_url: "https://www.linkedin.com/feed/?shareActive=true&text={text}", icon: "Linkedin", description: "B2B & Networking" },
    { name: "Reddit", slug: "reddit", domain: "social", base_url: "https://www.reddit.com/submit", intent_url: "https://www.reddit.com/submit?title={title}&text={text}", icon: "MessageCircle", description: "Niche Communities" },
    { name: "Facebook", slug: "facebook", domain: "social", base_url: "https://www.facebook.com/", intent_url: "", icon: "Facebook", description: "Community & Groups" },
    { name: "Instagram", slug: "instagram", domain: "social", base_url: "https://www.instagram.com/", intent_url: "", icon: "Instagram", description: "Visual" },

    // ACCOUNTING
    { name: "QuickBooks", slug: "quickbooks", domain: "accounting", base_url: "https://quickbooks.intuit.com/login", intent_url: "https://qbo.intuit.com/app/invoice?memo={text}", icon: "Calculator", description: "Invoicing & Finance" },
    { name: "Xero", slug: "xero", domain: "accounting", base_url: "https://login.xero.com/", intent_url: "", icon: "FileText", description: "Accounting Software" },
    { name: "Expensify", slug: "expensify", domain: "accounting", base_url: "https://www.expensify.com/", intent_url: "", icon: "FileText", description: "Expense Management" },

    // GOVERNMENT
    { name: "FOIA.gov", slug: "foia", domain: "government", base_url: "https://www.foia.gov/", intent_url: "https://www.foia.gov/request/agency-component?description={text}", icon: "Building", description: "Freedom of Info Requests" },
    { name: "Regulations.gov", slug: "regulations", domain: "government", base_url: "https://www.regulations.gov/", intent_url: "", icon: "Building", description: "Public Comments" },
    { name: "SAM.gov", slug: "sam", domain: "government", base_url: "https://sam.gov/content/home", intent_url: "", icon: "Building", description: "System for Award Management" },

    // LEGAL
    { name: "Clio", slug: "clio", domain: "legal", base_url: "https://app.clio.com/", intent_url: "", icon: "Scale", description: "Legal Practice Mgmt" },
    { name: "DocuSign", slug: "docusign", domain: "legal", base_url: "https://account.docusign.com/", intent_url: "", icon: "FileText", description: "Signatures" },
    { name: "LexisNexis", slug: "lexis", domain: "legal", base_url: "https://www.lexisnexis.com/", intent_url: "", icon: "Scale", description: "Legal Research" },
];

const MOCK_POSTS: any[] = [
    // ACCOUNTING
    { id: 101, title: "Q3 Vendor Payments", hook_text: "Summary of Q3 vendor payments for review. Invoice #4402 needs approval.", domain: "accounting", status: "Pending", media_image_url: "" },
    { id: 102, title: "Tax Deduction List", hook_text: "Compiled list of charitable contributions for the fiscal year.", domain: "accounting", status: "Posted", media_image_url: "" },

    // GOVERNMENT
    { id: 201, title: "Park Renovation Petition", hook_text: "Formal request to review the city planning documents regarding Central Park.", domain: "government", status: "Pending", media_image_url: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735" },
    { id: 202, title: "Grant Application: Arts", hook_text: "Submission for the National Endowment for the Arts community grant.", domain: "government", status: "Pending", media_image_url: "" },

    // SOCIAL
    { id: 301, title: "Surgery Fundraiser", hook_text: "We are $5k short for the operation. Please help us reach our goal.", domain: "social", status: "Pending", media_image_url: "https://images.unsplash.com/photo-1584515933487-779824d29309" },
    { id: 302, title: "Remote Work Tips", hook_text: "Top 5 ways to stay productive while working from home. #RemoteWork", domain: "social", status: "Posted", media_image_url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174" },
    { id: 303, title: "Product Launch Teaser", hook_text: "Something big is coming tomorrow. Stay tuned.", domain: "social", status: "Pending", media_image_url: "" },

    // LEGAL
    { id: 401, title: "NDA for Contractor", hook_text: "Standard Non-Disclosure Agreement for the new marketing consultant.", domain: "legal", status: "Pending", media_image_url: "" },
    { id: 402, title: "Cease & Desist Draft", hook_text: "Notice regarding copyright infringement on our brand assets.", domain: "legal", status: "Pending", media_image_url: "" },
];

export default function DemoDashboard() {
    const router = useRouter();

    // STATE
    const [expandedDomains, setExpandedDomains] = useState<string[]>(["accounting", "social", "government", "legal"]);
    const [selectedPostId, setSelectedPostId] = useState<number>(301); // Default to a social post
    const [showMusic, setShowMusic] = useState(false);

    // Derived State
    const selectedPost = MOCK_POSTS.find(p => p.id === selectedPostId);
    const activeDomain = selectedPost?.domain || "social";
    const relevantPlatforms = MOCK_PLATFORMS.filter(p => p.domain === activeDomain);

    // EDITOR STATE
    const [editedTitle, setEditedTitle] = useState("");
    const [editedHook, setEditedHook] = useState("");
    const [editedImageUrl, setEditedImageUrl] = useState("");
    const [isEditingMedia, setIsEditingMedia] = useState(false);

    // Fake User
    const user = { full_name: "Visitor" };

    // Sync Editor with Selected Post
    useEffect(() => {
        if (selectedPost) {
            setEditedTitle(selectedPost.title || "");
            setEditedHook(selectedPost.hook_text || "");
            setEditedImageUrl(selectedPost.media_image_url || "");
            setIsEditingMedia(false);
        }
    }, [selectedPostId, selectedPost]);

    // HANDLERS
    const toggleDomain = (domainId: string) => {
        if (expandedDomains.includes(domainId)) {
            setExpandedDomains(expandedDomains.filter(id => id !== domainId));
        } else {
            setExpandedDomains([...expandedDomains, domainId]);
        }
    };

    const handleLaunch = (plat: any) => {
        if (plat.intent_url) {
            const encodedText = encodeURIComponent(editedHook);
            const encodedTitle = encodeURIComponent(editedTitle);
            const finalUrl = plat.intent_url
                .replace("{text}", encodedText)
                .replace("{title}", encodedTitle);
            window.open(finalUrl, "_blank");
        } else {
            navigator.clipboard.writeText(editedHook).then(() => {
                window.open(plat.base_url, "_blank");
            }).catch(() => {
                window.open(plat.base_url, "_blank");
            });
        }
    };

    const handleNewTask = (domainId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        // In a real app, this would add to the list. 
        // For mock, let's just alert or console log as we can't easily mutate the const array persistently
        // But we can mutate a state copy if we moved MOCK_POSTS to state.
        alert(`Create new task for ${domainId} (Not implemented in demo)`);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col h-screen overflow-hidden">

            {/* HEADER */}
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-10">
                <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ChristmasStar.png" alt="Logo" className="w-6 h-6 object-contain" />
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">CampaignStudio</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600 hidden sm:inline">Welcome, {user.full_name}</span>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/login")} className="text-slate-500 hover:text-blue-600">
                        Login
                    </Button>
                </div>
            </header>

            {/* MAIN CONTENT GRID */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden">

                {/* LEFT: FILE EXPLORER */}
                <aside className="col-span-3 bg-slate-100 border-r border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-slate-200 bg-slate-100 font-bold text-xs text-slate-500 uppercase tracking-wider flex justify-between items-center">
                        <span className="flex items-center gap-2"><Layout className="w-3 h-3" /> Explorer</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {MOCK_DOMAINS.map((domain) => {
                            const isExpanded = expandedDomains.includes(domain.id);
                            const domainPosts = MOCK_POSTS.filter(p => p.domain === domain.id);

                            return (
                                <div key={domain.id} className="select-none">
                                    {/* Domain Folder */}
                                    <div
                                        onClick={() => toggleDomain(domain.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors text-sm font-medium group",
                                            "hover:bg-slate-200 text-slate-700"
                                        )}
                                    >
                                        <div className="text-slate-400 group-hover:text-slate-600">
                                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                        </div>
                                        {isExpanded ?
                                            <FolderOpen className={cn("w-4 h-4", "text-blue-500")} /> :
                                            <Folder className={cn("w-4 h-4", "text-slate-500")} />
                                        }
                                        <span className="flex-1">{domain.name}</span>
                                        <button
                                            onClick={(e) => handleNewTask(domain.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-300 rounded text-slate-500"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Domain Posts (Files) */}
                                    {isExpanded && (
                                        <div className="ml-4 pl-2 border-l border-slate-300 space-y-0.5 mt-0.5">
                                            {domainPosts.map((post) => (
                                                <div
                                                    key={post.id}
                                                    onClick={() => setSelectedPostId(post.id)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer text-sm transition-all",
                                                        selectedPostId === post.id
                                                            ? "bg-blue-100 text-blue-700 font-medium"
                                                            : "hover:bg-slate-200 text-slate-600"
                                                    )}
                                                >
                                                    <FileText className={cn("w-3.5 h-3.5", selectedPostId === post.id ? "text-blue-500" : "text-slate-400")} />
                                                    <span className="truncate">{post.title}</span>
                                                    {post.status === "Posted" && <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-auto flex-shrink-0" />}
                                                </div>
                                            ))}
                                            {domainPosts.length === 0 && (
                                                <div className="px-2 py-1 text-xs text-slate-400 italic">No tasks</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* CENTER: EDITOR */}
                <main className="col-span-6 bg-white flex flex-col overflow-y-auto h-full border-r border-slate-200">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="font-semibold text-slate-700">{selectedPost?.title || "No Selection"}</span>
                            {selectedPost && <span className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200 uppercase">{selectedPost?.domain}</span>}
                        </div>
                    </div>

                    <div className="p-8 max-w-3xl mx-auto w-full flex-1">
                        {selectedPost ? (
                            <div className="space-y-8">
                                {/* Title Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject / Title</label>
                                    <Input
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        className="text-2xl font-bold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-slate-300 h-auto rounded-none border-b border-transparent focus:border-slate-200 transition-colors"
                                        placeholder="Enter subject..."
                                    />
                                </div>

                                {/* Content Input */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Body Content</label>
                                        <AITextOptimizer
                                            text={editedHook}
                                            mode={activeDomain}
                                            onOptimized={(text) => setEditedHook(text)}
                                        />
                                    </div>
                                    <Textarea
                                        value={editedHook}
                                        onChange={(e) => setEditedHook(e.target.value)}
                                        className="min-h-[300px] text-lg leading-relaxed border-slate-100 bg-slate-50/30 focus:bg-white focus-visible:ring-blue-500/20 resize-none p-4 rounded-lg"
                                        placeholder="Draft your message..."
                                    />
                                </div>

                                {/* Media Attachment */}
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <ExternalLink className="w-3 h-3" /> Attachments
                                        </span>
                                        <Button variant="ghost" size="sm" onClick={() => setIsEditingMedia(!isEditingMedia)} className="h-7 text-xs">
                                            {isEditingMedia ? "Close" : editedImageUrl ? "Edit" : "Add"}
                                        </Button>
                                    </div>

                                    {isEditingMedia ? (
                                        <div className="p-0 animate-in slide-in-from-top-4 duration-300">
                                            <MediaEditor
                                                imageUrl={editedImageUrl}
                                                onSave={(blob: Blob) => { setIsEditingMedia(false); }}
                                                onCancel={() => setIsEditingMedia(false)}
                                            />
                                        </div>
                                    ) : (
                                        <div onClick={() => setIsEditingMedia(true)} className="cursor-pointer group">
                                            {editedImageUrl ? (
                                                <div className="relative p-4 bg-slate-900/5">
                                                    <img src={editedImageUrl} alt="Attachment" className="rounded-lg shadow-sm max-h-[300px] object-cover mx-auto" />
                                                </div>
                                            ) : (
                                                <div className="p-8 flex items-center justify-center text-slate-400 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                                                    <span className="text-sm flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Add Media / Files</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                                <FolderOpen className="w-16 h-16 opacity-20" />
                                <p>Select a task from the explorer to begin.</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* RIGHT: EXECUTION TARGETS */}
                <aside className="col-span-3 bg-slate-50 border-l border-slate-200 flex flex-col h-full overflow-hidden">
                    <div className="p-3 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-500 uppercase tracking-wider flex justify-between items-center">
                        <span className="flex items-center gap-2"><Rocket className="w-3 h-3" /> Execution Targets</span>
                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">{activeDomain}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {relevantPlatforms.length === 0 ? (
                            <div className="text-center p-6 text-slate-400 text-sm italic border border-dashed border-slate-200 rounded-lg">
                                No specific targets for this domain.
                            </div>
                        ) : (
                            relevantPlatforms.map((plat) => (
                                <div key={plat.slug} className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                                "bg-slate-50 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
                                            )}>
                                                {plat.icon === 'Twitter' && <Twitter className="w-4 h-4" />}
                                                {plat.icon === 'Linkedin' && <Linkedin className="w-4 h-4" />}
                                                {plat.icon === 'Facebook' && <Facebook className="w-4 h-4" />}
                                                {plat.icon === 'Instagram' && <Instagram className="w-4 h-4" />}
                                                {plat.icon === 'MessageCircle' && <MessageCircle className="w-4 h-4" />}
                                                {plat.icon === 'Calculator' && <Calculator className="w-4 h-4" />}
                                                {plat.icon === 'Building' && <Building className="w-4 h-4" />}
                                                {plat.icon === 'FileText' && <FileText className="w-4 h-4" />}
                                                {plat.icon === 'Scale' && <Scale className="w-4 h-4" />}
                                                {plat.icon === 'Rocket' && <Rocket className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm">{plat.name}</h3>
                                                <p className="text-[10px] text-slate-500 leading-tight">{plat.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleLaunch(plat)}
                                        className={cn(
                                            "w-full text-xs h-8",
                                            plat.intent_url
                                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                        )}
                                        variant={plat.intent_url ? "default" : "outline"}
                                    >
                                        {plat.intent_url ? (
                                            <>
                                                <Rocket className="w-3 h-3 mr-2" /> Launch Action
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3 h-3 mr-2" /> Copy & Open
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </div>

            {/* FLOATING MUSIC PLAYER */}
            {showMusic && (
                <div className="fixed bottom-24 right-6 z-[9999]">
                    <MusicPlayer onClose={() => setShowMusic(false)} />
                </div>
            )}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-full shadow-2xl border border-slate-200 p-2 flex items-center gap-2 z-40">
                <Button variant={showMusic ? "secondary" : "ghost"} size="icon" className="rounded-full text-slate-600" onClick={() => setShowMusic(!showMusic)}>
                    <Music className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
