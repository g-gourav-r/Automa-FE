import { Button } from "@/components/ui/button"
import { BadgeAlert } from "@/components/animatedIcons/BadgeAlert"
import { useNavigate } from "react-router-dom"

export default function SessionExpired() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="flex flex-col items-center space-y-6 rounded-xl bg-white p-10 shadow-lg border border-gray-200 max-w-sm text-center">
        <div>
            <BadgeAlert width={40} height={40} stroke="#ee2400" strokeWidth={3} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-800">Session Expired</h1>
          <p className="text-gray-500 text-sm">
            Your session has timed out for security reasons. Please log in again to continue.
          </p>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          onClick={() => navigate("/auth/login")}
        >
          Log in again to continue
        </Button>
      </div>
    </div>
  )
}
