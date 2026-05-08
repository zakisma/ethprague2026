from crewai import Task, Crew, Process
from agents.roles import data_fetcher, security_auditor

class UmiaVentureEngine:
    def __init__(self, target_address: str, chain_id: int):
        self.target_address = target_address
        self.chain_id = chain_id

    def execute_audit(self):
        # Task 1: Fetching (Ops-level task separation)
        t1 = Task(
            description=f"Retrieve code for {self.target_address} on chain {self.chain_id} from internal DB.",
            expected_output="Raw Solidity source code and compiler metadata.",
            agent=data_fetcher
        )

        # Task 2: Critical Audit
        t2 = Task(
            description="""Analyze the retrieved code. Focus on:
            1. Emergency stop functions (can they be abused?)
            2. Minting functions (is inflation capped?)
            3. Withdrawal logic (can funds be locked?)""",
            expected_output="Final Security Verdict with Risk Score (0-100).",
            agent=security_auditor
        )

        # Orchestration
        crew = Crew(
            agents=[data_fetcher, security_auditor],
            tasks=[t1, t2],
            process=Process.sequential # Chain-of-thought execution
        )
        
        return crew.kickoff()