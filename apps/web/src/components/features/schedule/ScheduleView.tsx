'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Plus, 
  Trophy,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScheduledEvent {
  id: string
  type: 'game' | 'tournament'
  title: string
  date: Date
  time: string
  participants?: string[]
  location?: string
  status: 'upcoming' | 'live' | 'completed'
}

// Mock data
const mockEvents: ScheduledEvent[] = [
  {
    id: '1',
    type: 'game',
    title: 'Weekly Game Night',
    date: new Date(2025, 0, 22),
    time: '7:00 PM',
    participants: ['Joseph', 'Josh', 'Mikey', 'Hyun'],
    location: 'Josh\'s Place',
    status: 'upcoming'
  },
  {
    id: '2',
    type: 'tournament',
    title: 'Winter Championship',
    date: new Date(2025, 0, 25),
    time: '2:00 PM',
    participants: ['8 players'],
    status: 'upcoming'
  },
  {
    id: '3',
    type: 'game',
    title: 'Quick Match',
    date: new Date(2025, 0, 19),
    time: '8:30 PM',
    participants: ['Joseph', 'Mikey', 'Naoki', 'Josh'],
    status: 'live'
  }
]

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ScheduleView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<'month' | 'week'>('month')

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }

  const monthDays = getMonthDays(currentDate)
  const today = new Date()

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">Manage games and tournaments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <CalendarDays className="w-4 h-4 mr-2" />
            Sync Calendar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'month' | 'week')} defaultValue="month">
        <TabsList>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-4">
          {/* Calendar Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{formatMonthYear(currentDate)}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {daysOfWeek.map(day => (
                  <div
                    key={day}
                    className="bg-muted/50 p-2 text-center text-sm font-medium"
                  >
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {monthDays.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                  const isToday = day.toDateString() === today.toDateString()
                  const events = getEventsForDate(day)
                  const isSelected = selectedDate?.toDateString() === day.toDateString()
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "bg-background min-h-[80px] p-2 text-left hover:bg-muted/50 transition-colors relative",
                        !isCurrentMonth && "text-muted-foreground",
                        isToday && "ring-2 ring-primary ring-inset",
                        isSelected && "bg-muted"
                      )}
                    >
                      <div className={cn(
                        "text-sm font-medium",
                        isToday && "text-primary"
                      )}>
                        {day.getDate()}
                      </div>
                      
                      {events.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {events.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={cn(
                                "text-xs px-1 py-0.5 rounded truncate",
                                event.type === 'tournament' 
                                  ? "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                                  : event.status === 'live'
                                  ? "bg-green-500/20 text-green-600 dark:text-green-400"
                                  : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                              )}
                            >
                              {event.title}
                            </div>
                          ))}
                          {events.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{events.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Events */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getEventsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No events scheduled</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).map(event => (
                      <Card key={event.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {event.type === 'tournament' ? (
                                  <Trophy className="w-4 h-4 text-purple-500" />
                                ) : (
                                  <Users className="w-4 h-4 text-blue-500" />
                                )}
                                <span className="font-medium">{event.title}</span>
                                {event.status === 'live' && (
                                  <Badge variant="destructive" className="gap-1">
                                    <Zap className="w-3 h-3" />
                                    Live
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {event.time}
                                </span>
                                {event.location && (
                                  <span>{event.location}</span>
                                )}
                              </div>
                              {event.participants && (
                                <div className="text-sm">
                                  {Array.isArray(event.participants) 
                                    ? event.participants.join(', ')
                                    : event.participants}
                                </div>
                              )}
                            </div>
                            <Button size="sm" variant="ghost">
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="week">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Week view coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Events</CardTitle>
          <CardDescription>Your next games and tournaments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockEvents
              .filter(e => e.status === 'upcoming')
              .slice(0, 3)
              .map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {event.date.getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.title}</span>
                        {event.type === 'tournament' && (
                          <Badge variant="secondary">
                            <Trophy className="w-3 h-3 mr-1" />
                            Tournament
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event.time} • {event.participants?.length || 0} participants
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Details
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}