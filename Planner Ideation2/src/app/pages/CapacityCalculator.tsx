import { useState } from "react";
import { Minus, Plus, RotateCcw, Info } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";

interface CalculatorInputs {
  planningPeriodWeeks: number;
  daysPerWeek: number;
  vacationDays: number;
  companyHolidays: number;
  focusTimeRatio: number;
  workstreams: number;
}

const defaultInputs: CalculatorInputs = {
  planningPeriodWeeks: 13,
  daysPerWeek: 5,
  vacationDays: 0,
  companyHolidays: 0,
  focusTimeRatio: 0.75,
  workstreams: 1,
};

export function CapacityCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);

  const updateInput = (key: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const increment = (key: keyof CalculatorInputs, step: number = 1) => {
    setInputs((prev) => ({ ...prev, [key]: prev[key] + step }));
  };

  const decrement = (key: keyof CalculatorInputs, step: number = 1) => {
    setInputs((prev) => ({ ...prev, [key]: Math.max(0, prev[key] - step) }));
  };

  const resetToDefaults = () => {
    setInputs(defaultInputs);
  };

  // Default workstream penalty (will eventually come from settings)
  // This reduces focus-time ratio by this percentage per additional workstream
  const workstreamPenalty = 0.10; // 10% reduction per workstream beyond 1

  // Calculations
  const availableDays =
    inputs.planningPeriodWeeks * inputs.daysPerWeek -
    inputs.vacationDays -
    inputs.companyHolidays;
  const availableWeeks = availableDays / inputs.daysPerWeek;
  const workWeeks = availableWeeks;
  
  // Adjust focus-time ratio based on workstreams
  const additionalWorkstreams = Math.max(0, inputs.workstreams - 1);
  const workstreamImpact = additionalWorkstreams * workstreamPenalty;
  const adjustedFocusTimeRatio = Math.max(0.2, inputs.focusTimeRatio - workstreamImpact);
  
  const focusWeeks = workWeeks * adjustedFocusTimeRatio;
  const dailyFocusHours =
    availableDays > 0 ? (focusWeeks * 5 * 8) / availableDays : 0;

  // Capacity status
  const getCapacityStatus = () => {
    if (focusWeeks >= 8) {
      return {
        label: "Healthy",
        color: "bg-green-100 dark:bg-green-950/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-900/50",
        emoji: "🟢",
      };
    } else if (focusWeeks >= 4) {
      return {
        label: "Tight",
        color: "bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50",
        emoji: "🟡",
      };
    } else {
      return {
        label: "Overloaded",
        color: "bg-red-100 dark:bg-red-950/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50",
        emoji: "🔴",
      };
    }
  };

  const capacityStatus = getCapacityStatus();

  return (
    <div className="max-w-6xl mx-auto p-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Designer Capacity Calculator
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Estimate your realistic design time for any planning period.
        </p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Results */}
        <div className="space-y-6">
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle>Your Capacity Summary</CardTitle>
              <CardDescription>
                Calculated based on your inputs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Work Weeks */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-5">
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                  Work Weeks
                </div>
                <div className="text-4xl font-semibold text-blue-900 dark:text-blue-200">
                  {workWeeks.toFixed(1)}
                </div>
              </div>

              {/* Focus Weeks - Hero Card */}
              <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/50 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
                    Focus Weeks
                  </div>
                  <div className="group relative">
                    <Info className="h-4 w-4 text-cyan-500 dark:text-cyan-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-10">
                      Focus Weeks = the realistic, uninterrupted time available
                      for design work after accounting for overhead.
                    </div>
                  </div>
                </div>
                <div className="text-4xl font-semibold text-cyan-900 dark:text-cyan-200">
                  {focusWeeks.toFixed(1)}
                </div>
              </div>

              {/* Available Days */}
              <div className="bg-muted/50 border border-border rounded-lg p-5">
                <div className="text-sm text-muted-foreground font-medium mb-1">
                  Available Days
                </div>
                <div className="text-4xl font-semibold text-foreground">
                  {availableDays}
                </div>
              </div>

              {/* Daily Focus Hours */}
              <div className="bg-muted/50 border border-border rounded-lg p-5">
                <div className="text-sm text-muted-foreground font-medium mb-1">
                  Daily Focus Hours
                </div>
                <div className="text-4xl font-semibold text-foreground">
                  {dailyFocusHours.toFixed(1)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity Status */}
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle>Capacity Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`flex items-center gap-3 p-4 rounded-lg border ${capacityStatus.color}`}
              >
                <span className="text-2xl">{capacityStatus.emoji}</span>
                <div>
                  <div className="font-semibold text-base">
                    {capacityStatus.label}
                  </div>
                  <div className="text-sm opacity-80">
                    {focusWeeks >= 8 && "You have healthy capacity for design work"}
                    {focusWeeks >= 4 && focusWeeks < 8 && "Capacity is tight—prioritize carefully"}
                    {focusWeeks < 4 && "Capacity is critically low—reduce scope"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Inputs */}
        <Card className="border border-border shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Your Capacity</CardTitle>
            <CardDescription>
              Adjust your planning period and availability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Planning Period */}
            <div>
              <Label htmlFor="planningPeriod" className="mb-3 block">
                Planning Period (weeks)
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => decrement("planningPeriodWeeks")}
                  disabled={inputs.planningPeriodWeeks <= 1}
                  className="h-10 w-10 shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="planningPeriod"
                  type="number"
                  min={1}
                  value={inputs.planningPeriodWeeks}
                  onChange={(e) =>
                    updateInput(
                      "planningPeriodWeeks",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => increment("planningPeriodWeeks")}
                  className="h-10 w-10 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Days per Week */}
            <div>
              <Label htmlFor="daysPerWeek" className="mb-3 block">
                Days per Week
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => decrement("daysPerWeek")}
                  disabled={inputs.daysPerWeek <= 1}
                  className="h-10 w-10 shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="daysPerWeek"
                  type="number"
                  min={1}
                  max={7}
                  value={inputs.daysPerWeek}
                  onChange={(e) =>
                    updateInput(
                      "daysPerWeek",
                      Math.min(7, Math.max(1, parseInt(e.target.value) || 1))
                    )
                  }
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => increment("daysPerWeek")}
                  disabled={inputs.daysPerWeek >= 7}
                  className="h-10 w-10 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Vacation / PTO Days */}
            <div>
              <Label htmlFor="vacationDays" className="mb-3 block">
                Vacation / PTO Days
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => decrement("vacationDays")}
                  disabled={inputs.vacationDays <= 0}
                  className="h-10 w-10 shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="vacationDays"
                  type="number"
                  min={0}
                  value={inputs.vacationDays}
                  onChange={(e) =>
                    updateInput("vacationDays", parseInt(e.target.value) || 0)
                  }
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => increment("vacationDays")}
                  className="h-10 w-10 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Company Holidays */}
            <div>
              <Label htmlFor="companyHolidays" className="mb-3 block">
                Company Holidays
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => decrement("companyHolidays")}
                  disabled={inputs.companyHolidays <= 0}
                  className="h-10 w-10 shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="companyHolidays"
                  type="number"
                  min={0}
                  value={inputs.companyHolidays}
                  onChange={(e) =>
                    updateInput(
                      "companyHolidays",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => increment("companyHolidays")}
                  className="h-10 w-10 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Concurrent Workstreams */}
            <div>
              <Label htmlFor="workstreams" className="mb-3 block">
                Concurrent Workstreams
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => decrement("workstreams")}
                  disabled={inputs.workstreams <= 1}
                  className="h-10 w-10 shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="workstreams"
                  type="number"
                  min={1}
                  value={inputs.workstreams}
                  onChange={(e) =>
                    updateInput(
                      "workstreams",
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => increment("workstreams")}
                  className="h-10 w-10 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Number of projects you're working on simultaneously. More workstreams reduce focus time.
              </p>
            </div>

            {/* Focus-Time Ratio */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="focusTimeRatio">Focus-Time Ratio</Label>
                <span className="text-sm font-medium text-cyan-600">
                  {Math.round(inputs.focusTimeRatio * 100)}%
                </span>
              </div>
              <Slider
                id="focusTimeRatio"
                min={0.4}
                max={0.9}
                step={0.05}
                value={[inputs.focusTimeRatio]}
                onValueChange={([value]) =>
                  updateInput("focusTimeRatio", value)
                }
                className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-500"
              />
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Accounts for meetings, context switching, and interruptions.
                Lower = more overhead.
              </p>
            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}