import os
import ast
import subprocess
import tempfile
import requests
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

SKIP_DIRS = {
    ".git", ".github", "__pycache__", ".venv", "venv",
    "node_modules", "dist", "build", ".mypy_cache", ".pytest_cache"
}

INTERESTING_EXTENSIONS = {
    ".py", ".js", ".ts", ".tsx", ".jsx",
    ".sol", ".rs", ".go",
    ".yaml", ".yml", ".toml", ".json",
    ".md", "Dockerfile"
}


def build_code_map(repo_dir: str, max_files: int = 80) -> str:
    """
    Lightweight local replacement for SigMap.
    Produces a compact architecture map for LLM analysis.
    """

    repo_path = Path(repo_dir)
    lines = []

    file_count = 0
    language_counts = {}

    for path in repo_path.rglob("*"):
        if file_count >= max_files:
            break

        if any(part in SKIP_DIRS for part in path.parts):
            continue

        if not path.is_file():
            continue

        suffix = path.suffix
        name = path.name

        is_interesting = suffix in INTERESTING_EXTENSIONS or name in {"Dockerfile", "docker-compose.yml", "compose.yaml"}

        if not is_interesting:
            continue

        rel_path = path.relative_to(repo_path)
        file_count += 1

        ext_key = suffix or name
        language_counts[ext_key] = language_counts.get(ext_key, 0) + 1

        lines.append(f"\nFILE: {rel_path}")

        # Python structure extraction
        if suffix == ".py":
            try:
                source = path.read_text(encoding="utf-8", errors="ignore")
                tree = ast.parse(source)

                classes = []
                functions = []

                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef):
                        classes.append(node.name)
                    elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        functions.append(node.name)

                if classes:
                    lines.append("  Classes: " + ", ".join(classes[:12]))
                if functions:
                    lines.append("  Functions: " + ", ".join(functions[:20]))

            except Exception as e:
                lines.append(f"  Python parse error: {e}")

        # Solidity quick scan
        elif suffix == ".sol":
            try:
                source = path.read_text(encoding="utf-8", errors="ignore")
                contracts = []
                for line in source.splitlines():
                    stripped = line.strip()
                    if stripped.startswith("contract ") or stripped.startswith("interface ") or stripped.startswith("library "):
                        contracts.append(stripped[:120])
                if contracts:
                    lines.append("  Solidity units: " + " | ".join(contracts[:10]))
            except Exception as e:
                lines.append(f"  Solidity parse error: {e}")

        # Config / package files: short preview
        elif name in {"pyproject.toml", "package.json", "Dockerfile", "compose.yaml", "docker-compose.yml"}:
            try:
                preview = path.read_text(encoding="utf-8", errors="ignore")[:1000]
                compact_preview = "\n".join(
                    line for line in preview.splitlines()
                    if line.strip() and not line.strip().startswith("#")
                )
                lines.append("  Preview:")
                lines.append("  " + compact_preview[:1000].replace("\n", "\n  "))
            except Exception as e:
                lines.append(f"  Preview error: {e}")

    header = [
        "CODE MAP SUMMARY",
        f"Files scanned: {file_count}",
        f"Detected extensions: {language_counts}",
        ""
    ]

    return "\n".join(header + lines)[:10000]


def analyze_github_repo(repo_url: str) -> dict:
    logger.info(f"Starting GitHub analysis for: {repo_url}")

    repo_path = repo_url.replace("https://github.com/", "").strip("/")
    api_url = f"https://api.github.com/repos/{repo_path}"

    result = {
        "stars": 0,
        "last_commit_days_ago": 999,
        "readme_snippet": "Not found",
        "code_map": "Failed to generate code map",
        "has_smart_contracts": False,
        "detected_stack": []
    }

    # GitHub metadata
    try:
        response = requests.get(api_url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            result["stars"] = data.get("stargazers_count", 0)

            pushed_at = data.get("pushed_at")
            if pushed_at:
                last_push_date = datetime.strptime(pushed_at, "%Y-%m-%dT%H:%M:%SZ")
                result["last_commit_days_ago"] = (datetime.utcnow() - last_push_date).days
        else:
            logger.warning(f"GitHub API returned status {response.status_code}")
    except Exception as e:
        logger.warning(f"Failed to fetch GitHub metadata: {e}")

    # README
    try:
        for branch in ["main", "master"]:
            readme_url = f"https://raw.githubusercontent.com/{repo_path}/{branch}/README.md"
            readme_resp = requests.get(readme_url, timeout=10)

            if readme_resp.status_code == 200:
                result["readme_snippet"] = readme_resp.text[:3000]
                break
    except Exception as e:
        logger.warning(f"Failed to fetch README: {e}")

    # Clone + local code map
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            logger.info(f"Cloning repo into temp dir: {temp_dir}")

            clone_cmd = ["git", "clone", "--depth", "1", repo_url, temp_dir]
            subprocess.run(
                clone_cmd,
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                text=True,
                timeout=60
            )

            files = os.listdir(temp_dir)
            logger.info(f"Files found in temp_dir: {files}")

            code_map = build_code_map(temp_dir)
            result["code_map"] = code_map

            lower_map = code_map.lower()

            result["has_smart_contracts"] = (
                ".sol" in lower_map
                or "contract " in lower_map
                or "hardhat" in lower_map
                or "foundry" in lower_map
                or "forge" in lower_map
            )

            stack = []
            if "fastapi" in lower_map:
                stack.append("FastAPI")
            if "django" in lower_map:
                stack.append("Django")
            if "postgres" in lower_map or "postgresql" in lower_map:
                stack.append("PostgreSQL")
            if "dockerfile" in lower_map or "compose.yaml" in lower_map:
                stack.append("Docker")
            if ".sol" in lower_map or "solidity" in lower_map:
                stack.append("Solidity")
            if "react" in lower_map:
                stack.append("React")
            if "next" in lower_map:
                stack.append("Next.js")

            result["detected_stack"] = stack

    except subprocess.TimeoutExpired:
        logger.error("Git clone or code map timed out.")
        result["code_map"] = "Code map timed out. Project might be too large."
    except Exception as e:
        logger.error(f"Failed during git clone or code map generation: {e}")
        result["code_map"] = f"Code map failed: {e}"

    logger.info("GitHub analysis complete.")
    return result