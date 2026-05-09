# backend/audit/bq_client.py

from typing import List, Dict, Any

from google.cloud import bigquery
from google.cloud.bigquery import QueryJobConfig, ScalarQueryParameter

from config import BQ_DATA_PROJECT, BQ_JOB_PROJECT, BQ_DATASET, BQ_LOCATION


def get_contracts_for_deployer_bq(
    deployer: str,
    max_contracts: int = 50,
) -> List[Dict[str, Any]]:
    """
    Возвращает список {address, chain_id} для контрактов,
    задеплоенных указанным кошельком и присутствующих в Sourcify.
    """

    # клиент выполняет запросы от имени JOB-проекта
    client = bigquery.Client(project=BQ_JOB_PROJECT)

    sql = f"""
    SELECT
        LOWER(CONCAT('0x', TO_HEX(cd.address))) AS contract_address,
        cd.chain_id
    FROM `{BQ_DATA_PROJECT}.{BQ_DATASET}.public_contract_deployments` cd
    JOIN `{BQ_DATA_PROJECT}.{BQ_DATASET}.public_verified_contracts` vc
        ON vc.deployment_id = cd.id
    WHERE
        cd.deployer = FROM_HEX(REGEXP_REPLACE(LOWER(@deployer), r'^0x', ''))
    ORDER BY cd.created_at DESC
    LIMIT @limit
    """

    job_config = QueryJobConfig(
        query_parameters=[
            ScalarQueryParameter("deployer", "STRING", deployer),
            ScalarQueryParameter("limit", "INT64", max_contracts),
        ]
    )

    query_job = client.query(
        sql,
        job_config=job_config,
        location=BQ_LOCATION,  # "europe-west1"
    )

    rows = list(query_job)

    return [
        {"address": row["contract_address"], "chain_id": row["chain_id"]}
        for row in rows
    ]