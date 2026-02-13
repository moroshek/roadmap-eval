# **Developer Assessment**

**Role:** Full Stack Developer **Bounty:** 3hr Flat Rate **Time Limit:** 3 Hours Hard Stop

## **1\. The Scenario**

You have been "onboarded" to **Roadmap Engine**, a white-label roadmap engine. The repository structure and architectural skeleton are in place.

We have a rigorous **Product Requirements Document (PRD)**.

**Your Mission:** Prove the core visualization logic works and demonstrate your ability to ship a polished UI.

## **2\. The Challenge**

We are testing your ability to **read specs**, **use AI tools effectively**, and **integrate complex logic** into an existing codebase.

### **🔴 The "Must-Have" (Automatic Failure if missing)**

**You must implement the "Strategy Matrix" Component.** *(Reference PRD Section 4.3 and Section 2.1 \- Governance Engine)*

You are required to:

1. **Populate Data:** Create 3-5 dummy markdown files in \_content/projects following the PRD schema.  
2. **Transform Logic:**  
   * Read the raw impact (0-10) and effort (0-10) scores.  
   * *Constraint:* Normalize them to 0-100 for the chart axes.  
   * *Constraint:* Programmatically assign a "Quadrant Label" (e.g., "Quick Wins") based on the logic defined in the PRD.  
3. **Render UI:** Create a Scatter Plot at the /matrix route.  
   * X-Axis: Effort / Y-Axis: Impact.  
   * Tooltip: Must show Project Title & Quadrant Label.

**⚠️ IF THIS COMPONENT IS BROKEN OR MISSING, THE ASSESSMENT IS AN AUTOMATIC FAIL.**

### **🟢 Further Objectives & Polish**

Once the core requirement is met, the rest of the time is yours to demonstrate your skills. We value **creativity**, **polish**, and **user delight**.

You are not expected to finish everything. Choose the areas where you can make the most impact:

* **UI Polish:** Make the Matrix interactions feel premium (animations, clean tooltips, responsive layout).  
* **Dashboarding:** Connect the **Executive Dashboard** metrics (Total Investment, Active Count).  
* **Advanced Features:** Implement the **Gantt Chart** timeline or **Fuzzy Search**.

## **3\. The Repository Structure**

* src/app: The Next.js App Router structure (pages are currently empty placeholders).  
* src/lib: Where your logic/utils should go.  
* \_content/projects: Seeded with starter synthetic project files for the matrix exercise.  
* Roadmap Engine PRD.md: The source of truth for logic and design.

## **3.1 Starter Dataset (AutoNova Motors Synthetic Content)**

To reduce setup overhead and keep the assessment focused on implementation quality, this repository includes starter synthetic content for a car manufacturer tenant:

* `_content/config.json` tenant config for **AutoNova Motors**.
* `_content/projects` seeded with four PRD-shaped project entities (one for each matrix quadrant).
* `_content/interviews` seeded with multiple synthetic interview transcripts (including longer, less-structured raw notes) for optional ingestion experiments.

Candidates may extend or modify this data during implementation, but the provided seed content is sufficient to complete the must-have matrix requirements.

## **4\. Deliverables & Submission**

1. **Code:** Submit a Pull Request (PR) to this repo.  
2. **Summary:** A brief comment on your PR explaining what you chose to focus on for the bonus objectives.

## **5\. Evaluation Criteria**

1. **Compliance:** Did you follow the PRD logic exactly? (e.g., are "Quick Wins" actually in the top-left?)  
2. **User Delight:** Does the application feel brittle, or does it feel like a product? (Formatting, spacing, error handling).  
3. **Code Quality:** Is the transformation logic separated from the UI component?  
4. **Velocity:** How much functionality were you able to ship in the timebox?

**Good luck.**
