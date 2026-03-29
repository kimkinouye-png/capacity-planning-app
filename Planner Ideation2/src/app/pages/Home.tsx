import { Link } from "react-router";
import { ClipboardPaste, Calculator, GitCompare, CalendarRange, Users, FileText, Sliders, BarChart3 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

// Step mockup components showing actual app interface
const Step1Mockup = () => (
  <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Plan Name</label>
        <input 
          type="text" 
          value="Q2 2026 Planning" 
          readOnly
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Quarter</label>
        <div className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm">
          Q2'26
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">UX Designers</label>
          <input 
            type="number" 
            value="5" 
            readOnly
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Content Designers</label>
          <input 
            type="number" 
            value="3" 
            readOnly
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm"
          />
        </div>
      </div>
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">UX Design Capacity</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">80.0 weeks</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Content Design Capacity</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">40.0 weeks</span>
        </div>
      </div>
    </div>
  </div>
);

const Step2Mockup = () => (
  <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <ClipboardPaste className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Paste Roadmap</span>
      </div>
    </div>
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 min-h-[240px] font-mono text-xs">
      <div className="space-y-1.5">
        <div className="grid grid-cols-4 gap-3 pb-2 border-b border-gray-300 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300">
          <div>KEY</div>
          <div>NAME</div>
          <div>INITIATIVE</div>
          <div>PRIORITY</div>
        </div>
        <div className="grid grid-cols-4 gap-3 text-gray-900 dark:text-gray-100">
          <div>PROJ-101</div>
          <div>Payment Flow</div>
          <div>Revenue</div>
          <div>P1</div>
        </div>
        <div className="grid grid-cols-4 gap-3 text-gray-900 dark:text-gray-100">
          <div>PROJ-102</div>
          <div>User Onboarding</div>
          <div>Growth</div>
          <div>P2</div>
        </div>
        <div className="grid grid-cols-4 gap-3 text-gray-900 dark:text-gray-100">
          <div>PROJ-103</div>
          <div>Dashboard Redesign</div>
          <div>Engagement</div>
          <div>P1</div>
        </div>
        <div className="grid grid-cols-4 gap-3 text-gray-900 dark:text-gray-100">
          <div>PROJ-104</div>
          <div>Mobile App</div>
          <div>Platform</div>
          <div>P3</div>
        </div>
      </div>
    </div>
    <div className="flex gap-2 mt-4">
      <button className="px-4 py-2 bg-cyan-500 text-white rounded-md text-sm font-medium hover:bg-cyan-600">
        Import Roadmap
      </button>
      <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
        Cancel
      </button>
    </div>
  </div>
);

const Step3Mockup = () => (
  <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
    <div className="mb-4">
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Payment Flow Redesign</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">PROJ-101 • Revenue Initiative</div>
    </div>
    
    <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-800">
      <button className="px-3 py-2 text-sm font-medium border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400">
        Product Design
      </button>
      <button className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        PM Intake
      </button>
      <button className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        Content Design
      </button>
    </div>

    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Product Risk</label>
          <span className="text-xs text-gray-500 dark:text-gray-400">Weight: ×0.4</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                num === 3
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Problem Ambiguity</label>
          <span className="text-xs text-gray-500 dark:text-gray-400">Weight: ×0.5</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                num === 4
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-950/20 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">UX Effort Estimate</span>
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">3.5 weeks</span>
        </div>
      </div>
    </div>
  </div>
);

const Step4Mockup = () => (
  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 space-y-3">
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Q2 2026 - Committed</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">15 roadmap items</div>
        </div>
        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-700">
          Committed
        </Badge>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">UX Design</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">72.0 / 80.0 weeks</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500" style={{ width: '90%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Content Design</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">35.0 / 40.0 weeks</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: '87.5%' }}></div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Q2 2026 - Optimistic</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">18 roadmap items</div>
        </div>
        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700">
          Draft
        </Badge>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">UX Design</span>
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">95.0 / 80.0 weeks</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: '100%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Content Design</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">42.0 / 40.0 weeks</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export function Home() {
  const steps = [
    {
      number: "1",
      title: "Add your team size",
      description: "Create a new scenario by setting your planning period and defining how many UX designers and content designers are on your team.",
      icon: Users,
      mockup: Step1Mockup,
    },
    {
      number: "2",
      title: "Paste your roadmap",
      description: "Copy your roadmap directly from Google Sheets, Excel, or any spreadsheet and paste it into the tool to get started.",
      icon: ClipboardPaste,
      mockup: Step2Mockup,
    },
    {
      number: "3",
      title: "Estimate effort",
      description: "Size your initiatives using factor-based complexity scoring for accurate estimates.",
      icon: Calculator,
      mockup: Step3Mockup,
    },
    {
      number: "4",
      title: "Compare scenarios",
      description: "Create and compare different planning scenarios to find the optimal approach.",
      icon: GitCompare,
      mockup: Step4Mockup,
    },
  ];

  const features = [
    {
      title: "Factor-Based Sizing",
      description: "Estimate effort using complexity factors across Product Management, UX Design, and Content Design",
    },
    {
      title: "Real-Time Calculations",
      description: "Size capacity and demand update instantly as you adjust complexity factors and team size",
    },
    {
      title: "Auto-Save Functionality",
      description: "Never lose your work with automatic saving of all changes and scenario updates",
    },
    {
      title: "Scenario Management",
      description: "Create, edit, and compare multiple scenarios to find the best plan for your team",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-900/30 mb-6">
          <CalendarRange className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h1 className="text-4xl font-semibold mb-5 text-foreground">Welcome to Capacity Planner</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          A planning tool that gives design leaders a measurable way to size and visualize how much work is in a product roadmap.
        </p>
      </div>

      {/* CTA Section */}
      <Card className="border border-border shadow-md bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 mb-16">
        <CardContent className="p-10 text-center">
          <h2 className="text-2xl font-semibold mb-8 text-foreground">Ready to get started?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/scenarios">
              <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                Create a New Plan
              </Button>
            </Link>
            <Link to="/scenarios">
              <Button size="lg" variant="outline" className="border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/20">
                Review Current Plans
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Steps with Illustrations */}
      <div className="space-y-12 mb-16">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isEven = index % 2 === 0;
          
          return (
            <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-start ${isEven ? '' : 'lg:flex-row-reverse'}`}>
              {/* Text Content */}
              <div className={`${isEven ? 'lg:order-1' : 'lg:order-2'} lg:pt-8`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                    <span className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">{step.number}</span>
                  </div>
                  <Icon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Illustration */}
              <div className={isEven ? 'lg:order-2' : 'lg:order-1'}>
                <Card className="border border-border shadow-lg overflow-hidden">
                  <step.mockup />
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}