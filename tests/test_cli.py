"""
Tests for the neemSEO CLI.
"""

from typer.testing import CliRunner
from neemseo.cli.main import app
from neemseo import __version__

runner = CliRunner()


def test_cli_version():
    result = runner.invoke(app, ["version"])
    assert result.exit_code == 0
    assert __version__ in result.stdout


def test_cli_rules():
    result = runner.invoke(app, ["rules"])
    assert result.exit_code == 0
    assert "title_optimization" in result.stdout
    assert "heading_structure" in result.stdout
