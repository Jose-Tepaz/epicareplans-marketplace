import { Button } from "@/components/ui/button"
import Link from "next/link"
import img1 from "@/public/images/ilustration-1.png"
import img2 from "@/public/images/ilustration-2.png"
import Image from "next/image"
export function HeroSection() {
  return (
    <section className="bg-primary relative overflow-hidden ">
      <div className="container mx-auto px-4 py-20 md:py-32 h-[100vh] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          {/* Left side - Text content */}
          <div className="text-white space-y-6 mx-auto max-w-2xl text-center ">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
              Find the right health insurance in minutes
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Compare coverages, prices, and benefits from top insurance providers. Get quotes, apply, and manage your
              policies all in one place.
            </p>
            <Link href="/explore">
              <Button
                size="lg"
                className="rounded-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8"
              >
                Explore
              </Button>
            </Link>
          </div>

          {/* Right side - Illustration */}
        </div>
      </div>

      
      <Image src={img1} alt="Illustration 1" className="absolute left-[-10rem] bottom-0 w-[600px]" /> 
      <Image src={img2} alt="Illustration 2" className="absolute right-[-20rem] bottom-0 w-[600px]" />
    </section>
  )
}
