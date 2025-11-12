#!/bin/bash
# Script to check markdown files for proper encoding
# Detects:
# - CRLF line endings (Windows)
# - Non-printable/binary characters
# - Files detected as "data" instead of text

set -e

EXIT_CODE=0
ERRORS_FOUND=0

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "Checking markdown files for encoding issues..."

# Find all .md files staged for commit, or all .md files if run manually
if [ -n "$1" ]; then
    # Manual mode: check all .md files
    MD_FILES=$(find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*")
else
    # Pre-commit mode: check only staged files
    MD_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.md$' || true)
fi

if [ -z "$MD_FILES" ]; then
    echo -e "${GREEN}No markdown files to check${NC}"
    exit 0
fi

for file in $MD_FILES; do
    # Skip if file doesn't exist (deleted files)
    [ ! -f "$file" ] && continue

    echo -n "Checking $file... "

    # Check 1: CRLF line endings
    if grep -q $'\r' "$file" 2>/dev/null; then
        echo -e "${RED}FAILED${NC}"
        echo -e "  ${RED}ERROR: File contains CRLF (Windows) line endings${NC}"
        echo -e "  ${YELLOW}Fix: Run 'dos2unix $file' or 'tr -d \"\\r\" < $file > temp && mv temp $file'${NC}"
        EXIT_CODE=1
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
        continue
    fi

    # Check 2: File type detection (should be text, not binary/data)
    FILE_TYPE=$(file -b "$file")
    if echo "$FILE_TYPE" | grep -qi "data"; then
        echo -e "${RED}FAILED${NC}"
        echo -e "  ${RED}ERROR: File detected as binary/data instead of text${NC}"
        echo -e "  ${YELLOW}File type: $FILE_TYPE${NC}"
        echo -e "  ${YELLOW}Fix: Remove non-printable characters with scripts/clean-markdown.sh $file${NC}"
        EXIT_CODE=1
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
        continue
    fi

    # Check 3: Non-printable ASCII control characters (excluding tabs and newlines)
    if LC_ALL=C grep -q '[^[:print:][:space:]]' "$file" 2>/dev/null; then
        # Allow valid UTF-8 sequences but catch control characters
        if python3 -c "
import sys
import string
with open('$file', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()
    # Check for control characters except \n, \r, \t
    forbidden = set(range(32)) - {9, 10, 13}  # Tab, LF, CR are OK
    for char in content:
        if ord(char) in forbidden:
            sys.exit(1)
" 2>/dev/null; then
            true  # File is clean
        else
            echo -e "${RED}FAILED${NC}"
            echo -e "  ${RED}ERROR: File contains non-printable control characters${NC}"
            echo -e "  ${YELLOW}Fix: Run scripts/clean-markdown.sh $file${NC}"
            EXIT_CODE=1
            ERRORS_FOUND=$((ERRORS_FOUND + 1))
            continue
        fi
    fi

    echo -e "${GREEN}OK${NC}"
done

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}All markdown files passed encoding checks${NC}"
else
    echo -e "${RED}$ERRORS_FOUND markdown file(s) failed encoding checks${NC}"
    echo -e "${YELLOW}Please fix the errors above before committing${NC}"
fi

exit $EXIT_CODE
