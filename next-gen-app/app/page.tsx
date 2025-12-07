"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Rocket,
    Zap,
    Globe,
    Users,
    CheckCircle,
    ArrowRight,
    Sparkles,
    Target,
    TrendingUp,
    Shield
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

// Mission statement carousel with micro-sponsorships AND lottery!
interface SponsoredStatement {
    text: string;
    sponsor?: {
        name: string;
        logo: string;
        url: string;
    };
    isLucky?: boolean;
    reward?: number;
    requiresAuth?: boolean; // For anonymous user wins
}

const MISSION_STATEMENTS: SponsoredStatement[] = [
    {
        text: "We're Going to Make You Money",
    },
    {
        text: "Stop Being the Product. Start Being the Profit",
    },
    {
        text: "They've Been Farming You. Time to Farm Them",
    },
    {
        text: "Your Content Should Pay You, Not Just Platforms",
    },
    {
        text: "Turn Every Campaign Into Revenue",
        sponsor: {
            name: "Stripe",
            logo: "💳",
            url: "https://stripe.com"
        }
    },
    {
        text: "The Internet Wants Your Money. We Help You Take Theirs"
    }
];

// Lottery logic - GUARANTEED WIN for anonymous users!
const getLuckyStatement = (isAuthenticated: boolean): SponsoredStatement => {
    // Anonymous users ALWAYS win (but must sign up to claim)
    if (!isAuthenticated) {
        return {
            text: "🎰 YOU WON $1.00! Sign up to claim your prize!",
            isLucky: true,
            reward: 1.00,
            requiresAuth: true
        };
    }

    // Logged-in users: 5% chance to win
    const isLucky = Math.random() < 0.05;

    if (isLucky) {
        return {
            text: "🎰 LUCKY YOU! We Just Put $1 in Your Account!",
            isLucky: true,
            reward: 1.00
        };
    }

    return MISSION_STATEMENTS[Math.floor(Math.random() * MISSION_STATEMENTS.length)];
};

