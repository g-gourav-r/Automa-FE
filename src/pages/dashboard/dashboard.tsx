import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { FilePlus, UploadCloud, BarChart2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

function DashboardCard({ icon: Icon, title, subtitle, buttonText, onClick }: {
  icon: any
  title: string
  subtitle: string
  buttonText: string
  onClick: () => void
}) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center p-8",
        "border border-gray-200 rounded-xl text-center",
        "bg-white shadow-sm hover:shadow-md transition-all duration-200 ease-in-out",
        "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center space-y-5 p-0">
        <Icon className="size-14 text-purple-600" />
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500 max-w-xs">{subtitle}</p>
        </div>
        <Button
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-gray-100">
          <div className="flex items-center gap-2 px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-6" />
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-8 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <DashboardCard
              icon={FilePlus}
              title="Create a Template"
              subtitle="Define document structures and extraction rules with ease."
              buttonText="Create Template"
              onClick={() => navigate("/templates/create")}
            />
            <DashboardCard
              icon={UploadCloud}
              title="Upload & Process File"
              subtitle="Effortlessly process and extract data from your documents."
              buttonText="Upload File"
              onClick={() => navigate("/templates/upload")}
            />
            <DashboardCard
              icon={BarChart2}
              title="View Analytics"
              subtitle="Track extraction performance and analyze document activity."
              buttonText="View Stats"
              onClick={() => navigate("/stats")}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
