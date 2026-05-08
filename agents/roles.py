from crewai import Agent
from langchain_openai import ChatOpenAI
from tools.web3_tool import process_venture_application, deploy_umia_market
from tools.sourcify_tool import ContractSourceTool
from core.config import settings

# Instance for all the agents to share
llm = ChatOpenAI(model_name=settings.CORE_MODEL, temperature=settings.AGENT_TEMPERATURE)

# Phase 1: Onboarding & Audit Pipeline
orchestrator = Agent(
    role="Venture Operations Lead",
    goal="Onboard new startups by collecting fees and initiating the audit pipeline.",
    backstory="You are the gatekeeper of the BORG. You ensure only paid and serious applications proceed.",
    tools=[process_venture_application],
    llm=llm
)

# Phase 1-2: Code Auditor & KPI Architect
auditor = Agent(
    role="Security & KPI Architect",
    goal="Audit the code and define a strict, unbreakable on-chain KPI for the market.",
    backstory="Senior Solidity Auditor. You turn abstract promises into 'If X gas burned then YES' logic.",
    tools=[ContractSourceTool(), deploy_umia_market],
    llm=llm
)