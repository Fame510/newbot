'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  ChevronLeft, 
  ChevronRight, 
  Terminal, 
  Key, 
  Shield, 
  Server, 
  Zap,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  Shell,
  Github,
  MessageSquare,
  Bot,
  Settings,
  Eye,
  EyeOff,
  Copy,
  RefreshCw
} from 'lucide-react'

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Shell },
  { id: 'auth', title: 'API Keys', icon: Key },
  { id: 'gateway', title: 'Gateway', icon: Server },
  { id: 'channels', title: 'Channels', icon: MessageSquare },
  { id: 'skills', title: 'Skills', icon: Zap },
  { id: 'deploy', title: 'Deploy', icon: Shield },
]

const AUTH_PROVIDERS = [
  { id: 'openai-api-key', name: 'OpenAI', description: 'ChatGPT & GPT models', icon: '🤖' },
  { id: 'anthropic-api-key', name: 'Anthropic', description: 'Claude models', icon: '🧠' },
  { id: 'gemini-api-key', name: 'Google Gemini', description: 'Gemini models', icon: '💎' },
  { id: 'openrouter-api-key', name: 'OpenRouter', description: 'Multi-model access', icon: '🔀' },
  { id: 'ollama', name: 'Ollama', description: 'Local models', icon: '🏠' },
  { id: 'skip', name: 'Skip', description: 'Configure later', icon: '⏭️' },
]

const CHANNEL_OPTIONS = [
  { id: 'telegram', name: 'Telegram', icon: '📱', description: 'Bot integration' },
  { id: 'discord', name: 'Discord', icon: '💬', description: 'Bot integration' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '📱', description: 'Via Baileys' },
  { id: 'slack', name: 'Slack', icon: '💼', description: 'Bot integration' },
  { id: 'webchat', name: 'WebChat', icon: '🌐', description: 'Built-in web interface' },
]

interface WizardState {
  authChoice: string
  apiKey: string
  gatewayPort: string
  gatewayAuth: string
  gatewayToken: string
  gatewayPassword: string
  installDaemon: boolean
  selectedChannels: string[]
  telegramToken: string
  discordToken: string
  whatsappEnabled: boolean
  slackBotToken: string
  slackAppToken: string
  workspace: string
}

