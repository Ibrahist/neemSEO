# Technical SEO Audit Skill

## Goal

Perform an SSRF-safe crawl of the project's target domain, audit on-page SEO factors, and produce a severity-ranked list of technical issues.

## Workflow

1. Call `neemseo_run_site_audit` with the project ID and start URL.
2. Monitor crawl completion and retrieve audit health score and issues.
3. Group findings by severity: Critical (broken canonicals, 4xx/5xx errors, missing titles), Warning (missing meta descriptions, duplicate H1s), and Info (redirect chains, slow response times).
4. Provide actionable code / HTML fixes for each identified critical issue.
