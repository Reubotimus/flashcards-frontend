"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const data = new FormData(e.currentTarget);
        const name = data.get("name") as string;
        const email = data.get("email") as string;
        const password = data.get("password") as string;
        const confirmPassword = data.get("confirmPassword") as string;

        // Basic client-side validation
        if (!name || !email || !password || !confirmPassword) {
            setError("All fields are required");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        try {
            setIsSubmitting(true);
            await authClient.signUp.email({ name, email, password });
            router.push("/");
        } catch (e: unknown) {
            if (
                e &&
                typeof e === "object" &&
                "body" in e &&
                typeof (e as { body?: unknown }).body === "object" &&
                (e as { body?: { message?: string } }).body &&
                "message" in (e as { body: { message?: string } }).body
            ) {
                setError(((e as { body: { message?: string } }).body.message) ?? "Something went wrong");
            } else if (e && typeof e === "object" && "message" in e) {
                setError((e as { message?: string }).message ?? "Something went wrong");
            } else {
                setError("Something went wrong");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Sign Up</h1>

                {error && (
                    <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" type="text" required />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required minLength={8} />
                    </div>
                    <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Creating…" : "Sign Up"}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <a
                        href="/sign-in"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Sign in
                    </a>
                </p>
            </div>
        </main>
    );
} 