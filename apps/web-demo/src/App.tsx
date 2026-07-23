import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Landing } from "./pages/Landing";
import { DemoStart } from "./pages/DemoStart";
import { Workspace } from "./pages/Workspace";
import { InfoPage } from "./pages/Info";

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
      <Route path="/demo/:scenario/session" element={<Workspace />} />
      <Route path="/owner" element={<Navigate to="/demo/scholarship/session" replace />} />
      <Route path="/helper" element={<Navigate to="/demo/scholarship/session" replace />} />
      <Route path="/review" element={<Navigate to="/demo/scholarship/session" replace />} />
      <Route path="/privacy-preview" element={<Workspace initialStage="privacy" />} />
      <Route path="/blocked-action" element={<Workspace initialStage="blocked" />} />
      <Route path="/receipt" element={<Workspace initialStage="receipt" />} />
      <Route path="/practice" element={<InfoPage type="practice" />} />
      <Route path="/safety" element={<InfoPage type="safety" />} />
      <Route path="/accessibility" element={<InfoPage type="accessibility" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
