# Accessibility Plan

Target: WCAG 2.2 AA and Lighthouse Accessibility 95+.

## Implemented Controls

- Skip link to main content.
- Semantic HTML landmarks and heading hierarchy.
- Labeled inputs, selects, buttons, and status regions.
- Keyboard navigable controls with visible focus states.
- Screen reader compatible charts through surrounding labels and summaries.
- Voice input for the AI coach.
- Text-to-speech for coach responses.
- Voice commands for dashboard navigation and contrast changes.
- High contrast mode.
- Dark mode.
- Adjustable font scale.
- Language selector for multilingual readiness.
- Colorblind-safe chart palette.
- Reduced motion support.

## QA Checklist

- Run React Testing Library tests.
- Run `jest-axe` component accessibility audit.
- Run Lighthouse on Firebase Hosting preview.
- Test keyboard-only journey from hero to calculator, coach, twin, maps, and accessibility controls.
- Test with VoiceOver or NVDA.
