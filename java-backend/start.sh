#!/bin/bash

echo "🚀 Starting Rental Management System - Java Backend"
echo "=================================================="

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven first."
    exit 1
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17 or higher."
    exit 1
fi

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | awk -F '.' '{print $1}')
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ Java 17 or higher is required. Current version: $JAVA_VERSION"
    exit 1
fi

echo "✅ Java version: $(java -version 2>&1 | head -n 1)"
echo "✅ Maven version: $(mvn -version | head -n 1)"

# Clean and build
echo ""
echo "📦 Building project..."
mvn clean install -DskipTests

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🏃 Starting Spring Boot application..."
    echo "📡 API will be available at: http://localhost:8080"
    echo ""
    mvn spring-boot:run
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

