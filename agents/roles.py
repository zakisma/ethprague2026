from crewai import Agent
from langchain_openai import ChatOpenAI
from tools.sourcify_tool import ContractSourceTool
from tools.web3_tool import FutarchyMarketDataTool, FutarchyTradeTool
from core.llm_factory import LLMFactory

def create_kpi_architect(llm) -> Agent:
    """CORE AGENT: Requires high security and strict determinism."""
    return Agent(
        role="Protocol Operations Manager",
        goal="Formulate strict, measurable on-chain KPIs based on the developer's backend security profile.",
        backstory="You are the trusted AI Orchestrator of the BORG. You operate strictly on the backend to prevent fraud.",
        llm=llm,
        verbose=True
    )

def create_onchain_umpire(llm) -> Agent:
    """CORE AGENT: Resolves markets. Cannot be manipulated by the user."""
    return Agent(
        role="On-Chain Data Auditor",
        goal="Verify on-chain usage metrics objectively to resolve decision markets.",
        backstory="You are an impartial judge enforcing the Umia Futarchy mechanisms.",
        llm=llm,
        verbose=True
    )

def create_research_analyst(llm) -> Agent:
    """TERMINAL AGENT: Analyzes markets for the trader. Can run on local models."""
    return Agent(
        role="DeFi Quantitative Analyst",
        goal="Analyze decision markets and provide trading advice based on available data.",
        backstory="You are a personal trading assistant. You adapt to the user's preferred risk profile.",
        llm=llm,
        verbose=True
    )