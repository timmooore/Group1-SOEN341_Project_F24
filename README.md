**SOEN 341 - Tutorial FK-X Group 1**

# Project: A Peer Assessment Application 

The Peer Assessment Application is designed for university team projects, allowing students to evaluate their teammates based on key performance dimensions. This system promotes accountability and provides valuable feedback to students and instructors on team dynamics and individual contributions.

## :bookmark: Table of Contents 
1. [Team Members and Roles](#team-members-and-roles)
2. [Key Features](#key-features)
3. [Development Methodology](#development-methodology)
4. [Technology Stack](#technology-stack)
5. [Usage Guide](#usage-guide)
6. [Sprint 1](#sprint-1)
7. [Sprint 2](#sprint-2)
8. [Sprint 3](#sprint-3)
9. [Sprint 4](#sprint-4)


<a name="team-members-and-roles"></a>
## :superhero: Team Members and Roles
| Team Member | Role | Description |
| ----------- | ---- | ----------- |
| **Alessandro Condina** | Frontend Development Lead | Responsible for leading the development of the application frontend. Main voice for the overall design of the project. Communicates with backend leads to ensure design visions are well-understood. |
| **Olivier Constanzo de Oliveira** | Development Pivot | Assists both front- and backend development as necessary. Works with Frontend lead to design the different pages of the applications and ensure all team members understand the design vision. |
| **Nicholas Gallacher** | Product Owner (PO) | Serves as the primary voice for product features and requirements and oversees the creation and prioritization of user stories. |
| **Timothy Moore** | Project Manager (PM) | Oversees management and maintenance of progress tracking and collaboration tools on GitHub. Supports Product Owner with backlog refinement and Scrum Master with effective communcation of priorities to development team. Manages acceptance testing. |
| **Nicholas Papamakarios** | Scrum Master (SM) & Development Pivot | Maintains meeting minutes and ensures development team has clear understanding of task requirements and priorities set by the PO and PM. Assists front- and back-end development as necessary. |
| **Gregory Sacciadis** | Backend Development lead | Responsible for leading the development of the application backend. Ensures proper route setup and logic, and conducts regular code reviews of the other developers' code. |

<a name="key-features"></a>
## :star: Key Features

1. **Student Assessment:** Students assess their teammates anonymously on a 7-point scale across four dimensions: cooperation, conceptual contribution, practical contribution, and work ethic. The evaluation promotes honest feedback and helps improve team performance.
    - Cooperation: Participation in meetings, communication, assistance, and volunteering.
    - Conceptual Contribution: Research, idea generation, and identification of difficulties.
    - Practical Contribution: Report writing, reviewing others' work, and organizational contributions.
    - Work Ethic: Attitude, respect for teammates, deadlines, and commitments.

2. **Automated Score Sharing and Feedback:** After submissions, scores are aggregated, and anonymous peer feedback is shared with students. Instructors receive detailed reports of individual and team performance.

3. **Instructor Dashboard:** Instructors can manage teams and access detailed peer assessment results by team and student. Data can also be exported as CSV files for further analysis.

<a name="development-methodology"></a>
## :arrows_counterclockwise: Development Methodology

This uses the scrum agile development framework. Development is broken down into four (4) development sprints.

### Story Points

This project uses the modified Fibonacci scale to assign story points:
- 0, 1, 2: Trivial user stories.
- 3, 5: Small user stories.
- 8, 13: Medium-complexity user stories that can be accomplished in a single sprint.
- 20, 40, 100: Large user stories or epics that cannot be accomplished in a single sprint.

### Coding Standards

The following coding standards are enforced in this project to ensure consistency, maintainability, and reliability across the codebase:

---

#### **General JavaScript Best Practices**
- **Equality Checks**: Use strict equality (`===` and `!==`) to avoid unexpected type coercion.
  ```javascript
  // Good
  if (a === b) { ... }

  // Bad
  if (a == b) { ... }
  ```
 - **Control Structures**: Always use curly braces `{}` for all control statements, even for single-line blocks, to improve readability.
  ```javascript
  // Good
  if (condition) {
    doSomething();
  }

  // Bad
  if (condition) doSomething();
  ```
  - **Variable Declarations**: Use `const` for variables that are not reassigned and `let` for variables that need reassignment.
  ```javascript
  // Good
  const value = 42;

  // Bad
  let value = 42; // Should be const
  ```
  ### Coding Standards

The following coding standards are enforced in this project to ensure consistency, maintainability, and reliability across the codebase:

---

#### **Console Logs**

- The use of `console.log()` is allowed for debugging but should be removed in production-ready code.

---

#### **Formatting and Style**

- **Prettier Integration**: All formatting is enforced by Prettier, ensuring consistent:
  - Indentation (2 spaces).
  - Line lengths (80 characters).
  - Use of semicolons.
  - Spacing around braces, parentheses, and operators.
- Code that violates Prettier formatting rules will trigger an ESLint error.

---

#### **Naming Conventions**

- **CamelCase**: Variable and function names should follow camelCase by convention. However, this is not strictly enforced, allowing flexibility for legacy or external APIs.

---

#### **Testing Standards**

- **Jest Best Practices**:
  - Test suites should be organized using `describe` and `it` blocks.
  - Avoid using `.only` or `.skip` in production test files.

---

#### **Recommended JavaScript Rules**

The following recommended JavaScript rules are enforced:

- **No Unused Variables**: Prevents declaring variables that are never used.
- **No Undefined Variables**: Ensures variables are defined before use.
- **Avoid Eval**: Disallows the use of `eval()` for security and readability.
- **No Redeclaration**: Prevents accidental redeclaration of variables.

---

This project leverages **ESLint** and **Prettier** to enforce these coding standards. Developers are expected to follow these guidelines and update existing code to align with these rules as needed.

<a name="technology-stack"></a>
## :package: Technology Stack

### Frontend
- CSS :art:
### Backend
- Node.js :atom:
### Database
- MongoDB :leafy_green:
### Testing Framework
- Jest :black_joker:

<a name="usage-guide"></a>
## :open_book: Usage Guide

To be filled in as project develops.

<a name="sprint-1"></a>
## :runner: Sprint 1: User Authentication & Team Management

### Sprint Description

The first sprint focuses on setting up the project environment and implementing core functionalities related to user authentication and team management. This includes establishing roles for students and instructors, allowing instructors to create and manage teams, and enabling students to view their assigned teams.


### Activities

1. GitHub repository setup and initialization.
2. Creation of the README.txt file, describing the project and team members.
3. Sprint 1 planning, detailing user stories and task breakdowns.
4. Implementation of user authentication system, allowing login functionality for students and instructors.
5. Demo of at least one core functionality (e.g., login system).

<a name="sprint-2"></a>
## :runner: Sprint 2: Basic Peer Assessment Interface, Evaluation, and Submission

### Sprint Description

The second sprint focuses on the development of the basic features and interface required in the Peer Assessment Application.

### Activities

1. Design and develop simple peer assessment interfaces where students can select teammates for evaluation.
2. Enable students to provide peer ratings using a 5-point scale for the cooperation dimension.
3. Confirm submission of peer assessment.
4. Begin development of dimension-based assessment.  



## Sprint 3: [To Be Defined]

### Sprint Description

The third sprint focuses on implementing view pages for the instructor to view student assessments.
Moreover, another key area of focus is implementing unit tests to evaluate the functional elements from Sprints 1 and 2.

### Activities

1. Design and develop instructor interfaces to view student evaluations.
2. Design and develop student interface so a given student can see evaluations done for them (by their peers).
3. Implement unit tests for Sprint 1 and 2's functional elements (User model, Team model, Login/Register forms, ...)

## Sprint 4: [To Be Defined]

Information for Sprint 4 will be added when instructions are available.
