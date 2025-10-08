"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Settings, Save, TestTube, AlertTriangle, CheckCircle } from "lucide-react"

// Mock AI configuration data
const mockAIConfig = {
  models: {
    primary: "gpt-4",
    fallback: "gpt-3.5-turbo",
    available: ["gpt-4", "gpt-3.5-turbo", "claude-3", "gemini-pro"],
  },
  parameters: {
    price: 2048,
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
  },
  prompts: {
    systemPrompt:
      "You are a professional legal document assistant. Generate accurate, legally compliant documents based on user requirements.",
    documentTemplates: {
      contract: "Generate a professional contract with the following terms...",
      letter: "Create a formal business letter with...",
      agreement: "Draft a legal agreement that includes...",
    },
  },
  limits: {
    dailyLimit: 1000,
    userDailyLimit: 10,
    maxFileSize: 10, // MB
    allowedFileTypes: ["pdf", "txt", "docx"],
  },
  features: {
    fileUpload: true,
    multipleFormats: true,
    templateCustomization: true,
    bulkGeneration: false,
  },
}

export function AiConfigSection() {
  const [config, setConfig] = useState(mockAIConfig)
  const [testPrompt, setTestPrompt] = useState("")
  const [testResult, setTestResult] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleConfigChange = (section: string, field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSaveConfig = () => {
    // TODO: Save configuration to backend
    console.log("Saving AI configuration:", config)
    setHasChanges(false)
  }

  const handleTestModel = async () => {
    if (!testPrompt.trim()) return

    setIsTesting(true)

    // Simulate API call
    setTimeout(() => {
      setTestResult(
        `Test response from ${config.models.primary}:\n\nThis is a simulated response to: "${testPrompt}"\n\nModel parameters:\n- Temperature: ${config.parameters.temperature}\n- Max Tokens: ${config.parameters.maxTokens}\n- Top P: ${config.parameters.topP}`,
      )
      setIsTesting(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Configuration
          </h2>
          <p className="text-gray-600">Configure AI models and document generation settings</p>
        </div>
        <Button onClick={handleSaveConfig} disabled={!hasChanges} className="bg-purple-600 hover:bg-purple-700">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="limits">Limits & Features</TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Configuration</CardTitle>
              <CardDescription>Select and configure AI models for document generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="primary-model">Primary Model</Label>
                  <Select
                    value={config.models.primary}
                    onValueChange={(value) => handleConfigChange("models", "primary", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.models.available.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                          {model === "gpt-4" && <Badge className="ml-2 bg-green-100 text-green-800">Recommended</Badge>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fallback-model">Fallback Model</Label>
                  <Select
                    value={config.models.fallback}
                    onValueChange={(value) => handleConfigChange("models", "fallback", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.models.available.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Settings className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Model Selection Guide</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>GPT-4:</strong> Best quality, higher cost, slower
                      </li>
                      <li>
                        <strong>GPT-3.5-Turbo:</strong> Good balance of quality and speed
                      </li>
                      <li>
                        <strong>Claude-3:</strong> Excellent for legal documents
                      </li>
                      <li>
                        <strong>Gemini-Pro:</strong> Good for technical documents
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters">
          <Card>
            <CardHeader>
              <CardTitle>Model Parameters</CardTitle>
              <CardDescription>Fine-tune AI model behavior and output quality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="max-tokens">Max Tokens: {config.parameters.maxTokens}</Label>
                  <input
                    type="range"
                    id="max-tokens"
                    min="512"
                    max="4096"
                    step="256"
                    value={config.parameters.maxTokens}
                    onChange={(e) => handleConfigChange("parameters", "maxTokens", Number.parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>512</span>
                    <span>4096</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="temperature">Temperature: {config.parameters.temperature}</Label>
                  <input
                    type="range"
                    id="temperature"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.parameters.temperature}
                    onChange={(e) => handleConfigChange("parameters", "temperature", Number.parseFloat(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 (Focused)</span>
                    <span>2 (Creative)</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="top-p">Top P: {config.parameters.topP}</Label>
                  <input
                    type="range"
                    id="top-p"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.parameters.topP}
                    onChange={(e) => handleConfigChange("parameters", "topP", Number.parseFloat(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>1</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="frequency-penalty">Frequency Penalty: {config.parameters.frequencyPenalty}</Label>
                  <input
                    type="range"
                    id="frequency-penalty"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={config.parameters.frequencyPenalty}
                    onChange={(e) =>
                      handleConfigChange("parameters", "frequencyPenalty", Number.parseFloat(e.target.value))
                    }
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>-2</span>
                    <span>2</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Parameter Guidelines</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>Temperature:</strong> Lower values (0.3-0.7) for formal documents
                      </li>
                      <li>
                        <strong>Max Tokens:</strong> 2048+ recommended for full documents
                      </li>
                      <li>
                        <strong>Top P:</strong> 0.9 is optimal for most use cases
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Templates</CardTitle>
              <CardDescription>Customize AI prompts for different document types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={config.prompts.systemPrompt}
                  onChange={(e) => handleConfigChange("prompts", "systemPrompt", e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div className="space-y-4">
                <Label>Document Type Templates</Label>
                {Object.entries(config.prompts.documentTemplates).map(([type, template]) => (
                  <div key={type}>
                    <Label htmlFor={`template-${type}`} className="capitalize">
                      {type} Template
                    </Label>
                    <Textarea
                      id={`template-${type}`}
                      value={template}
                      onChange={(e) => {
                        const newTemplates = { ...config.prompts.documentTemplates, [type]: e.target.value }
                        handleConfigChange("prompts", "documentTemplates", newTemplates)
                      }}
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits & Features</CardTitle>
              <CardDescription>Configure usage limits and enable/disable features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="daily-limit">Daily Generation Limit</Label>
                  <Input
                    id="daily-limit"
                    type="number"
                    value={config.limits.dailyLimit}
                    onChange={(e) => handleConfigChange("limits", "dailyLimit", Number.parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="user-daily-limit">Per User Daily Limit</Label>
                  <Input
                    id="user-daily-limit"
                    type="number"
                    value={config.limits.userDailyLimit}
                    onChange={(e) => handleConfigChange("limits", "userDailyLimit", Number.parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                  <Input
                    id="max-file-size"
                    type="number"
                    value={config.limits.maxFileSize}
                    onChange={(e) => handleConfigChange("limits", "maxFileSize", Number.parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Feature Toggles</Label>
                <div className="space-y-3">
                  {Object.entries(config.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <Label htmlFor={`feature-${feature}`} className="capitalize">
                        {feature.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                      <Switch
                        id={`feature-${feature}`}
                        checked={enabled}
                        onCheckedChange={(checked) => handleConfigChange("features", feature, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test AI Model
          </CardTitle>
          <CardDescription>Test your current AI configuration with a sample prompt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-prompt">Test Prompt</Label>
            <Textarea
              id="test-prompt"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter a test prompt to see how the AI responds with current settings..."
              rows={3}
              className="mt-2"
            />
          </div>

          <Button onClick={handleTestModel} disabled={!testPrompt.trim() || isTesting} className="w-full">
            {isTesting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Test Model
              </>
            )}
          </Button>

          {testResult && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm">Test Result</span>
              </div>
              <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
