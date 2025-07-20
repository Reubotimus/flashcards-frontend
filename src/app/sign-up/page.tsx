import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default function SignUpPage() {
    async function signUpAction(formData: FormData) {
        "use server";
        const email = formData.get("email") as string;
        const name = formData.get("name") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!email || !name || !password || !confirmPassword || password !== confirmPassword) {
            // Handle error: passwords don't match or fields are empty
            return;
        }

        try {
            await auth.api.signUpEmail({
                body: {
                    email,
                    name,
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
                <h1 className="text-2xl font-bold text-center">Sign Up</h1>
                <form action={signUpAction} className="space-y-4">
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
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">
                        Sign Up
                    </Button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <a href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </a>
                </p>
            </div>
        </main>
    );
} 