from crewai import Agent
from langchain_openai import ChatOpenAI
from tools.sourcify_tool import ContractSourceTool
from tools.web3_tool import FutarchyMarketDataTool, FutarchyTradeTool

# Standard: Centralized LLM configuration
llm = ChatOpenAI(model_name="gpt-4o", temperature=0.0)

# Agent 1: The ML Oracle (Wraps your teammate's ML model)
risk_oracle = Agent(
    role="Quantitative Risk Oracle",
    goal="Evaluate smart contract upgrades and calculate a definitive 'AI Trust Score' (0-100) representing the probability of success.",
    backstory="""You are a predictive engine. You rely on the internal Sourcify database 
    and historical exploit data to predict if a proposed protocol change will succeed.
    Your output is purely mathematical probabilities, devoid of emotion.""",
    tools=[ContractSourceTool()],
    llm=llm,
    verbose=True
)

# Agent 2: The Autonomous Execution Trader
quant_trader = Agent(
    role="Autonomous Treasury Manager",
    goal="Calculate Expected Value (EV) by comparing the AI Trust Score with Market Probabilities, and execute trades autonomously.",
    backstory="""You are a highly aggressive, purely logical hedge fund manager operating on Umia's Decision Markets. 
    You manage the BORG's treasury. You look for inefficiencies where the 'AI Trust Score' differs 
    significantly from the 'Market Probability'. If you find an edge > 10%, you execute the trade without hesitation.""",
    tools=[FutarchyMarketDataTool(), FutarchyTradeTool()],
    llm=llm,
    verbose=True
)