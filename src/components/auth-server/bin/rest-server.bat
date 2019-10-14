@echo off
set ROOT_PATH=%~dp0
set AUTH_SERVER_DATABASE_ROOT_PATH=%ROOT_PATH%..\..\..\..\data
set AUTH_SERVER_DATABASE_PATH=%AUTH_SERVER_DATABASE_ROOT_PATH%\database.db
set PYTHONPATH=%ROOT_PATH%..
set FLASK_APP=%ROOT_PATH%rest-server.py
set FLASK_DEBUG=1
if not exist %AUTH_SERVER_DATABASE_ROOT_PATH% mkdir %AUTH_SERVER_DATABASE_ROOT_PATH%

if [%1] EQU [] (
	goto default
)
if 1%1 EQU +1%1 (
	if %1 GEQ 0 (
		if %1 LEQ 65535 (
			flask run --host=0.0.0.0 --port=%1
			goto eof
		)
	)
)
:default
flask run --host=0.0.0.0 --port=1234
:eof