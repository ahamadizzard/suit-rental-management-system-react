@echo off
REM ====== MongoDB Local to Cloud Sync Script (Specific Collections) ======

REM --- Change these variables ---
SET LOCAL_URI=mongodb://127.0.0.1:27017/blazerhub
SET CLOUD_URI=mongodb+srv://izzardahamad:199dssenanayake@rentmanager.qeptzjj.mongodb.net/?retryWrites=true&w=majority&appName=RentManager
SET BACKUP_DIR=C:\mongo_backup
REM List collections to sync, separated by space
SET COLLECTIONS=users suits rentals

REM --- Step 1: Create backup folder ---
echo Creating backup folder...
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM --- Step 2: Dump each collection ---
for %%c in (%COLLECTIONS%) do (
    echo Exporting collection %%c...
    mongodump --uri="%LOCAL_URI%" --collection=%%c --out="%BACKUP_DIR%"
    IF %ERRORLEVEL% NEQ 0 (
        echo Failed to dump collection %%c
        pause
        exit /b
    )
)

REM --- Step 3: Restore each collection to cloud ---
for %%c in (%COLLECTIONS%) do (
    echo Restoring collection %%c to cloud...
    mongorestore --uri="%CLOUD_URI%" --drop --collection=%%c "%BACKUP_DIR%\blazerhub\%%c.bson"
    IF %ERRORLEVEL% NEQ 0 (
        echo Failed to restore collection %%c
        pause
        exit /b
    )
)

echo Selected collections synced successfully!
pause
