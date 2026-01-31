import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp,  
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  BarChart3,
  DollarSign,
  PieChart,
  Activity,
  Percent,
  Zap,
  Target
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar } from 'recharts'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

interface FeatureSlider {
  name: string
  label: string
  description: string
  icon: React.ReactNode
  value: number
  category: 'solvency' | 'profitability'
}

interface PredictionResult {
  probability: number
  isHighRisk: boolean
  threshold: number
  featureImpacts: Array<{
    feature: string
    value: number
    impact: number
  }>
}

const defaultFeatures: FeatureSlider[] = [
  {
    name: 'Borrowing dependency',
    label: 'Borrowing Dependency',
    description: 'Dependency on external borrowing relative to total capital.',
    icon: <DollarSign className="h-4 w-4" />,
    value: 0.5,
    category: 'solvency'
  },
  {
    name: 'Liability to Equity',
    label: 'Liability to Equity Ratio',
    description: 'The proportion of company funds contributed by creditors vs owners.',
    icon: <PieChart className="h-4 w-4" />,
    value: 0.5,
    category: 'solvency'
  },
  {
    name: 'Continuous interest rate (after tax)',
    label: 'Interest Rate (After Tax)',
    description: 'Effective interest rate burden ensuring tax adjustments.',
    icon: <Percent className="h-4 w-4" />,
    value: 0.5,
    category: 'profitability'
  },
  {
    name: 'Net worth/Assets',
    label: 'Net Worth / Assets',
    description: 'Shareholder equity relative to total assets.',
    icon: <BarChart3 className="h-4 w-4" />,
    value: 0.5,
    category: 'profitability'
  },
  {
    name: 'Persistent EPS in the Last Four Seasons',
    label: 'Persistent EPS (Last 4 Seasons)',
    description: 'Earnings Per Share consistency over the last year.',
    icon: <Activity className="h-4 w-4" />,
    value: 0.5,
    category: 'profitability'
  }
]

