"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, DollarSign } from "lucide-react"
import Link from "next/link"

export function CoverageCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  const coverages = [
    {
      icon: "🦷",
      title: "Dental Plans",
      description: "Affordable dental coverage for individuals and families.",
    },
    {
      icon: Eye,
      title: "Vision Plans",
      description: "Eye exams, glasses, and contacts at lower costs.",
    },
    {
      icon: DollarSign,
      title: "Fixed Benefit Indemnity",
      description: "Pre-set cash benefits for specific medical services.",
    },
  ]

  return (
    <section className="bg-secondary py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
          <span className="text-primary">Choose</span> the coverage you need
        </h2>

        {/* Carousel container */}
        <div className="relative max-w-5xl mx-auto">
          <div className="border-4 border-primary rounded-[3rem] bg-white/50 backdrop-blur-sm p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              {coverages.map((coverage, index) => (
                <Card key={index} className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="flex justify-center">
                      {typeof coverage.icon === "string" ? (
                        <div className="text-6xl">{coverage.icon}</div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                          <coverage.icon className="h-10 w-10 text-gray-900" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{coverage.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{coverage.description}</p>
                    <Link href="/explore">
                      <Button className="rounded-full bg-primary hover:bg-primary/90 text-white w-full">Explore</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === activeIndex ? "bg-gray-900" : "bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
