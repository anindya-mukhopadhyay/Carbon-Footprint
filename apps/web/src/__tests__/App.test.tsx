import { render, screen } from "@testing-library/react";
import { App } from "@/App";

vi.mock("firebase/analytics", () => ({
  getAnalytics: vi.fn(),
  isSupported: vi.fn().mockResolvedValue(false)
}));

vi.mock("firebase/messaging", () => ({
  getMessaging: vi.fn(),
  isSupported: vi.fn().mockResolvedValue(false)
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback({
      uid: "test-user-123",
      email: "test@domain.com",
      displayName: "Anindya"
    });
    return () => {};
  }),
  signOut: vi.fn()
}));

vi.mock("@/lib/firebase", () => ({
  initializeTelemetry: vi.fn(),
  auth: {},
  db: {}
}));

vi.mock("@/lib/api", () => ({
  uploadReceipt: vi.fn(),
  createEntry: vi.fn().mockResolvedValue({ id: "mock-entry-id" }),
  getEntries: vi.fn().mockResolvedValue([]),
  askCoach: vi.fn().mockResolvedValue({ answer: "mock answer", actions: [], estimatedAnnualSavingsKg: 0 })
}));

describe("EcoTrack application", () => {
  it("renders the core climate experience", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /small choices.*measurable impact/i })
    ).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: /good morning/i })).toBeInTheDocument();
  });
});
