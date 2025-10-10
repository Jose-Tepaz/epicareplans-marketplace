"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Subscribe:", email)
  }

  return (
    <section className="bg-muted py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join our newsletter</h2>
          <p className="text-gray-700 mb-6">Stay updated with the latest insurance news and offers.</p>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full bg-white border-gray-300"
              required
            />
            <Button type="submit" className="rounded-full bg-gray-900 hover:bg-gray-800 text-white px-8">
              Subscribe
            </Button>
          </form>

          <p className="text-xs text-gray-600 mt-3">By subscribing, you agree to our Privacy Policy</p>
        </div>
      </div>
    </section>
  )
}
