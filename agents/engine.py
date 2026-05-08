from crewai import Task, Crew, Process

# Импортируем ВСЕХ агентов из нашего нового roles.py
from agents.roles import orchestrator, auditor, market_judge, pr_manager

class BORG_ApplicationEngine:
    """
    PHASE 1 & 2: Onboarding Pipeline.
    Called when a startup submits an application to the platform.
    """
    def __init__(self, dev_address: str, contract_address: str):
        self.dev_address = dev_address
        self.contract_address = contract_address

    def run(self):
        # 1: Anti-spam fee collection
        t1_fee = Task(
            description=f"Verify and collect app fee from {self.dev_address}.",
            expected_output="Confirmation of payment receipt.",
            agent=orchestrator
        )

        # 2: Audit and market creation
        t2_audit = Task(
            description=f"Audit verified code at {self.contract_address} using Sourcify. Define a strict KPI and deploy the Umia Market.",
            expected_output="Final Security Verdict and Market Deployment Result.",
            agent=auditor,
            context=[t1_fee] # Start only after successful payment
        )

        crew = Crew(
            agents=[orchestrator, auditor],
            tasks=[t1_fee, t2_audit],
            process=Process.sequential,
            verbose=True
        )
        return crew.kickoff()


class BORG_ResolutionEngine:
    """
    PHASE 4: Settlement Pipeline.
    Called after 14 days to close the market and distribute funds.
    """
    def __init__(self, market_id: str, target_kpi: int, project_addr: str):
        self.market_id = market_id
        self.target_kpi = target_kpi
        self.project_addr = project_addr

    def run(self):
        # 1: On-chain Verification and Financial Settlement
        t1_settle = Task(
            description=(f"Resolve market {self.market_id} for {self.project_addr}. "
                         f"The target KPI was {self.target_kpi}. "
                         f"Check actual on-chain data and settle the market (YES/NO)."),
            expected_output="A summary of the resolution (YES/NO) and the transaction hash.",
            agent=market_judge
        )

        # 2: Public Relations and Community Updates
        t2_report = Task(
            description="""Draft a professional yet engaging Twitter post about this market resolution. 
            Include the result (Success/Fail), the actual stats vs target KPI, and mention the payouts.
            Use hashtags #Umia #DeFi #AgenticVenture.""",
            expected_output="The exact text to be published on Twitter.",
            agent=pr_manager,
            context=[t1_settle] # Only after funds are released
        )

        crew = Crew(
            agents=[market_judge, pr_manager],
            tasks=[t1_settle, t2_report],
            process=Process.sequential,
            verbose=True
        )
        return crew.kickoff()