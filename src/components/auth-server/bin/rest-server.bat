@echo off
set ROOT_PATH=%~dp0..\..\..\..\

set AUTH_SERVER_DATABASE_PATH=%ROOT_PATH%tmp\database.db

set PYTHONPATH=%ROOT_PATH%src\components\auth-server

set FLASK_APP=%ROOT_PATH%src\components\auth-server\bin\rest-server.py

flask run --host=0.0.0.0 --port=1234