from crewai import Agent
from langchain_openai import ChatOpenAI
from tools.sourcify_tool import ContractSourceTool

# +++ Standard: Centralized LLM configuration
llm = ChatOpenAI(
    model_name="gpt-4o",
    temperature=0.0, # Deterministic for security audits
    max_tokens=4000
)

# Agent 1: The Data Engineer (Expert for the shared repository)
data_fetcher = Agent(
    role="Source Code Custodian",
    goal="Extract and format verified source code from the internal Sourcify repository.",
    backstory="""You are an automated system responsible for data integrity. 
    You interact with the internal database via tools to provide the Auditor 
    with the exact code that was verified. You don't analyze code; you only fetch it.""",
    tools=[ContractSourceTool()],
    llm=llm,
    verbose=True
)

# Agent 2: The Security Architect
security_auditor = Agent(
    role="Senior Security Researcher",
    goal="Identify high-risk patterns in Solidity code that could compromise an Umia Venture.",
    backstory="""Expert in DeFi security. You analyze code for 'rug pull' mechanics, 
    centralized admin powers, and logical vulnerabilities. You provide a binary 
    risk assessment (PASS/FAIL).""",
    llm=llm,
    verbose=True
)