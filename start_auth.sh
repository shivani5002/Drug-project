#!/bin/bash
gunicorn --bind 0.0.0.0:$PORT auth_backend:app