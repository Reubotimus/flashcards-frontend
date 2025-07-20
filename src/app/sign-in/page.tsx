import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default function SignInPage() {
    async function signInAction(formData: FormData) {
        "use server";
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            return;
        }

        try {
            await auth.api.signInEmail({
                body: {
                    email,
                    password,
                },
            });
        } catch (e) {
            console.error(e)
            return;
        }
        revalidatePath("/dashboard");
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Sign In</h1>
                <form action={signInAction} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">
                        Sign In
                    </Button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <a href="/sign-up" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign up
                    </a>
                </p>
            </div>
        </main>
    );
} 