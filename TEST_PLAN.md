# Test Plan

## Overview
A comprehensive, multi-layered testing strategy designed to ensure high reliability and bug-free deployments for the Linkqs platform.

### 1. Unit Testing
- **Frontend:** Jest + React Testing Library for isolated component testing.
- **Backend:** Jest for validating controllers and domain services independently of the database.
- *Goal:* Achieve and maintain 80%+ code coverage (enforced via SonarQube).

### 2. Integration Testing
- Supertest is used to test backend API endpoints.
- Validates the data flow from the Controller to the Service to a test Database schema.

### 3. UI Testing (E2E)
- Cypress or Playwright utilized to simulate real user interactions across critical user journeys (e.g., Login, Dashboard rendering, Profile updates).

## Screen-Wise Test Cases

### Authentication Screen
- [ ] **TC_01:** Verify successful email/password login redirects to the Dashboard.
- [ ] **TC_02:** Verify validation errors appear for improperly formatted emails.
- [ ] **TC_03:** Verify clicking "Sign in with Google" successfully initiates the OAuth redirect.

### Profile & Settings Screen
- [ ] **TC_04:** Verify user profile data (name, email, avatar) loads correctly.
- [ ] **TC_05:** Verify the Dark Mode toggle switches the theme instantly without a page reload.
- [ ] **TC_06:** Verify toggling notification preferences sends an API update to the database successfully.

### Dashboard (Bento Grid)
- [ ] **TC_07:** Verify skeleton loaders appear before data is fully fetched.
- [ ] **TC_08:** Verify data widgets correctly render the fetched JSON payloads.

## Completion Tracking
- **Unit Tests:** 0% (Pending implementation)
- **Integration Tests:** 0% (Pending implementation)
- **UI Tests:** 0% (Pending implementation)
