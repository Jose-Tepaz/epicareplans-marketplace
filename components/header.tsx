"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import logo from "@/public/images/epicare-logos.svg"
import Image from "next/image"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src={logo} alt="Logo" width={100} height={100} />  
            
            
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-900 font-medium hover:text-primary transition-colors">
              Home Page
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-primary transition-colors">
              About <span className="text-cyan">Us</span>
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary transition-colors">
              Contact <span className="text-cyan">Us</span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors">
                Insurance Types
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Dental Plans</DropdownMenuItem>
                <DropdownMenuItem>Vision Plans</DropdownMenuItem>
                <DropdownMenuItem>Fixed Benefit Indemnity</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-full border-cyan text-cyan hover:bg-cyan hover:text-white bg-transparent"
            >
              Login
            </Button>
            <Link href="/explore">
              <Button className="rounded-full bg-cyan hover:bg-cyan/90 text-white">Explore</Button>
            </Link>
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
