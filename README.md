# Data Alchemist

An AI-enabled resource allocation configurator that transforms messy spreadsheets into clean, validated data with business rules.

## Features

### 🚀 Core Functionality
- **Smart File Upload**: Upload CSV/XLSX files for clients, workers, and tasks
- **AI-like Header Mapping**: Automatically maps various column names to canonical headers
- **Editable Data Grids**: Inline editing with real-time validation
- **Comprehensive Validation**: 8+ validation rules with immediate feedback
- **Business Rules Builder**: Create co-run, load-limit, phase-window rules
- **Natural Language Features**: Search and rule creation using plain English
- **Prioritization Controls**: Adjust weights for different allocation criteria
- **Export Functionality**: Download cleaned CSVs and rules.json

### 🤖 AI-Enhanced Features
- **Natural Language Search**: "tasks with duration > 1 and phase 2 preferred"
- **Natural Language Rules**: "co-run T001 T002" or "phase window T003 phases 1-3"
- **Smart Data Parsing**: Handles various data formats and column arrangements
- **Intelligent Validation**: Cross-reference checks and feasibility analysis

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd alchemist

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage
1. Open `http://localhost:3000`
2. Upload sample CSV files from `/samples/` folder
3. View validation results in real-time
4. Edit data directly in the grids
5. Create business rules using buttons or natural language
6. Adjust prioritization weights
7. Export cleaned data and rules

## Sample Data

The `/samples/` folder contains example CSV files:
- `clients.csv` - Client information with priorities and requested tasks
- `workers.csv` - Worker skills, availability, and capacity
- `tasks.csv` - Task definitions with requirements and constraints

## Validation Rules

The system validates:
1. **Missing required columns**
2. **Duplicate IDs** across entities
3. **Malformed data** (non-numeric in numeric fields)
4. **Out-of-range values** (priorities 1-5, durations ≥1)
5. **Invalid JSON** in attributes
6. **Unknown references** (requested tasks must exist)
7. **Skill coverage** (every required skill must have workers)
8. **Feasibility checks** (worker capacity vs task requirements)

## Business Rules

Supported rule types:
- **Co-run**: Tasks that must run together
- **Load-limit**: Maximum slots per phase for worker groups
- **Phase-window**: Allowed phases for specific tasks
- **Slot-restriction**: Minimum common slots for groups
- **Pattern-match**: Regex-based rules
- **Precedence-override**: Priority adjustments

## Natural Language Examples

### Search Queries
- "tasks with duration more than 2 phases"
- "tasks having phase 2 in preferred phases"
- "tasks requiring python skills"

### Rule Creation
- "co-run T001 T002"
- "phase window T003 phases 1-3"
- "load limit senior workers to 2 per phase"

## Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **State Management**: Zustand with Immer for immutable updates
- **Data Grid**: AG Grid Community with inline editing
- **File Parsing**: PapaParse for CSV, XLSX for Excel files
- **Validation**: Custom validation engine with Zod schemas
- **API Routes**: Next.js API routes for AI features

## Development

### Project Structure
```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   └── page.tsx        # Main page
├── components/         # React components
├── store/             # Zustand store
├── types/             # TypeScript types
└── utils/             # Utility functions
```

### Key Components
- `Uploader.tsx` - File upload with header mapping
- `DataGrid.tsx` - Editable data grid wrapper
- `ValidationPanel.tsx` - Real-time validation display
- `RulesBuilder.tsx` - Business rules creation
- `NLSearch.tsx` - Natural language search
- `NLRuleInput.tsx` - Natural language rule creation

## Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Other Platforms
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

