import { PlayCircle, BookOpen, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

export function Help() {
  const quickStart = [
    "Create a new plan by clicking 'New Plan' and entering team size",
    "Add roadmap items manually, paste from a spreadsheet, or upload a file",
    "Estimate effort using complexity factors for UX and Content Design",
    "Review capacity to see if your plan is feasible",
  ];

  const faqs = [
    {
      question: "How do I create a new plan?",
      answer:
        "Click 'New Plan' on the Plans page. Enter a plan name, select a quarter, and specify how many UX designers and Content designers are on your team. You can add roadmap items later or import them from a spreadsheet.",
    },
    {
      question: "What are the three tabs in the New Plan modal?",
      answer:
        "Setup (create plan with basic info), Paste Roadmap (import tab-delimited data from spreadsheets), and Upload File (import CSV/XLS/XLSX files). You can create a plan without roadmap items and add them manually later.",
    },
    {
      question: "How do I add roadmap items?",
      answer:
        "Click 'View Details' on a plan card, then use the 'Add Roadmap Item' button. You can also paste roadmap data or upload a file when creating a new plan.",
    },
    {
      question: "What are complexity factors?",
      answer:
        "Complexity factors help estimate effort more accurately. For Product Design, you score Product Risk and Problem Ambiguity (1-5). For Content Design, you score Content Surface Area and Localization Scope (1-5). These are combined with configurable weights in Settings.",
    },
    {
      question: "How is capacity calculated?",
      answer:
        "Capacity = (Work Weeks - Holidays/PTO) × Focus Time Ratio × Team Size. The Focus Time Ratio (default 70%) accounts for meetings and non-project work. You can adjust this in Settings.",
    },
    {
      question: "How is demand calculated?",
      answer:
        "Demand is the sum of all focus weeks for roadmap items in a plan. Each item's effort is calculated using base weeks plus complexity adjustments based on the factors you score.",
    },
    {
      question: "What's the difference between Draft and Committed plans?",
      answer:
        "Draft plans are exploratory - you can experiment with different scenarios. Committed plans represent your finalized capacity allocation. You can compare multiple scenarios side by side.",
    },
    {
      question: "Does the tool auto-save?",
      answer:
        "Yes! All changes are automatically saved to your browser's local storage. Your data persists across sessions, but it's stored locally only and not shared across devices.",
    },
    {
      question: "Where can I adjust calculation settings?",
      answer:
        "Go to Settings to configure complexity factor weights, focus time ratio, planning period details, and project type demand levels. Changes apply to all new calculations.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <span>Get Started</span>
        <span>/</span>
        <span className="text-foreground font-medium">Help</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground">Capacity Planning Guide</h1>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Learn how to effectively use the Capacity Planner to manage and plan roadmaps across quarterly cycles.
        </p>
      </div>

      {/* Quick Start */}
      <Card className="mb-8 border border-cyan-200 dark:border-cyan-800 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <CardTitle>Quick Start</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {quickStart.map((item, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-sm font-medium flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-foreground pt-0.5">{item}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Key Concepts */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
          <Info className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          Key Concepts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Focus Weeks</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                A feature requiring 3 focus weeks means 3 weeks of heads down + 0 disruptions. Example:
                Work Weeks = Focus Weeks × 1.7x
              </CardDescription>
              <div className="mt-3 p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg text-sm text-cyan-700 dark:text-cyan-300">
                <span className="font-medium">Example:</span> Work Weeks = 3 focus weeks ÷ 0.7 ≈ 4-5
                work weeks
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Work Weeks</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Accounts for non-project time: meetings by dividing focus time by 0.7x. The group a
                designer needs are included in work weeks calculations.
              </CardDescription>
              <div className="mt-3 p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg text-sm text-cyan-700 dark:text-cyan-300">
                <span className="font-medium">Formula:</span> Work Weeks = Focus Weeks ÷ 0.7
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Complexity Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Score each factor from 1-5, calculated into effort, which are specific to Product Design,
                UX Designers, and Content Design:
              </CardDescription>
              <ul className="mt-3 space-y-1 text-sm text-foreground">
                <li className="flex gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Product Risk</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Problem Ambiguity</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>User Complexity Requirements</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Legal Compliance Dependency</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Capacity Status</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Visual indicators show if your team is under, near, or over capacity for the planning
                period:
              </CardDescription>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-foreground">
                    <span className="font-medium">Green:</span> &lt;90% capacity
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-foreground">
                    <span className="font-medium">Amber:</span> 90-100% capacity
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-foreground">
                    <span className="font-medium">Red:</span> &gt;100% capacity
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Frequently Asked Questions</h2>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/50">
                    <span className="text-left font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}