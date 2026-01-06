#!/bin/bash
# TypeScript Type Checker Script

echo "🔍 Checking TypeScript types..."
echo ""

# Check for unawaited params/searchParams
echo "1. Checking for unawaited params/searchParams..."
grep -r "params\." app/ --include="*.tsx" --include="*.ts" | grep -v "await params" | grep -v "Promise<" | head -10
grep -r "searchParams\." app/ --include="*.tsx" --include="*.ts" | grep -v "await searchParams" | grep -v "Promise<" | head -10

echo ""
echo "2. Checking for missing type definitions..."
find app -name "*.tsx" -o -name "*.ts" | xargs grep -l "export.*function\|export.*default" | while read file; do
  if ! grep -q "Promise<" "$file" 2>/dev/null && grep -q "params\|searchParams" "$file" 2>/dev/null; then
    echo "⚠️  Potential issue: $file uses params/searchParams but may not be typed as Promise"
  fi
done

echo ""
echo "3. Running TypeScript compiler check..."
npx tsc --noEmit --skipLibCheck 2>&1 | head -50

echo ""
echo "✅ Check complete!"
