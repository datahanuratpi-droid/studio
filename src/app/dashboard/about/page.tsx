"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AboutPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirek ke dashboard karena About sekarang ada di pop-out
    router.replace("/dashboard")
  }, [router])

  return null
}
