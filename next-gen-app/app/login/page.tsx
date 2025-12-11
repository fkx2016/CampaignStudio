"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/context/NewAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            /* 
             * REAL AUTH LOGIC ENABLED
             */
            const res = await fetch(`${API_BASE_URL}/auth/token`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ username: email, password }),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Login Failed:", text);
                throw new Error("Invalid credentials");
            }

            const data = await res.json();
            console.log("Login Success! Token:", data.access_token.substring(0, 10));
            // localStorage.setItem("token", data.access_token);

            // Redirect via Context
            login(data.access_token);
            // router.push("/dashboard");

        } catch (err) {
            setError("Login failed. Please try again.");
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
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Welcome back
                </h1>
            </div>

            {/* DEV SHORTCUTS (Moved Up) */}
            <div className="flex flex-col items-center gap-3 w-full max-w-md my-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Select Environment</div>
                <div className="grid grid-cols-2 gap-3 w-full">
                    <Link href="/studio" className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-900 rounded-lg hover:bg-slate-800 hover:shadow-md transition-all group">
                        <span className="font-bold text-white">Pro Studio</span>
                        <span className="text-xs text-slate-400">Classic Social Tool</span>
                    </Link>
                    <Link href="/demo" className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group">
                        <span className="font-bold text-slate-800 group-hover:text-blue-600">Universal OS</span>
                        <span className="text-xs text-slate-500">Experimental Beta</span>
                    </Link>
                </div>
            </div>

            {/* DIVIDER */}
            <div className="relative w-full max-w-md flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative bg-slate-50 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Or sign in to your account
                </div>
            </div>

            {/* FORM CARD */}
            <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-200">

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
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
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-slate-700">Password</label>
                            <Link href="#" className="text-xs text-blue-600 hover:underline">Forgot?</Link>
                        </div>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                required
                                className="bg-slate-50 pr-10"
                                placeholder="••••••••"
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
                        className="w-full h-11 text-base bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>

                    <div className="text-center text-sm text-slate-500 mt-4">
                        Don&apos;t have an account? <Link href="/register" className="text-blue-600 font-bold hover:underline">New Campaign</Link>
                    </div>
                </form>
            </div>


        </div>
    );
}
