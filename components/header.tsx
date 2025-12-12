"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ChevronDown, User, LogOut, UserCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { CartDrawer } from "@/components/cart-drawer"
import { useRouter } from "next/navigation"
import { useState } from "react"
import logo from "@/public/images/epicare-logos.svg"
import Image from "next/image"

export function Header() {
  const { user, loading, signOut } = useAuth()
  const { totalItems } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
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
                        <Link
                          href={process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3001'}
                          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <UserCircle className="h-4 w-4 mr-2" />
                          Mi Dashboard

                        </Link>
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
            
            <Link href={user ? '/insurance-options' : '/explore'}>
              <Button className="rounded-full bg-cyan hover:bg-cyan/90 text-white">Explore</Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsCartOpen(true)}
              className="relative"
              aria-label="View cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>

    {/* Cart Drawer */}
    <CartDrawer isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  )
}
