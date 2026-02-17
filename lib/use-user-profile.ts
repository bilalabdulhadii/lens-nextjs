"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export type UserProfile = {
    username: string;
    fullName: string;
    email: string;
};

export function useUserProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;

        async function run() {
            if (!user) {
                setProfile(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            const snap = await getDoc(doc(db, "users", user.uid));
            if (!alive) return;

            if (snap.exists()) {
                setProfile(snap.data() as UserProfile);
            } else {
                // fallback if profile doc missing
                setProfile({
                    username: "",
                    fullName: user.displayName || "",
                    email: user.email || "",
                });
            }
            setLoading(false);
        }

        run();
        return () => {
            alive = false;
        };
    }, [user]);

    return { profile, loading };
}
