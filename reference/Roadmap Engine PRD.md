# **Product Requirements Document: Roadmap Engine**

**Target:** Enterprise-Grade Multi-Tenant Static Site Generator

## **1\. Executive Summary**

**Roadmap Engine **is a white-label platform designed to operationalize strategic consulting. It functions as a specialized Static Site Generator (SSG) that transforms structured data (Markdown/JSON) into high-fidelity, interactive roadmap applications.

The system decouples the **Application Core** (Next.js/React) from the **Client Content** (Data Repository). This architecture allows for rapid scaling: a new client environment can be deployed in minutes by simply provisioning a new configuration file and data repository, without forking the codebase.

### **1.1 Core Capabilities**

1. **Multi-Tenancy:** A single codebase serves infinite clients via build-time configuration.  
2. **Automated Governance:** A Logic Layer that strictly enforces roadmap timing and capacity constraints based on deterministic rules.  
3. **AI-Assisted Ingestion:** An ETL pipeline that converts raw unstructured text (interviews, docs) into structured project artifacts.

## **2\. System Architecture**

The platform utilizes a modern Jamstack architecture with a distinct Build Pipeline.

### **2.1 Backend Logic Layer (The Build Pipeline)**

This layer runs in a CI/CD environment (e.g., GitHub Actions) or pre-build script. It is responsible for data integrity and logic application.

1. **Ingestion Engine (The AI Pipeline):**  
   * **Step 1: Normalization.** Converts PDF/Docx/Audio inputs into plain text.  
   * **Step 2: Entity Extraction (LLM).** Uses a large-context model (e.g., Gemini 3 Pro) to identify distinct initiatives.  
     * *System Prompt:* "Analyze the provided transcripts. Extract discrete project opportunities. For each, generate a title, a 1-paragraph rationale, and a list of key deliverables."  
   * **Step 3: Heuristic Scoring.** The AI attempts to assign 'Impact' and 'Effort' scores based on sentiment analysis (e.g., "urgent", "critical" \= High Impact; "complex", "years" \= High Effort).  
   * **Output:** Draft Markdown files in \_staging with a confidence\_score metadata field.  
2. **Governance Engine (Node.js):**  
   * **Input:** Structured Markdown files in \_content.  
   * **Validation:** Runs Zod schema validation on all Frontmatter. Fails the build if required fields are missing.  
   * **Logic:**  
     * **Temporal Logic:** Compares start\_date vs. System Date to update statuses (e.g., Queued → Active).  
     * **Capacity Logic:** Checks concurrency limits defined in config; flags resource bottlenecks.  
     * **Matrix Calculation:** Normalizes Impact/Effort scores to 0-100 coordinates and assigns Quadrant Labels.

   **Quadrant Logic Definitions:**

| Quadrant Name | Impact Score (Y-Axis) | Effort Score (X-Axis) |
| :---- | :---- | :---- |
| **Quick Wins** | High (\>= 50\) | Low (\< 50\) |
| **Big Bets** | High (\>= 50\) | High (\>= 50\) |
| **Fillers** | Low (\< 50\) | Low (\< 50\) |
| **Time Sinks** | Low (\< 50\) | High (\>= 50\) |

   * **Output:** A massive, optimized master\_data.json file used by the frontend.

### **2.2 Presentation Layer (Frontend)**

* **Framework:** Next.js (Static Export).  
* **Styling:** Tailwind CSS (configured dynamically via Design Tokens).  
* **State Management:** React Context (read-only access to master\_data.json).  
* **Search:** Client-side fuzzy search (Fuse.js).

### **2.3 Repository & Folder Structure**

To maintain the separation between the "Engine" (Code) and "Fuel" (Content), we enforce the following directory structure.

#### **Root Directory**

* /src: **The Engine.** Contains all Next.js application code, components, and logic. This folder is identical across all client deployments.  
* /scripts: **The Logic Layer.** Contains the Python/Node scripts for ingestion and governance.  
* /\_content: **The Fuel.** This is the *only* folder that changes between clients.

#### **Content Directory Breakdown (/\_content)**

This directory acts as the database.

* /\_content/config.json: The "Brain." Contains all client specific settings, branding colors, and feature toggles.  
* /\_content/assets/: Drop logos, favicons, and hero images here.  
* /\_content/interviews/: **DROP ZONE.**  
  * *Purpose:* This is where consultants drop raw text files.  
  * *Files:* interview\_ceo.txt, meeting\_notes\_finance.docx, strategy\_dump.md.  
  * *Action:* The Ingestion Script watches this folder to generate drafts.  
* /\_content/projects/: **The Database.**  
  * *Purpose:* Contains the structured Markdown files for each initiative.  
  * *Files:* PRJ-001.md, PRJ-002.md.  
* /\_content/updates/:  
  * *Purpose:* Contains weekly/monthly progress logs.  
  * *Files:* 2026-week-12.md.  
* /\_content/\_staging/:  
  * *Purpose:* The AI outputs draft project files here. They must be manually reviewed and moved to /projects to go live.

