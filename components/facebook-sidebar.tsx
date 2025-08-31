import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FacebookSidebar() {
  return (
    <div className="space-y-4">
      {/* Sponsored */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Sponsored</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-[#3b5998] hover:underline cursor-pointer">
                Scuba Diving Vacations
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Dive or Snorkel with Stuart Cove's Dive Bahamas in Nassau. World class walls, wrecks, reefs and
                unforgettable shark dives!
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-12 h-12 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">HD</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-[#3b5998] hover:underline cursor-pointer">
                Hard Drive Imaging?
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                True hardware-independent Windows imaging. Only one master image needed for easy deployment regardless
                of manufacturer.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-[#3b5998] hover:underline cursor-pointer">
            <span className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center text-white text-xs">
              📷
            </span>
            Photos
          </div>
          <div className="flex items-center gap-2 text-sm text-[#3b5998] hover:underline cursor-pointer">
            <span className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs">
              🎮
            </span>
            Games
          </div>
          <div className="flex items-center gap-2 text-sm text-[#3b5998] hover:underline cursor-pointer">
            <span className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs">
              📝
            </span>
            Notes
          </div>
          <div className="flex items-center gap-2 text-sm text-[#3b5998] hover:underline cursor-pointer">
            <span className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center text-white text-xs">
              📊
            </span>
            Marketplace
          </div>
        </CardContent>
      </Card>

      {/* Friends */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Friends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Sarah Johnson", status: "online" },
            { name: "Mike Chen", status: "away" },
            { name: "Emma Wilson", status: "offline" },
            { name: "David Brown", status: "online" },
          ].map((friend) => (
            <div key={friend.name} className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 bg-[#3b5998] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {friend.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    friend.status === "online"
                      ? "bg-green-500"
                      : friend.status === "away"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                  }`}
                />
              </div>
              <span className="text-sm text-[#3b5998] hover:underline cursor-pointer">{friend.name}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
