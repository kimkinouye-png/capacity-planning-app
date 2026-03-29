import { useState } from "react";
import { Save, RotateCcw, ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface Settings {
  effortWeights: {
    productRisk: number;
    problemAmbiguity: number;
    contentSurface: number;
    localizationScope: number;
  };
  effortModelEnabled: boolean;
  workstreamPenalty: number;
  workstreamImpactEnabled: boolean;
  focusTimeRatio: number;
  planningPeriods: {
    "Q2'26": { workWeeks: number; holidays: number; pto: number; focusWeeks: number };
    "Q3'26": { workWeeks: number; holidays: number; pto: number; focusWeeks: number };
    "Q4'26": { workWeeks: number; holidays: number; pto: number; focusWeeks: number };
    "Q1'27": { workWeeks: number; holidays: number; pto: number; focusWeeks: number };
  };
  sizeBandThresholds: {
    xs: { min: number; max: number };
    s: { min: number; max: number };
    m: { min: number; max: number };
    l: { min: number; max: number };
    xl: { min: number };
  };
  projectTypeDemand: {
    "net-new": { ux: string; content: string };
    "new-feature": { ux: string; content: string };
    "enhancement": { ux: string; content: string };
    "optimization": { ux: string; content: string };
    "fix-polish": { ux: string; content: string };
  };
}

const defaultSettings: Settings = {
  effortWeights: {
    productRisk: 4,
    problemAmbiguity: 5,
    contentSurface: 5,
    localizationScope: 5,
  },
  effortModelEnabled: true,
  workstreamPenalty: 0.10,
  workstreamImpactEnabled: true,
  focusTimeRatio: 0.75,
  planningPeriods: {
    "Q2'26": { workWeeks: 13, holidays: 10, pto: 5, focusWeeks: 11 },
    "Q3'26": { workWeeks: 13, holidays: 10, pto: 5, focusWeeks: 11 },
    "Q4'26": { workWeeks: 13, holidays: 10, pto: 5, focusWeeks: 11 },
    "Q1'27": { workWeeks: 13, holidays: 10, pto: 5, focusWeeks: 11 },
  },
  sizeBandThresholds: {
    xs: { min: 0, max: 2 },
    s: { min: 2, max: 4 },
    m: { min: 4, max: 8 },
    l: { min: 8, max: 12 },
    xl: { min: 12 },
  },
  projectTypeDemand: {
    "net-new": { ux: "XL", content: "XL" },
    "new-feature": { ux: "L", content: "L" },
    "enhancement": { ux: "M", content: "S" },
    "optimization": { ux: "S", content: "XS" },
    "fix-polish": { ux: "XS", content: "XS" },
  },
};

export function Settings() {
  const [settings, setSettings] =
    useState<Settings>(() => {
      // Try to load settings from localStorage
      const savedSettings = localStorage.getItem('capacityPlannerSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          // Merge with default settings to ensure all fields are present
          return {
            ...defaultSettings,
            ...parsed,
            planningPeriods: {
              ...defaultSettings.planningPeriods,
              ...(parsed.planningPeriods || {}),
            },
            sizeBandThresholds: {
              ...defaultSettings.sizeBandThresholds,
              ...(parsed.sizeBandThresholds || {}),
            },
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
          console.error('Failed to parse saved settings:', e);
        }
      }
      // Fall back to default settings
      return defaultSettings;
    });
  const [hasChanges, setHasChanges] = useState(false);

  const updateWeight = (
    key: keyof Settings["effortWeights"],
    value: number,
  ) => {
    setSettings((prev) => ({
      ...prev,
      effortWeights: {
        ...prev.effortWeights,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const updateSizeBand = (
    key: keyof Settings["sizeBandThresholds"],
    field: 'min' | 'max',
    value: number,
  ) => {
    setSettings((prev) => {
      const currentBand = prev.sizeBandThresholds[key];
      
      // For XL, only update min since it doesn't have max
      if (key === 'xl') {
        return {
          ...prev,
          sizeBandThresholds: {
            ...prev.sizeBandThresholds,
            xl: { min: field === 'min' ? value : currentBand.min },
          },
        };
      }
      
      // For other bands, update min or max
      return {
        ...prev,
        sizeBandThresholds: {
          ...prev.sizeBandThresholds,
          [key]: {
            ...(currentBand as { min: number; max: number }),
            [field]: value,
          },
        },
      };
    });
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const saveSettings = () => {
    // In a real app, this would save to backend or localStorage
    localStorage.setItem('capacityPlannerSettings', JSON.stringify(settings));
    console.log("Saving settings:", settings);
    setHasChanges(false);
  };

  // Calculate focus weeks based on work weeks, holidays, PTO, and focus time ratio
  const calculateFocusWeeks = (quarter: keyof typeof settings.planningPeriods) => {
    const period = settings.planningPeriods[quarter];
    const totalDaysOff = period.holidays + period.pto;
    const weeksOff = totalDaysOff / 5; // Convert days to weeks (assuming 5-day work week)
    const availableWeeks = period.workWeeks - weeksOff;
    const focusWeeks = availableWeeks * settings.focusTimeRatio;
    return Math.max(0, parseFloat(focusWeeks.toFixed(1)));
  };

  // Safety check - ensure projectTypeDemand is defined before rendering
  if (!settings.projectTypeDemand) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <span>Get Started</span>
        <span>/</span>
        <span className="text-foreground font-medium">
          Settings
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-foreground">
              Settings
            </h1>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Admin
            </Link>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Configure global effort model weights, focus-time
            ratio, and size-band thresholds
          </p>
        </div>
        {hasChanges && (
          <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
            UNSAVED CHANGES
          </Badge>
        )}
      </div>

      {/* Table of Contents */}
      <Card className="mb-8 border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Table of Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href="#planning-period"
              className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline flex items-center gap-2"
            >
              <span>→</span> Planning Period
            </a>
            <a
              href="#size-band-thresholds"
              className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline flex items-center gap-2"
            >
              <span>→</span> Size Band Thresholds
            </a>
            <a
              href="#project-type-demand"
              className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline flex items-center gap-2"
            >
              <span>→</span> Project Type Demand
            </a>
            <a
              href="#effort-model"
              className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline flex items-center gap-2"
            >
              <span>→</span> Effort Model Weights
            </a>
            <a
              href="#workstream-impact"
              className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline flex items-center gap-2"
            >
              <span>→</span> Workstream Impact
            </a>
          </nav>
        </CardContent>
      </Card>

      {/* Planning Period */}
      <Card id="planning-period" className="mb-6 border border-border shadow-sm scroll-mt-8">
        <CardHeader>
          <CardTitle>Planning Periods</CardTitle>
          <CardDescription>
            Configure work weeks, holidays, and planned time off for each quarter (Q2'26 - Q1'27). Focus weeks are automatically calculated based on the Focus Time Ratio setting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Quarter</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Work Weeks</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Holidays (days)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">PTO (days)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Focus Weeks</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(settings.planningPeriods) as Array<keyof typeof settings.planningPeriods>).map((quarter) => (
                  <tr key={quarter} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">{quarter}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Input
                        type="number"
                        min={1}
                        max={15}
                        value={settings.planningPeriods[quarter].workWeeks}
                        onChange={(e) => {
                          setSettings((prev) => ({
                            ...prev,
                            planningPeriods: {
                              ...prev.planningPeriods,
                              [quarter]: {
                                ...prev.planningPeriods[quarter],
                                workWeeks: parseInt(e.target.value) || 0,
                              },
                            },
                          }));
                          setHasChanges(true);
                        }}
                        className="w-24"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Input
                        type="number"
                        min={0}
                        max={30}
                        value={settings.planningPeriods[quarter].holidays}
                        onChange={(e) => {
                          setSettings((prev) => ({
                            ...prev,
                            planningPeriods: {
                              ...prev.planningPeriods,
                              [quarter]: {
                                ...prev.planningPeriods[quarter],
                                holidays: parseInt(e.target.value) || 0,
                              },
                            },
                          }));
                          setHasChanges(true);
                        }}
                        className="w-24"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        value={settings.planningPeriods[quarter].pto}
                        onChange={(e) => {
                          setSettings((prev) => ({
                            ...prev,
                            planningPeriods: {
                              ...prev.planningPeriods,
                              [quarter]: {
                                ...prev.planningPeriods[quarter],
                                pto: parseInt(e.target.value) || 0,
                              },
                            },
                          }));
                          setHasChanges(true);
                        }}
                        className="w-24"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24 px-3 py-2 text-sm font-medium text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 rounded-md border border-cyan-200 dark:border-cyan-800">
                        {calculateFocusWeeks(quarter)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Focus Time Ratio */}
      <Card className="mb-6 border border-border shadow-sm">
        <CardHeader>
          <CardTitle>Focus Time Ratio</CardTitle>
          <CardDescription>
            Percentage of available time that can be dedicated to focused project work, accounting for meetings, emails, and administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="focusTimeRatio">Focus-Time Ratio</Label>
            <span className="text-sm font-medium text-cyan-600">
              {Math.round(settings.focusTimeRatio * 100)}%
            </span>
          </div>
          <Slider
            id="focusTimeRatio"
            min={0.50}
            max={1.0}
            step={0.05}
            value={[settings.focusTimeRatio]}
            onValueChange={([value]) => {
              setSettings((prev) => ({ ...prev, focusTimeRatio: value }));
              setHasChanges(true);
            }}
            className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-500"
          />
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Accounts for meetings, context switching, and interruptions.
            Lower = more overhead.
          </p>
        </CardContent>
      </Card>

      {/* Size Band Thresholds */}
      <Card id="size-band-thresholds" className="mb-6 border border-border shadow-sm scroll-mt-8">
        <CardHeader>
          <CardTitle>Size Band Thresholds</CardTitle>
          <CardDescription>
            Define work week ranges for each size band (XS, S, M, L, XL)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Size Band</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Min Weeks</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Max Weeks</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Range</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">XS</span>
                  </td>
                  <td className="py-3 px-4">
                    <Input
                      type="number"
                      min={0}
                      value={settings.sizeBandThresholds.xs.min}
                      onChange={(e) => updateSizeBand("xs", "min", parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Input
                      type="number"
                      min={0}
                      value={settings.sizeBandThresholds.xs.max}
                      onChange={(e) => updateSizeBand("xs", "max", parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {settings.sizeBandThresholds.xs.min} - {settings.sizeBandThresholds.xs.max} weeks
                  </td>
                </tr>
                
                <tr className="border-b border-border">
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">S</span>
                  </td>
                  <td className="py-3 px-4">
                    <Input
                      type="number"
                      min={0}
                      value={settings.sizeBandThresholds.s.min}
                      onChange={(e) => updateSizeBand("s", "min", parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Input
                      type="number"
                      min={0}
                      value={settings.sizeBandThresholds.s.max}
                      onChange={(e) => updateSizeBand("s", "max", parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {settings.sizeBandThresholds.s.min} - {settings.sizeBandThresholds.s.max} weeks
                  </td>
                </tr>
                
                <tr className="border-b border-border">
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">M</span>
                  </td>
                  <td className="py-3 px-4">
                    <Input
                      type="number"
                      min={0}
                      value={settings.sizeBandThresholds.m.min}
                      onChange={(e) => updateSizeBand("m", "min", parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Input
                      type="number"
                      min={0}
                      value={settings.sizeBandThresholds.m.max}
                      onChange={(e) => updateSizeBand("m", "max", parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {settings.sizeBandThresholds.m.min} - {settings.sizeBandThresholds.m.max} weeks
                  </td>
                </tr>
                
                <tr className="border-b border-border">
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">L</span>
                  </td>
                  <td className="py-3 px-4">
                    <Input
                      type="number"
                      min={0}
                      value={settings.sizeBandThresholds.l.min}
                      onChange={(e) => updateSizeBand("l", "min", parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Input
                      type="number"
                      min={0}
                      value={settings.sizeBandThresholds.l.max}
                      onChange={(e) => updateSizeBand("l", "max", parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {settings.sizeBandThresholds.l.min} - {settings.sizeBandThresholds.l.max} weeks
                  </td>
                </tr>
                
                <tr>
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">XL</span>
                  </td>
                  <td className="py-3 px-4">
                    <Input
                      type="number"
                      min={0}
                      value={settings.sizeBandThresholds.xl.min}
                      onChange={(e) => updateSizeBand("xl", "min", parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">—</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {settings.sizeBandThresholds.xl.min}+ weeks
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Project Type Demand */}
      <Card id="project-type-demand" className="mb-6 border border-border shadow-sm scroll-mt-8">
        <CardHeader>
          <CardTitle>Project Type Demand</CardTitle>
          <CardDescription>
            Define the demand for each project type in terms of UX and content design effort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Project Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">UX Design Effort</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Content Design Effort</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">Net New</span>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={settings.projectTypeDemand["net-new"].ux}
                      onValueChange={(value) => {
                        setSettings((prev) => ({
                          ...prev,
                          projectTypeDemand: {
                            ...prev.projectTypeDemand,
                            "net-new": {
                              ...prev.projectTypeDemand["net-new"],
                              ux: value,
                            },
                          },
                        }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue>{settings.projectTypeDemand["net-new"].ux}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={settings.projectTypeDemand["net-new"].content}
                      onValueChange={(value) => {
                        setSettings((prev) => ({
                          ...prev,
                          projectTypeDemand: {
                            ...prev.projectTypeDemand,
                            "net-new": {
                              ...prev.projectTypeDemand["net-new"],
                              content: value,
                            },
                          },
                        }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue>{settings.projectTypeDemand["net-new"].content}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                
                <tr className="border-b border-border">
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">New Feature</span>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={settings.projectTypeDemand["new-feature"].ux}
                      onValueChange={(value) => {
                        setSettings((prev) => ({
                          ...prev,
                          projectTypeDemand: {
                            ...prev.projectTypeDemand,
                            "new-feature": {
                              ...prev.projectTypeDemand["new-feature"],
                              ux: value,
                            },
                          },
                        }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue>{settings.projectTypeDemand["new-feature"].ux}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={settings.projectTypeDemand["new-feature"].content}
                      onValueChange={(value) => {
                        setSettings((prev) => ({
                          ...prev,
                          projectTypeDemand: {
                            ...prev.projectTypeDemand,
                            "new-feature": {
                              ...prev.projectTypeDemand["new-feature"],
                              content: value,
                            },
                          },
                        }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue>{settings.projectTypeDemand["new-feature"].content}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                
                <tr className="border-b border-border">
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">Enhancement</span>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={settings.projectTypeDemand["enhancement"].ux}
                      onValueChange={(value) => {
                        setSettings((prev) => ({
                          ...prev,
                          projectTypeDemand: {
                            ...prev.projectTypeDemand,
                            "enhancement": {
                              ...prev.projectTypeDemand["enhancement"],
                              ux: value,
                            },
                          },
                        }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue>{settings.projectTypeDemand["enhancement"].ux}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={settings.projectTypeDemand["enhancement"].content}
                      onValueChange={(value) => {
                        setSettings((prev) => ({
                          ...prev,
                          projectTypeDemand: {
                            ...prev.projectTypeDemand,
                            "enhancement": {
                              ...prev.projectTypeDemand["enhancement"],
                              content: value,
                            },
                          },
                        }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue>{settings.projectTypeDemand["enhancement"].content}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                
                <tr className="border-b border-border">
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">Optimization</span>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={settings.projectTypeDemand["optimization"].ux}
                      onValueChange={(value) => {
                        setSettings((prev) => ({
                          ...prev,
                          projectTypeDemand: {
                            ...prev.projectTypeDemand,
                            "optimization": {
                              ...prev.projectTypeDemand["optimization"],
                              ux: value,
                            },
                          },
                        }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue>{settings.projectTypeDemand["optimization"].ux}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={settings.projectTypeDemand["optimization"].content}
                      onValueChange={(value) => {
                        setSettings((prev) => ({
                          ...prev,
                          projectTypeDemand: {
                            ...prev.projectTypeDemand,
                            "optimization": {
                              ...prev.projectTypeDemand["optimization"],
                              content: value,
                            },
                          },
                        }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue>{settings.projectTypeDemand["optimization"].content}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                
                <tr>
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">Fix/Polish</span>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={settings.projectTypeDemand["fix-polish"].ux}
                      onValueChange={(value) => {
                        setSettings((prev) => ({
                          ...prev,
                          projectTypeDemand: {
                            ...prev.projectTypeDemand,
                            "fix-polish": {
                              ...prev.projectTypeDemand["fix-polish"],
                              ux: value,
                            },
                          },
                        }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue>{settings.projectTypeDemand["fix-polish"].ux}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={settings.projectTypeDemand["fix-polish"].content}
                      onValueChange={(value) => {
                        setSettings((prev) => ({
                          ...prev,
                          projectTypeDemand: {
                            ...prev.projectTypeDemand,
                            "fix-polish": {
                              ...prev.projectTypeDemand["fix-polish"],
                              content: value,
                            },
                          },
                        }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue>{settings.projectTypeDemand["fix-polish"].content}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Effort Model Weights */}
      <Card id="effort-model" className="mb-6 border border-border shadow-sm scroll-mt-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Effort Model Weights</CardTitle>
              <CardDescription>
                Adjust the weights for different complexity factors.
                Higher values increase the impact on effort
                calculations.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="effortModelToggle" className="text-sm font-medium cursor-pointer">
                {settings.effortModelEnabled ? "Enabled" : "Disabled"}
              </Label>
              <Switch
                id="effortModelToggle"
                checked={settings.effortModelEnabled}
                onCheckedChange={(checked) => {
                  setSettings((prev) => ({ ...prev, effortModelEnabled: checked }));
                  setHasChanges(true);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={!settings.effortModelEnabled ? "opacity-50 pointer-events-none" : ""}>
            <h4 className="text-base font-semibold mb-5 text-foreground">
              UX Design
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Label htmlFor="productRisk">
                      Product Risk
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      How much impact does this roadmap have on the business?
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {settings.effortWeights.productRisk}
                    </span>
                    <span className="text-xs text-cyan-600 font-medium">
                      (×{(settings.effortWeights.productRisk / 10).toFixed(1)})
                    </span>
                  </div>
                </div>
                <Slider
                  id="productRisk"
                  min={1}
                  max={10}
                  step={1}
                  value={[settings.effortWeights.productRisk]}
                  onValueChange={([value]) =>
                    updateWeight("productRisk", value)
                  }
                  className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Label htmlFor="problemAmbiguity">
                      Problem Ambiguity
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      If a problem statement is not "clear" enough, how will this impact the design?
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {settings.effortWeights.problemAmbiguity}
                    </span>
                    <span className="text-xs text-cyan-600 font-medium">
                      (×{(settings.effortWeights.problemAmbiguity / 10).toFixed(1)})
                    </span>
                  </div>
                </div>
                <Slider
                  id="problemAmbiguity"
                  min={1}
                  max={10}
                  step={1}
                  value={[settings.effortWeights.problemAmbiguity]}
                  onValueChange={([value]) =>
                    updateWeight("problemAmbiguity", value)
                  }
                  className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className={`pt-4 border-t border-border ${!settings.effortModelEnabled ? "opacity-50 pointer-events-none" : ""}`}>
            <h4 className="text-base font-semibold mb-5 text-foreground">
              Content Design
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Label htmlFor="contentSurface">
                      Content Surface Area
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      How large of a surface are teams writing content for?
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {settings.effortWeights.contentSurface}
                    </span>
                    <span className="text-xs text-cyan-600 font-medium">
                      (×{(settings.effortWeights.contentSurface / 10).toFixed(1)})
                    </span>
                  </div>
                </div>
                <Slider
                  id="contentSurface"
                  min={1}
                  max={10}
                  step={1}
                  value={[
                    settings.effortWeights.contentSurface,
                  ]}
                  onValueChange={([value]) =>
                    updateWeight("contentSurface", value)
                  }
                  className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Label htmlFor="localizationScope">
                      Localization
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Number of languages needed
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {settings.effortWeights.localizationScope}
                    </span>
                    <span className="text-xs text-cyan-600 font-medium">
                      (×{(settings.effortWeights.localizationScope / 10).toFixed(1)})
                    </span>
                  </div>
                </div>
                <Slider
                  id="localizationScope"
                  min={1}
                  max={10}
                  step={1}
                  value={[
                    settings.effortWeights.localizationScope,
                  ]}
                  onValueChange={([value]) =>
                    updateWeight("localizationScope", value)
                  }
                  className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workstream Penalty */}
      <Card id="workstream-impact" className="mb-6 border border-border shadow-sm scroll-mt-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Workstream Impact</CardTitle>
              <CardDescription>
                Configure how concurrent workstreams affect focus-time ratio in the capacity calculator
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="workstreamImpactToggle" className="text-sm font-medium cursor-pointer">
                {settings.workstreamImpactEnabled ? "Enabled" : "Disabled"}
              </Label>
              <Switch
                id="workstreamImpactToggle"
                checked={settings.workstreamImpactEnabled}
                onCheckedChange={(checked) => {
                  setSettings((prev) => ({ ...prev, workstreamImpactEnabled: checked }));
                  setHasChanges(true);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={!settings.workstreamImpactEnabled ? "opacity-50 pointer-events-none" : ""}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Label htmlFor="workstreamPenalty">
                  Penalty per Additional Workstream
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reduces focus-time ratio for each project beyond the first
                </p>
              </div>
              <span className="text-sm font-medium text-cyan-600">
                {Math.round(settings.workstreamPenalty * 100)}%
              </span>
            </div>
            <Slider
              id="workstreamPenalty"
              min={0.05}
              max={0.25}
              step={0.05}
              value={[settings.workstreamPenalty]}
              onValueChange={([value]) => {
                setSettings((prev) => ({ ...prev, workstreamPenalty: value }));
                setHasChanges(true);
              }}
              className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-500"
            />
            <p className="text-xs text-muted-foreground mt-3">
              Example: With {Math.round(settings.workstreamPenalty * 100)}% penalty, working on 3 concurrent projects reduces your focus-time ratio by {Math.round(settings.workstreamPenalty * 2 * 100)}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={resetToDefaults}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
          onClick={saveSettings}
          disabled={!hasChanges}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}