## **3\. Data Model Specification**

The system relies on strict schemas to ensure stability across different clients.

### **3.1 Global Configuration (config.json)**

Controls the identity and feature set for a specific client tenant.

{  
  "tenant\_id": "client\_alpha",  
  "meta": {  
    "title": "Strategic Transformation Map",  
    "logo\_url": "/assets/logo.svg",  
    "favicon\_url": "/assets/favicon.ico"  
  },  
  "design\_tokens": {  
    "colors": {  
      "primary": "\#0F172A",  
      "secondary": "\#3B82F6",  
      "accent": "\#F59E0B",  
      "background": "\#F8FAFC"  
    },  
    "typography": {  
      "heading\_font": "Inter",  
      "body\_font": "Roboto"  
    }  
  },  
  "modules": {  
    "enable\_matrix": true,  
    "enable\_gantt": true,  
    "enable\_blog": true  
  },  
  "governance": {  
    "fiscal\_year\_start": "2026-01-01",  
    "max\_concurrent\_projects": 5,  
    "phases": \["Foundation", "Acceleration", "Scale"\]  
  }  
}

### **3.2 Project Entity (/content/projects/\*.md)**

The core unit of the application.

\---  
id: "PRJ-001"  
title: "Automated Customer Support Agent"  
slug: "automated-customer-support"  
owner: "Director of Ops"  
department: "Operations" \# Maps to taxonomy  
phase: "Foundation"  
status: "Active" \# \[Backlog, Queued, Active, Paused, Complete\]  
dates:  
  planned\_start: "2026-03-01"  
  planned\_end: "2026-06-01"  
  actual\_start: "2026-03-05"  
scores:  
  strategic\_value: 8.5 \# 1-10 scale (Y-Axis)  
  complexity: 4.0 \# 1-10 scale (X-Axis)  
  confidence: 0.9 \# Used for risk highlighting  
financials:  
  estimated\_cost: 45000  
  projected\_roi: 120000  
  currency: "USD"  
tags: \["AI", "Automation", "External"\]  
related\_projects: \["PRJ-004", "PRJ-009"\]  
\---  
\# Executive Summary  
(Markdown content...)

\#\# Deliverables  
\- \[ \] Chatbot MVP  
\- \[ \] Knowledge Base Integration

### **3.3 Status Update Entity (/content/updates/\*.md)**

Provides the "live" feed of progress.

\---  
id: "UPD-2026-12"  
date: "2026-03-12"  
author: "Program Management Office"  
type: "Weekly" \# \[Weekly, Monthly, Milestone\]  
highlight\_projects: \["PRJ-001", "PRJ-003"\]  
sentiment: "On Track" \# \[On Track, At Risk, Blocked\]  
\---  
\# Weekly Rollup  
Key achievements this week include...

### **3.4 Build-Time Validation Rules**

To prevent broken deployments, the build pipeline enforces these strict rules:

1. **ID Uniqueness:** No two projects can share the same id.  
2. **Date Validity:** planned\_end must be after planned\_start.  
3. **Referential Integrity:** If PRJ-001 lists PRJ-002 as a dependency, PRJ-002.md must exist.  
4. **Taxonomy Check:** Every project's department and phase must exist in the config.json allowlists.

## **4\. UI/UX Specifications (Page-by-Page)**

The UI must be responsive, accessible (WCAG 2.1 AA), and print-friendly.

### **4.1 Global Elements**

* **Navigation Sidebar (Left):**  
  * Logo Area (Configurable).  
  * Primary Links: Dashboard, Strategy Matrix, Roadmap (Gantt), Project Library, Updates.  
  * Footer: User Profile (Static), Copyright, Version.  
* **Top Bar:**  
  * Breadcrumbs.  
  * Global Search Input (cmd+k trigger).  
  * Date/Fiscal Week Display.

### **4.2 Page: Executive Dashboard (/)**

* **Objective:** Immediate situational awareness.  
* **Layout:** Grid (CSS Grid).  
* **Widgets:**  
  * **Metric Cards:** Total Investment, ROI Multiplier, Active Projects Count.  
  * **Phase Indicator:** A linear progress rail showing the current strategic phase (e.g., "Currently in Phase 1: Foundation").  
  * **Velocity Chart:** Simple bar chart showing completed story points/projects over time.  
  * **Recent Activity:** List of the 3 most recent Status Update headlines.

### **4.3 Page: Strategy Matrix (/matrix)**

* **Objective:** Visualizing trade-offs and portfolio balance.  
* **Component:** Interactive Scatter Plot (Recharts/D3).  
  * **X-Axis:** Complexity/Effort.  
  * **Y-Axis:** Strategic Value/Impact.  
  * **Quadrants:** Background zones labeled (e.g., "Quick Wins", "Big Bets").  
* **Interactivity:**  
  * **Filtering:** Sidebar controls to toggle Departments or Phases.  
  * **Tooltips:** Hovering a node shows Title \+ ROI.  
  * **Zoom:** Brush-to-zoom functionality for crowded clusters.

