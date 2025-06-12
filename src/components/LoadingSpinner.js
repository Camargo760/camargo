import { Loader2 } from "lucide-react"

const LoadingSpinner = ({ siteTheme }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: siteTheme.bgColor }}>
      <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin h-16 w-16" style={{ color: siteTheme.accentColor }} />
        <p className="mt-4 text-lg" style={{ color: siteTheme.textColor }}>
          Loading, please wait...
        </p>
      </div>
    </div>
  )
}

export default LoadingSpinner
