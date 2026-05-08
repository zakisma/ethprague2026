from crewai import Task, Crew, Process
from pydantic import BaseModel, Field
from agents.roles import risk_oracle, quant_trader

# --- State Schemas (Pydantic) ---
class OraclePrediction(BaseModel):
    proposal_id: str
    ai_trust_score: float = Field(..., description="Probability of success (0.0 to 1.0)")
    risk_factors: list[str]

class TradeDecision(BaseModel):
    market_id: str
    edge_calculated: float = Field(..., description="Difference between AI score and Market probability")
    action_taken: str = Field(..., description="'BUY_YES', 'BUY_NO', or 'HOLD'")
    investment_amount: float
    transaction_receipt: str = Field(default="NONE")

# --- The Engine ---
class FutarchyTradingEngine:
    def __init__(self, target_address: str, market_id: str):
        self.target_address = target_address
        self.market_id = market_id

    def execute_market_strategy(self):
        # Task 1: ML Risk Prediction
        t1_predict = Task(
            description=f"""Analyze the code for address {self.target_address} using the Sourcify tool.
            Generate an AI Trust Score (probability of success) based on code quality and security.
            Format your output strictly as a probability between 0.0 and 1.0.""",
            expected_output="A structured prediction containing the ai_trust_score.",
            agent=risk_oracle,
            output_json=OraclePrediction
        )

        # Task 2: EV Calculation and Trading
        t2_trade = Task(
            description=f"""Take the OraclePrediction from the previous task.
            1. Use 'get_market_probabilities' for market_id: {self.market_id}.
            2. Calculate your Edge: (ai_trust_score - probability_yes).
            3. TRADING RULES:
               - If Edge >= +0.10 (10% undervalued): Execute trade BUY 'YES' for $500 using 'execute_conditional_trade'.
               - If Edge <= -0.10 (10% overvalued): Execute trade BUY 'NO' for $500 using 'execute_conditional_trade'.
               - Otherwise: Action is 'HOLD', do not execute trade.
            4. Return the final trade decision and receipt.""",
            expected_output="A structured summary of the trading action taken.",
            agent=quant_trader,
            output_json=TradeDecision,
            context=[t1_predict] # This links the Oracle's output directly into the Trader's brain
        )

        crew = Crew(
            agents=[risk_oracle, quant_trader],
            tasks=[t1_predict, t2_trade],
            process=Process.sequential,
            verbose=True
        )
        
        return crew.kickoff()