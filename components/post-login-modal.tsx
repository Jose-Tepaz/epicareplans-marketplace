'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShoppingCart, LayoutDashboard } from 'lucide-react'
import { getUserProfile } from '@/lib/api/enrollment-db'

interface PostLoginModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

export function PostLoginModal({ isOpen, onClose, userEmail }: PostLoginModalProps) {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleBuyPlans = async () => {
    setIsRedirecting(true)
    onClose()
    
    try {
      // Verificar si tiene datos de explore guardados
      const profile = await getUserProfile()
      console.log('🔍 PostLoginModal - Profile data:', profile)
      
      const hasExploreData = profile && 
        profile.zip_code && 
        profile.date_of_birth && 
        profile.gender &&
        profile.is_smoker !== null

      console.log('🔍 PostLoginModal - Has explore data:', hasExploreData)
      console.log('🔍 PostLoginModal - Profile fields:', {
        zip_code: profile?.zip_code,
        date_of_birth: profile?.date_of_birth,
        gender: profile?.gender,
        is_smoker: profile?.is_smoker
      })

      if (hasExploreData) {
        console.log('✅ Redirecting to insurance-options')
        router.push('/insurance-options')
      } else {
        console.log('❌ Missing profile data, redirecting to explore')
        router.push('/explore?skip-account-question=true')
      }
    } catch (error) {
      console.error('❌ Error checking profile:', error)
      router.push('/explore?skip-account-question=true')
    }
  }

  const handleGoToDashboard = () => {
    setIsRedirecting(true)
    // Redirigir al dashboard (subdominio)
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.epicareplans.com'
    window.location.href = dashboardUrl
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome back!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Where would you like to go?
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={handleBuyPlans}
              disabled={isRedirecting}
              className="h-24 flex flex-col items-center justify-center gap-2"
            >
              <ShoppingCart className="h-8 w-8" />
              <div>
                <div className="font-semibold">Buy New Plans</div>
                <div className="text-xs opacity-80">Explore and purchase insurance</div>
              </div>
            </Button>

            <Button
              onClick={handleGoToDashboard}
              disabled={isRedirecting}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
            >
              <LayoutDashboard className="h-8 w-8" />
              <div>
                <div className="font-semibold">Go to Dashboard</div>
                <div className="text-xs opacity-80">Manage your policies</div>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

