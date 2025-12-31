@echo off
REM Setup script for Abraxas project (Windows)

echo Setting up Abraxas development environment...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3.9 or higher.
    exit /b 1
)

echo Creating virtual environment...
if not exist ".venv" (
    python -m venv .venv
    echo Virtual environment created
) else (
    echo Virtual environment already exists
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Upgrading pip...
python -m pip install --upgrade pip >nul 2>&1

echo Installing Abraxas in development mode...
pip install -e .[dev] >nul 2>&1

echo.
echo Setup complete!
echo.
echo To activate the virtual environment, run:
echo   .venv\Scripts\activate.bat
echo.
echo To verify the installation, run:
echo   abraxas --version
echo.
echo To run tests, use:
echo   pytest
echo.
