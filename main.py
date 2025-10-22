import uvicorn
import os
import sys

# Add the ml_models/src directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'ml_models', 'src')))

from api.main import app

if __name__ == "__main__":
    # This will attempt to run the FastAPI app.
    # IMPORTANT: This will FAIL in WebContainer due to missing Python dependencies (numpy, pandas, scikit-learn, etc.)
    # which cannot be installed without 'pip'.
    # To run this backend, you need a Python environment with 'pip' where you can install the dependencies
    # listed in 'requirements.txt'.
    print("Attempting to start FastAPI server...")
    print("NOTE: This will likely fail in WebContainer due to missing Python dependencies.")
    print("Please run this backend in an environment with 'pip' and installed dependencies.")
    uvicorn.run(app, host="0.0.0.0", port=8000)
