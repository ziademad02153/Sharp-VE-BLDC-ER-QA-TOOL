# WashLab - Quality Assurance Diagnostics System

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

WashLab is an interactive, telemetry-driven diagnostic interface engineered for QA teams. It standardizes testing protocols, localizes state execution, and provides real-time feedback for electromechanical appliance validation.

## System Architecture

The application implements a decoupled, client-heavy architecture, utilizing `wouter` for lightweight client-side routing and Radix primitives for an accessible, unstyled component foundation. The UI state is encapsulated within context providers to isolate diagnostic sessions.

### Architecture Overview

```mermaid
graph TD
    subgraph Client [Frontend SPA - React 19]
        A[Router Entry] --> B(Validation Scenarios)
        B --> C{Diagnostic Modules}
        C -->|Vibration/Acoustics| D[Mechanical Context]
        C -->|Current/Safety| E[Electrical Context]
        C -->|Cycle Integrity| F[Performance Context]
    end

    subgraph Core [State & Persistence]
        D --> G[Session State Manager]
        E --> G
        F --> G
        G --> H[(Browser IndexedDB / LocalStorage)]
    end

    subgraph Deployment [Server / Hosting Edge]
        I[Node.js Express Server] -.->|Serves Static Assets| Client
        J[Vercel Edge Network] -.->|Production CDN| Client
    end
```

### Component Interaction Sequence

```mermaid
sequenceDiagram
    participant Eng as QA Engineer
    participant UI as Interface (React)
    participant State as Context/Hooks
    participant Storage as Local Persistence

    Eng->>UI: Initialize Diagnostic Session
    UI->>State: Dispatch START_SESSION payload
    State-->>UI: Render Dynamic Questionnaire
    
    loop During Validation
        Eng->>UI: Input Telemetry Data
        UI->>State: Evaluate Thresholds & Sanitize
        State->>Storage: Sync checkpoint (Debounced)
    end
    
    Eng->>UI: Finalize Protocol
    UI->>State: Aggregate QA Metrics
    State->>Storage: Commit Final Report
    UI-->>Eng: Render Summary Dashboard
```

## Repository Structure

```text
.
├── client/
│   ├── public/          # Static assets & standalone scripts
│   └── src/
│       ├── components/  # Radix UI implementations & domain components
│       ├── contexts/    # Global state management
│       ├── hooks/       # Custom React hooks (useMobile, usePersistFn)
│       ├── pages/       # Route-level components
│       └── lib/         # Utility functions (Tailwind merge, formatting)
├── server/
│   └── index.ts         # Express boilerplate for static serving
├── shared/
│   └── const.ts         # Cross-boundary types and constants
└── vite.config.ts       # Build configuration & path aliases
```

## Author

**Ziad Emad** (@ziademad02153)
Architected and engineered this interactive diagnostic system to streamline QA workflows.
