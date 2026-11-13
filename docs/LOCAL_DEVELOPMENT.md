# neemSEO Local Development Guide

## Prerequisites

- Python 3.10+
- Git

## Step-by-Step Setup

1. Clone and enter the repository:
   ```bash
   git clone https://github.com/your-org/neemseo.git
   cd neemseo
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # macOS / Linux:
   source .venv/bin/activate
   ```

3. Install in editable development mode:
   ```bash
   pip install -e ".[dev]"
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

5. Run the development server:
   ```bash
   python backend/main.py
   # Or using uvicorn directly:
   uvicorn backend.main:app --reload --port 8000
   ```

6. Open your browser to `http://localhost:8000`.

## Testing the CLI

neemSEO includes a rich CLI:

```bash
# Check version
neemseo version

# List all SEO rules
neemseo rules

# Audit a public web page
neemseo audit https://example.com --keyword "example domain"

# Audit with Core Web Vitals and export CSV
neemseo audit https://example.com --pagespeed --csv fixes.csv

# View audit history
neemseo history
```

## Running Unit and Integration Tests

```bash
pytest -v
```

