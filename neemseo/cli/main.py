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
from neemseo.db.models import AuditRun

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


if __name__ == "__main__":
    app()
