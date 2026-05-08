from pydantic import BaseModel, Field

class GrantApplication(BaseModel):
    wallet_address: str = Field(..., description="Registered Ethereum wallet address of the applicant (0x...)")
    github_url: str = Field(..., description="Link to the applicant's GitHub profile or repository showcasing their project")
    requested_amount_usd: int = Field(..., description="Amount of the grant requested in USD")
    project_description: str = Field(..., description="Brief description of what the funds will be used for")