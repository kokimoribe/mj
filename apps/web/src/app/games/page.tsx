import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { History } from 'lucide-react'

export default function GamesPage() {
  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Game History
          </CardTitle>
          <CardDescription>
            View past games and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Game history view coming soon...
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  )
}