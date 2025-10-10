import { Button } from "@/components/ui/button"
import { Monitor, Smartphone, Bell, CreditCard } from "lucide-react"
import Link from "next/link"

export function WhyPlatformSection() {
  const features = [
    {
      icon: Monitor,
      title: "All-in-one access",
      description: "Buy, renew, and manage your policies from a single web app.",
    },
    {
      icon: Smartphone,
      title: "Multi-device",
      description: "Available on desktop and mobile, manage your insurance anywhere.",
    },
    {
      icon: Bell,
      title: "Smart reminders",
      description: "Get notified before your policy expires.",
    },
    {
      icon: CreditCard,
      title: "Secure payments",
      description: "Encrypted and reliable transactions.",
    },
  ]

  return (
    <section className="bg-secondary py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
          {/* Left side - Main content */}
          <div className="space-y-6">
            <div className="inline-block">
              <span className="text-primary text-sm font-semibold tracking-wider uppercase">SECURE</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-balance">
              Why use our <span className="text-cyan">platform?</span>
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Our insurance plans provide peace of mind and financial protection. Tailored to your needs, they ensure
              you're covered when it matters most.
            </p>
            <div className="flex gap-3">
              <Link href="/explore">
                <Button
                  variant="outline"
                  className="rounded-full border-cyan text-cyan hover:bg-cyan hover:text-white bg-transparent"
                >
                  Explore
                </Button>
              </Link>
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white">Button →</Button>
            </div>
          </div>

          {/* Right side - Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="space-y-4">
                <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center border-4 border-primary">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
