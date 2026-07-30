@echo off
cd /d "%~dp0\.."
title AVA Coffee - Auto Build APK
echo =======================================================
echo     AVA COFFEE - AN DROID APK AUTOMATED BUILD SCRIPT
echo =======================================================
echo.

:: 1. Cau hinh JDK tu OpenJDK (da kiem tra co san tren may cua ban)
set "JAVA_HOME=C:\Users\sonle\.jdks\openjdk-23.0.2"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [1/4] Kiem tra phien ban Java (Yeu cau JDK 11 tro len)...
java -version
if %ERRORLEVEL% neq 0 (
    echo [LOI] Khong tim thay Java 17 trong thu muc IntelliJ JBR.
    echo Vui long kiem tra lai duong dan JDK.
    pause
    exit /b %ERRORLEVEL%
)
echo.

:: 2. Tu dong kiem tra Android SDK
if "%ANDROID_HOME%"=="" (
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
    ) else if exist "C:\Android\sdk" (
        set "ANDROID_HOME=C:\Android\sdk"
    ) else (
        echo [LOI] Khong tim thay Android SDK tren may cua ban.
        echo.
        echo HUONG DAN KHAC PHUC:
        echo 1. Vui long tai va cai dat Android Studio tu: https://developer.android.com/studio
        echo 2. Mo Android Studio len va lam theo cac buoc mac dinh de tai Android SDK.
        echo 3. Sau do, chay lai file .bat nay.
        echo.
        pause
        exit /b 1
    )
)
echo Android SDK duoc tim thay tai: %ANDROID_HOME%
echo.

:: 3. Build Next.js Web App
echo [2/4] Dang build phien ban Web Next.js (Static Export)...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [LOI] Build Next.js that bai. Vui long kiem tra code hoac cac loi compiler.
    pause
    exit /b %ERRORLEVEL%
)
echo.

:: 4. Sync code vao thu muc Android (Capacitor)
echo [3/4] Dang dong bo code Next.js vao du an Android...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo [LOI] Dong bo hoa Capacitor that bai.
    pause
    exit /b %ERRORLEVEL%
)
echo.

:: 5. Bien dich ra file APK bang Gradle
echo [4/4] Dang bien dich ra file APK bang Gradle...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% neq 0 (
    echo [LOI] Bien dich APK that bai. Vui long kiem tra log.
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo =======================================================
echo   BIEN DICH APK THANH CONG!
echo =======================================================
echo.
echo Dang sao chep file APK vao thu muc 'AVA Coffee apk'...
copy "android\app\build\outputs\apk\debug\app-debug.apk" "AVA Coffee apk\AVA_Coffee.apk" /Y
echo.
echo Hoan thanh! File APK da duoc luu tai:
echo "AVA Coffee apk\AVA_Coffee.apk"
echo.
pause
