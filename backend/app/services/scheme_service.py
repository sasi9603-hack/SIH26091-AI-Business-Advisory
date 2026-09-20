from typing import List, Optional
from ..schemas.schemes import SchemeItemResponse, SchemeMatchResponse

OFFICIAL_SCHEMES_LIST = [
    SchemeItemResponse(
        id='micro-finance',
        name='Micro Finance Scheme',
        shortCode='MICRO-FIN',
        ministry='Ministry of MSME / SIH26091 Priority Credit Facility',
        maxProjectCost=140000.0,
        subsidyPctRange='Funding Up to 90% of Project Cost (Max ?1.25 Lakh)',
        beneficiaryEquityPct='10% Available Margin Capital',
        targetBeneficiaries='Small and micro business units in rural and semi-urban localities',
        keyFeatures=[
            'Project cost ceiling: Up to ?1.40 Lakh',
            'Maximum eligible loan: ?1.25 Lakh',
            'Concessional interest rate: 6.5% per annum',
            'Repayment tenure: 3 Years with 3-Month Moratorium period',
            'Quarterly debt servicing schedule'
        ],
        eligibilityConditions=[
            'Total estimated project cost must not exceed ?1,40,000',
            'Beneficiary contribution (Margin Capital) of at least 10%',
            'Applicable for small/micro business trade and rural repair units',
            'No prior institutional banking default'
        ],
        documentChecklist=[
            'Aadhaar Card for biometric authentication',
            'Proof of business location / Gram Panchayat NOC',
            'Quotation of initial machinery/tools',
            'Bank passbook for direct benefit disbursement'
        ],
        portalUrl='https://www.jansamarth.in',
        nodalAgency='Public Sector Banks, Regional Rural Banks (RRBs), and MFIs'
    ),
    SchemeItemResponse(
        id='term-loan',
        name='Term Loan Scheme',
        shortCode='TERM-LOAN',
        ministry='Ministry of MSME / SIH26091 Scalable Enterprise Credit',
        maxProjectCost=5000000.0,
        subsidyPctRange='Funding Up to 90% of Project Cost (Max ?45.00 Lakh)',
        beneficiaryEquityPct='10% Available Margin Capital',
        targetBeneficiaries='Larger micro-enterprise projects in rural & semi-urban clusters',
        keyFeatures=[
            'Project cost eligibility: > ?1.40 Lakh and <= ?50.00 Lakh',
            'Maximum eligible loan: ?45.00 Lakh',
            'Interest rate: 8.0% per annum',
            'Repayment tenure: 7 Years with 6-Month Moratorium period',
            'Quarterly debt servicing schedule'
        ],
        eligibilityConditions=[
            'Project cost must be between ?1.40 Lakh and ?50.00 Lakh',
            'Beneficiary contribution (Margin Capital) of at least 10%',
            'Viable project plan for greenfield or capacity expansion micro-enterprise',
            'Regular banking KYC verification'
        ],
        documentChecklist=[
            'Detailed Project Report (DPR) with equipment cost estimates',
            'Aadhaar Card and PAN card',
            'Land/lease agreement for business premises',
            'Bank account statement for the last 6 months'
        ],
        portalUrl='https://www.jansamarth.in',
        nodalAgency='Commercial Banks, SIDBI, and Public Sector Lending Institutions'
    )
]

def get_all_schemes() -> List[SchemeItemResponse]:
    return OFFICIAL_SCHEMES_LIST

def evaluate_scheme_match(project_cost: float, available_capital: float) -> SchemeMatchResponse:
    if project_cost <= 0:
        return SchemeMatchResponse(
            matched_schemes=[],
            recommended_scheme=None,
            outside_range=False,
            status_message="Awaiting valid project cost or margin capital input."
        )

    if project_cost <= 140000:
        rec = OFFICIAL_SCHEMES_LIST[0]
        return SchemeMatchResponse(
            matched_schemes=[rec],
            recommended_scheme=rec,
            outside_range=False,
            status_message="Project qualifies for the SIH26091 Micro Finance Scheme."
        )
    elif 140000 < project_cost <= 5000000:
        rec = OFFICIAL_SCHEMES_LIST[1]
        return SchemeMatchResponse(
            matched_schemes=[rec],
            recommended_scheme=rec,
            outside_range=False,
            status_message="Project qualifies for the SIH26091 Term Loan Scheme."
        )
    else:
        return SchemeMatchResponse(
            matched_schemes=[],
            recommended_scheme=None,
            outside_range=True,
            status_message="Calculated project cost exceeds the ?50 Lakh ceiling specified under SIH26091 guidelines."
        )
