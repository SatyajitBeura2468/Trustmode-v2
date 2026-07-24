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

describe("TrustMode web app", () => {
  it("uses plain language on the public entry flow", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: /digital help/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /start a practice session/i })).toBeTruthy();
    expect(screen.queryByText(/Ghost Workspace|temporary capability|Intent Contract|semantic field/i)).toBeNull();
  });

  it("explains help permissions without protocol jargon", () => {
    renderAt("/demo/scholarship");
    expect(screen.getByRole("heading", { name: /what the invited person can and cannot do/i })).toBeTruthy();
    expect(screen.queryByText(/Ghost Workspace|temporary capability|Intent Contract|six checks/i)).toBeNull();
  });

  it("waits honestly and never invents a helper name", () => {
    renderAt("/demo/scholarship/session");
    expect(screen.getAllByText(/waiting for the invited person to join/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/no helper has joined/i).length).toBeGreaterThan(0);
    for (const inventedName of ["Priya", "Meera", "Ananya", "Aarav", "Kabir", "Ishaan"]) {
      expect(screen.queryByText(new RegExp(inventedName, "i"))).toBeNull();
    }
    expect(screen.queryByText(/^Connected$/i)).toBeNull();
  });

  it("uses scenario-specific hospital content", () => {
    renderAt("/demo/hospital/session");
    expect(screen.getByRole("heading", { name: /appointment details/i })).toBeTruthy();
    expect(screen.getByText(/patient identification number/i)).toBeTruthy();
    expect(screen.queryByText(/scholarship form/i)).toBeNull();
    expect(screen.getByText("Invite helper", { exact: true })).toBeTruthy();
  });
});
