import os
import requests
import logging
from typing import Dict, Any
from pydantic import BaseModel, Field
from langchain.tools import tool

logger = logging.getLogger("AI_Ops.GitHubTool")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN") # Optional, but recommended

class GitHubInput(BaseModel):
    repo_url: str = Field(..., description="The full GitHub repository URL, e.g., https://github.com/owner/repo")

@tool("analyze_github_repo", args_schema=GitHubInput)
def analyze_github_repo(repo_url: str) -> Dict[str, Any]:
    """
    Fetches crucial metadata and the README from a GitHub repository to evaluate a project's health,
    activity, and community proof for grant distribution.
    """
    logger.info(f"Analyzing GitHub repo: {repo_url}")
    
    # 1. Parse URL to extract owner and repo
    try:
        parts = repo_url.rstrip('/').split('/')
        owner, repo = parts[-2], parts[-1]
    except Exception:
        return {"error": "Invalid GitHub URL format."}

    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    api_base = f"https://api.github.com/repos/{owner}/{repo}"

    try:
        # --- A. get repository metadata ---
        repo_res = requests.get(api_base, headers=headers)
        if repo_res.status_code != 200:
            return {"error": f"Repository not found or private. Status: {repo_res.status_code}"}
        
        repo_data = repo_res.json()
        
        # --- B. get README (if exists) ---
        readme_res = requests.get(f"{api_base}/readme", headers=headers)
        readme_text = "No README found."
        if readme_res.status_code == 200:
            import base64
            readme_data = readme_res.json()
            readme_text = base64.b64decode(readme_data['content']).decode('utf-8')
            # Cut README to a reasonable length for LLM processing
            readme_text = readme_text[:3000] + "... [TRUNCATED]" 

        # Forms clean output for LLM analysis
        return {
            "name": repo_data.get("full_name"),
            "stars": repo_data.get("stargazers_count"),
            "forks": repo_data.get("forks_count"),
            "open_issues": repo_data.get("open_issues_count"),
            "language": repo_data.get("language"),
            "created_at": repo_data.get("created_at"),
            "last_pushed_at": repo_data.get("pushed_at"),
            "readme_snippet": readme_text
        }

    except Exception as e:
        logger.error(f"GitHub API Error: {str(e)}")
        return {"error": f"Failed to fetch data: {str(e)}"}