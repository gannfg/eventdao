#!/bin/bash

echo "Auto-pushing EventDAO changes to GitHub..."

git add .
git commit -m "Auto-update: $(date)"
git push origin main

echo "Push completed!"
