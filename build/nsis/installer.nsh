; !!! Include LogicLib to support ${If} commands !!!
!include LogicLib.nsh

; --- Custom UI Settings ---
!define MUI_WELCOMEPAGE_TITLE "Welcome to Sanago Setup"
!define MUI_WELCOMEPAGE_TITLE_3LINES
!define MUI_WELCOMEPAGE_TEXT "Sanago is a healthcare management system that helps streamline patient registration, appointment scheduling, and medical records management."

!define MUI_FINISHPAGE_TITLE "Sanago Installation Complete"
!define MUI_FINISHPAGE_TEXT "Sanago has been successfully installed on your computer."

; --- REMOVED CONFLICTING LINES ---
; We removed MUI_FINISHPAGE_RUN because "runAfterFinish": true in package.json 
; already handles the "Run Sanago" checkbox logic.

!define MUI_INSTFILESPAGE_PROGRESSBAR "smooth"

; --- Application Running Check Override ---
!macro customCheckAppRunning
  DetailPrint "Skipping application running check for compatibility..."
!macroend

; --- Initialization Logic ---
!macro customInit
  ; 1. Set default install directory
  StrCpy $INSTDIR "$PROGRAMFILES\Sanago"
  
  ; 2. Check for Admin rights
  UserInfo::GetAccountType
  Pop $R0
  ${If} $R0 != "admin"
    MessageBox MB_ICONEXCLAMATION "Sanago recommends installing with Administrator privileges for best performance."
  ${EndIf}
!macroend

; --- Uninstaller Logic ---
!macro customUnInit
  DetailPrint "Skipping application running check for uninstallation..."
!macroend