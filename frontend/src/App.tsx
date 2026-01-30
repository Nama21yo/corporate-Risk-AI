import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Header } from '@/components/Header'
import { SingleCompanySimulator } from '@/components/SingleCompanySimulator'
import { BatchPortfolioAudit } from '@/components/BatchPortfolioAudit'
import { Building2, FolderOpen } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('single')

  return (
    <TooltipProvider>
      <div className="min-h-screen gradient-mesh">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Corporate Bankruptcy Risk Assessment
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-Powered Financial Health Diagnostics
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Single Company
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Batch Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="animate-fade-in">
              <SingleCompanySimulator />
            </TabsContent>

            <TabsContent value="batch" className="animate-fade-in">
              <BatchPortfolioAudit />
            </TabsContent>
          </Tabs>
        </main>

        <footer className="border-t bg-background/50 backdrop-blur-sm mt-16">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            © 2026 Corporate Risk AI. Powered by Machine Learning & SHAP Analysis.
          </div>
        </footer>
      </div>
    </TooltipProvider>
  )
}

export default App










