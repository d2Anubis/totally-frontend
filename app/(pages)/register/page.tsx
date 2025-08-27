"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/account");
    } else {
      router.replace("/auth?tab=registration");
    }
  }, [router, isLoggedIn]);

  return null; // This page will redirect to /auth or /account
}
