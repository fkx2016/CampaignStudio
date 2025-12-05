"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X as XIcon, Zap, Shield, Star } from "lucide-react";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* HEADER */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ChristmasStar.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">CampaignStudio</span>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/studio">
                        <Button variant="ghost" className="text-slate-500 hover:text-slate-900">
                            <XIcon className="w-5 h-5 mr-1" /> Back to Studio
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="pt-24 pb-12 px-6 flex-1 flex flex-col items-center justify-center gap-12">

                <div className="text-center max-w-2xl space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">Pro Studio</span>
                    </h1>
                    <p className="text-xl text-slate-500">
                        Unlock unlimited campaigns, advanced AI models, and cross-platform syncing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                    {/* FREE TIER */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col gap-6 relative opacity-75 hover:opacity-100 transition-opacity">
                        <div>
                            <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest">Free</h3>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-slate-900">$0</span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                        </div>
                        <ul className="space-y-3 flex-1">
                            <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-green-500" /> 1 Active Project</li>
                            <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-green-500" /> Basic AI Models</li>
                            <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-green-500" /> 3 Social Platforms</li>
                            <li className="flex items-center gap-3 text-slate-400"><XIcon className="w-5 h-5" /> No Ops Integrations</li>
                            <li className="flex items-center gap-3 text-slate-400"><XIcon className="w-5 h-5" /> No History</li>
                        </ul>
                        <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                    </div>

                    {/* PRO TIER (HIGHLIGHTED) */}
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-500 p-8 flex flex-col gap-6 relative transform scale-105 z-10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                            Most Popular
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-5 h-5" /> Pro Studio
                            </h3>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-5xl font-black text-slate-900">$29</span>
                                <span className="text-slate-500 font-medium">/mo</span>
                            </div>
                        </div>
                        <ul className="space-y-3 flex-1">
                            <li className="flex items-center gap-3 text-slate-900 font-medium"><Check className="w-5 h-5 text-orange-500" /> Unlimited Projects</li>
                            <li className="flex items-center gap-3 text-slate-900 font-medium"><Check className="w-5 h-5 text-orange-500" /> GPT-4 & Best Models</li>
                            <li className="flex items-center gap-3 text-slate-900 font-medium"><Check className="w-5 h-5 text-orange-500" /> All 30+ Platforms</li>
                            <li className="flex items-center gap-3 text-slate-900 font-medium"><Check className="w-5 h-5 text-orange-500" /> Ops & Finance Integrations</li>
                            <li className="flex items-center gap-3 text-slate-900 font-medium"><Check className="w-5 h-5 text-orange-500" /> "Save Work" Recovery</li>
                        </ul>
                        <Button className="w-full h-12 text-lg bg-gradient-to-r from-amber-400 to-orange-600 hover:from-amber-500 hover:to-orange-700 text-white font-bold shadow-lg">
                            Start Free Trial
                        </Button>
                        <p className="text-xs text-center text-slate-400">7-day free trial, cancel anytime.</p>
                    </div>

                    {/* ENTERPRISE TIER */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col gap-6 relative opacity-75 hover:opacity-100 transition-opacity">
                        <div>
                            <h3 className="text-lg font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
                                <Shield className="w-5 h-5" /> Agency
                            </h3>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-slate-900">$99</span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                        </div>
                        <ul className="space-y-3 flex-1">
                            <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-purple-500" /> 10 Team Members</li>
                            <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-purple-500" /> White Label Reports</li>
                            <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-purple-500" /> API Access</li>
                            <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-purple-500" /> Custom Integrations</li>
                        </ul>
                        <Button variant="outline" className="w-full hover:text-purple-600 hover:border-purple-200">Contact Sales</Button>
                    </div>

                </div>

                <div className="mt-12 text-center">
                    <h4 className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-6">Trusted by Innovative Teams</h4>
                    <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="font-black text-2xl text-slate-300">ACME Corp</div>
                        <div className="font-black text-2xl text-slate-300">Stark Ind.</div>
                        <div className="font-black text-2xl text-slate-300">Wayne Ent.</div>
                        <div className="font-black text-2xl text-slate-300">Cyberdyne</div>
                    </div>
                </div>

            </div>
        </div>
    );
}