export default function LandingPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // START HYDRATION FIX
    // Start with a safe default (first statement) to match server
    const [missionStatement, setMissionStatement] = useState<SponsoredStatement>(MISSION_STATEMENTS[0]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const hasToken = !!localStorage.getItem('token');
        // Only run lottery logic on the client
        setMissionStatement(getLuckyStatement(hasToken));
    }, []);
    // END HYDRATION FIX

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName || email.split("@")[0],
                }),
            });

            if (response.ok) {
                // Auto-login after registration
                const loginResponse = await fetch(`${API_BASE_URL}/auth/token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        username: email,
                        password: password,
                    }),
                });

                if (loginResponse.ok) {
                    const data = await loginResponse.json();
                    localStorage.setItem("token", data.access_token);
                    router.push("/dashboard");
                } else {
                    router.push("/login");
                }
            } else {
                const data = await response.json();
                setError(data.detail || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/ChristmasStar.png" alt="Logo" className="w-8 h-8" />
                        <span className="text-2xl font-bold text-white">CampaignStudio</span>
                    </Link>
                    <Link href="/login">
                        <Button variant="ghost" className="text-white hover:bg-white/10">
                            Sign In
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    {/* Left: Hero Content */}
                    <div className="space-y-8">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${missionStatement.isLucky
                            ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-200 border-yellow-400/50 animate-pulse shadow-lg shadow-yellow-500/50'
                            : 'bg-green-500/20 text-green-300 border-green-500/30'
                            }`}>
                            <Sparkles className="w-4 h-4" />
                            <span className={missionStatement.isLucky ? 'font-bold' : ''}>{missionStatement.text}</span>
                            {missionStatement.sponsor && (
                                <>
                                    <span className="text-green-400/50">|</span>
                                    <a
                                        href={missionStatement.sponsor.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:text-green-200 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Track click analytics here
                                        }}
                                    >
                                        <span>{missionStatement.sponsor.logo}</span>
                                        <span className="text-xs opacity-75">{missionStatement.sponsor.name}</span>
                                    </a>
                                </>
                            )}
                        </div>

                        {/* Special CTA for Anonymous Winners */}
                        {missionStatement.requiresAuth && (
                            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-400/50 rounded-xl p-4 animate-pulse">
                                <p className="text-white font-bold text-lg mb-2">
                                    ⚠️ You're not registered! We can't send you the $1.00
                                </p>
                                <p className="text-slate-300 text-sm mb-3">
                                    Sign up below in 60 seconds to claim your prize before it expires!
                                </p>
                                <button
                                    onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Claim My $1.00 Now! ⏱️
                                </button>
                            </div>
                        )}

                        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                            Turn Every Campaign Into
                            <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                Revenue (Yes, Even That One)
                            </span>
                        </h1>

                        <p className="text-xl text-slate-300 leading-relaxed">
                            The internet wants to make money off you. We help you make money off them instead.
                            Whether it&apos;s a political campaign, fundraiser, or &quot;awareness drive&quot; -
                            we see what you really want. And we&apos;re built to deliver it.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-slate-300">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span>Built-in monetization for every campaign</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span>AI finds revenue you didn&apos;t know existed</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span>Track ROI, not just vanity metrics</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Signup Form */}
                    <div id="signup" className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Start Free Today</h2>
                            <p className="text-slate-300">Join thousands of creators already using CampaignStudio</p>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-4">
                            <div>
                                <Input
                                    type="text"
                                    placeholder="Full Name (optional)"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 h-12"
                                />
                            </div>
                            <div>
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 h-12"
                                />
                            </div>
                            <div>
                                <Input
                                    type="password"
                                    placeholder="Create password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 h-12"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg shadow-lg"
                            >
                                {loading ? (
                                    "Creating your account..."
                                ) : (
                                    <>
                                        Get Started Free
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-slate-400 mt-4">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                                Sign in
                            </Link>
                        </p>

                        {/* Interactive Studio Surprise */}
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <Link href="/studio">
                                <div className="group relative overflow-hidden rounded-lg border border-white/20 hover:border-red-400 transition-all duration-300 cursor-pointer">
                                    {/* Default State */}
                                    <div className="p-4 text-center group-hover:opacity-0 transition-opacity duration-300">
                                        <p className="text-sm text-slate-400">
                                            Not ready to sign up? No problem! <span className="underline">Click here</span>
                                        </p>
                                    </div>

                                    {/* Hover State - Surprise! */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 p-4">
                                        <p className="text-2xl font-bold text-red-400 mb-1 animate-pulse">
                                            Great! Let&apos;s Go! 🚀
                                        </p>
                                        <p className="text-xs text-slate-300">
                                            Click to explore (no signup needed)
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
                        <p className="text-xl text-slate-300">Powerful features designed for modern campaigns</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                                <Target className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Multi-Platform Publishing</h3>
                            <p className="text-slate-300">
                                Publish to 22+ platforms including Twitter, LinkedIn, Facebook, Instagram, and more from one dashboard.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">AI-Powered Optimization</h3>
                            <p className="text-slate-300">
                                Let AI optimize your content for maximum engagement across different platforms and audiences.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Campaign Analytics</h3>
                            <p className="text-slate-300">
                                Track performance, engagement, and ROI across all your campaigns in real-time.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                                <Globe className="w-6 h-6 text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">5 Campaign Modes</h3>
                            <p className="text-slate-300">
                                Donation drives, political campaigns, content marketing, promotions, and operations - all in one place.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-pink-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Team Collaboration</h3>
                            <p className="text-slate-300">
                                Work together with your team, assign tasks, and manage campaigns collaboratively.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Secure & Reliable</h3>
                            <p className="text-slate-300">
                                Enterprise-grade security with JWT authentication, encrypted data, and 99.9% uptime.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Stop Leaving Money on the Table?
                    </h2>
                    <p className="text-xl text-slate-300 mb-8">
                        Every campaign is a revenue opportunity. We&apos;ll show you how to capture it.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="#signup">
                            <Button className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg shadow-lg">
                                <Rocket className="w-5 h-5 mr-2" />
                                Start Free Today
                            </Button>
                        </Link>
                        <Link href="/studio">
                            <Button className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg shadow-lg border-2 border-green-400/50">
                                <Globe className="w-5 h-5 mr-2" />
                                Try Studio
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-400 text-sm">
                        © 2025 CampaignStudio. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/studio" className="text-slate-400 hover:text-white text-sm transition-colors">
                            Studio
                        </Link>
                        <Link href="/demo" className="text-slate-400 hover:text-white text-sm transition-colors">
                            Demo
                        </Link>
                        <a href="mailto:fkurka@gmail.com" className="text-slate-400 hover:text-white text-sm transition-colors">
                            Contact
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
