import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { FilePlus, UploadCloud, BarChart2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"


function DashboardCard({ icon: Icon, title, subtitle, buttonText, onClick }: {
  icon: any
  title: string
  subtitle: string
  buttonText: string
  onClick: () => void
}) {
  return (
    <Card className="flex flex-col items-center justify-center p-8 border-dashed border-2 border-gray-300 rounded-lg text-center bg-white">
      <CardContent className="flex flex-col items-center space-y-4">
        <Icon className="size-12 text-gray-400" />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <Button onClick={onClick}>{buttonText}</Button>
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
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Cards grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <DashboardCard
              icon={FilePlus}
              title="Create a Template"
              subtitle="Define document structures and extraction rules"
              buttonText="Create Template"
              onClick={() => navigate("/templates/create")}
            />
            <DashboardCard
              icon={UploadCloud}
              title="Upload File"
              subtitle="Process and extract data from your documents"
              buttonText="Upload File"
              onClick={() => navigate("/upload")}
            />
            <DashboardCard
              icon={BarChart2}
              title="View Stats"
              subtitle="Track extraction performance and document activity"
              buttonText="View Stats"
              onClick={() => navigate("/stats")}
            />
          </div>

          {/* Placeholder content */}
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
