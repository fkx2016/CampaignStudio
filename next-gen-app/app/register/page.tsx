"use client";

import { useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { Loader2, Eye, EyeOff, Check, Rocket, Zap, Globe, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Registration failed");
            }

            // Success! Redirect to login
            router.push("/login?registered=true");

        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 gap-8">

            {/* HEADLINE */}
            <div className="text-center max-w-2xl space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ChristmasStar.png" alt="Logo" className="w-10 h-10 object-contain" />
                    <span className="font-bold text-2xl tracking-tight text-slate-900">CampaignStudio</span>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    Upgrade to <span className="text-blue-600">Pro</span> today.
                </h1>
                <p className="text-slate-500 text-lg">
                    Unlock unlimited campaigns, AI auto-sync, and premium tools.
                </p>

                {/* Benefits Pills */}
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                        <Rocket className="w-4 h-4" /> Unlimited Posts
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-100">
                        <Globe className="w-4 h-4" /> Sync Channels
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-100">
                        <Zap className="w-4 h-4" /> AI Magic
                    </span>
                </div>
            </div>

            {/* FORM CARD */}
            <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-200">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Create your account</h2>
                    <p className="text-slate-500 text-sm">No credit card required for trial.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                        <Input
                            type="text"
                            required
                            className="bg-slate-50"
                            placeholder="Jane Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Email Address</label>
                        <Input
                            type="email"
                            required
                            className="bg-slate-50"
                            placeholder="jane@campaign.studio"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Password</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                required
                                className="bg-slate-50 pr-10"
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 mt-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                            </>
                        ) : (
                            "Start Free Trial"
                        )}
                    </Button>

                    <div className="text-center text-sm text-slate-500 mt-4">
                        Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
                    </div>
                </form>
            </div>

            <div className="text-center text-slate-400 text-xs">
                By joining, you agree to our Terms of Service and Privacy Policy.
            </div>
        </div>
    );
}
