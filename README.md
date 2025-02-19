# 🌐 WebApp

## 🚀 Cloud-Native Web Application

### 🛠️ Technologies Used

- Backend: Node.js, Express.js

- Database: Microsoft SQL Server

### ⚙️ Installation

#### Prerequisites

Ensure you have the following installed on your system:

 - Node.js installed (https://nodejs.org/en)
 - SQL Server installed and running (https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

### 📥 Setup & Running the Application

#### 🔹 Clone the Repository

- git clone (https://github.com/csye6225-HarshithaSappidi/webapp.git)
- cd webapp

#### 🔹 Install Dependencies

- npm install

#### 🔹 Configure Environment Variables
- Create a .env file in the project root and set up your database credentials:
  
  DB_HOST=your-database-host

  DB_PORT=your-database-port

  DB_USER=your-database-user

  DB_PASSWORD=your-database-password

  DB_NAME=your-database-name

  PORT=8080

#### 🔹 Start the Application
- npm run start

#### 🔹 Access the Web Application
- http://localhost:8080/healthz
  
### ⚙️ Connecting the local to the Digital Ocean Droplet

- ssh -i /Users/harshithasappidi/.ssh/id_ed25519 root@xxxxxxxxx
- scp -i /Users/harshithasappidi/.ssh/id_ed25519 webapp.zip root@xxxxxxx:/tmp   
- scp -i /Users/harshithasappidi/.ssh/id_ed25519 setup.sh root@xxxxxxxxx:/tmp

### 🛠 Automating Application Setup with Shell Script

 A shell script (setup.sh) has been added to automate the application setup on an Ubuntu

#### 📝 Running the Setup Script

To execute the setup script inside the Droplet terminal, run the following commands:

- cp /tmp/setup.sh ~/setup.sh

- chmod +x setup.sh

- ./setup.sh

####  🔨 Shell Script Functionality

##### Updates the package lists and upgrades all installed packages.
- sudo apt update && sudo apt upgrade -y

##### Installs MySQL and starts the service.
- sudo apt install mysql-server -y
- sudo systemctl start mysql

##### Creates the sample_db database and configures users and privileges.

echo "Setting up MySQL database and user..."

sudo mysql -u root -p -e "
    CREATE DATABASE IF NOT EXISTS {DB_NAME};
    CREATE USER IF NOT EXISTS '{DB_USER}'@'{DB_HOST}' IDENTIFIED BY '{DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON {DB_NAME}.* TO '{DB_USER}'@'{DB_HOST}';
    FLUSH PRIVILEGES;
"

##### Creates an application group (testgroup) and user (testuser).

- sudo groupadd testgroup
- sudo useradd -m -g testgroup -s /bin/bash testuser

#####  Sets up the application directory at /opt/csye6225 with correct permissions.

- sudo mkdir -p /opt/csye6225 

- sudo chown testuser:testgroup /opt/csye6225 

- sudo chmod 750 /opt/csye6225 

- sudo apt update 

- sudo apt install unzip -y

- sudo unzip /tmp/webapp.zip -d /opt/csye6225

- sudo chown -R testuser:testgroup /opt/csye6225 

##### Installs necessary dependencies including unzip, npm, and required Node.js modules (express, nodemon, mysql, sequelize, dotenv).

- npm install express nodemon mysql sequelize dotenv

##### Runs API tests and starts the application.
- npm run test & npm run start

### Implementing CI with GitHub Actions for a Web App

#### Step 1: Create a GitHub Actions Workflow
- Go to .github/workflows/, create file

#### Step 2: Ensure PRs Require Successful CI Runs
- Go to your GitHub repository Settings → Branches.
- Under Branch Protection Rules, click Add Rule.
  
#### Step 3: Enforce CI Checks on Pull Requests
- Whenever a developer raises a PR, the GitHub Actions workflow will automatically run the tests.