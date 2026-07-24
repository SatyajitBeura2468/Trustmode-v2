import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { DemoProvider } from "./state/DemoContext";
import { App } from "./App";

beforeAll(() => {
  vi.stubGlobal("scrollTo", vi.fn());
});

afterEach(() => {
  cleanup();
  localStorage.clear();
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
    expect(screen.getByRole("link", { name: /start a controlled session/i })).toBeTruthy();
  });

  it("explains help permissions for a selected scenario", () => {
    renderAt("/demo/scholarship");
    expect(screen.getByRole("heading", { name: /what the person helping you can/i })).toBeTruthy();
    expect(screen.getByText(/the person helping you cannot/i)).toBeTruthy();
  });

  it("renders a shared form without exposing protected values", () => {
    renderAt("/demo/scholarship/session");
    expect(screen.getByRole("heading", { name: /helping with education details/i })).toBeTruthy();
    expect(screen.getByText(/visible only to you/i)).toBeTruthy();
    expect(screen.queryByText(/123456789012/)).toBeNull();
  });
});
