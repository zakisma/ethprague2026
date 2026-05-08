from crewai import Task, Crew, Process
from pydantic import BaseModel, Field
from agents.roles import create_kpi_architect, create_research_analyst
from core.llm_factory import LLMFactory, UserLLMConfig

class CoreProtocolPipeline:
    """Executes Phase 1 and Phase 4 from the Architecture Diagram."""
    
    def __init__(self):
        # 🔒 SECURE: Always uses the internal factory method
        self.secure_llm = LLMFactory.get_core_llm(temperature=0.0)

    def execute_phase_1_application(self, dev_data: dict):
        architect = create_kpi_architect(self.secure_llm)
        
        t1 = Task(
            description=f"Formulate KPI for developer {dev_data['address']} with score {dev_data['score']}.",
            expected_output="A strict KPI string.",
            agent=architect
        )
        
        crew = Crew(agents=[architect], tasks=[t1], process=Process.sequential)
        return crew.kickoff()

class UserTerminalPipeline:
    """Executes requests from the Trader UI (ProofFund Mockup)."""
    
    def __init__(self, user_config: UserLLMConfig = None):
        # 🔓 FLEXIBLE: Uses user's key or local model if provided
        self.terminal_llm = LLMFactory.get_terminal_llm(user_config)

    def generate_trading_advice(self, market_data: dict):
        analyst = create_research_analyst(self.terminal_llm)
        
        t1 = Task(
            description=f"Analyze market {market_data['id']}. Current YES prob: {market_data['yes_prob']}. Give advice.",
            expected_output="Trader-focused JSON report.",
            agent=analyst
        )
        
        crew = Crew(agents=[analyst], tasks=[t1], process=Process.sequential)
        return crew.kickoff()