import { Shield, Lightbulb } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">Corporate Risk AI</h1>
            <p className="text-xs text-muted-foreground">Enterprise Risk Assessment</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span className="hidden sm:inline">Tip: Use Batch Audit for bulk processing</span>
          <span className="sm:hidden">Batch for bulk</span>
        </div>
      </div>
    </header>
  )
}










