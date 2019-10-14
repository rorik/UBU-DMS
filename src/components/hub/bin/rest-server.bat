@echo off
set ROOT_PATH=%~dp0
set PYTHONPATH=%ROOT_PATH%..
set FLASK_APP=%ROOT_PATH%rest-server.py
set FLASK_DEBUG=1
set FLASK_RUN_PORT=4444
set FLASK_RUN_HOST=0.0.0.0
set AUTH_SERVER_HOST=127.0.0.1
set AUTH_SERVER_PORT=1234

if [%1] EQU [] (
	goto run
)
if 1%1 EQU +1%1 (
	if %1 GEQ 0 (
		if %1 LEQ 65535 (
			set FLASK_RUN_PORT=%1
		)
	)
)
:run
python %FLASK_APP%
:eof