import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import type { ScenarioId } from "@trustmode/core";
import { Landing } from "./pages/Landing";
import { DemoStart } from "./pages/DemoStart";
import { InfoPage } from "./pages/Info";
import { HelperWorkspacePage } from "./pages/HelperWorkspace";
import { ControlledPortalPage } from "./pages/ControlledPortal";
import { OwnerTask } from "./components/SharedTask";
import { useDemo } from "./state/DemoContext";
import "./collaboration.css";

const scenarioIds = new Set<ScenarioId>(["scholarship", "hospital", "admission"]);

function OwnerRoute() {
  const { scenario } = useParams();
  const demo = useDemo();
  const routeScenario = scenarioIds.has(scenario as ScenarioId) ? scenario as ScenarioId : "scholarship";

  useEffect(() => {
    if (demo.scenarioId !== routeScenario) demo.setScenario(routeScenario);
  }, [demo, routeScenario]);

  if (demo.scenarioId !== routeScenario) {
    return <main id="main" className="route-loading" aria-live="polite">Opening the selected practice workflow…</main>;
  }
  return <OwnerTask />;
}

export function App() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/demo" element={<DemoStart />} />
      <Route path="/demo/:scenario" element={<DemoStart />} />
      <Route path="/demo/:scenario/session" element={<OwnerRoute />} />
      <Route path="/owner" element={<Navigate to="/demo/scholarship/session" replace />} />
      <Route path="/helper" element={<HelperWorkspacePage />} />
      <Route path="/portal/:scenario" element={<ControlledPortalPage />} />
      <Route path="/review" element={<Navigate to="/demo/scholarship/session" replace />} />
      <Route path="/privacy-preview" element={<Navigate to="/demo/scholarship/session" replace />} />
      <Route path="/blocked-action" element={<Navigate to="/demo/scholarship/session" replace />} />
      <Route path="/receipt" element={<Navigate to="/demo/scholarship/session" replace />} />
      <Route path="/practice" element={<InfoPage type="practice" />} />
      <Route path="/safety" element={<InfoPage type="safety" />} />
      <Route path="/accessibility" element={<InfoPage type="accessibility" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
