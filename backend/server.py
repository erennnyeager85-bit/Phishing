from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import re
import joblib
import pickle
from urllib.parse import urlparse
import numpy as np


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Report(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    reporter_address: str
    description: Optional[str] = None
    phishing_score: Optional[float] = None
    upvotes: int = 0
    downvotes: int = 0
    confirmed_scam: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReportCreate(BaseModel):
    url: str
    reporter_address: str
    description: Optional[str] = None

class PhishingAnalysisRequest(BaseModel):
    url: str

class PhishingAnalysisResponse(BaseModel):
    url: str
    phishing_probability: float
    risk_level: str
    features: dict

class VoteRequest(BaseModel):
    report_id: str
    voter_address: str
    is_scam: bool

class DashboardStats(BaseModel):
    total_reports: int
    confirmed_scams: int
    pending_reports: int
    total_votes: int
    unique_reporters: int


# ML Feature Extraction for Phishing Detection
def extract_url_features(url: str) -> dict:
    """Extract features from URL for phishing detection"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        path = parsed.path
        
        features = {
            'url_length': len(url),
            'domain_length': len(domain),
            'path_length': len(path),
            'num_dots': url.count('.'),
            'num_hyphens': url.count('-'),
            'num_underscores': url.count('_'),
            'num_slashes': url.count('/'),
            'num_questionmarks': url.count('?'),
            'num_equals': url.count('='),
            'num_at': url.count('@'),
            'num_ampersands': url.count('&'),
            'num_digits': sum(c.isdigit() for c in url),
            'has_ip': 1 if re.match(r'^\d+\.\d+\.\d+\.\d+', domain) else 0,
            'has_https': 1 if parsed.scheme == 'https' else 0,
            'suspicious_tld': 1 if any(tld in domain for tld in ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top']) else 0,
            'has_suspicious_words': 1 if any(word in url.lower() for word in ['login', 'verify', 'secure', 'account', 'update', 'banking', 'wallet', 'crypto']) else 0
        }
        
        return features
    except Exception as e:
        logging.error(f"Error extracting features: {e}")
        return {}

def calculate_phishing_score(features: dict) -> float:
    """Simple rule-based phishing score calculation"""
    score = 0.0
    
    # Length-based scoring
    if features.get('url_length', 0) > 75:
        score += 0.2
    if features.get('domain_length', 0) > 30:
        score += 0.15
    
    # Suspicious characteristics
    if features.get('has_ip', 0) == 1:
        score += 0.3
    if features.get('has_https', 0) == 0:
        score += 0.15
    if features.get('suspicious_tld', 0) == 1:
        score += 0.25
    if features.get('has_suspicious_words', 0) == 1:
        score += 0.2
    
    # Special character overuse
    if features.get('num_dots', 0) > 4:
        score += 0.1
    if features.get('num_hyphens', 0) > 3:
        score += 0.1
    if features.get('num_at', 0) > 0:
        score += 0.2
    
    # Normalize to 0-1 range
    return min(score, 1.0)


# API Routes
@api_router.get("/")
async def root():
    return {"message": "PhishBlock API - Decentralized Anti-Phishing Database"}


@api_router.post("/ml/analyze", response_model=PhishingAnalysisResponse)
async def analyze_url(request: PhishingAnalysisRequest):
    """Analyze URL for phishing probability using ML features"""
    try:
        features = extract_url_features(request.url)
        phishing_prob = calculate_phishing_score(features)
        
        # Determine risk level
        if phishing_prob >= 0.7:
            risk_level = "HIGH"
        elif phishing_prob >= 0.4:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return PhishingAnalysisResponse(
            url=request.url,
            phishing_probability=round(phishing_prob * 100, 2),
            risk_level=risk_level,
            features=features
        )
    except Exception as e:
        logging.error(f"Error analyzing URL: {e}")
        raise HTTPException(status_code=500, detail="Error analyzing URL")


@api_router.post("/reports", response_model=Report)
async def create_report(report: ReportCreate):
    """Create a new phishing report"""
    try:
        # Analyze URL to get phishing score
        features = extract_url_features(report.url)
        phishing_score = calculate_phishing_score(features)
        
        report_obj = Report(
            url=report.url,
            reporter_address=report.reporter_address,
            description=report.description,
            phishing_score=round(phishing_score * 100, 2)
        )
        
        # Convert to dict and serialize datetime
        doc = report_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        await db.reports.insert_one(doc)
        return report_obj
    except Exception as e:
        logging.error(f"Error creating report: {e}")
        raise HTTPException(status_code=500, detail="Error creating report")


@api_router.get("/reports", response_model=List[Report])
async def get_reports(status: Optional[str] = None):
    """Get all reports with optional status filter"""
    try:
        query = {}
        if status == "confirmed":
            query['confirmed_scam'] = True
        elif status == "pending":
            query['confirmed_scam'] = False
        
        reports = await db.reports.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
        
        # Convert ISO string timestamps back to datetime objects
        for report in reports:
            if isinstance(report['timestamp'], str):
                report['timestamp'] = datetime.fromisoformat(report['timestamp'])
        
        return reports
    except Exception as e:
        logging.error(f"Error fetching reports: {e}")
        raise HTTPException(status_code=500, detail="Error fetching reports")


@api_router.post("/reports/vote")
async def vote_on_report(vote: VoteRequest):
    """Vote on a report (upvote = scam, downvote = safe)"""
    try:
        # Find the report
        report = await db.reports.find_one({"id": vote.report_id}, {"_id": 0})
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Check if user already voted (simple check by address)
        voter_key = f"voter_{vote.voter_address}"
        if voter_key in report:
            raise HTTPException(status_code=400, detail="You have already voted on this report")
        
        # Update votes
        update = {}
        if vote.is_scam:
            update['upvotes'] = report.get('upvotes', 0) + 1
        else:
            update['downvotes'] = report.get('downvotes', 0) + 1
        
        # Mark as voted by this user
        update[voter_key] = True
        
        # Check if report should be confirmed (simple threshold: 3+ upvotes and more upvotes than downvotes)
        if update.get('upvotes', report.get('upvotes', 0)) >= 3 and \
           update.get('upvotes', report.get('upvotes', 0)) > update.get('downvotes', report.get('downvotes', 0)):
            update['confirmed_scam'] = True
        
        await db.reports.update_one({"id": vote.report_id}, {"$set": update})
        
        return {"message": "Vote recorded successfully", "confirmed_scam": update.get('confirmed_scam', False)}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error voting on report: {e}")
        raise HTTPException(status_code=500, detail="Error recording vote")


@api_router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        total_reports = await db.reports.count_documents({})
        confirmed_scams = await db.reports.count_documents({"confirmed_scam": True})
        pending_reports = await db.reports.count_documents({"confirmed_scam": False})
        
        # Calculate total votes
        reports = await db.reports.find({}, {"_id": 0, "upvotes": 1, "downvotes": 1}).to_list(1000)
        total_votes = sum(r.get('upvotes', 0) + r.get('downvotes', 0) for r in reports)
        
        # Get unique reporters
        unique_reporters = len(await db.reports.distinct("reporter_address"))
        
        return DashboardStats(
            total_reports=total_reports,
            confirmed_scams=confirmed_scams,
            pending_reports=pending_reports,
            total_votes=total_votes,
            unique_reporters=unique_reporters
        )
    except Exception as e:
        logging.error(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail="Error fetching statistics")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()