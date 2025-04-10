#!/bin/bash

# Update package list and install necessary dependencies
sudo apt-get update -y
sudo apt-get install -y unzip curl

# Install Node.js and npm (LTS version) for the application
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js and npm installation by checking their versions
node -v
npm -v

# Create a system user for the application (non-login user for security)
sudo useradd -r -s /usr/sbin/nologin -m csye6225

# Setup application directory and extract the webapp
sudo mkdir -p /opt/csye6225
sudo unzip /tmp/webapp.zip -d /opt/csye6225

# Change ownership and permissions for the application folder
# The 'csye6225' user should own the directory for security, and read/write/execute permissions are set
echo "Changing Permissions"
sudo chown -R csye6225:csye6225 /opt/csye6225/webapp
sudo chmod -R 755 /opt/csye6225/webapp

# Clean up by removing the webapp.zip file after extraction
rm /tmp/webapp.zip 

# Install Node.js dependencies for the webapp
cd /opt/csye6225/webapp || exit  # Exit if directory doesn't exist
sudo -u csye6225 npm install

# Install AWS CLI manually (if missing)
if ! command -v aws &> /dev/null; then
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    chmod +x ./aws/install
    sudo ./aws/install
    rm -rf awscliv2.zip aws
fi

# Move the service configuration file to systemd's directory and reload the systemd manager to recognize it
sudo mv /tmp/webapp.service /etc/systemd/system
sudo systemctl daemon-reload


# Install and Start CloudWatch Agent
echo "CloudWatch Agent Installing..."
cd /tmp || exit
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo -E dpkg -i amazon-cloudwatch-agent.deb
sudo systemctl enable amazon-cloudwatch-agent
sudo systemctl start amazon-cloudwatch-agent
sudo systemctl status amazon-cloudwatch-agent

# Restart, enable, and check the status of the webapp service
sudo systemctl restart webapp.service
sudo systemctl enable webapp.service
sudo systemctl status webapp.service
