import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, Plus, Trash2, Check, Pencil } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

interface Scenario {
  id: string;
  name: string;
  description: string;
  status: "draft" | "committed";
  quarter: string;
  capacity: {
    uxDesign: number;
    contentDesign: number;
  };
  teamSize: {
    uxDesign: number;
    contentDesign: number;
  };
  demand: {
    uxDesign: number;
    contentDesign: number;
  };
  roadmapItemsCount: number;
  createdAt: Date;
}

interface RoadmapItem {
  id: string;
  key: string;
  name: string;
  initiative: string;
  priority: string;
  quarter: string;
  status: "draft" | "committed";
  projectType?: string;
  uxFocusWeeks: number;
  contentFocusWeeks: number;
  // UX Complexity Factors (1-5 scale)
  uxProductRisk?: number;
  uxProblemAmbiguity?: number;
  // Content Complexity Factors (1-5 scale)
  contentSurfaceArea?: number;
  contentLocalizationScope?: number;
}

// Load settings from localStorage
const getSettings = () => {
  const defaultSettings = {
    effortWeights: {
      productRisk: 4,
      problemAmbiguity: 5,
      contentSurface: 5,
      localizationScope: 5,
    },
    effortModelEnabled: true,
    projectTypeDemand: {
      "net-new": { ux: "XL", content: "XL" },
      "new-feature": { ux: "L", content: "L" },
      "enhancement": { ux: "M", content: "S" },
      "optimization": { ux: "S", content: "XS" },
      "fix-polish": { ux: "XS", content: "XS" },
    },
  };

  const saved = localStorage.getItem("capacityPlannerSettings");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge parsed settings with defaults to ensure all fields exist
      return {
        ...defaultSettings,
        ...parsed,
        effortWeights: {
          ...defaultSettings.effortWeights,
          ...(parsed.effortWeights || {}),
        },
        projectTypeDemand: {
          ...defaultSettings.projectTypeDemand,
          ...(parsed.projectTypeDemand || {}),
        },
      };
    } catch (e) {
      console.error("Failed to parse settings:", e);
    }
  }
  
  return defaultSettings;
};

// Base effort calculation
const BASE_FOCUS_WEEKS = 3.0;

// Map demand levels to focus weeks (aligned with Settings page Size Band Thresholds)
const DEMAND_WEEKS_MAP: Record<string, number> = {
  "XS": 2.0,   // max of xs band (0-2 weeks)
  "S": 4.0,    // max of s band (2-4 weeks)
  "M": 8.0,    // max of m band (4-8 weeks)
  "L": 12.0,   // max of l band (8-12 weeks)
  "XL": 12.0,  // min of xl band (12+ weeks)
};

