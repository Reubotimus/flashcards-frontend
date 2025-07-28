"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const data = new FormData(e.currentTarget);
        const email = data.get("email") as string;
        const password = data.get("password") as string;

        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        try {
            setIsSubmitting(true);
            await authClient.signIn.email({ email, password });
            router.push("/");
        } catch (e: any) {
            setError(e.body?.message ?? e.message ?? "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Sign In</h1>

                {error && (
                    <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in…" : "Sign In"}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <a
                        href="/sign-up"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Sign up
                    </a>
                </p>
            </div>
        </main>
    );
} 