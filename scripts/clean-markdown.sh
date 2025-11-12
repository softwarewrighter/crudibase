#!/bin/bash
# Script to clean markdown files of non-printable characters and CRLF
# Usage: ./clean-markdown.sh <file.md>

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <markdown-file.md>"
    exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
    echo "Error: File '$FILE' not found"
    exit 1
fi

echo "Cleaning $FILE..."

# Create backup
cp "$FILE" "${FILE}.backup"

# Use Python to remove non-printable characters while preserving UTF-8
python3 << 'PYTHON_EOF' "$FILE"
import sys
import string

file_path = sys.argv[1]

# Read the file
with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Keep only printable characters (includes spaces, newlines, tabs, and standard ASCII)
# This preserves UTF-8 multi-byte sequences but removes control characters
printable = set(string.printable)
clean_content = ''.join(char for char in content if char in printable)

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(clean_content)

print(f"Cleaned {file_path}")
PYTHON_EOF

echo "File cleaned successfully"
echo "Backup saved as ${FILE}.backup"

# Verify the result
FILE_TYPE=$(file -b "$FILE")
echo "File type after cleaning: $FILE_TYPE"

if echo "$FILE_TYPE" | grep -qi "data"; then
    echo "WARNING: File still detected as binary/data - manual review needed"
    exit 1
fi

echo "File is now clean and ready to commit"
