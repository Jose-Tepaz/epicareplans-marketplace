"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SimpleTestMultiplePlans() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>("")

  const handleTest = async () => {
    setIsLoading(true)
    setResult("")

    try {
      const response = await fetch('/api/test-multiple-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const data = await response.json()
      setResult(response.ok ? "✅ Éxito" : `❌ Error: ${data.message}`)
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-orange-300">
      <CardHeader>
        <CardTitle className="text-orange-700">🔧 Test Simple: Múltiples Planes</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleTest} disabled={isLoading}>
          {isLoading ? "Probando..." : "Probar 2 Planes"}
        </Button>
        {result && <div className="mt-2 p-2 bg-gray-100 rounded">{result}</div>}
      </CardContent>
    </Card>
  )
}
