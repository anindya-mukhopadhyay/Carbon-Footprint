describe("EcoTrack AI smoke journey", () => {
  it("calculates a footprint and reaches accessibility controls", () => {
    cy.visit("/");
    cy.findByRole("heading", { name: /understand, predict/i }).should("be.visible");
    cy.findByLabelText(/distance per day/i).clear().type("18");
    cy.findByRole("button", { name: /calculate footprint/i }).click();
    cy.findByRole("heading", { name: /accessibility controls/i }).scrollIntoView().should("be.visible");
  });
});
