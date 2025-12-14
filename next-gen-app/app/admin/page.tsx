"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
import {
    Users,
    ArrowLeft,
    Shield,
    RefreshCw,
    Download,
    TrendingUp
} from "lucide-react";

interface User {
    id: number;
    email: string;
    full_name: string;
    is_active: boolean;
    is_superuser: boolean;
}

export default function AdminPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/auth/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                if (response.status === 403) {
                    setError("You are not authorized to view this page.");
                } else {
                    setError("Failed to fetch users");
                }
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const downloadCSV = () => {
        const headers = ["ID", "Email", "Name", "Role", "Status"];
        const rows = users.map(u => [
            u.id,
            u.email,
            u.full_name || "",
            u.is_superuser ? "Admin" : "User",
            u.is_active ? "Active" : "Inactive"
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "campaign_users.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/studio">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Studio
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-slate-300 mx-2" />
                    <span className="font-bold text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        Admin Dashboard
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">
                        {users.length} Total Users
                    </span>
                </div>
            </header>

            {/* Content */}
            <main className="pt-24 px-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">User Metrics</h1>
                        <p className="text-slate-500">View and manage your growing user base.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={fetchUsers}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            onClick={downloadCSV}
                            disabled={users.length === 0}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-500">Total Signups</div>
                                <div className="text-2xl font-bold text-slate-900">{users.length}</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-500">Active Today</div>
                                <div className="text-2xl font-bold text-slate-900">{users.length}</div>
                            </div>
                        </div>
                    </div>
                    {/* Placeholder for future metric */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 opacity-50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-500">Money Seeks (Coming Soon)</div>
                                <div className="text-2xl font-bold text-slate-900">-</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 mb-6">
                        {error}
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700">ID</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">User</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Email</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading && users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500">#{user.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{user.full_name || "Anonymous"}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">{user.email}</td>
                                        <td className="px-6 py-4">
                                            {user.is_superuser ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    <Shield className="w-3 h-3" /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                    User
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_active ? (
                                                <span className="text-green-600 font-medium">Active</span>
                                            ) : (
                                                <span className="text-red-500">Inactive</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && users.length === 0 && !error && (
                        <div className="p-8 text-center text-slate-500">
                            No users found.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
