import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Scenarios } from "./pages/Scenarios";
import { ScenarioDetail } from "./pages/ScenarioDetail";
import { Help } from "./pages/Help";
import { Settings } from "./pages/Settings";
import { CapacityCalculator } from "./pages/CapacityCalculator";
import { Admin } from "./pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "scenarios", Component: Scenarios },
      { path: "scenarios/:id", Component: ScenarioDetail },
      { path: "calculator", Component: CapacityCalculator },
      { path: "help", Component: Help },
      { path: "settings", Component: Settings },
      { path: "admin", Component: Admin },
    ],
  },
]);