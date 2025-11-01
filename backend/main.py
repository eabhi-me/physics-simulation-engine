from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from simulation import OpticalSimulator
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Optical Setup Designer API",
    description="Backend API for optical setup simulation",
    version="1.0.0"
)

# Configure CORS
# Use ALLOWED_ORIGINS env var (comma-separated) in production, else allow all for local/dev
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
if allowed_origins_env.strip() == "*":
    cors_config = dict(
        allow_origins=["*"],
        allow_credentials=False,  # '*' cannot be combined with credentials
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    cors_config = dict(
        allow_origins=[o.strip() for o in allowed_origins_env.split(",") if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.add_middleware(CORSMiddleware, **cors_config)

# Pydantic models for request/response
class Position(BaseModel):
    x: float
    y: float

class SourceProperties(BaseModel):
    angle: float
    wavelength: float
    intensity: float

class MirrorProperties(BaseModel):
    reflectivity: float
    width: float

class LensProperties(BaseModel):
    focalLength: float
    diameter: float
    refractiveIndex: float

class DetectorProperties(BaseModel):
    sensitivity: float
    width: float

class OpticalComponent(BaseModel):
    id: str
    type: str  # 'source', 'mirror', 'lens', 'detector'
    position: Position
    rotation: float
    properties: Dict[str, Any]

class SimulationSettings(BaseModel):
    freqStart: float
    freqStop: float
    freqPoints: int

class OpticalSetup(BaseModel):
    components: List[OpticalComponent]
    simulationSettings: SimulationSettings

class Ray(BaseModel):
    id: str
    points: List[Position]
    color: str
    intensity: float

class PathLength(BaseModel):
    componentId: str
    length: float

class FrequencyPoint(BaseModel):
    frequency: float
    transmission: float

class SimulationResult(BaseModel):
    rays: List[Ray]
    pathLengths: List[PathLength]
    frequencySweep: List[FrequencyPoint]

# Initialize simulator
simulator = OpticalSimulator()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Optical Setup Designer API",
        "version": "1.0.0",
        "endpoints": {
            "simulate": "/api/simulate",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/api/simulate", response_model=SimulationResult)
async def simulate_optical_setup(setup: OpticalSetup):
    """
    Simulate an optical setup and return ray paths, path lengths, and frequency sweep data.
    
    Args:
        setup: OpticalSetup containing components and simulation settings
        
    Returns:
        SimulationResult with rays, path lengths, and frequency sweep data
    """
    try:
        logger.info(f"Simulating setup with {len(setup.components)} components")
        
        # Run simulation
        result = simulator.simulate(
            components=setup.components,
            settings=setup.simulationSettings
        )
        
        logger.info(f"Simulation complete: {len(result['rays'])} rays traced")
        
        return SimulationResult(**result)
        
    except Exception as e:
        logger.error(f"Simulation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@app.get("/api/components")
async def get_available_components():
    """Get list of available optical components"""
    return {
        "components": [
            {
                "type": "source",
                "name": "Light Source",
                "description": "Emits light rays",
                "properties": ["angle", "wavelength", "intensity"]
            },
            {
                "type": "mirror",
                "name": "Mirror",
                "description": "Reflects light rays",
                "properties": ["reflectivity", "width"]
            },
            {
                "type": "lens",
                "name": "Lens",
                "description": "Refracts and focuses light",
                "properties": ["focalLength", "diameter", "refractiveIndex"]
            },
            {
                "type": "detector",
                "name": "Detector",
                "description": "Detects light intensity",
                "properties": ["sensitivity", "width"]
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
