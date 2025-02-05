#!/bin/bash


# Update system package lists and upgrade installed packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "Installing MySQL server..."
# Install MySQL server and enable it
sudo apt install mysql-server -y
sudo systemctl enable mysql
sudo systemctl start mysql

# Using the variables from .env to create database
echo "Setting up MySQL database and user..."
sudo mysql -u root -p -e "
    CREATE DATABASE IF NOT EXISTS ${DB_NAME};
    CREATE USER IF NOT EXISTS '${DB_USER}'@'${DB_HOST}' IDENTIFIED BY '${DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'${DB_HOST}';
    FLUSH PRIVILEGES;
"

echo "Creating application group and user..."
# Create a new group for the application and a new user assigned to that group
sudo groupadd testgroup || echo "Group already exists"
sudo useradd -m -g testgroup -s /bin/bash testuser || echo "User already exists"

echo "Setting up application directory..."
# Create the application directory and set appropriate ownership and permissions
sudo mkdir -p /opt/csye6225
sudo chown testuser:testgroup /opt/csye6225
sudo chmod 750 /opt/csye6225

# Ensure unzip is installed before extracting files
echo "Installing unzip package..."
sudo apt install unzip -y

echo "Extracting application files..."
sudo unzip /tmp/webapp.zip -d /opt/csye6225

# Set ownership and permissions for the extracted files
echo "Updating file permissions..."
sudo chown -R testuser:testgroup /opt/csye6225
sudo chmod -R 750 /opt/csye6225

# Navigate to application directory
cd /opt/csye6225/webapp

echo "Installing Node.js dependencies..."
sudo apt install npm -y
npm install express nodemon mysql sequelize dotenv

# Removing the zip file after extraction
echo "Cleaning up temporary files..."
rm /tmp/webapp.zip

# Run tests and start the application
echo "Running tests and starting the application..."
npm run test
npm run start

echo "Setup Completed Successfully!"
