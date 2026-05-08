from crewai import Task, Crew, Process
from agents.roles import orchestrator, auditor

class BORG_VentureEngine:
    def __init__(self, dev_address: str, contract_address: str):
        self.dev_address = dev_address
        self.contract_address = contract_address

    def run_application_phase(self):
        # 1: Anti-spam fee collection
        t1_fee = Task(
            description=f"Verify and collect app fee from {self.dev_address}.",
            expected_output="Confirmation of payment receipt.",
            agent=orchestrator
        )

        # 2: Audit and market creation
        t2_audit = Task(
            description=f"Audit code at {self.contract_address} and deploy the Umia Market.",
            expected_output="Final Security Verdict and Market Deployment Address.",
            agent=auditor,
            context=[t1_fee] # Start only after payment
        )

        crew = Crew(
            agents=[orchestrator, auditor],
            tasks=[t1_fee, t2_audit],
            process=Process.sequential,
            verbose=True
        )
        return crew.kickoff()