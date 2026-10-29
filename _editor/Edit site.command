#!/bin/zsh
# Double-click in Finder to start the editor; close the Terminal window to stop it.
cd "$(dirname "$0")/.." && node _editor/server.js