export function ScenarioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(getSettings());

  // Reload settings when modal opens or on mount
  useEffect(() => {
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
  }, []);

  // Get dynamic UX factors based on settings
  const getUxFactors = () => {
    const { effortWeights, effortModelEnabled } = settings;
    const getMultiplier = (weight: number) =>
      effortModelEnabled ? weight / 10 : 1.0;

    return {
      productRisk: {
        label: "Product Risk",
        multiplier: getMultiplier(effortWeights.productRisk),
        description: "How much impact does this roadmap have on the business?",
      },
      problemAmbiguity: {
        label: "Problem Ambiguity",
        multiplier: getMultiplier(effortWeights.problemAmbiguity),
        description:
          "If a problem statement is not 'clear' enough, how will this impact the design?",
      },
    };
  };

  // Get dynamic Content factors based on settings
  const getContentFactors = () => {
    const { effortWeights, effortModelEnabled } = settings;
    const getMultiplier = (weight: number) =>
      effortModelEnabled ? weight / 10 : 1.0;

    return {
      surfaceArea: {
        label: "Content Surface Area",
        multiplier: getMultiplier(effortWeights.contentSurface),
        description: "How large of a surface are teams writing content for?",
      },
      localizationScope: {
        label: "Localization",
        multiplier: getMultiplier(effortWeights.localizationScope),
        description: "Number of languages needed",
      },
    };
  };

  const [scenario, setScenario] = useState<Scenario>(() => {
    const saved = localStorage.getItem("scenarios");
    if (saved) {
      const scenarios = JSON.parse(saved);
      const found = scenarios.find((s: Scenario) => s.id === id);
      if (found) return found;
    }
    return {
      id: id || "1",
      name: "New Scenario",
      description: "Planning scenario",
      status: "draft",
      quarter: "2026 Q4",
      teamSize: { uxDesign: 3, contentDesign: 2 },
      capacity: { uxDesign: 39.0, contentDesign: 26.0 },
      demand: { uxDesign: 0, contentDesign: 0 },
      roadmapItemsCount: 0,
      createdAt: new Date(),
    };
  });

  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>(() => {
    // Load roadmap items from localStorage for this scenario
    const saved = localStorage.getItem(`roadmapItems_${id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse roadmap items:", e);
      }
    }
    return [];
  });
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [tempTeamSize, setTempTeamSize] = useState(scenario.teamSize);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(scenario.name);
  const [activeTab, setActiveTab] = useState("pm-intake");

  useEffect(() => {
    const saved = localStorage.getItem("scenarios");
    if (saved) {
      const scenarios = JSON.parse(saved);
      const updatedScenarios = scenarios.map((s: Scenario) =>
        s.id === scenario.id ? scenario : s
      );
      localStorage.setItem("scenarios", JSON.stringify(updatedScenarios));
    }
  }, [scenario]);

  // Save roadmap items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`roadmapItems_${id}`, JSON.stringify(roadmapItems));
  }, [roadmapItems, id]);

  const [newItem, setNewItem] = useState<Partial<RoadmapItem>>({
    key: "",
    name: "",
    initiative: "",
    priority: "P1",
    status: "draft",
    quarter: scenario.quarter,
    uxFocusWeeks: 3.0,
    contentFocusWeeks: 3.0,
    uxProductRisk: 3,
    uxProblemAmbiguity: 3,
    contentSurfaceArea: 3,
    contentLocalizationScope: 3,
  });

  const WEEKS_PER_QUARTER = 13;

  useEffect(() => {
    const newCapacity = {
      uxDesign: tempTeamSize.uxDesign * WEEKS_PER_QUARTER,
      contentDesign: tempTeamSize.contentDesign * WEEKS_PER_QUARTER,
    };
    setScenario((prev) => ({ ...prev, capacity: newCapacity, teamSize: tempTeamSize }));
  }, [tempTeamSize]);

  useEffect(() => {
    // Calculate total demand based on project type demand levels
    const totalUxEffort = roadmapItems.reduce((sum, item) => {
      if (!item.projectType || !settings.projectTypeDemand) {
        return sum + (item.uxFocusWeeks || 0); // Fallback to stored weeks
      }
      const demand = settings.projectTypeDemand[item.projectType as keyof typeof settings.projectTypeDemand];
      const weeks = demand?.ux ? DEMAND_WEEKS_MAP[demand.ux] || 0 : 0;
      return sum + weeks;
    }, 0);
    
    const totalContentEffort = roadmapItems.reduce((sum, item) => {
      if (!item.projectType || !settings.projectTypeDemand) {
        return sum + (item.contentFocusWeeks || 0); // Fallback to stored weeks
      }
      const demand = settings.projectTypeDemand[item.projectType as keyof typeof settings.projectTypeDemand];
      const weeks = demand?.content ? DEMAND_WEEKS_MAP[demand.content] || 0 : 0;
      return sum + weeks;
    }, 0);
    
    setScenario((prev) => ({
      ...prev,
      demand: { uxDesign: totalUxEffort, contentDesign: totalContentEffort },
      roadmapItemsCount: roadmapItems.length,
    }));
  }, [roadmapItems, settings]);

  // Calculate UX effort estimate based on complexity factors
  const calculateUxEffort = () => {
    const productRisk = newItem.uxProductRisk || 3;
    const problemAmbiguity = newItem.uxProblemAmbiguity || 3;
    
    const totalComplexity = 
      (productRisk * getUxFactors().productRisk.multiplier) +
      (problemAmbiguity * getUxFactors().problemAmbiguity.multiplier);
    
    const avgComplexity = totalComplexity / 2;
    const focusWeeks = BASE_FOCUS_WEEKS * (avgComplexity / 3);
    
    return parseFloat(focusWeeks.toFixed(1));
  };

  // Calculate Content effort estimate based on complexity factors
  const calculateContentEffort = () => {
    const surfaceArea = newItem.contentSurfaceArea || 3;
    const localization = newItem.contentLocalizationScope || 3;
    
    const totalComplexity = 
      (surfaceArea * getContentFactors().surfaceArea.multiplier) +
      (localization * getContentFactors().localizationScope.multiplier);
    
    const avgComplexity = totalComplexity / 2;
    const focusWeeks = BASE_FOCUS_WEEKS * (avgComplexity / 3);
    
    return parseFloat(focusWeeks.toFixed(1));
  };

  // Update effort when complexity factors change
  useEffect(() => {
    const uxEffort = calculateUxEffort();
    const contentEffort = calculateContentEffort();
    setNewItem(prev => ({
      ...prev,
      uxFocusWeeks: uxEffort,
      contentFocusWeeks: contentEffort
    }));
  }, [
    newItem.uxProductRisk, 
    newItem.uxProblemAmbiguity, 
    newItem.contentSurfaceArea,
    newItem.contentLocalizationScope
  ]);

  const getSurplus = (type: "uxDesign" | "contentDesign") => {
    return scenario.capacity[type] - scenario.demand[type];
  };

  const getUtilization = (type: "uxDesign" | "contentDesign") => {
    if (scenario.capacity[type] === 0) return 0;
    return (scenario.demand[type] / scenario.capacity[type]) * 100;
  };

  const commitScenario = () => {
    setScenario((prev) => ({ ...prev, status: "committed" }));
  };

  const revertToDraft = () => {
    setScenario((prev) => ({ ...prev, status: "draft" }));
  };

  const openItemModal = (item?: RoadmapItem) => {
    if (item) {
      setIsEditMode(true);
      setNewItem(item);
    } else {
      setIsEditMode(false);
      setNewItem({
        key: "",
        name: "",
        initiative: "",
        priority: "P1",
        status: "draft",
        quarter: scenario.quarter,
        uxFocusWeeks: 3.0,
        contentFocusWeeks: 3.0,
        uxProductRisk: 3,
        uxProblemAmbiguity: 3,
        contentSurfaceArea: 3,
        contentLocalizationScope: 3,
      });
    }
    setActiveTab("pm-intake");
    setIsItemModalOpen(true);
  };

  const saveItem = () => {
    if (!newItem.key || !newItem.name || !newItem.initiative) {
      alert("Please fill in all required fields (Key, Name, Initiative)");
      return;
    }

    if (isEditMode && newItem.id) {
      setRoadmapItems(roadmapItems.map(item => 
        item.id === newItem.id ? newItem as RoadmapItem : item
      ));
    } else {
      const item: RoadmapItem = {
        ...newItem,
        id: Date.now().toString(),
      } as RoadmapItem;
      setRoadmapItems([...roadmapItems, item]);
    }

    setIsItemModalOpen(false);
  };

  const deleteItem = (itemId: string) => {
    setRoadmapItems(roadmapItems.filter((item) => item.id !== itemId));
  };

  const parsePastedData = () => {
    if (!pastedText.trim()) return;

    const lines = pastedText.trim().split("\n");
    if (lines.length === 0) return;

    const firstLine = lines[0].toLowerCase();
    const isHeader =
      firstLine.includes("title") ||
      firstLine.includes("name") ||
      firstLine.includes("date") ||
      firstLine.includes("effort");

    const dataLines = isHeader ? lines.slice(1) : lines;

    const newItems: RoadmapItem[] = dataLines
      .map((line, index) => {
        const parts = line.split(/\t|\|/).map((p) => p.trim());

        if (parts.length < 4) return null;

        if (parts.length >= 6) {
          return {
            id: Date.now().toString() + index,
            key: parts[0],
            name: parts[1],
            initiative: parts[2],
            priority: parts[3] || "P1",
            status: "draft" as const,
            quarter: scenario.quarter,
            uxFocusWeeks: parseFloat(parts[4]) || 3.0,
            contentFocusWeeks: parseFloat(parts[5]) || 3.0,
          };
        }

        return null;
      })
      .filter((item): item is RoadmapItem => item !== null);

    setRoadmapItems([...roadmapItems, ...newItems]);
    setIsPasteModalOpen(false);
    setPastedText("");
  };

  // Component for rendering factor buttons
  const FactorButtons = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onChange(num)}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            value === num
              ? "bg-cyan-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {num}
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">
          Get Started
        </Link>
        <span>/</span>
        <Link to="/scenarios" className="hover:text-foreground transition-colors">
          Plans
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Scenario Summary</span>
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 -ml-2"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Plans
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-10">
        <div className="flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setScenario((prev) => ({ ...prev, name: tempName }));
                    setIsEditingName(false);
                  }
                  if (e.key === "Escape") {
                    setTempName(scenario.name);
                    setIsEditingName(false);
                  }
                }}
                onBlur={() => {
                  setScenario((prev) => ({ ...prev, name: tempName }));
                  setIsEditingName(false);
                }}
                className="text-3xl font-semibold h-auto py-1 px-2"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-2 group">
              <h1 className="text-3xl font-semibold text-foreground">{scenario.name}</h1>
              {scenario.status === "committed" ? (
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                  Committed
                </Badge>
              ) : (
                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700">
                  Draft
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTempName(scenario.name);
                  setIsEditingName(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
          <p className="text-muted-foreground">
            {scenario.quarter} • {scenario.teamSize.uxDesign} UX Designer
            {scenario.teamSize.uxDesign !== 1 ? "s" : ""} • {scenario.teamSize.contentDesign}{" "}
            Content Designer{scenario.teamSize.contentDesign !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-3">
          {scenario.status === "draft" && (
            <Button
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
              onClick={commitScenario}
            >
              Commit this scenario
            </Button>
          )}
          {scenario.status === "committed" && (
            <Button
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
              onClick={revertToDraft}
            >
              Revert to Draft
            </Button>
          )}
          <Button variant="outline">Force Reload</Button>
        </div>
      </div>

      {/* Capacity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">UX Design Capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm text-muted-foreground mb-2">Team Size</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  value={tempTeamSize.uxDesign}
                  onChange={(e) =>
                    setTempTeamSize({
                      ...tempTeamSize,
                      uxDesign: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-24"
                />
                <span className="text-muted-foreground text-sm">designers</span>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Total Capacity</div>
              <div className="text-2xl font-semibold text-foreground">
                {scenario.capacity.uxDesign.toFixed(1)} focus weeks
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Total Demand</div>
              <div className="text-2xl font-semibold text-foreground">
                {scenario.demand.uxDesign.toFixed(1)} focus weeks
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div
                className={`text-xl font-semibold ${
                  getSurplus("uxDesign") >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {getSurplus("uxDesign") >= 0 ? "+" : ""}
                {getSurplus("uxDesign").toFixed(1)} focus weeks
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {getSurplus("uxDesign") >= 0 ? "Surplus" : "Deficit"} -{" "}
                {getUtilization("uxDesign").toFixed(0)}% utilized
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Content Design Capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm text-muted-foreground mb-2">Team Size</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  value={tempTeamSize.contentDesign}
                  onChange={(e) =>
                    setTempTeamSize({
                      ...tempTeamSize,
                      contentDesign: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-24"
                />
                <span className="text-muted-foreground text-sm">designers</span>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Total Capacity</div>
              <div className="text-2xl font-semibold text-foreground">
                {scenario.capacity.contentDesign.toFixed(1)} focus weeks
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Total Demand</div>
              <div className="text-2xl font-semibold text-foreground">
                {scenario.demand.contentDesign.toFixed(1)} focus weeks
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div
                className={`text-xl font-semibold ${
                  getSurplus("contentDesign") >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {getSurplus("contentDesign") >= 0 ? "+" : ""}
                {getSurplus("contentDesign").toFixed(1)} focus weeks
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {getSurplus("contentDesign") >= 0 ? "Surplus" : "Deficit"} -{" "}
                {getUtilization("contentDesign").toFixed(0)}% utilized
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roadmap Items Section */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Roadmap Items</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Demand shown in focus weeks
          </p>
        </CardHeader>
        <CardContent>
          {roadmapItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">
                No roadmap items yet. Add items to see capacity calculations.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  onClick={() => openItemModal()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button>
                <Button variant="outline" onClick={() => setIsPasteModalOpen(true)}>
                  Paste from table
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 pr-4 text-muted-foreground font-medium">KEY</th>
                      <th className="pb-3 pr-4 text-muted-foreground font-medium">NAME</th>
                      <th className="pb-3 pr-4 text-muted-foreground font-medium">TYPE</th>
                      <th className="pb-3 pr-4 text-muted-foreground font-medium">QUARTER</th>
                      <th className="pb-3 pr-4 text-muted-foreground font-medium">PRIORITY</th>
                      <th className="pb-3 pr-4 text-muted-foreground font-medium">
                        UX
                      </th>
                      <th className="pb-3 pr-4 text-muted-foreground font-medium">
                        CONTENT
                      </th>
                      <th className="pb-3 text-muted-foreground font-medium">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roadmapItems.map((item) => {
                      // Helper function to get project type display
                      const getProjectTypeDisplay = (type?: string) => {
                        const types: Record<string, { emoji: string; label: string }> = {
                          'net-new': { emoji: '🆕', label: 'Net New' },
                          'new-feature': { emoji: '✨', label: 'New Feature' },
                          'enhancement': { emoji: '🔧', label: 'Enhancement' },
                          'optimization': { emoji: '⚡', label: 'Optimization' },
                          'fix-polish': { emoji: '🩹', label: 'Fix/Polish' },
                        };
                        return type ? types[type] : null;
                      };

                      // Get demand effort from settings based on project type
                      const getDemandEffort = (type?: string) => {
                        if (!type || !settings.projectTypeDemand) {
                          return { ux: '—', content: '—' };
                        }
                        const demand = settings.projectTypeDemand[type as keyof typeof settings.projectTypeDemand];
                        return demand || { ux: '—', content: '—' };
                      };

                      const typeDisplay = getProjectTypeDisplay(item.projectType);
                      const demandEffort = getDemandEffort(item.projectType);

                      return (
                        <tr key={item.id} className="border-b border-border last:border-0">
                          <td className="py-3 pr-4 text-foreground">{item.key}</td>
                          <td className="py-3 pr-4 text-foreground">{item.name}</td>
                          <td className="py-3 pr-4 text-foreground">
                            {typeDisplay ? (
                              <span className="inline-flex items-center gap-1.5 text-xs">
                                <span>{typeDisplay.emoji}</span>
                                <span className="text-muted-foreground">{typeDisplay.label}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-foreground">{item.quarter}</td>
                          <td className="py-3 pr-4">
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700">
                              {item.priority}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-medium text-foreground">{demandEffort.ux}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-medium text-foreground">{demandEffort.content}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openItemModal(item)}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteItem(item.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="pt-4 flex gap-3">
                <Button
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  size="sm"
                  onClick={() => openItemModal()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add new item
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsPasteModalOpen(true)}>
                  Paste from table
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabbed Item Modal */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? `${newItem.key}: ${newItem.name}` : "Create New Roadmap Item"}</DialogTitle>
            <DialogDescription>
              {newItem.initiative && <span className="text-foreground">{newItem.initiative} • </span>}
              {newItem.priority && <span className="text-muted-foreground">{newItem.priority}</span>}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pm-intake">PM Intake</TabsTrigger>
              <TabsTrigger value="product-design">Product Design</TabsTrigger>
              <TabsTrigger value="content-design">Content Design</TabsTrigger>
            </TabsList>

            <TabsContent value="pm-intake" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="key" className="text-sm font-normal mb-2">
                  Key <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="key"
                  placeholder="e.g., PROJ-1"
                  value={newItem.key}
                  onChange={(e) => setNewItem({ ...newItem, key: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="name" className="text-sm font-normal mb-2">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., New Payment Method"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="initiative" className="text-sm font-normal mb-2">
                  Initiative <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="initiative"
                  placeholder="e.g., Revenue"
                  value={newItem.initiative}
                  onChange={(e) => setNewItem({ ...newItem, initiative: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="quarter" className="text-sm font-normal mb-2">
                  Quarter <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newItem.quarter}
                  onValueChange={(value) => setNewItem({ ...newItem, quarter: value })}
                >
                  <SelectTrigger id="quarter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q2'26">Q2'26</SelectItem>
                    <SelectItem value="Q3'26">Q3'26</SelectItem>
                    <SelectItem value="Q4'26">Q4'26</SelectItem>
                    <SelectItem value="Q1'27">Q1'27</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority" className="text-sm font-normal mb-2">
                  Priority <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newItem.priority}
                  onValueChange={(value) => setNewItem({ ...newItem, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P1">P1</SelectItem>
                    <SelectItem value="P2">P2</SelectItem>
                    <SelectItem value="P3">P3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Project Type Field */}
              <div>
                <Label className="text-sm font-normal mb-2">
                  What kind of work is this? <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Choose the option that best describes the nature of this roadmap item.
                </p>
                <div className="space-y-2">
                  {[
                    { 
                      value: "net-new", 
                      emoji: "🆕", 
                      label: "Net New Product", 
                      description: "A brand new product, platform, or 0-to-1 experience" 
                    },
                    { 
                      value: "new-feature", 
                      emoji: "✨", 
                      label: "New Feature", 
                      description: "New functionality added to an existing product" 
                    },
                    { 
                      value: "enhancement", 
                      emoji: "🔧", 
                      label: "Feature Enhancement", 
                      description: "Improving or extending something that already exists" 
                    },
                    { 
                      value: "optimization", 
                      emoji: "⚡", 
                      label: "Optimization", 
                      description: "Same flow, better execution — no new screens" 
                    },
                    { 
                      value: "fix-polish", 
                      emoji: "🩹", 
                      label: "Fix / Polish", 
                      description: "Targeted correction of a UX, accessibility, or visual issue" 
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNewItem({ ...newItem, projectType: option.value })}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        newItem.projectType === option.value
                          ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20"
                          : "border-border bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground text-sm">{option.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="product-design" className="space-y-6 mt-4">
              <p className="text-sm text-muted-foreground">
                Filled by the product designer to describe UX complexity factors, patterns, and design considerations.
              </p>

              <div className="space-y-6">
                <h4 className="text-base font-semibold text-foreground">UX Complexity Factors</h4>

                <div>
                  <div className="mb-2">
                    <Label className="text-sm font-medium">{getUxFactors().productRisk.label} (×{getUxFactors().productRisk.multiplier})</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{getUxFactors().productRisk.description}</p>
                  </div>
                  <FactorButtons 
                    value={newItem.uxProductRisk || 3} 
                    onChange={(val) => setNewItem({ ...newItem, uxProductRisk: val })} 
                  />
                </div>

                <div>
                  <div className="mb-2">
                    <Label className="text-sm font-medium">{getUxFactors().problemAmbiguity.label} (×{getUxFactors().problemAmbiguity.multiplier})</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{getUxFactors().problemAmbiguity.description}</p>
                  </div>
                  <FactorButtons 
                    value={newItem.uxProblemAmbiguity || 3} 
                    onChange={(val) => setNewItem({ ...newItem, uxProblemAmbiguity: val })} 
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm font-medium text-foreground mb-1">UX Effort Estimate</div>
                  <div className="text-xs text-muted-foreground mb-3">Real-time calculation based on complexity factors</div>
                  <div className="flex items-baseline gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Focus Weeks</div>
                      <div className="text-2xl font-semibold text-foreground">{newItem.uxFocusWeeks?.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Work Weeks</div>
                      <div className="text-2xl font-semibold text-foreground">{((newItem.uxFocusWeeks || 3) / 0.75).toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content-design" className="space-y-6 mt-4">
              <p className="text-sm text-muted-foreground">
                Filled by the content designer to describe content complexity factors and localization needs.
              </p>

              <div className="space-y-6">
                <h4 className="text-base font-semibold text-foreground">Content Effort Factors</h4>

                <div>
                  <div className="mb-2">
                    <Label className="text-sm font-medium">{getContentFactors().surfaceArea.label} (×{getContentFactors().surfaceArea.multiplier})</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{getContentFactors().surfaceArea.description}</p>
                  </div>
                  <FactorButtons 
                    value={newItem.contentSurfaceArea || 3} 
                    onChange={(val) => setNewItem({ ...newItem, contentSurfaceArea: val })} 
                  />
                </div>

                <div>
                  <div className="mb-2">
                    <Label className="text-sm font-medium">{getContentFactors().localizationScope.label} (×{getContentFactors().localizationScope.multiplier})</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{getContentFactors().localizationScope.description}</p>
                  </div>
                  <FactorButtons 
                    value={newItem.contentLocalizationScope || 3} 
                    onChange={(val) => setNewItem({ ...newItem, contentLocalizationScope: val })} 
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm font-medium text-foreground mb-1">Content Effort Estimate</div>
                  <div className="text-xs text-muted-foreground mb-3">Real-time calculation based on complexity factors</div>
                  <div className="flex items-baseline gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Focus Weeks</div>
                      <div className="text-2xl font-semibold text-foreground">{newItem.contentFocusWeeks?.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Work Weeks</div>
                      <div className="text-2xl font-semibold text-foreground">{((newItem.contentFocusWeeks || 3) / 0.75).toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsItemModalOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={saveItem}>
              {isEditMode ? "Save Changes" : "Create Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Paste from Table Modal */}
      <Dialog open={isPasteModalOpen} onOpenChange={setIsPasteModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Paste roadmap items</DialogTitle>
            <DialogDescription>
              Copy and paste data from your spreadsheet to quickly add multiple roadmap items.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-normal text-foreground mb-3">
                Paste from spreadsheet
              </Label>
              <Textarea
                placeholder="Paste your data here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            <div className="text-xs text-muted-foreground space-y-2">
              <div>
                <span className="font-medium">Preferred format:</span> Key | Name | Initiative |
                Priority | UX effort weeks | Content effort weeks
              </div>
              <div className="text-muted-foreground/80">
                You can paste directly from Google Sheets or Excel. The first row may be a header
                (will be auto-detected).
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
              onClick={parsePastedData}
            >
              Preview items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}