export default function OpenClawWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  
  const [state, setState] = useState<WizardState>({
    authChoice: '',
    apiKey: '',
    gatewayPort: '18789',
    gatewayAuth: 'token',
    gatewayToken: '',
    gatewayPassword: '',
    installDaemon: true,
    selectedChannels: ['webchat'],
    telegramToken: '',
    discordToken: '',
    whatsappEnabled: false,
    slackBotToken: '',
    slackAppToken: '',
    workspace: '',
  })

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return true
      case 'auth':
        return state.authChoice === 'skip' || state.apiKey.length > 0
      case 'gateway':
        return state.gatewayPort.length > 0 && 
               (state.gatewayAuth === 'token' ? state.gatewayToken.length > 0 : state.gatewayPassword.length > 0)
      case 'channels':
        return true
      case 'skills':
        return true
      case 'deploy':
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const generateToken = () => {
    const token = Array.from({ length: 32 }, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('')
    updateState({ gatewayToken: token })
  }

  const handleDeploy = async () => {
    setIsProcessing(true)
    setError(null)
    setLogs([])
    
    addLog('🦞 Starting OpenClaw onboarding...')
    
    try {
      // Build the command arguments
      const args = [
        '--non-interactive',
        '--accept-risk',
        `--auth-choice=${state.authChoice}`,
        `--gateway-port=${state.gatewayPort}`,
        `--gateway-auth=${state.gatewayAuth}`,
      ]
      
      if (state.authChoice !== 'skip' && state.apiKey) {
        args.push(`--${state.authChoice}=${state.apiKey}`)
      }
      
      if (state.gatewayAuth === 'token' && state.gatewayToken) {
        args.push(`--gateway-token=${state.gatewayToken}`)
      } else if (state.gatewayAuth === 'password' && state.gatewayPassword) {
        args.push(`--gateway-password=${state.gatewayPassword}`)
      }
      
      if (state.installDaemon) {
        args.push('--install-daemon')
      } else {
        args.push('--no-install-daemon')
      }
      
      if (state.selectedChannels.length === 0 || state.selectedChannels.includes('webchat')) {
        args.push('--skip-channels')
      }
      
      addLog(`Running: openclaw onboard ${args.join(' ')}`)
      
      // Call the API to execute the command
      const response = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ args, state }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        addLog('✅ Onboarding completed successfully!')
        if (result.output) {
          result.output.split('\n').forEach((line: string) => addLog(line))
        }
        setIsComplete(true)
      } else {
        throw new Error(result.error || 'Onboarding failed')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      addLog(`❌ Error: ${errorMsg}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                  <Shell className="w-16 h-16 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                  Welcome to OpenClaw
                </h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Your personal AI assistant that runs on your own devices
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="border-2 hover:border-orange-500/50 transition-colors">
                <CardHeader className="text-center">
                  <Shield className="w-8 h-8 mx-auto text-orange-500" />
                  <CardTitle className="text-lg">Private</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Run everything locally. Your data stays on your devices.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:border-orange-500/50 transition-colors">
                <CardHeader className="text-center">
                  <MessageSquare className="w-8 h-8 mx-auto text-orange-500" />
                  <CardTitle className="text-lg">Multi-Channel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    WhatsApp, Telegram, Discord, Slack & more
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:border-orange-500/50 transition-colors">
                <CardHeader className="text-center">
                  <Bot className="w-8 h-8 mx-auto text-orange-500" />
                  <CardTitle className="text-lg">Powerful</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Full system access, browser control, voice & more
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                This wizard will set up the OpenClaw Gateway on your system. 
                Agents have full system access when running locally.
              </AlertDescription>
            </Alert>
          </div>
        )
        
      case 'auth':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Choose Your AI Provider</h2>
              <p className="text-muted-foreground">
                Select an AI model provider to power your assistant
              </p>
            </div>
            
            <RadioGroup
              value={state.authChoice}
              onValueChange={(value) => updateState({ authChoice: value })}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {AUTH_PROVIDERS.map((provider) => (
                <div key={provider.id} className="relative">
                  <RadioGroupItem
                    value={provider.id}
                    id={provider.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={provider.id}
                    className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer hover:border-orange-500/50 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 transition-all"
                  >
                    <span className="text-2xl">{provider.icon}</span>
                    <div>
                      <div className="font-semibold">{provider.name}</div>
                      <div className="text-sm text-muted-foreground">{provider.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {state.authChoice && state.authChoice !== 'skip' && (
              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API Key
                  </Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      placeholder={`Enter your ${AUTH_PROVIDERS.find(p => p.id === state.authChoice)?.name} API key`}
                      value={state.apiKey}
                      onChange={(e) => updateState({ apiKey: e.target.value })}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
        
      case 'gateway':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Gateway Configuration</h2>
              <p className="text-muted-foreground">
                The gateway is the control plane for all OpenClaw operations
              </p>
            </div>
            
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="port">Gateway Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={state.gatewayPort}
                  onChange={(e) => updateState({ gatewayPort: e.target.value })}
                  placeholder="18789"
                />
                <p className="text-xs text-muted-foreground">
                  Default: 18789. The WebSocket gateway will listen on this port.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Authentication Mode</Label>
                <RadioGroup
                  value={state.gatewayAuth}
                  onValueChange={(value) => updateState({ gatewayAuth: value })}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="relative">
                    <RadioGroupItem value="token" id="auth-token" className="peer sr-only" />
                    <Label
                      htmlFor="auth-token"
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer hover:border-orange-500/50 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 transition-all"
                    >
                      <Key className="w-6 h-6" />
                      <span className="font-semibold">Token</span>
                      <span className="text-xs text-muted-foreground text-center">Simple token-based auth</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem value="password" id="auth-password" className="peer sr-only" />
                    <Label
                      htmlFor="auth-password"
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer hover:border-orange-500/50 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 transition-all"
                    >
                      <Shield className="w-6 h-6" />
                      <span className="font-semibold">Password</span>
                      <span className="text-xs text-muted-foreground text-center">Password-protected access</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {state.gatewayAuth === 'token' ? (
                <div className="space-y-2">
                  <Label htmlFor="token">Gateway Token</Label>
                  <div className="flex gap-2">
                    <Input
                      id="token"
                      type="text"
                      value={state.gatewayToken}
                      onChange={(e) => updateState({ gatewayToken: e.target.value })}
                      placeholder="Enter or generate a token"
                      className="font-mono"
                    />
                    <Button variant="outline" onClick={generateToken}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="password">Gateway Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={state.gatewayPassword}
                    onChange={(e) => updateState({ gatewayPassword: e.target.value })}
                    placeholder="Enter a password"
                  />
                </div>
              )}
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daemon">Install as Service</Label>
                  <p className="text-xs text-muted-foreground">
                    Run the gateway as a background service (launchd/systemd)
                  </p>
                </div>
                <Switch
                  id="daemon"
                  checked={state.installDaemon}
                  onCheckedChange={(checked) => updateState({ installDaemon: checked })}
                />
              </div>
            </div>
          </div>
        )
        
      case 'channels':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Channel Setup</h2>
              <p className="text-muted-foreground">
                Connect your messaging platforms (you can configure these later)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHANNEL_OPTIONS.map((channel) => (
                <div
                  key={channel.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    state.selectedChannels.includes(channel.id)
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'hover:border-orange-500/50'
                  }`}
                  onClick={() => {
                    const channels = state.selectedChannels.includes(channel.id)
                      ? state.selectedChannels.filter(c => c !== channel.id)
                      : [...state.selectedChannels, channel.id]
                    updateState({ selectedChannels: channels })
                  }}
                >
                  <span className="text-2xl">{channel.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{channel.name}</div>
                    <div className="text-sm text-muted-foreground">{channel.description}</div>
                  </div>
                  {state.selectedChannels.includes(channel.id) && (
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  )}
                </div>
              ))}
            </div>
            
            {state.selectedChannels.includes('telegram') && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                <Separator />
                <Label htmlFor="telegramToken">Telegram Bot Token</Label>
                <Input
                  id="telegramToken"
                  type="password"
                  value={state.telegramToken}
                  onChange={(e) => updateState({ telegramToken: e.target.value })}
                  placeholder="123456:ABC-DEF..."
                />
              </div>
            )}
            
            {state.selectedChannels.includes('discord') && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                <Separator />
                <Label htmlFor="discordToken">Discord Bot Token</Label>
                <Input
                  id="discordToken"
                  type="password"
                  value={state.discordToken}
                  onChange={(e) => updateState({ discordToken: e.target.value })}
                  placeholder="Bot token from Discord Developer Portal"
                />
              </div>
            )}
            
            {state.selectedChannels.includes('slack') && (
              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="slackBotToken">Slack Bot Token</Label>
                  <Input
                    id="slackBotToken"
                    type="password"
                    value={state.slackBotToken}
                    onChange={(e) => updateState({ slackBotToken: e.target.value })}
                    placeholder="xoxb-..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slackAppToken">Slack App Token</Label>
                  <Input
                    id="slackAppToken"
                    type="password"
                    value={state.slackAppToken}
                    onChange={(e) => updateState({ slackAppToken: e.target.value })}
                    placeholder="xapp-..."
                  />
                </div>
              </div>
            )}
          </div>
        )
        
      case 'skills':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Skills & Capabilities</h2>
              <p className="text-muted-foreground">
                Enable additional skills for your assistant
              </p>
            </div>
            
            <div className="grid gap-4">
              <Card className="border-2 border-green-500/50 bg-green-500/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <CardTitle className="text-lg">Core Skills (Included)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Bash</Badge>
                    <Badge variant="secondary">Browser</Badge>
                    <Badge variant="secondary">Canvas</Badge>
                    <Badge variant="secondary">Files</Badge>
                    <Badge variant="secondary">Memory</Badge>
                    <Badge variant="secondary">Search</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Core skills are always available and provide file operations, 
                    browser control, memory management, and more.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    Additional Skills
                  </CardTitle>
                  <CardDescription>
                    Discover and install community skills from ClawHub
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You can browse and install additional skills anytime using:
                  </p>
                  <code className="block mt-2 p-2 bg-muted rounded text-sm font-mono">
                    openclaw skills search &lt;query&gt;
                  </code>
                </CardContent>
              </Card>
            </div>
            
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertTitle>Tip</AlertTitle>
              <AlertDescription>
                Skills extend your assistant's capabilities. Visit 
                <a href="https://clawhub.com" target="_blank" className="text-orange-500 hover:underline ml-1">
                  ClawHub
                </a> to discover more.
              </AlertDescription>
            </Alert>
          </div>
        )
        
      case 'deploy':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Ready to Deploy</h2>
              <p className="text-muted-foreground">
                Review your configuration and start the gateway
              </p>
            </div>
            
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">AI Provider:</span>
                    <Badge variant="secondary" className="ml-2">
                      {AUTH_PROVIDERS.find(p => p.id === state.authChoice)?.name || 'Not set'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gateway Port:</span>
                    <Badge variant="secondary" className="ml-2">{state.gatewayPort}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Auth Mode:</span>
                    <Badge variant="secondary" className="ml-2 capitalize">{state.gatewayAuth}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Daemon:</span>
                    <Badge variant="secondary" className="ml-2">
                      {state.installDaemon ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Channels:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {state.selectedChannels.map(c => (
                        <Badge key={c} variant="outline">{c}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {logs.length > 0 && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Deployment Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48 bg-muted rounded-lg p-3">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {logs.join('\n')}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isComplete && (
              <Alert className="border-green-500 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-500">Success!</AlertTitle>
                <AlertDescription>
                  OpenClaw has been configured. Run <code className="px-1 py-0.5 bg-muted rounded">openclaw gateway</code> to start.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
              <Shell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">OpenClaw Setup</h1>
              <p className="text-sm text-slate-400">Onboarding Wizard</p>
            </div>
          </div>
          <Badge variant="outline" className="text-slate-300 border-slate-600">
            v2026.3.11
          </Badge>
        </div>
        
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-orange-500' : 'text-slate-500'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index < currentStep
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : index === currentStep
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-slate-600'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs mt-1 hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2 bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-red-500" />
        </div>
        
        {/* Main Content */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-between p-6 pt-0">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isProcessing}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleDeploy}
                disabled={isProcessing || isComplete}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : isComplete ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Deploy Now
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            OpenClaw is open source.{' '}
            <a 
              href="https://github.com/openclaw/openclaw" 
              target="_blank" 
              className="text-orange-500 hover:underline"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
