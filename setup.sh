#!/bin/bash

# Chamilo LMS Setup Script
# This script helps set up Chamilo on macOS

set -e

echo "========================================="
echo "Chamilo LMS Setup Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}This script is designed for macOS${NC}"
    exit 1
fi

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo -e "${RED}Homebrew is not installed. Please install it first:${NC}"
    echo "Visit: https://brew.sh"
    exit 1
fi

echo -e "${GREEN}✓ Homebrew found${NC}"

# Check PHP
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -r 'echo PHP_VERSION;')
    echo -e "${GREEN}✓ PHP is installed (version $PHP_VERSION)${NC}"
else
    echo -e "${YELLOW}PHP is not installed. Installing...${NC}"
    brew install php
fi

# Check for required PHP extensions
echo ""
echo "Checking PHP extensions..."
REQUIRED_EXTENSIONS=("mysqli" "pdo_mysql" "gd" "mbstring" "curl" "zip" "xml")
MISSING_EXTENSIONS=()

for ext in "${REQUIRED_EXTENSIONS[@]}"; do
    if php -m | grep -q "$ext"; then
        echo -e "${GREEN}✓ $ext${NC}"
    else
        echo -e "${YELLOW}✗ $ext (missing)${NC}"
        MISSING_EXTENSIONS+=("$ext")
    fi
done

if [ ${#MISSING_EXTENSIONS[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}Some PHP extensions are missing.${NC}"
    echo "You may need to install them manually or reinstall PHP with extensions:"
    echo "brew install php@8.3"
fi

# Check MySQL/MariaDB
echo ""
if command -v mysql &> /dev/null || command -v mariadb &> /dev/null; then
    echo -e "${GREEN}✓ MySQL/MariaDB is installed${NC}"
    DB_INSTALLED=true
else
    echo -e "${YELLOW}MySQL/MariaDB is not installed${NC}"
    echo ""
    read -p "Do you want to install MariaDB? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Installing MariaDB..."
        brew install mariadb
        brew services start mariadb
        echo -e "${GREEN}✓ MariaDB installed and started${NC}"
        DB_INSTALLED=true
    else
        DB_INSTALLED=false
    fi
fi

# Check Apache
if command -v httpd &> /dev/null || command -v apache2 &> /dev/null; then
    echo -e "${GREEN}✓ Apache is available${NC}"
else
    echo -e "${YELLOW}Apache is not found. You can use PHP's built-in server for testing.${NC}"
fi

# Download Chamilo
echo ""
echo "========================================="
echo "Downloading Chamilo"
echo "========================================="
echo ""

CHAMILO_DIR="chamilo"

if [ -d "$CHAMILO_DIR" ]; then
    echo -e "${YELLOW}Chamilo directory already exists.${NC}"
    read -p "Do you want to remove it and download fresh? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$CHAMILO_DIR"
    else
        echo "Skipping download. Using existing directory."
        SKIP_DOWNLOAD=true
    fi
fi

if [ "$SKIP_DOWNLOAD" != true ]; then
    echo "Please download Chamilo manually:"
    echo "1. Visit: https://chamilo.org/en/download/"
    echo "2. Download the latest stable version"
    echo "3. Extract it to: $(pwd)/$CHAMILO_DIR"
    echo ""
    echo "OR use git to clone the repository:"
    echo "  git clone https://github.com/chamilo/chamilo-lms.git $CHAMILO_DIR"
    echo ""
    read -p "Press Enter after you've downloaded/extracted Chamilo..."
fi

# Set permissions
if [ -d "$CHAMILO_DIR" ]; then
    echo ""
    echo "Setting file permissions..."
    cd "$CHAMILO_DIR"
    
    # Make directories writable
    mkdir -p app/cache app/config web/uploads var
    chmod -R 755 .
    chmod -R 777 app/cache app/config web/uploads var 2>/dev/null || {
        echo -e "${YELLOW}Note: Some permission changes may require sudo${NC}"
    }
    
    cd ..
    echo -e "${GREEN}✓ Permissions set${NC}"
fi

# Create database setup instructions
if [ "$DB_INSTALLED" = true ]; then
    echo ""
    echo "========================================="
    echo "Database Setup"
    echo "========================================="
    echo ""
    echo "To create the database, run:"
    echo ""
    echo "  mysql -u root -p"
    echo ""
    echo "Then execute:"
    echo "  CREATE DATABASE chamilo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo "  CREATE USER 'chamilo_user'@'localhost' IDENTIFIED BY 'your_secure_password';"
    echo "  GRANT ALL PRIVILEGES ON chamilo_db.* TO 'chamilo_user'@'localhost';"
    echo "  FLUSH PRIVILEGES;"
    echo "  EXIT;"
    echo ""
fi

# Final instructions
echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start PHP built-in server (for quick testing):"
echo "   cd $CHAMILO_DIR && php -S localhost:8000"
echo ""
echo "2. Or configure Apache to point to:"
echo "   $(pwd)/$CHAMILO_DIR"
echo ""
echo "3. Open your browser and navigate to:"
echo "   http://localhost:8000"
echo ""
echo "4. Follow the Chamilo installation wizard"
echo ""
echo "For detailed instructions, see README.md"
echo ""
echo -e "${GREEN}Happy teaching! 🎓${NC}"
