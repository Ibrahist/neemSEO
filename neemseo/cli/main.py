"""
neemSEO Command Line Interface (CLI).
Allows running on-page audits, listing rules, and exporting reports from the terminal.
"""

import asyncio
import csv
import json
from typing import Optional
import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text

from neemseo import __version__
from neemseo.core.auditor import OnPageAuditor
from neemseo.core.scoring import AuditReport
from neemseo.rules.registry import registry
from neemseo.rules.base import Severity
from neemseo.db.session import init_db, SessionLocal
from neemseo.crawler.schemas import CrawlConfig, CrawlStatus, CrawlSummaryReport
from neemseo.crawler.engine import SiteCrawler
from neemseo.crawler.analyzer import CrawlAnalyzer
from neemseo.db.models import AuditRun, Crawl, CrawlPage, CrawlLink, KeywordList, KeywordEntry
from neemseo.keywords.schemas import KeywordResearchRequest, SearchIntent
from neemseo.keywords.service import KeywordResearchService
from neemseo.keywords.clustering import KeywordClusterer
from neemseo.keywords.intent import IntentClassifier
from neemseo.keywords.scoring import PriorityScorer

app = typer.Typer(
    name="neemseo",
    help="neemSEO: Open-source, focused SEO suite and alternative to Semrush/Ahrefs.",
    add_completion=False,
)
console = Console()


def format_status(status: Severity) -> Text:
    if status == Severity.FAIL:
        return Text("FAIL", style="bold red")
    elif status == Severity.WARN:
        return Text("WARN", style="bold yellow")
    else:
        return Text("PASS", style="bold green")


@app.command(name="version")
def version_cmd():
    """Print neemSEO version."""
    console.print(f"[bold green]neemSEO[/bold green] version [cyan]{__version__}[/cyan]")


@app.command(name="rules")
def rules_cmd():
    """List all registered on-page SEO check rules."""
    rules = registry.list_rules()
    table = Table(title="neemSEO Registered Audit Rules", header_style="bold magenta")
    table.add_column("Rule ID", style="cyan")
    table.add_column("Category", style="green")
    table.add_column("Impact (1-10)", justify="center", style="bold")
    table.add_column("Check Title", style="white")

    for r in sorted(rules, key=lambda x: (x["category"], -x["default_impact"])):
        table.add_row(r["rule_id"], r["category"].capitalize(), str(r["default_impact"]), r["title"])

    console.print(table)


@app.command(name="history")
def history_cmd(limit: int = typer.Option(10, "--limit", "-n", help="Number of recent audits to display")):
    """Show recent audit history from the local database."""
    init_db()
    with SessionLocal() as db:
        runs = db.query(AuditRun).order_by(AuditRun.created_at.desc()).limit(limit).all()
        if not runs:
            console.print("[yellow]No audit history found in local database.[/yellow]")
            return

        table = Table(title="Recent neemSEO Audits", header_style="bold cyan")
        table.add_column("Date", style="dim")
        table.add_column("Score", justify="center")
        table.add_column("Grade", justify="center")
        table.add_column("URL", style="white")
        table.add_column("Target Keyword", style="italic yellow")
        table.add_column("Words", justify="right")

        for r in runs:
            score_color = "green" if r.overall_score >= 80 else ("yellow" if r.overall_score >= 60 else "red")
            table.add_row(
                r.created_at.strftime("%Y-%m-%d %H:%M"),
                f"[{score_color}]{r.overall_score}/100[/{score_color}]",
                f"[{score_color}]{r.grade}[/{score_color}]",
                r.url,
                r.target_keyword or "-",
                str(r.word_count),
            )

        console.print(table)


