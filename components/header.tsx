"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ChevronDown, User, LogOut, UserCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import logo from "@/public/images/epicare-logos.svg"
import Image from "next/image"

export function Header() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

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
            {!loading && (
              <>
                {user ? (
                  // Usuario autenticado - Versión simplificada
                  <div className="relative group">
                    <Button
                      variant="outline"
                      className="rounded-full border-cyan text-cyan hover:bg-cyan hover:text-white bg-transparent flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      <span>{user.email?.split('@')[0]}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    
                    {/* Dropdown manual */}
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
                      <div className="px-3 py-2 bg-gray-50 border-b">
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500">Signed in</p>
                      </div>
                      <div className="py-1">
                        
                        <div className="border-t my-1"></div>
                        <button
                          onClick={handleSignOut}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Usuario no autenticado
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="rounded-full border-cyan text-cyan hover:bg-cyan hover:text-white bg-transparent"
                    >
                      Login
                    </Button>
                  </Link>
                )}
              </>
            )}
            
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
