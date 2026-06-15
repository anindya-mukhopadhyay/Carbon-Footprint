describe("EcoTrack AI dashboard", () => {
  it("loads the dashboard and calculates a footprint", () => {
    cy.visit("/");
    cy.findByRole("heading", { name: /small choices/i }).should("be.visible");
    cy.findByRole("button", { name: /calculate my footprint/i }).first().click();
    cy.get("#calculator").should("be.visible");
    cy.findByText(/estimated footprint/i).should("be.visible");
  });
});
