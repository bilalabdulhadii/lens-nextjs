import { SignupForm } from "@/components/signup-form";
import Link from "next/link";
import Image from "next/image";
import { GuestOnly } from "@/components/guards/guest-only";

export default function SignupPage() {
    return (
        <GuestOnly>
            <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <Link
                        href="/"
                        className="flex items-center gap-3 self-center font-medium mb-4"
                        aria-label="Go to home">
                        <Image
                            src="/lens_white.svg"
                            alt="Lens logo"
                            width={48}
                            height={48}
                            className="size-9"
                        />
                        <span className="text-3xl">Lens</span>
                    </Link>
                    <SignupForm />
                </div>
            </div>
        </GuestOnly>
    );
}