export function SingleCompanySimulator() {
  const [features, setFeatures] = useState<FeatureSlider[]>(defaultFeatures)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)

  const handleSliderChange = (index: number, value: number[]) => {
    const newFeatures = [...features]
    newFeatures[index].value = value[0]
    setFeatures(newFeatures)
  }

  const handlePredict = async () => {
    setIsLoading(true)
    
    try {
      const userData: Record<string, number> = {}
      features.forEach(f => {
        userData[f.name] = f.value
      })

      const response = await fetch(`${API_BASE}/predict/single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (!response.ok) throw new Error('Prediction failed')
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Prediction error:', error)
      // Mock result for demo
      setResult({
        probability: Math.random() * 0.8,
        isHighRisk: Math.random() > 0.6,
        threshold: 0.4,
        featureImpacts: features.slice(0, 5).map(f => ({
          feature: f.label,
          value: f.value,
          impact: (Math.random() - 0.5) * 0.2
        }))
      })
    } finally {
      setIsLoading(false)
    }
  }

  const solvencyFeatures = features.filter(f => f.category === 'solvency')
  const profitabilityFeatures = features.filter(f => f.category === 'profitability')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Interactive Stress Testing
          </CardTitle>
          <CardDescription>
            Adjust the key financial levers below to simulate a specific company's operating scenario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Solvency & Leverage */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-sky-100 flex items-center justify-center">
                  <PieChart className="h-4 w-4 text-sky-600" />
                </div>
                <h3 className="font-semibold text-foreground">Solvency & Leverage</h3>
              </div>
              
              {solvencyFeatures.map((feature) => (
                <FeatureSliderItem
                  key={feature.name}
                  feature={feature}
                  onChange={(value) => handleSliderChange(features.indexOf(feature), value)}
                />
              ))}
            </div>

            {/* Profitability & Efficiency */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-foreground">Profitability & Efficiency</h3>
              </div>
              
              {profitabilityFeatures.map((feature) => (
                <FeatureSliderItem
                  key={feature.name}
                  feature={feature}
                  onChange={(value) => handleSliderChange(features.indexOf(feature), value)}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <Button 
              onClick={handlePredict} 
              size="lg" 
              className="w-full md:w-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Run Risk Assessment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {isLoading && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      {result && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          {/* Risk Overview Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className={`border-2 ${result.isHighRisk ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100/50' : 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Risk Score</span>
                  {result.isHighRisk ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
                <div className={`text-4xl font-bold mb-1 ${result.isHighRisk ? 'text-red-600' : 'text-emerald-600'}`}>
                  {(result.probability * 100).toFixed(1)}%
                </div>
                <Badge variant={result.isHighRisk ? 'destructive' : 'success'} className="text-xs">
                  {result.isHighRisk ? 'HIGH RISK' : 'STABLE'}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Threshold</span>
                  <Target className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-4xl font-bold text-amber-600 mb-1">
                  {(result.threshold * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">Safety Limit</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-sky-300 bg-gradient-to-br from-sky-50 to-sky-100/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
                  <Zap className="h-5 w-5 text-sky-500" />
                </div>
                <div className="text-4xl font-bold text-sky-600 mb-1">
                  {result.probability < 0.2 ? 'Low' : result.probability < 0.4 ? 'Medium' : result.probability < 0.6 ? 'High' : 'Critical'}
                </div>
                <p className="text-xs text-muted-foreground">Assessment</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Gauge Visualization */}
          <Card className={result.isHighRisk ? 'border-red-200' : 'border-emerald-200'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Risk Probability Gauge
              </CardTitle>
              <CardDescription>
                {result.isHighRisk 
                  ? `Risk Score exceeds safety threshold. The company exhibits strong signals of financial distress.`
                  : `Risk Score is below safety threshold. Current metrics suggest a healthy financial outlook.`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="90%" 
                  barSize={20} 
                  data={[
                    { name: 'Risk', value: result.probability * 100, fill: result.isHighRisk ? '#ef4444' : '#10b981' }
                  ]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold" fill={result.isHighRisk ? '#ef4444' : '#10b981'}>
                    {(result.probability * 100).toFixed(1)}%
                  </text>
                  <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-sm" fill="#6b7280">
                    Risk Probability
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Risk</span>
                  <span className="font-semibold">{(result.probability * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={result.probability * 100} 
                  className="h-3"
                  indicatorClassName={result.isHighRisk ? 'bg-red-500' : 'bg-emerald-500'}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Safe (0-{(result.threshold * 100).toFixed(0)}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Risk ({(result.threshold * 100).toFixed(0)}%-100%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Impact Visualization */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Key Risk Drivers
                </CardTitle>
                <CardDescription>
                  Top factors influencing the risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={result.featureImpacts} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" domain={[-0.15, 0.15]} tickFormatter={(value) => `${(value * 100).toFixed(1)}%`} />
                    <YAxis type="category" dataKey="feature" width={150} tick={{ fontSize: 12 }} />
                    <RechartsTooltip 
                      formatter={(value: any) => [`${(value * 100).toFixed(2)}%`, 'Impact']}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                      {result.featureImpacts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.impact > 0 ? '#ef4444' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="flex justify-center gap-6 mt-4 pt-4 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-emerald-500" />
                    <span>Reduces Risk</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-500" />
                    <span>Increases Risk</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Feature Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Impact Analysis
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of each feature's contribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.featureImpacts.map((impact, idx) => (
                    <div key={idx} className="group hover:bg-muted/50 p-3 rounded-lg transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${impact.impact > 0 ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse-gentle`} />
                          <span className="font-medium text-sm">{impact.feature}</span>
                        </div>
                        <Badge variant={impact.impact > 0 ? 'destructive' : 'success'} className="text-xs">
                          {impact.impact > 0 ? '+' : ''}{(impact.impact * 100).toFixed(2)}%
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>Current Value</span>
                          <span className="font-mono">{impact.value.toFixed(3)}</span>
                        </div>
                        <Progress 
                          value={Math.abs(impact.impact) * 500} 
                          className="h-2"
                          indicatorClassName={impact.impact > 0 ? 'bg-red-400' : 'bg-emerald-400'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function FeatureSliderItem({ 
  feature, 
  onChange 
}: { 
  feature: FeatureSlider
  onChange: (value: number[]) => void 
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{feature.icon}</span>
          <Label className="font-medium">{feature.label}</Label>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{feature.description}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
          {feature.value.toFixed(2)}
        </span>
      </div>
      <Slider
        value={[feature.value]}
        onValueChange={onChange}
        min={0}
        max={1}
        step={0.01}
        className="w-full"
      />
    </div>
  )
}
