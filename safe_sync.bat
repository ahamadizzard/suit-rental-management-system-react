@echo off
REM ====== Safe MongoDB Sync Script (Local to Cloud) ======

REM --- Configuration ---
SET LOCAL_URI=mongodb://127.0.0.1:27017/blazerhub
SET CLOUD_URI=mongodb+srv://izzardahamad:199dssenanayake@rentmanager.qeptzjj.mongodb.net/?retryWrites=true&w=majority&appName=RentManager
SET BASE_BACKUP_DIR=C:\mongo_backup
REM Collections to sync
SET COLLECTIONS=users suits rentals

REM --- Create timestamp ---
FOR /F "tokens=1-3 delims=/- " %%A IN ("%DATE%") DO SET TODAY=%%C-%%A-%%B
SET TIMESTAMP=%TODAY%_%TIME:~0,2%-%TIME:~3,2%-%TIME:~6,2%

REM --- Create backup folders ---
SET LOCAL_BACKUP_DIR=%BASE_BACKUP_DIR%\local_%TIMESTAMP%
SET CLOUD_BACKUP_DIR=%BASE_BACKUP_DIR%\cloud_%TIMESTAMP%

mkdir "%LOCAL_BACKUP_DIR%"
mkdir "%CLOUD_BACKUP_DIR%"

echo ===== Exporting local collections =====
for %%c in (%COLLECTIONS%) do (
    echo Exporting collection %%c from local DB...
    mongodump --uri="%LOCAL_URI%" --collection=%%c --out="%LOCAL_BACKUP_DIR%"
    IF %ERRORLEVEL% NEQ 0 (
        echo Failed to dump collection %%c from local DB
        pause
        exit /b
    )
)

echo ===== Backing up cloud collections =====
for %%c in (%COLLECTIONS%) do (
    echo Exporting collection %%c from cloud DB...
    mongodump --uri="%CLOUD_URI%" --collection=%%c --out="%CLOUD_BACKUP_DIR%"
    IF %ERRORLEVEL% NEQ 0 (
        echo Failed to dump collection %%c from cloud DB
        pause
        exit /b
    )
)

echo ===== Restoring local collections to cloud =====
for %%c in (%COLLECTIONS%) do (
    echo Restoring collection %%c to cloud DB...
    mongorestore --uri="%CLOUD_URI%" --drop --collection=%%c "%LOCAL_BACKUP_DIR%\blazerhub\%%c.bson"
    IF %ERRORLEVEL% NEQ 0 (
        echo Failed to restore collection %%c to cloud DB
        pause
        exit /b
    )
)

echo ===== Sync completed successfully! =====
echo Local backup: %LOCAL_BACKUP_DIR%
echo Cloud backup: %CLOUD_BACKUP_DIR%
pause
