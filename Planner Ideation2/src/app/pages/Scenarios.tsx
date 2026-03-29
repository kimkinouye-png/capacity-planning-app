import { useState, useEffect } from "react";
import { Plus, Trash2, Copy, CheckCircle, AlertCircle, Edit2, ChevronRight, Calendar, Users, Check, X, Upload, ClipboardPaste, Info } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Label } from "../components/ui/label";

interface Scenario {
  id: string;
  name: string;
  description: string;
  status: "draft" | "committed";
  quarter: string;
  teamSize: {
    uxDesign: number;
    contentDesign: number;
  };
  capacity: {
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

export function Scenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    const saved = localStorage.getItem("scenarios");
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: "1",
        name: "Q2 2026 Planning",
        description: "Initial planning scenario for Q2 roadmap",
        status: "draft",
        quarter: "Q2'26",
        teamSize: { uxDesign: 5, contentDesign: 3 },
        capacity: { uxDesign: 80, contentDesign: 40 },
        demand: { uxDesign: 95, contentDesign: 35 },
        roadmapItemsCount: 10,
        createdAt: new Date("2026-03-01"),
      },
      {
        id: "2",
        name: "Conservative Estimate",
        description: "Conservative capacity planning with buffer time",
        status: "draft",
        quarter: "Q2'26",
        teamSize: { uxDesign: 5, contentDesign: 3 },
        capacity: { uxDesign: 75, contentDesign: 38 },
        demand: { uxDesign: 72, contentDesign: 36 },
        roadmapItemsCount: 8,
        createdAt: new Date("2026-03-10"),
      },
    ];
  });

  const [isCreating, setIsCreating] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [newScenarioDescription, setNewScenarioDescription] = useState("");
  const [newScenarioQuarter, setNewScenarioQuarter] = useState("Q2'26");
  const [newScenarioTeamSizeUXDesign, setNewScenarioTeamSizeUXDesign] = useState(5);
  const [newScenarioTeamSizeContentDesign, setNewScenarioTeamSizeContentDesign] = useState(3);
  const [newScenarioCapacityUXDesign, setNewScenarioCapacityUXDesign] = useState(80);
  const [newScenarioCapacityContentDesign, setNewScenarioCapacityContentDesign] = useState(40);
  const [newScenarioDemandUXDesign, setNewScenarioDemandUXDesign] = useState(0);
  const [newScenarioDemandContentDesign, setNewScenarioDemandContentDesign] = useState(0);
  const [newScenarioRoadmapItemsCount, setNewScenarioRoadmapItemsCount] = useState(0);

  // Persist scenarios to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("scenarios", JSON.stringify(scenarios));
  }, [scenarios]);

  const createScenario = () => {
    if (newScenarioName.trim()) {
      const newScenario: Scenario = {
        id: Date.now().toString(),
        name: newScenarioName,
        description: newScenarioDescription,
        status: "draft",
        quarter: newScenarioQuarter,
        teamSize: { uxDesign: newScenarioTeamSizeUXDesign, contentDesign: newScenarioTeamSizeContentDesign },
        capacity: { uxDesign: newScenarioCapacityUXDesign, contentDesign: newScenarioCapacityContentDesign },
        demand: { uxDesign: newScenarioDemandUXDesign, contentDesign: newScenarioDemandContentDesign },
        roadmapItemsCount: newScenarioRoadmapItemsCount,
        createdAt: new Date(),
      };
      setScenarios([...scenarios, newScenario]);
      setNewScenarioName("");
      setNewScenarioDescription("");
      setNewScenarioQuarter("Q2'26");
      setNewScenarioTeamSizeUXDesign(5);
      setNewScenarioTeamSizeContentDesign(3);
      setNewScenarioCapacityUXDesign(80);
      setNewScenarioCapacityContentDesign(40);
      setNewScenarioDemandUXDesign(0);
      setNewScenarioDemandContentDesign(0);
      setNewScenarioRoadmapItemsCount(0);
      setIsCreating(false);
    }
  };

  const deleteScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const duplicateScenario = (scenario: Scenario) => {
    const duplicate: Scenario = {
      ...scenario,
      id: Date.now().toString(),
      name: `${scenario.name} (Copy)`,
      createdAt: new Date(),
    };
    setScenarios([...scenarios, duplicate]);
  };

  const getSurplus = (type: "uxDesign" | "contentDesign", scenario: Scenario) => {
    return scenario.capacity[type] - scenario.demand[type];
  };

  const isWithinCapacity = (scenario: Scenario) => {
    const uxSurplus = getSurplus("uxDesign", scenario);
    const contentSurplus = getSurplus("contentDesign", scenario);
    return uxSurplus >= 0 && contentSurplus >= 0;
  };

  return (
    <div className="max-w-7xl mx-auto p-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <span>Get Started</span>
        <span>/</span>
        <span className="text-foreground font-medium">Plans</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Plans</h1>
          <p className="text-muted-foreground leading-relaxed">
            Create and manage planning scenarios to explore different options
          </p>
        </div>
        <Button
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      {/* Create New Plan Modal */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription>
              Set up your planning scenario. You can import roadmap items or add them manually later.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="paste">Paste Roadmap</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>

            {/* Setup Tab */}
            <TabsContent value="setup" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Roadmap items are optional.</strong> You can create your plan now and add roadmap items manually later, or use the other tabs to import them from a spreadsheet or file.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="plan-name">Plan Name *</Label>
                  <Input
                    id="plan-name"
                    placeholder="e.g., Q2 2026 Planning"
                    value={newScenarioName}
                    onChange={(e) => setNewScenarioName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="plan-description">Description</Label>
                  <Textarea
                    id="plan-description"
                    placeholder="Brief description of this planning scenario..."
                    value={newScenarioDescription}
                    onChange={(e) => setNewScenarioDescription(e.target.value)}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="quarter">Quarter</Label>
                  <Select value={newScenarioQuarter} onValueChange={setNewScenarioQuarter}>
                    <SelectTrigger id="quarter" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1'26">Q1 2026</SelectItem>
                      <SelectItem value="Q2'26">Q2 2026</SelectItem>
                      <SelectItem value="Q3'26">Q3 2026</SelectItem>
                      <SelectItem value="Q4'26">Q4 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border border-border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Team Capacity</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ux-designers">UX Designers</Label>
                      <Input
                        id="ux-designers"
                        type="number"
                        min="0"
                        value={newScenarioTeamSizeUXDesign}
                        onChange={(e) => setNewScenarioTeamSizeUXDesign(parseInt(e.target.value) || 0)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content-designers">Content Designers</Label>
                      <Input
                        id="content-designers"
                        type="number"
                        min="0"
                        value={newScenarioTeamSizeContentDesign}
                        onChange={(e) => setNewScenarioTeamSizeContentDesign(parseInt(e.target.value) || 0)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Paste Roadmap Tab */}
            <TabsContent value="paste" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="paste-area">Paste from Spreadsheet</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Copy and paste roadmap data from Excel, Google Sheets, or any spreadsheet
                  </p>
                </div>
                <Textarea
                  id="paste-area"
                  placeholder="KEY&#9;NAME&#9;INITIATIVE&#9;PRIORITY&#10;PROJ-1&#9;Payment Flow&#9;Revenue&#9;P1&#10;PROJ-2&#9;User Onboarding&#9;Growth&#9;P2"
                  className="font-mono text-xs min-h-[300px]"
                  rows={12}
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ClipboardPaste className="h-4 w-4" />
                  <span>Tip: Include headers in your first row for best results</span>
                </div>
              </div>
            </TabsContent>

            {/* Upload File Tab */}
            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div>
                  <Label>Upload Roadmap File</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a CSV or Excel file with your roadmap data
                  </p>
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center bg-gray-50 dark:bg-gray-900">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-foreground font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CSV, XLS, or XLSX (max 10MB)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xls,.xlsx"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
              onClick={createScenario}
              disabled={!newScenarioName.trim()}
            >
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {scenarios.length === 0 ? (
        <Card className="border-dashed border-2 border-border shadow-none">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scenarios yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first scenario to start planning
            </p>
            <Button
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
              onClick={() => setIsCreating(true)}
            >
              Start planning your quarter →
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Committed Scenarios Section */}
          {scenarios.filter(s => s.status === "committed").length > 0 && (
            <div className="mb-10">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-1">Committed Scenarios</h2>
                <p className="text-sm text-muted-foreground">
                  Finalized scenarios that are locked in for execution
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scenarios.filter(s => s.status === "committed").map((scenario) => {
                  const uxSurplus = getSurplus("uxDesign", scenario);
                  const contentSurplus = getSurplus("contentDesign", scenario);
                  const isWithin = isWithinCapacity(scenario);
                  
                  return (
                    <Card
                      key={scenario.id}
                      className="border border-border shadow-sm hover:shadow-md transition-all"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">{scenario.name}</h3>
                              <div className="flex items-center gap-1">
                                <div className={`h-2 w-2 rounded-full ${isWithin ? "bg-green-500" : "bg-red-500"}`} />
                                <span className={`text-sm ${isWithin ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                  {isWithin ? "Within" : "Over"}
                                </span>
                              </div>
                            </div>
                            
                            {/* Meta information */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{scenario.quarter}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                <span>{scenario.teamSize.uxDesign} UX, {scenario.teamSize.contentDesign} Content</span>
                              </div>
                              <span>{scenario.roadmapItemsCount} roadmap items</span>
                            </div>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                            Committed
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* UX Design */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-foreground font-medium">UX Design</span>
                            <div className="flex items-center gap-2">
                              <span className="text-foreground font-semibold">
                                {scenario.demand.uxDesign.toFixed(1)} / {scenario.capacity.uxDesign.toFixed(1)} focus weeks
                              </span>
                              <span className={`font-medium ${uxSurplus >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                {uxSurplus >= 0 ? "+" : ""}{uxSurplus.toFixed(1)} surplus
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Content Design */}
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground font-medium">Content Design</span>
                            <div className="flex items-center gap-2">
                              <span className="text-foreground font-semibold">
                                {scenario.demand.contentDesign.toFixed(1)} / {scenario.capacity.contentDesign.toFixed(1)} focus weeks
                              </span>
                              <span className={`font-medium ${contentSurplus >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                {contentSurplus >= 0 ? "+" : ""}{contentSurplus.toFixed(1)} surplus
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-border">
                          <Link to={`/scenarios/${scenario.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              View Details
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              duplicateScenario(scenario);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              if (confirm(`Are you sure you want to delete "${scenario.name}"?`)) {
                                deleteScenario(scenario.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Draft Scenarios Section */}
          {scenarios.filter(s => s.status === "draft").length > 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-1">Draft Plans</h2>
                <p className="text-sm text-muted-foreground">
                  Work-in-progress scenarios still being refined
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scenarios.filter(s => s.status === "draft").map((scenario) => {
                  const uxSurplus = getSurplus("uxDesign", scenario);
                  const contentSurplus = getSurplus("contentDesign", scenario);
                  const isWithin = isWithinCapacity(scenario);
                  
                  return (
                    <Card
                      key={scenario.id}
                      className="border border-border shadow-sm hover:shadow-md transition-all"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">{scenario.name}</h3>
                              <div className="flex items-center gap-1">
                                <div className={`h-2 w-2 rounded-full ${isWithin ? "bg-green-500" : "bg-red-500"}`} />
                                <span className={`text-sm ${isWithin ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                  {isWithin ? "Within" : "Over"}
                                </span>
                              </div>
                            </div>
                            
                            {/* Meta information */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{scenario.quarter}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                <span>{scenario.teamSize.uxDesign} UX, {scenario.teamSize.contentDesign} Content</span>
                              </div>
                              <span>{scenario.roadmapItemsCount} roadmap items</span>
                            </div>
                          </div>
                          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700">
                            Draft
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* UX Design */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-foreground font-medium">UX Design</span>
                            <div className="flex items-center gap-2">
                              <span className="text-foreground font-semibold">
                                {scenario.demand.uxDesign.toFixed(1)} / {scenario.capacity.uxDesign.toFixed(1)} focus weeks
                              </span>
                              <span className={`font-medium ${uxSurplus >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                {uxSurplus >= 0 ? "+" : ""}{uxSurplus.toFixed(1)} surplus
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Content Design */}
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground font-medium">Content Design</span>
                            <div className="flex items-center gap-2">
                              <span className="text-foreground font-semibold">
                                {scenario.demand.contentDesign.toFixed(1)} / {scenario.capacity.contentDesign.toFixed(1)} focus weeks
                              </span>
                              <span className={`font-medium ${contentSurplus >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                {contentSurplus >= 0 ? "+" : ""}{contentSurplus.toFixed(1)} surplus
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-border">
                          <Link to={`/scenarios/${scenario.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              View Details
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              duplicateScenario(scenario);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              if (confirm(`Are you sure you want to delete "${scenario.name}"?`)) {
                                deleteScenario(scenario.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}