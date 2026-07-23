import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { DemoProvider } from "./state/DemoContext";
import { App } from "./App";

beforeAll(() => {
  vi.stubGlobal("scrollTo", vi.fn());
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <DemoProvider><App /></DemoProvider>
    </MemoryRouter>,
  );
}

describe("TrustMode web demo", () => {
  it("renders the core promise and live demo action", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: /digital help/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /try the safe demo/i })).toBeTruthy();
  });

  it("renders the Intent Contract for a selected scenario", () => {
    renderAt("/demo/scholarship");
    expect(screen.getByRole("heading", { name: /clear boundaries/i })).toBeTruthy();
    expect(screen.getByText(/the helper may not/i)).toBeTruthy();
  });

  it("renders semantic proposals without private values", () => {
    renderAt("/demo/scholarship/session");
    expect(screen.getByRole("heading", { name: "Ghost Workspace" })).toBeTruthy();
    expect(screen.getAllByText(/select CBSE/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/123456789012/)).toBeNull();
  });
});
