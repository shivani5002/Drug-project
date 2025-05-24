#!/bin/bash
gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 "auth_backend:app"