# ABC Enterprise Admin - IT Support & Website CMS Desktop Suite

A high-performance enterprise desktop application built with **React**, **Vite**, **Tailwind CSS**, and **Electron** featuring **Role-Based Authentication (RBAC)** to manage IT Support Tickets, Website Content (CMS), and Employee Self-Service.

---

## 🔐 Authentication & Role-Based Access Control (RBAC)

The application features corporate authentication with 4 distinct roles and strict permission boundaries:

| Role | Test Account | Allowed Workspace Access |
| :--- | :--- | :--- |
| **👑 Super Admin** | `admin@abccompany.com` | **Full Unrestricted Access**: IT Incident Queue, Website CMS (Pages, Banners, Blog/News, Media, Navigation), Team Privileges, System Settings & Employee Portal. |
| **🛡️ IT Support Specialist** | `support@abccompany.com` | **IT Helpdesk & Website CMS**: Overview Dashboard, IT Incident Queue, Diagnostic Playbooks, and full Website CMS management (Pages, Banners, Blog/Articles, Media Library). *(Restricted from System Settings).* |
| **🌐 Website CMS Editor** | `cms@abccompany.com` | **Digital Content Operations**: Web Pages, Hero Banners, Blog/Articles Editor with Markdown preview, CDN Media Asset Library, and Site Menus. *(Cannot access IT internal dispatch)*. |
| **👤 Standard Employee** | `employee@abccompany.com` | **Self-Service Helpdesk Only**: Raise IT tickets, live 3-stage progress tracking for their issues, troubleshooting guides & knowledge base. *(Completely restricted from Admin, CMS, and IT triage queues)*. |

> **Tip**: The login screen features a 1-click **"Instant Demo Accounts"** picker so you can switch and test all 4 roles in one click.

---

## 🚀 Key Modules & UI/UX Capabilities

### 1. 👤 Employee Self-Service Portal
- **Guided Incident Wizard**: Raise tickets with categories (`Network & VPN`, `Website CMS Bug`, `Software & Licenses`, `Access & SSO`, `Hardware & Printers`).
- **Live Visual Progress Bar**: 3-stage progress indicator (`1. Submitted` ➔ `2. Under Investigation` ➔ `3. Solved`).
- **Support Chat & Rating**: Chat with the assigned engineer and give a 5-star satisfaction score upon resolution.
- **Self-Help Knowledge Hub**: Step-by-step guides with copyable terminal commands (e.g., DNS flush, FortiClient setup, printer connection).

### 2. 🎫 IT Support Service Desk
- **Dual View Modes**: Switch between **Table View** and workflow **Kanban Board View** (`Open` -> `In Progress` -> `Waiting on Customer` -> `Resolved`).
- **Diagnostic Playbook**: Embedded root-cause advice based on incident category with 1-click solution insertion.
- **Internal Staff Notes**: Private amber-highlighted notes hidden from employees.
- **Solve & Close Workflow**: Prompts the engineer to document the solution for future reference.

### 3. 🌐 Website Content Management System (CMS)
- **Web Pages Manager**: Hierarchy management, template assignment, and live preview modal.
- **Blog & News Editor**: Full Markdown editor with **Live Preview** tab, category tags, author selection, and SEO metadata.
- **Hero Banners & Announcements**: Top Hero banners, Global Sticky Alert bars, and Events sliders with live card previews.
- **Media Asset Library**: Drag-and-drop CDN upload simulation, format/dimensions inspector, and one-click **Copy CDN URL** button.
- **Site Navigation & Menus**: Header navbar and footer link builder with Move Up/Down controls.

### 4. 👥 Team & Access Control
- Staff directory with role badges and live presence indicators (`Online`, `In Meeting`, `Away`).
- "+ Invite Member" modal to onboard staff with granular roles.

### 5. ⚙️ System Settings & Backend Readiness
- **Dual Theme Switch**: Instant switch between **Deep Slate Dark Mode** and **Crisp Light Mode**.
- **Backend Gateway Settings**: REST API, WebSocket gateway, CDN origins, and secret keys pre-configured for Phase 2 backend connection.
- **Connection Diagnostic Tool**: Built-in test ping with latency and health verification.

---

## 🛠️ How to Run the Application

### 1. Web Preview Mode (Instant Live Reload)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Desktop Electron Window Mode
```bash
npm run electron:dev
```
Launches the native desktop application window with custom titlebar framing and IPC controls.

### 3. Build for Production
```bash
npm run build
```
Generates the optimized production build in the `dist/` directory.
