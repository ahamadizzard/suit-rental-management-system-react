@echo off
REM ====== MongoDB Local to Cloud Sync Script ======

REM --- Change these variables ---
SET LOCAL_URI=mongodb://127.0.0.1:27017/blazerhub
SET CLOUD_URI=mongodb+srv://izzardahamad:199dssenanayake@rentmanager.qeptzjj.mongodb.net/?retryWrites=true&w=majority&appName=RentManager
SET BACKUP_DIR=C:\mongo_backup

REM --- Step 1: Create backup folder ---
echo Creating backup folder...
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM --- Step 2: Dump local database ---
echo Exporting local database...
mongodump --uri="%LOCAL_URI%" --out="%BACKUP_DIR%"

IF %ERRORLEVEL% NEQ 0 (
    echo Failed to dump local database.
    pause
    exit /b
)

REM --- Step 3: Restore to cloud database ---
echo Restoring to cloud database...
mongorestore --uri="%CLOUD_URI%" --drop "%BACKUP_DIR%\blazerhub"

IF %ERRORLEVEL% NEQ 0 (
    echo Failed to restore to cloud database.
    pause
    exit /b
)

echo Database synced successfully!
pause