@app.command(name="audit")
def audit_cmd(
    url: str = typer.Argument(..., help="The URL to audit (e.g. https://example.com)"),
    keyword: Optional[str] = typer.Option(None, "--keyword", "-k", help="Target keyword to check on-page targeting"),
    pagespeed: bool = typer.Option(False, "--pagespeed", "-p", help="Include Google PageSpeed Core Web Vitals"),
    as_json: bool = typer.Option(False, "--json", help="Output full report as raw JSON"),
    export_csv: Optional[str] = typer.Option(None, "--csv", help="Export prioritized fix list to CSV file"),
):
    """Run a comprehensive on-page SEO audit for any web page."""
    init_db()

    with console.status(f"[bold cyan]Auditing [white]{url}[/white] with neemSEO-Bot/1.0...[/bold cyan]"):
        auditor = OnPageAuditor()
        with SessionLocal() as db:
            report: AuditReport = asyncio.run(
                auditor.audit_url(
                    url=url,
                    keyword=keyword,
                    check_pagespeed=pagespeed,
                    db=db,
                )
            )

    # 1. Raw JSON output mode
    if as_json:
        console.print(report.model_dump_json(indent=2))
        return

    # 2. Export CSV if requested
    if export_csv:
        with open(export_csv, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Impact", "Status", "Category", "Rule", "Issue Title", "Message", "Recommendation"])
            for fix in report.prioritized_fixes:
                writer.writerow([
                    fix.impact_score,
                    fix.status.value,
                    fix.category.value,
                    fix.rule_id,
                    fix.title,
                    fix.message,
                    fix.recommendation,
                ])
        console.print(f"[green]✓ Exported prioritized fix list to [bold]{export_csv}[/bold][/green]\n")

    # 3. Rich Terminal Dashboard
    score_style = "bold green" if report.overall_score >= 80 else ("bold yellow" if report.overall_score >= 60 else "bold red")

    summary_text = (
        f"[bold]URL:[/bold] {report.url}\n"
        f"[bold]HTTP Status:[/bold] {report.status_code} | [bold]Load Time:[/bold] {report.response_time_ms} ms\n"
        f"[bold]Target Keyword:[/bold] {keyword or '[dim]None provided[/dim]'}\n"
        f"[bold]Health Score:[/bold] [{score_style}]{report.overall_score}/100 (Grade: {report.grade})[/{score_style}]\n"
        f"[bold]Summary:[/bold] [green]{report.passed_count} Passed[/green] | [yellow]{report.warning_count} Warnings[/yellow] | [red]{report.failure_count} Failures[/red]"
    )
    console.print(Panel(summary_text, title="[bold cyan]neemSEO On-Page Audit Report[/bold cyan]", border_style="cyan"))

    # Category Scores Table
    cat_table = Table(title="Category Score Breakdown", header_style="bold blue")
    cat_table.add_column("Category", style="white")
    cat_table.add_column("Score", justify="center")
    cat_table.add_column("Passed", justify="center", style="green")
    cat_table.add_column("Warnings", justify="center", style="yellow")
    cat_table.add_column("Failures", justify="center", style="red")

    for cat_name, c_score in report.category_scores.items():
        c_color = "green" if c_score.score >= 80 else ("yellow" if c_score.score >= 60 else "red")
        cat_table.add_row(
            cat_name.replace("_", " ").title(),
            f"[{c_color}]{c_score.score}%[/{c_color}]",
            str(c_score.passed),
            str(c_score.warned),
            str(c_score.failed),
        )
    console.print(cat_table)

    # Core Web Vitals Table if available
    if report.core_web_vitals:
        cwv = report.core_web_vitals
        cwv_table = Table(title="Google Core Web Vitals (Mobile)", header_style="bold magenta")
        cwv_table.add_column("Metric", style="white")
        cwv_table.add_column("Value", justify="center")
        cwv_table.add_column("Rating", justify="center")

        def rating_style(r: str) -> str:
            return "green" if r == "GOOD" else ("yellow" if r == "NEEDS_IMPROVEMENT" else "red")

        cwv_table.add_row("Largest Contentful Paint (LCP)", f"{cwv.get('lcp_seconds')}s", f"[{rating_style(cwv.get('lcp_rating'))}]{cwv.get('lcp_rating')}[/]")
        cwv_table.add_row("Cumulative Layout Shift (CLS)", f"{cwv.get('cls_score')}", f"[{rating_style(cwv.get('cls_rating'))}]{cwv.get('cls_rating')}[/]")
        cwv_table.add_row("Interaction to Next Paint (INP)", f"{cwv.get('inp_ms')}ms", f"[{rating_style(cwv.get('inp_rating'))}]{cwv.get('inp_rating')}[/]")
        cwv_table.add_row("Time to First Byte (TTFB)", f"{cwv.get('ttfb_ms')}ms", "[dim]Diagnostic[/dim]")
        console.print(cwv_table)

    # Prioritized Fixes Table
    if report.prioritized_fixes:
        fix_table = Table(title="Prioritized Fix List (Most Impactful First)", header_style="bold red")
        fix_table.add_column("Impact", justify="center", style="bold red")
        fix_table.add_column("Status", justify="center")
        fix_table.add_column("Issue Title", style="bold white")
        fix_table.add_column("What's Wrong & How to Fix", style="dim")

        for fix in report.prioritized_fixes:
            desc = f"{fix.message}\n[italic green]Fix:[/italic green] {fix.recommendation}"
            fix_table.add_row(
                str(fix.impact_score),
                format_status(fix.status),
                fix.title,
                desc,
            )
        console.print(fix_table)
    else:
        console.print("\n[bold green]✓ Outstanding! No critical issues or warnings found.[/bold green]\n")


@app.command(name="crawls")
def list_crawls_cmd(limit: int = typer.Option(10, "--limit", "-n", help="Number of crawls to display")):
    """List past site crawls."""
    init_db()
    with SessionLocal() as db:
        crawls = db.query(Crawl).order_by(Crawl.created_at.desc()).limit(limit).all()
        if not crawls:
            console.print("[yellow]No crawl history found.[/yellow]")
            return

        table = Table(title="neemSEO Site Crawl History", header_style="bold cyan")
        table.add_column("Crawl ID", style="dim")
        table.add_column("Date", style="dim")
        table.add_column("Status", justify="center")
        table.add_column("Domain / Seed URL", style="white")
        table.add_column("Pages", justify="right", style="bold")
        table.add_column("Duration", justify="right")

        for c in crawls:
            status_color = "green" if c.status == "completed" else ("yellow" if c.status == "running" else "red")
            table.add_row(
                c.id[:8] + "...",
                c.created_at.strftime("%Y-%m-%d %H:%M"),
                f"[{status_color}]{c.status.upper()}[/{status_color}]",
                c.seed_url,
                str(c.pages_crawled),
                f"{c.duration_seconds:.1f}s",
            )
        console.print(table)


@app.command(name="crawl")
def crawl_cmd(
    url: str = typer.Argument(..., help="Seed homepage URL (e.g. https://example.com)"),
    max_pages: int = typer.Option(30, "--max-pages", "-m", help="Maximum pages to crawl"),
    max_depth: int = typer.Option(3, "--max-depth", "-d", help="Maximum crawl depth"),
    concurrency: int = typer.Option(4, "--concurrency", "-c", help="Concurrent fetch requests"),
    sitemap: bool = typer.Option(True, "--sitemap/--no-sitemap", help="Discover and ingest sitemap.xml"),
    export_csv: Optional[str] = typer.Option(None, "--csv", help="Export broken links to CSV"),
):
    """Run a whole-site crawl and audit across internal pages and sitemaps."""
    init_db()
    import uuid

    crawl_id = str(uuid.uuid4())
    config = CrawlConfig(
        seed_url=url,
        max_pages=max_pages,
        max_depth=max_depth,
        concurrency=concurrency,
        check_sitemap=sitemap,
    )

    with SessionLocal() as db:
        crawl_obj = Crawl(
            id=crawl_id,
            seed_url=url,
            max_pages=max_pages,
            max_depth=max_depth,
            status=CrawlStatus.RUNNING.value,
        )
        db.add(crawl_obj)
        db.commit()

    crawler = SiteCrawler(config=config, crawl_id=crawl_id)

    with console.status(f"[bold cyan]Crawling {url} (max {max_pages} pages, depth {max_depth})...[/bold cyan]"):
        report: CrawlSummaryReport = asyncio.run(crawler.crawl())

    # Summary Panel
    avg_color = "bold green" if report.average_health_score >= 80 else ("bold yellow" if report.average_health_score >= 60 else "bold red")
    summary = (
        f"[bold]Seed Domain:[/bold] {report.seed_url}\n"
        f"[bold]Crawl Status:[/bold] [green]{report.status.value.upper()}[/green] | [bold]Duration:[/bold] {report.duration_seconds}s\n"
        f"[bold]Pages Crawled:[/bold] {report.total_pages_crawled} | [bold]Links Discovered:[/bold] {report.total_links_found}\n"
        f"[bold]Sitemap URLs Discovered:[/bold] {report.sitemap_urls_discovered}\n"
        f"[bold]Average On-Page Score:[/bold] [{avg_color}]{report.average_health_score}/100[/{avg_color}]\n"
        f"[bold]Broken Links Found:[/bold] [red]{report.broken_links_count}[/red] | [bold]Duplicate Titles:[/bold] [yellow]{len(report.duplicate_titles)}[/yellow] | [bold]Orphans:[/bold] [magenta]{report.orphan_pages_count}[/magenta]"
    )
    console.print(Panel(summary, title="[bold cyan]neemSEO Site Crawl Audit Report[/bold cyan]", border_style="cyan"))

    # Broken links table
    if report.broken_links:
        broken_table = Table(title="Broken Links Detected (4xx / 5xx)", header_style="bold red")
        broken_table.add_column("Status", justify="center", style="bold red")
        broken_table.add_column("Target URL", style="white")
        broken_table.add_column("Found on Source Page", style="dim")
        broken_table.add_column("Anchor Text", style="italic")

        for b in report.broken_links[:15]:
            broken_table.add_row(
                str(b.status_code),
                b.target_url,
                b.source_url,
                b.anchor_text or "[dim]No anchor[/dim]",
            )
        console.print(broken_table)
    else:
        console.print("[green]✓ No broken internal or external links detected.[/green]")

    # Duplicate titles table
    if report.duplicate_titles:
        dup_table = Table(title="Duplicate Page Titles", header_style="bold yellow")
        dup_table.add_column("Duplicate Count", justify="center", style="bold yellow")
        dup_table.add_column("Title String", style="white")
        dup_table.add_column("Affected Pages", style="dim")

        for d in report.duplicate_titles[:10]:
            dup_table.add_row(str(d.count), d.content, ", ".join(d.urls[:2]))
        console.print(dup_table)

    # Click depth distribution
    if report.depth_distribution:
        depth_table = Table(title="Click Depth Architecture", header_style="bold blue")
        depth_table.add_column("Crawl Depth", justify="center")
        depth_table.add_column("Pages Discovered", justify="center")
        for depth_lvl, count in sorted(report.depth_distribution.items()):
            depth_table.add_row(f"Depth {depth_lvl}", str(count))
        console.print(depth_table)

    # Export CSV if requested
    if export_csv:
        with open(export_csv, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Broken URL", "Source Page", "Anchor Text", "Status", "Internal"])
            for b in report.broken_links:
                writer.writerow([b.target_url, b.source_url, b.anchor_text, b.status_code, b.is_internal])
        console.print(f"\n[green]✓ Exported broken links to {export_csv}[/green]\n")


@app.command(name="crawl-compare")
def crawl_compare_cmd(
    base_id: str = typer.Argument(..., help="Earlier crawl ID"),
    target_id: str = typer.Argument(..., help="Recent crawl ID"),
):
    """Compare two crawl audits of the same domain to highlight regressions and fixes."""
    init_db()
    with SessionLocal() as db:
        c1 = db.query(Crawl).filter(Crawl.id.like(f"{base_id}%")).first()
        c2 = db.query(Crawl).filter(Crawl.id.like(f"{target_id}%")).first()

        if not c1 or not c2:
            console.print("[red]Error: One or both crawl IDs not found.[/red]")
            return

        if not c1.report_summary or not c2.report_summary:
            console.print("[red]Error: Both crawls must be completed with report summaries.[/red]")
            return

        r1 = CrawlSummaryReport(**c1.report_summary)
        r2 = CrawlSummaryReport(**c2.report_summary)

        diff = CrawlAnalyzer.compare_crawls(r1, r2)

        change_color = "green" if diff.score_change >= 0 else "red"
        sign = "+" if diff.score_change > 0 else ""

        comp_text = (
            f"[bold]Domain:[/bold] {diff.seed_url}\n"
            f"[bold]Base Crawl:[/bold] {c1.id[:8]} ({c1.created_at.strftime('%Y-%m-%d %H:%M')})\n"
            f"[bold]Target Crawl:[/bold] {c2.id[:8]} ({c2.created_at.strftime('%Y-%m-%d %H:%M')})\n"
            f"[bold]Health Score Trend:[/bold] [{change_color}]{sign}{diff.score_change} pts[/{change_color}]\n"
            f"[bold]Pages Crawled Change:[/bold] {diff.pages_change:+d}\n"
            f"[bold]New Broken Links:[/bold] [red]{len(diff.new_broken_links)}[/red] | [bold]Resolved Broken Links:[/bold] [green]{len(diff.resolved_broken_links)}[/green]"
        )
        console.print(Panel(comp_text, title="[bold cyan]Crawl Comparison Diff[/bold cyan]", border_style="cyan"))


def format_intent(intent: SearchIntent) -> Text:
    if intent == SearchIntent.TRANSACTIONAL:
        return Text("Transactional", style="bold green")
    elif intent == SearchIntent.COMMERCIAL:
        return Text("Commercial", style="bold cyan")
    elif intent == SearchIntent.NAVIGATIONAL:
        return Text("Navigational", style="bold magenta")
    else:
        return Text("Informational", style="bold blue")


@app.command(name="keywords")
def keywords_cmd(
    seed: str = typer.Argument(..., help="Seed keyword (e.g. 'seo tools' or 'python web framework')"),
    country: str = typer.Option("US", "--country", "-c", help="Country code for Google suggest (e.g. US, UK, DE)"),
    expand_az: bool = typer.Option(True, "--expand-az/--no-expand-az", help="Expand with A-Z alphabet modifiers"),
    questions: bool = typer.Option(True, "--questions/--no-questions", help="Expand with question intent modifiers"),
    paid: bool = typer.Option(False, "--paid", help="Query DataForSEO API if configured (BYOK)"),
    limit: int = typer.Option(50, "--limit", "-n", help="Maximum keywords to display in table"),
    export_csv: Optional[str] = typer.Option(None, "--csv", help="Export keyword ideas to CSV file"),
):
    """Run keyword research, auto-tag search intent, score priority, and cluster topics."""
    init_db()

    with console.status(f"[bold cyan]Expanding keywords for [white]'{seed}'[/white]...[/bold cyan]"):
        service = KeywordResearchService()
        req = KeywordResearchRequest(
            seed_keyword=seed,
            country_code=country,
            expand_alphabet=expand_az,
            expand_questions=questions,
            use_paid_api=paid,
            max_results=limit * 2,
            save_to_db=True,
        )
        result = asyncio.run(service.research(req))

    # Summary Panel
    cost_str = f"${result.cost_usd:.4f}" if result.cost_usd > 0 else "$0.00 (Free Autocomplete)"
    summary = (
        f"[bold]Seed Keyword:[/bold] {seed}\n"
        f"[bold]Total Keywords Discovered:[/bold] {result.total_found}\n"
        f"[bold]Thematic Clusters:[/bold] {len(result.clusters)}\n"
        f"[bold]API Cost:[/bold] {cost_str}\n"
        f"[bold]Saved Run ID:[/bold] {result.id[:8] if result.id else 'None'}"
    )
    console.print(Panel(summary, title="[bold green]neemSEO Keyword Research Summary[/bold green]", border_style="green"))

    # Clusters Overview Table
    if result.clusters:
        c_table = Table(title="Topic Clusters Overview", header_style="bold magenta")
        c_table.add_column("Cluster Name", style="bold white")
        c_table.add_column("Keywords", justify="center")
        c_table.add_column("Est. Volume", justify="right")
        c_table.add_column("Avg KD", justify="center")
        c_table.add_column("Dominant Intent", style="bold")

        for c in result.clusters[:8]:
            kd_col = "green" if c.average_difficulty <= 30 else ("yellow" if c.average_difficulty <= 60 else "red")
            c_table.add_row(
                c.cluster_name,
                str(c.keyword_count),
                f"{c.total_volume:,}",
                f"[{kd_col}]{c.average_difficulty:.0f}[/{kd_col}]",
                format_intent(c.dominant_intent),
            )
        console.print(c_table)

    # Keywords Detail Table
    k_table = Table(title=f"Top Keyword Opportunities (Sorted by Priority Score)", header_style="bold cyan")
    k_table.add_column("Priority", justify="center", style="bold")
    k_table.add_column("Keyword", style="white")
    k_table.add_column("Volume", justify="right")
    k_table.add_column("KD", justify="center")
    k_table.add_column("CPC", justify="right", style="dim")
    k_table.add_column("Search Intent")
    k_table.add_column("Cluster Theme", style="italic")

    # Sort keywords by priority_score descending
    sorted_keywords = sorted(result.keywords, key=lambda k: k.priority_score, reverse=True)

    for item in sorted_keywords[:limit]:
        p_col = "green" if item.priority_score >= 70 else ("yellow" if item.priority_score >= 50 else "white")
        kd_col = "green" if item.difficulty <= 30 else ("yellow" if item.difficulty <= 60 else "red")
        k_table.add_row(
            f"[{p_col}]{item.priority_score}/100[/{p_col}]",
            item.keyword,
            f"{item.search_volume:,}",
            f"[{kd_col}]{item.difficulty}[/{kd_col}]",
            f"${item.cpc:.2f}",
            format_intent(item.intent),
            item.cluster,
        )
    console.print(k_table)

    # CSV Export
    if export_csv:
        with open(export_csv, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Keyword", "Search Volume", "Keyword Difficulty", "CPC ($)", "Search Intent", "Cluster", "Priority Score", "Source"])
            for item in sorted_keywords:
                writer.writerow([item.keyword, item.search_volume, item.difficulty, f"{item.cpc:.2f}", item.intent.value, item.cluster, item.priority_score, item.source])
        console.print(f"\n[green]✓ Exported {len(sorted_keywords)} keywords to {export_csv}[/green]\n")


@app.command(name="keyword-lists")
def keyword_lists_cmd(limit: int = typer.Option(10, "--limit", "-n", help="Number of saved runs")):
    """Show recent keyword research runs saved in the database."""
    init_db()
    with SessionLocal() as db:
        runs = db.query(KeywordList).order_by(KeywordList.created_at.desc()).limit(limit).all()
        if not runs:
            console.print("[yellow]No keyword research runs found in database.[/yellow]")
            return

        table = Table(title="Saved Keyword Research Runs", header_style="bold green")
        table.add_column("ID", style="cyan")
        table.add_column("Seed Keyword", style="bold white")
        table.add_column("Country", justify="center")
        table.add_column("Total Keywords", justify="right")
        table.add_column("Cost (USD)", justify="right")
        table.add_column("Date", style="dim")

        for r in runs:
            table.add_row(
                r.id[:8],
                r.seed_keyword,
                r.country,
                str(r.total_keywords),
                f"${float(r.cost_usd or 0.0):.4f}",
                r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else "",
            )
        console.print(table)



if __name__ == "__main__":
    app()

