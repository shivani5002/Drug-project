#!/bin/bash
gunicorn --bind 0.0.0.0:$PORT vit_backend:app