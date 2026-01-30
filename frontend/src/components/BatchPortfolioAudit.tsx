import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2,
  Building2,
  TrendingUp,
  BarChart3,
  X,
  FileText,
  PieChart,
  Shield,
  Activity
} from 'lucide-react'
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface CompanyResult {
  id: number
  riskScore: number
  status: 'HIGH RISK' | 'Stable'
  data: Record<string, number>
}

interface BatchResult {
  results: CompanyResult[]
  summary: {
    totalCompanies: number
    highRiskCount: number
    stableCount: number
    averageRisk: number
  }
}

export function BatchPortfolioAudit() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<BatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setResult(null)
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  })

  const handleUpload = async () => {
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/predict/batch', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Batch prediction failed')

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error('Batch prediction error:', err)
      // Mock result for demo
      const mockResults: CompanyResult[] = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        riskScore: Math.random(),
        status: Math.random() > 0.7 ? 'HIGH RISK' : 'Stable',
        data: {
          'Borrowing dependency': Math.random(),
          'Liability to Equity': Math.random(),
          'Net worth/Assets': Math.random()
        }
      }))

      setResult({
        results: mockResults,
        summary: {
          totalCompanies: mockResults.length,
          highRiskCount: mockResults.filter(r => r.status === 'HIGH RISK').length,
          stableCount: mockResults.filter(r => r.status === 'Stable').length,
          averageRisk: mockResults.reduce((acc, r) => acc + r.riskScore, 0) / mockResults.length
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadTemplate = () => {
    const columns = [
      'Borrowing dependency',
      'Continuous interest rate (after tax)',
      'Net worth/Assets',
      'Persistent EPS in the Last Four Seasons',
      'Liability to Equity'
    ]
    const csv = columns.join(',') + '\n'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'portfolio_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadResults = () => {
    if (!result) return

    const headers = ['ID', 'Risk Score', 'Status', ...Object.keys(result.results[0]?.data || {})]
    const rows = result.results.map(r => [
      r.id,
      (r.riskScore * 100).toFixed(2) + '%',
      r.status,
      ...Object.values(r.data).map(v => v.toFixed(4))
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'risk_audit_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearFile = () => {
    setFile(null)
    setResult(null)
    setError(null)
  }

  const getDistributionData = (results: CompanyResult[]) => {
    const ranges = [
      { range: '0-20%', min: 0, max: 0.2, count: 0 },
      { range: '20-40%', min: 0.2, max: 0.4, count: 0 },
      { range: '40-60%', min: 0.4, max: 0.6, count: 0 },
      { range: '60-80%', min: 0.6, max: 0.8, count: 0 },
      { range: '80-100%', min: 0.8, max: 1.0, count: 0 }
    ]

    results.forEach(result => {
      const range = ranges.find(r => result.riskScore >= r.min && result.riskScore < r.max)
      if (range) range.count++
    })

    return ranges
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Batch Portfolio Risk Scan
          </CardTitle>
          <CardDescription>
            Upload a CSV file containing financial data for multiple companies. The AI will scan the entire portfolio and flag high-risk entities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Download Template */}
            <Card className="border-dashed">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center">
                    <Download className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">1. Get Template</h3>
                    <p className="text-sm text-muted-foreground">Download the standard CSV template</p>
                  </div>
                </div>
                <Button variant="outline" onClick={downloadTemplate} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card className="border-dashed">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">2. Upload Portfolio</h3>
                    <p className="text-sm text-muted-foreground">Upload your populated CSV file</p>
                  </div>
                </div>

                {!file ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    {isDragActive ? (
                      <p className="text-primary font-medium">Drop the file here...</p>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Drag & drop a CSV file here, or click to select
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Only .csv files are supported
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-emerald-500" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={clearFile}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {file && (
            <div className="mt-6 pt-6 border-t">
              <Button 
                onClick={handleUpload} 
                size="lg" 
                disabled={isLoading}
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Scanning Portfolio...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Run Portfolio Audit
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
              <Skeleton className="h-64" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Companies</p>
                    <p className="text-3xl font-bold text-foreground">{result.summary.totalCompanies}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-sky-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={result.summary.highRiskCount > 0 ? 'border-red-200' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">High Risk Alerts</p>
                    <p className={`text-3xl font-bold ${result.summary.highRiskCount > 0 ? 'text-red-500' : 'text-foreground'}`}>
                      {result.summary.highRiskCount}
                    </p>
                    {result.summary.highRiskCount > 0 && (
                      <Badge variant="destructive" className="mt-1">Attention Needed</Badge>
                    )}
                  </div>
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    result.summary.highRiskCount > 0 ? 'bg-red-100' : 'bg-emerald-100'
                  }`}>
                    {result.summary.highRiskCount > 0 ? (
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Portfolio Average Risk</p>
                    <p className="text-3xl font-bold text-foreground">
                      {(result.summary.averageRisk * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detail View</CardTitle>
                <Button variant="outline" onClick={downloadResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="sticky left-0 bg-background z-10 text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Risk Score</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      {result.results.length > 0 && Object.keys(result.results[0].data).map((key) => (
                        <th key={key} className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">
                          {key}
                        </th>
                      ))}
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((company) => (
                      <tr 
                        key={company.id} 
                        className={`border-b last:border-0 transition-colors ${
                          company.status === 'HIGH RISK' 
                            ? 'bg-red-50/50 hover:bg-red-50' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <td className="sticky left-0 bg-background py-3 px-4 font-medium">{company.id}</td>
                        <td className="py-3 px-4">
                          <span className={`font-mono font-semibold ${
                            company.status === 'HIGH RISK' ? 'text-red-600' : 'text-emerald-600'
                          }`}>
                            {(company.riskScore * 100).toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={company.status === 'HIGH RISK' ? 'destructive' : 'success'}>
                            {company.status === 'HIGH RISK' ? (
                              <><AlertTriangle className="h-3 w-3 mr-1" /> HIGH RISK</>
                            ) : (
                              <><CheckCircle2 className="h-3 w-3 mr-1" /> Stable</>
                            )}
                          </Badge>
                        </td>
                        {Object.values(company.data).map((value, idx) => (
                          <td key={idx} className="py-3 px-4 font-mono text-xs">
                            {typeof value === 'number' ? value.toFixed(4) : value}
                          </td>
                        ))}
                        <td className="py-3 px-4 w-48">
                          <Progress 
                            value={company.riskScore * 100} 
                            className="h-2"
                            indicatorClassName={company.status === 'HIGH RISK' ? 'bg-red-500' : 'bg-emerald-500'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