### **4.4 Page: Roadmap Gantt (/roadmap)**

* **Objective:** Timeline visualization and sequencing.  
* **Component:** Horizontal scrolling timeline.  
* **Features:**  
  * **Grouping:** Dropdown to group rows by Department or Status.  
  * **Current Time:** Vertical red line indicating "Today".  
  * **Status Colors:** Bars colored by status (Active=Green, Delayed=Red).  
  * **Milestones:** Diamond icons overlaid on bars representing key deliverables.

### **4.5 Page: Project Library (/projects)**

* **Objective:** Searchable database of all initiatives.  
* **Layout:** Card Grid or Data Table (User toggleable).  
* **Filters:**  
  * Multi-select for Owner, Status, Department.  
  * Range slider for Cost/ROI.  
* **Card Anatomy:** Title, ID Badge, Status Pill, Owner Avatar, Sparkline (progress).

### **4.6 Page: Project Detail (/projects/\[slug\])**

* **Objective:** The "Single Source of Truth" for a specific initiative.  
* **Layout:** Two-column (Main Content \+ Metadata Sidebar).  
* **Main Content:**  
  * **Header:** Title, Description, Status Badge.  
  * **Tabs:**  
    * *Overview:* The rendered Markdown content.  
    * *Plan:* Checklist of deliverables and milestones.  
    * *Updates:* Filtered list of Status Updates referencing this project ID.  
* **Sidebar:**  
  * **"The Numbers":** Hard metrics (Cost, ROI, Dates).  
  * **"Team":** List of stakeholders.  
  * **"Dependencies":** Links to blocking/blocked projects.  
* **Actions:** "Print One-Pager" (PDF generation).

### **4.7 Interaction & State Design**

* **Empty States:**  
  * *Search Results:* "No projects found matching 'XYZ'. Try adjusting your filters."  
  * *Updates Feed:* "No updates posted yet. Check back next week."  
* **Loading States:**  
  * Skeleton loaders must be used for all dashboard widgets and the Gantt chart.  
  * No "spinners" allowed for primary page loads.  
* **Print Styles:**  
  * All pages must support @media print.  
  * Hide Sidebars and Top Bars.  
  * Expand all "Tabs" to be visible vertically.

## **5\. Automation & Cron Logic**

To ensure the roadmap remains "living" without manual code edits, we utilize scheduled jobs.

### **5.1 The "Midnight" Job (Daily Cron)**

**Trigger:** 00:00 UTC daily via GitHub Actions / Vercel Cron. **Logic:**

1. **Load Data:** Parse all Project Markdown files.  
2. **Date Check:**  
   * Iterate through every project.  
   * IF project.status \== 'Queued' AND project.start\_date \<= TODAY:  
     * Update status to Active.  
     * Log event: "Auto-activated project![][image1]  
       ".  
   * IF project.status \== 'Active' AND project.end\_date \< TODAY:  
     * Flag as Overdue (Does not auto-complete; requires human intervention).  
3. **Rebuild:** Trigger a new deployment of the static site to reflect status changes.

### **5.2 The "Smart Queue" Job (Weekly Cron)**

**Trigger:** 00:00 UTC Mondays. **Logic:**

1. **Capacity Check:**  
   * Count Active projects.  
   * IF Active\_Count \< config.max\_concurrent\_projects:  
     * Scan Backlog for highest strategic\_value project.  
     * Send notification/alert to Admin: "Capacity available. Recommended next project:![][image2]  
       ".  
   * *Note: This job does not auto-activate; it only recommends.*

## **6\. Security & Access Control**

Since the output is a static site, security must be handled at the Edge (CDN level) or via client-side gating.

### **6.1 Access Strategy**

* **Middleware Authentication:**  
  * The site will be deployed behind a Vercel/Netlify middleware function.  
  * Basic Auth (Username/Password) is the MVP requirement.  
  * Enterprise Tier: SAML/SSO integration via the hosting provider (e.g., Okta \-\> Vercel).  
* **Build-Time Redaction:**  
  * Sensitive fields (e.g., exact\_budget) can be redacted at build time based on a public\_version: true flag in config.json.

### **6.2 Data Security**

* **No Database:** There is no runtime database to hack. The "database" is the build artifact.  
* **API Exposure:** No API routes are exposed. All logic is computed at build time.

## **7\. Search & Filtering Specifications**

### **7.1 Fuzzy Search Engine**

* **Library:** Fuse.js  
* **Index Keys & Weighting:**  
  * title (Weight: 1.0)  
  * id (Weight: 0.8)  
  * tags (Weight: 0.6)  
  * owner (Weight: 0.4)  
  * content (Weight: 0.2) \- Body text has lowest weight to prevent noise.  
* **Threshold:** 0.3 (Strict matching to avoid irrelevant results).

### **7.2 Taxonomy Filtering**

* **Logic:** AND logic within categories, OR logic between categories.  
  * *Example:* (Dept: "Sales" OR "Marketing") AND (Phase: "Walk").
