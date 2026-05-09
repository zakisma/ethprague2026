"""
Legacy CrewAI agent definitions.

Currently not used in the MVP pipeline.
The active AI flow is implemented through:
- src/services/deep_audit.py
- src/services/milestone_agent.py
- src/services/gemini_client.py

Keep this file only as a future reference if the project returns to CrewAI orchestration.
"""
from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI
from src.tools.sourcify_tool import fetch_developer_reputation
from tools.mock_umia_tool import verify_app_fee, deploy_umia_market
from src.core.config import settings

# Initialize Google Gemini Models
deep_reasoning_llm = ChatGoogleGenerativeAI(
    model=settings.CORE_MODEL,
    temperature=settings.AGENT_TEMPERATURE,
    google_api_key=settings.GOOGLE_API_KEY
)

fast_ops_llm = ChatGoogleGenerativeAI(
    model=settings.FAST_MODEL,
    temperature=0.0,
    google_api_key=settings.GOOGLE_API_KEY
)

# --- AGENT DEFINITIONS ---

gatekeeper = Agent(
    role="Venture Gatekeeper & Compliance Lead",
    goal="Ensure applicants have paid the App Fee and extract their base reputation score.",
    backstory="You are a strict security protocol. You never process applications without verifying the anti-spam fee.",
    tools=[verify_app_fee, fetch_developer_reputation],
    llm=fast_ops_llm,
    verbose=True
)

deep_auditor = Agent(
    role="Senior AI Smart Contract Auditor",
    goal="Analyze the gap between a developer's historical capability and their current grant proposal.",
    backstory="""You are a world-class Web3 auditor. You compare the complexity of a developer's past 
    verified contracts (via Sourcify) against the amount of funding they are requesting. 
    You detect over-promising and under-delivering.""",
    tools=[], # In the future, add GitHub Repo Reader tool here
    llm=deep_reasoning_llm,
    verbose=True
)

treasury_manager = Agent(
    role="Umia Treasury Architect",
    goal="Deploy prediction markets with highly specific, measurable on-chain KPIs.",
    backstory="You are a quantitative financial agent. You translate business milestones into strict on-chain metrics.",
    tools=[deploy_umia_market],
    llm=fast_ops_llm,
    verbose=True
)