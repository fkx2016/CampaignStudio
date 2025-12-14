"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface User {
    id: number;
    email: string;
    full_name?: string;
    is_active: boolean;
    is_superuser?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => void;
    loginAsDemo: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for token on mount
        const token = localStorage.getItem("token");

        if (token) {
            if (token === "demo-token") {
                // Restore demo session
                setUser({
                    id: 0,
                    email: "demo@campaignstudio.com",
                    full_name: "Demo User",
                    is_active: true
                });
                setLoading(false);
            } else {
                fetchUser(token);
            }
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUser = async (token: string) => {
        try {
            // Try primary path
            let res = await fetch(`${API_BASE_URL}/auth/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // If 404, try legacy path
            if (res.status === 404) {
                res = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                logout(); // Invalid token
            }
        } catch (err) {
            console.error("AuthContext: Network Error", err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (token: string) => {
        localStorage.setItem("token", token);
        fetchUser(token);
        router.push("/studio"); // Redirect to Studio/Dashboard
    };

    const loginAsDemo = () => {
        const demoUser: User = {
            id: 0,
            email: "demo@campaignstudio.com",
            full_name: "Demo User",
            is_active: true
        };
        localStorage.setItem("token", "demo-token");
        setUser(demoUser);
        router.push("/studio");
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        router.push("/login"); // Redirect to Welcome Back
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, loginAsDemo, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
