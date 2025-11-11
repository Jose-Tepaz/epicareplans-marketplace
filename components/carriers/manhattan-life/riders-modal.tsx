"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import type { ManhattanLifeRider } from "@/lib/api/carriers/manhattan-life/types"

interface RidersModalProps {
  riders: ManhattanLifeRider[]
  open: boolean
  onClose: () => void
}

export function RidersModal({ riders, open, onClose }: RidersModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Available Riders</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {riders.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No riders available for this plan
            </p>
          ) : (
            riders.map((rider) => (
              <Card key={rider.riderUnitStateId} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {rider.riderName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {rider.unitName}
                      </p>
                      {rider.coverageAmount && (
                        <p className="text-sm text-blue-600 font-medium mt-2">
                          Coverage: ${rider.coverageAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-xs text-gray-500 font-mono">
                        {rider.riderCode}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

