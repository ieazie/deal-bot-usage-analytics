#!/bin/bash

echo "🧪 Running tests for Deal Bot Usage Analytics..."

# Function to run tests and capture exit code
run_tests() {
    local service=$1
    local command=$2
    
    echo "🔍 Running $service tests..."
    if eval "$command"; then
        echo "✅ $service tests passed"
        return 0
    else
        echo "❌ $service tests failed"
        return 1
    fi
}

# Initialize exit code
exit_code=0

# Run backend tests
if ! run_tests "Backend" "cd backend && npm test"; then
    exit_code=1
fi

echo ""

# Run frontend tests
if ! run_tests "Frontend" "cd frontend && npm test"; then
    exit_code=1
fi

echo ""

# Summary
if [ $exit_code -eq 0 ]; then
    echo "🎉 All tests passed!"
else
    echo "💥 Some tests failed. Please check the output above."
fi

exit $exit_code 