import { useState, useEffect } from "react";
import { Database, CheckCircle, XCircle, RefreshCw, Box, FileJson, ArrowRight, Calculator } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface DataModel {
  name: string;
  fields: { name: string; type: string; required?: boolean }[];
  relationships?: string[];
}

export function Admin() {
  const [storageStatus, setStorageStatus] = useState<"healthy" | "error" | "checking">("checking");
  const [storageSize, setStorageSize] = useState({ used: 0, total: 0 });
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [dataStats, setDataStats] = useState({
    scenarios: 0,
    settings: 0,
  });

  // Data models used in the app
  const dataModels: DataModel[] = [
    {
      name: "Scenario",
      fields: [
        { name: "id", type: "string", required: true },
        { name: "name", type: "string", required: true },
        { name: "description", type: "string" },
        { name: "status", type: "'draft' | 'committed'", required: true },
        { name: "quarter", type: "string", required: true },
        { name: "teamSize", type: "{ uxDesign: number; contentDesign: number }", required: true },
        { name: "capacity", type: "{ uxDesign: number; contentDesign: number }", required: true },
        { name: "demand", type: "{ uxDesign: number; contentDesign: number }", required: true },
        { name: "roadmapItemsCount", type: "number", required: true },
        { name: "createdAt", type: "Date", required: true },
      ],
      relationships: ["RoadmapItem (many)"],
    },
    {
      name: "RoadmapItem",
      fields: [
        { name: "id", type: "string", required: true },
        { name: "key", type: "string", required: true },
        { name: "name", type: "string", required: true },
        { name: "initiative", type: "string", required: true },
        { name: "priority", type: "string", required: true },
        { name: "quarter", type: "string", required: true },
        { name: "status", type: "'draft' | 'committed'", required: true },
        { name: "projectType", type: "'net-new' | 'new-feature' | 'enhancement' | 'optimization' | 'fix-polish'" },
        { name: "uxFocusWeeks", type: "number", required: true },
        { name: "contentFocusWeeks", type: "number", required: true },
        { name: "uxProductRisk", type: "number (1-5)" },
        { name: "uxProblemAmbiguity", type: "number (1-5)" },
        { name: "contentSurfaceArea", type: "number (1-5)" },
        { name: "contentLocalizationScope", type: "number (1-5)" },
      ],
      relationships: ["Scenario (belongs to)"],
    },
    {
      name: "Settings",
      fields: [
        { name: "effortWeights", type: "EffortWeights", required: true },
        { name: "effortModelEnabled", type: "boolean", required: true },
        { name: "workstreamPenalty", type: "number", required: true },
        { name: "workstreamImpactEnabled", type: "boolean", required: true },
        { name: "focusTimeRatio", type: "number", required: true },
        { name: "planningPeriods", type: "PlanningPeriods", required: true },
        { name: "sizeBandThresholds", type: "SizeBandThresholds", required: true },
        { name: "projectTypeDemand", type: "ProjectTypeDemand", required: true },
      ],
    },
    {
      name: "EffortWeights",
      fields: [
        { name: "productRisk", type: "number (1-10)", required: true },
        { name: "problemAmbiguity", type: "number (1-10)", required: true },
        { name: "contentSurface", type: "number (1-10)", required: true },
        { name: "localizationScope", type: "number (1-10)", required: true },
      ],
    },
    {
      name: "SizeBandThresholds",
      fields: [
        { name: "xs", type: "{ min: 0, max: 2 }", required: true },
        { name: "s", type: "{ min: 2, max: 4 }", required: true },
        { name: "m", type: "{ min: 4, max: 8 }", required: true },
        { name: "l", type: "{ min: 8, max: 12 }", required: true },
        { name: "xl", type: "{ min: 12 }", required: true },
      ],
    },
    {
      name: "ProjectTypeDemand",
      fields: [
        { name: "net-new", type: "{ ux: 'XL', content: 'XL' }", required: true },
        { name: "new-feature", type: "{ ux: 'L', content: 'L' }", required: true },
        { name: "enhancement", type: "{ ux: 'M', content: 'S' }", required: true },
        { name: "optimization", type: "{ ux: 'S', content: 'XS' }", required: true },
        { name: "fix-polish", type: "{ ux: 'XS', content: 'XS' }", required: true },
      ],
    },
  ];

  const checkStorageHealth = () => {
    setStorageStatus("checking");
    try {
      // Test localStorage access
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);

      // Get storage size estimate
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }

      // Estimate in KB
      const usedKB = totalSize / 1024;
      const totalKB = 5120; // 5MB typical localStorage limit

      setStorageSize({ used: usedKB, total: totalKB });

      // Get data counts
      const scenarios = localStorage.getItem("scenarios");
      const settings = localStorage.getItem("capacityPlannerSettings");

      setDataStats({
        scenarios: scenarios ? JSON.parse(scenarios).length : 0,
        settings: settings ? 1 : 0,
      });

      setStorageStatus("healthy");
      setLastChecked(new Date());
    } catch (error) {
      console.error("Storage health check failed:", error);
      setStorageStatus("error");
    }
  };

  useEffect(() => {
    checkStorageHealth();
  }, []);

  const clearAllData = () => {
    if (confirm("⚠️ This will delete ALL data including scenarios and settings. Are you sure?")) {
      localStorage.clear();
      checkStorageHealth();
      alert("All data has been cleared.");
    }
  };

  const exportData = () => {
    const data = {
      scenarios: localStorage.getItem("scenarios"),
      settings: localStorage.getItem("capacityPlannerSettings"),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capacity-planner-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <span>Get Started</span>
        <span>/</span>
        <span className="text-foreground font-medium">Admin</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground leading-relaxed">
            Monitor database connection and data models
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700">
          ADMIN ONLY
        </Badge>
      </div>

      {/* Database Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Status
            </CardTitle>
            <CardDescription>LocalStorage connection health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="flex items-center gap-2">
                {storageStatus === "healthy" && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Healthy</span>
                  </>
                )}
                {storageStatus === "error" && (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Error</span>
                  </>
                )}
                {storageStatus === "checking" && (
                  <>
                    <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                    <span className="text-sm font-medium text-blue-600">Checking...</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Checked</span>
              <span className="text-sm font-medium text-foreground">
                {lastChecked.toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Storage Used</span>
              <span className="text-sm font-medium text-foreground">
                {storageSize.used.toFixed(2)} KB / {storageSize.total} KB
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all"
                style={{ width: `${(storageSize.used / storageSize.total) * 100}%` }}
              />
            </div>

            <Button
              onClick={checkStorageHealth}
              variant="outline"
              size="sm"
              className="w-full mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              Data Statistics
            </CardTitle>
            <CardDescription>Current data counts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plans</span>
              <span className="text-2xl font-semibold text-foreground">{dataStats.scenarios}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Settings Config</span>
              <span className="text-2xl font-semibold text-foreground">{dataStats.settings}</span>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <Button
                onClick={exportData}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <FileJson className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button
                onClick={clearAllData}
                variant="outline"
                size="sm"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Focus Weeks Calculation Models */}
      <Card className="border border-border shadow-sm mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Focus Weeks Calculation Models
          </CardTitle>
          <CardDescription>
            Visualization of factors influencing effort calculations for UX and Content Design
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Project Type Demand Mapping */}
          <div className="mb-8 border border-purple-200 dark:border-purple-800 rounded-lg p-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold text-sm">📊</span>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-foreground mb-1">
                  Project Type → Demand Effort Mapping
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Each project type is automatically mapped to a demand level (XS-XL), which then converts to max focus weeks from the Size Band Thresholds.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mapping Table */}
              <div className="bg-white dark:bg-gray-900 border border-border rounded-lg p-4">
                <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-3 uppercase tracking-wide">
                  Project Type Demand Levels
                </div>
                <div className="space-y-2">
                  {[
                    { emoji: '🆕', label: 'Net New', ux: 'XL', content: 'XL' },
                    { emoji: '✨', label: 'New Feature', ux: 'L', content: 'L' },
                    { emoji: '🔧', label: 'Enhancement', ux: 'M', content: 'S' },
                    { emoji: '⚡', label: 'Optimization', ux: 'S', content: 'XS' },
                    { emoji: '🩹', label: 'Fix/Polish', ux: 'XS', content: 'XS' },
                  ].map((type) => (
                    <div key={type.label} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{type.emoji}</span>
                        <span className="text-sm font-medium text-foreground">{type.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-purple-600 dark:text-purple-400">UX: {type.ux}</span>
                        <span className="text-pink-600 dark:text-pink-400">Content: {type.content}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Size Band to Weeks Conversion */}
              <div className="bg-white dark:bg-gray-900 border border-border rounded-lg p-4">
                <div className="text-xs font-semibold text-pink-700 dark:text-pink-400 mb-3 uppercase tracking-wide">
                  Demand Level → Focus Weeks
                </div>
                <div className="space-y-2">
                  {[
                    { level: 'XS', min: 0, max: 2, weeks: 2 },
                    { level: 'S', min: 2, max: 4, weeks: 4 },
                    { level: 'M', min: 4, max: 8, weeks: 8 },
                    { level: 'L', min: 8, max: 12, weeks: 12 },
                    { level: 'XL', min: 12, max: null, weeks: 12 },
                  ].map((band) => (
                    <div key={band.level} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground w-6">{band.level}</span>
                        <span className="text-xs text-muted-foreground">
                          ({band.min}-{band.max || '∞'} weeks)
                        </span>
                      </div>
                      <div className="text-sm font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                        → {band.weeks} weeks
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                <strong className="text-foreground">Example:</strong> A "New Feature" project has UX demand level "L" and Content demand level "L". 
                This maps to <strong className="text-cyan-600">12 weeks</strong> for UX and <strong className="text-cyan-600">12 weeks</strong> for Content, 
                which are summed across all roadmap items to calculate total scenario demand.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* UX Design Model */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">UX Design</h3>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                  Product Design
                </Badge>
              </div>

              {/* Input Factors */}
              <div className="border border-border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-3 uppercase tracking-wide">
                  Input Factors
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-foreground">Base Focus Weeks</span>
                    <span className="text-xs text-muted-foreground ml-auto">(User Input)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-foreground">Product Risk</span>
                    <span className="text-xs text-muted-foreground ml-auto">(1-5 scale)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-foreground">Problem Ambiguity</span>
                    <span className="text-xs text-muted-foreground ml-auto">(1-5 scale)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Settings/Weights */}
              <div className="border border-border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20">
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-3 uppercase tracking-wide">
                  Settings Weights
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-foreground">Product Risk Weight</span>
                    <span className="text-xs text-muted-foreground ml-auto">(1-10)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-foreground">Problem Ambiguity Weight</span>
                    <span className="text-xs text-muted-foreground ml-auto">(1-10)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-foreground">Effort Model Toggle</span>
                    <span className="text-xs text-muted-foreground ml-auto">(On/Off)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Formula */}
              <div className="border border-border rounded-lg p-4 bg-cyan-50 dark:bg-cyan-950/20">
                <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 mb-3 uppercase tracking-wide">
                  Calculation Formula
                </div>
                <div className="space-y-3">
                  <div className="font-mono text-xs text-foreground bg-white dark:bg-gray-900 p-3 rounded border border-border">
                    <div className="mb-2">
                      <span className="text-green-600">multiplier</span> = 
                      <span className="text-purple-600"> weight</span> / 10
                    </div>
                    <div className="mb-2">
                      <span className="text-green-600">complexity</span> = 
                      <span className="text-blue-600"> factor</span> × 
                      <span className="text-green-600"> multiplier</span>
                    </div>
                    <div className="pt-2 border-t border-border text-cyan-700 dark:text-cyan-400">
                      <strong>Total</strong> = baseWeeks + complexities
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Example: Base 2 weeks + (Risk:3 × 0.4) + (Ambig:2 × 0.5) = 4.2 weeks
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Output */}
              <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 uppercase tracking-wide">
                  Output
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-base font-semibold text-foreground">UX Focus Weeks</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Stored in RoadmapItem.uxFocusWeeks
                </div>
              </div>
            </div>

            {/* Content Design Model */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Content Design</h3>
                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700">
                  Content Design
                </Badge>
              </div>

              {/* Input Factors */}
              <div className="border border-border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-3 uppercase tracking-wide">
                  Input Factors
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-foreground">Base Focus Weeks</span>
                    <span className="text-xs text-muted-foreground ml-auto">(User Input)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-foreground">Content Surface Area</span>
                    <span className="text-xs text-muted-foreground ml-auto">(1-5 scale)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-foreground">Localization Scope</span>
                    <span className="text-xs text-muted-foreground ml-auto">(1-5 scale)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Settings/Weights */}
              <div className="border border-border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20">
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-3 uppercase tracking-wide">
                  Settings Weights
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-foreground">Content Surface Weight</span>
                    <span className="text-xs text-muted-foreground ml-auto">(1-10)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-foreground">Localization Weight</span>
                    <span className="text-xs text-muted-foreground ml-auto">(1-10)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-foreground">Effort Model Toggle</span>
                    <span className="text-xs text-muted-foreground ml-auto">(On/Off)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Formula */}
              <div className="border border-border rounded-lg p-4 bg-cyan-50 dark:bg-cyan-950/20">
                <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 mb-3 uppercase tracking-wide">
                  Calculation Formula
                </div>
                <div className="space-y-3">
                  <div className="font-mono text-xs text-foreground bg-white dark:bg-gray-900 p-3 rounded border border-border">
                    <div className="mb-2">
                      <span className="text-green-600">multiplier</span> = 
                      <span className="text-purple-600"> weight</span> / 10
                    </div>
                    <div className="mb-2">
                      <span className="text-green-600">complexity</span> = 
                      <span className="text-blue-600"> factor</span> × 
                      <span className="text-green-600"> multiplier</span>
                    </div>
                    <div className="pt-2 border-t border-border text-cyan-700 dark:text-cyan-400">
                      <strong>Total</strong> = baseWeeks + complexities
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Example: Base 1 week + (Surface:4 × 0.5) + (Local:2 × 0.5) = 4 weeks
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Output */}
              <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 uppercase tracking-wide">
                  Output
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-base font-semibold text-foreground">Content Focus Weeks</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Stored in RoadmapItem.contentFocusWeeks
                </div>
              </div>
            </div>
          </div>

          {/* Key Notes */}
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3">Key Notes:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 mt-1">•</span>
                <span>Complexity factors are optional and rated on a 1-5 scale in the roadmap modal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 mt-1">•</span>
                <span>Settings weights (1-10) are converted to multipliers using formula: weight / 10</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 mt-1">•</span>
                <span>If Effort Model is disabled in Settings, complexity adjustments are not applied</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 mt-1">•</span>
                <span>Final focus weeks are used to calculate demand and capacity in scenarios</span>
              </li>
            </ul>
          </div>

          {/* Focus Time Ratio - Capacity Calculation */}
          <div className="mt-6 pt-6 border-t-2 border-dashed border-border">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">?</span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-foreground mb-1">
                    Where does Focus Time Ratio fit in?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    The Focus Time Ratio is used at the <strong>Scenario level</strong> to calculate <strong>capacity</strong>, not individual roadmap item effort.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Demand Side */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <h5 className="text-sm font-semibold text-foreground">DEMAND Calculation</h5>
                  </div>
                  <div className="bg-white dark:bg-gray-900 border border-border rounded-lg p-4 space-y-2">
                    <div className="text-xs font-mono text-muted-foreground">
                      Sum all roadmap items:
                    </div>
                    <div className="text-xs font-mono text-foreground pl-2">
                      • Item 1: <span className="text-blue-600">4.2 weeks</span> (UX)
                    </div>
                    <div className="text-xs font-mono text-foreground pl-2">
                      • Item 2: <span className="text-blue-600">3.5 weeks</span> (UX)
                    </div>
                    <div className="text-xs font-mono text-foreground pl-2">
                      • Item 3: <span className="text-blue-600">2.0 weeks</span> (UX)
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="text-xs font-mono text-foreground font-semibold">
                        Total UX Demand: <span className="text-red-600">9.7 weeks</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground italic">
                    ℹ️ Uses the calculations shown above (base + complexity)
                  </div>
                </div>

                {/* Capacity Side */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <h5 className="text-sm font-semibold text-foreground">CAPACITY Calculation</h5>
                  </div>
                  <div className="bg-white dark:bg-gray-900 border border-border rounded-lg p-4 space-y-2">
                    <div className="text-xs font-mono text-foreground">
                      Work Weeks: <span className="text-blue-600">13</span>
                    </div>
                    <div className="text-xs font-mono text-foreground">
                      Holidays + PTO: <span className="text-blue-600">5 days</span> = 1 week
                    </div>
                    <div className="text-xs font-mono text-foreground">
                      Available: <span className="text-blue-600">12 weeks</span>
                    </div>
                    <div className="text-xs font-mono text-foreground bg-purple-50 dark:bg-purple-950/30 p-2 rounded border border-purple-200 dark:border-purple-800">
                      <strong className="text-purple-700 dark:text-purple-400">Focus Time Ratio: 0.7</strong>
                    </div>
                    <div className="text-xs font-mono text-foreground">
                      Focus Weeks: <span className="text-blue-600">12 × 0.7 = 8.4</span>
                    </div>
                    <div className="text-xs font-mono text-foreground">
                      Team Size: <span className="text-blue-600">3 designers</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="text-xs font-mono text-foreground font-semibold">
                        Total UX Capacity: <span className="text-green-600">25.2 weeks</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground italic">
                    ℹ️ Focus Time Ratio accounts for meetings, admin work, etc.
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Summary:</strong> Focus Time Ratio (70%) reduces available weeks to account for non-project time, 
                  while complexity factors increase individual item effort based on uncertainty and scope.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Models */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle>Data Models</CardTitle>
          <CardDescription>Database schema and relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {dataModels.map((model, index) => (
              <div
                key={index}
                className="border border-border rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{model.name}</h3>
                  {model.relationships && (
                    <Badge variant="outline" className="text-xs">
                      {model.relationships.length} relationship(s)
                    </Badge>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                          Field
                        </th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                          Type
                        </th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                          Required
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {model.fields.map((field, fieldIndex) => (
                        <tr key={fieldIndex} className="border-b border-border last:border-0">
                          <td className="py-2 px-3 font-mono text-foreground">{field.name}</td>
                          <td className="py-2 px-3 text-muted-foreground font-mono text-xs">
                            {field.type}
                          </td>
                          <td className="py-2 px-3">
                            {field.required ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700 text-xs">
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                No
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {model.relationships && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Relationships:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {model.relationships.map((rel, relIndex) => (
                        <Badge
                          key={relIndex}
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                        >
                          {rel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="border border-border shadow-sm mt-6">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Application metadata</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Storage Type</span>
              <span className="font-medium text-foreground">LocalStorage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Browser Support</span>
              <span className="font-medium text-foreground">
                {typeof Storage !== "undefined" ? "✓ Supported" : "✗ Not Supported"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Persistence</span>
              <span className="font-medium text-foreground">Client-side only</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auto-save</span>
              <span className="font-medium text-green-600">Enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}