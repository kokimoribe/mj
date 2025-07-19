export default async function TestPage() {
  try {
    const response = await fetch('https://mj-skill-rating.vercel.app/leaderboard', {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
        <div className="mb-4">
          <strong>Status:</strong> ✅ API Working
        </div>
        <div className="mb-4">
          <strong>Season:</strong> {data.seasonName}
        </div>
        <div className="mb-4">
          <strong>Players:</strong> {data.players.length}
        </div>
        <div className="space-y-2">
          {data.players.map((player: any, index: number) => (
            <div key={player.id} className="border p-2 rounded">
              <strong>#{index + 1}</strong> {player.name} - Rating: {player.rating}
            </div>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
        <div className="mb-4">
          <strong>Status:</strong> ❌ API Failed
        </div>
        <div className="text-red-600">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    )
  }
}