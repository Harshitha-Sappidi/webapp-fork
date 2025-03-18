# Define required plugins for Amazon and Google Cloud
packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.0.0, <2.0.0"
    }
    google = {
      source  = "github.com/hashicorp/googlecompute"
      version = ">= 1.0.0, <2.0.0"
    }
  }
}

# Amazon EB Source Configuration
source "amazon-ebs" "my-ami" {
  ami_groups      = []
  region          = var.aws_region
  profile         = var.aws_profile
  source_ami      = var.source_ami
  instance_type   = var.instance_type
  ssh_username    = var.ssh_username
  subnet_id       = var.subnet_id
  ami_name        = "csye6225_webapp_${formatdate("YYYY_MM_DD_HH_mm_ss", timestamp())}"
  ami_description = var.ami_description

  # Block device mapping for EC2 volume
  launch_block_device_mappings {
    device_name           = var.device_name
    volume_size           = var.volume_size
    volume_type           = var.volume_type
    delete_on_termination = true
  }
}

# Google Cloud Platform (GCP) Source Configuration
source "googlecompute" "gcp-image" {
  project_id          = var.gcp_project
  region              = var.gcp_region
  zone                = var.gcp_zone
  image_name          = "csye6225-${formatdate("YYYY-MM-DD-hh-mm-ss", timestamp())}"
  machine_type        = var.gcp_machine_type
  disk_size           = var.gcp_disk_size
  disk_type           = var.gcp_disk_type
  ssh_username        = var.ssh_username
  source_image_family = var.gcp_image_family
}

# Build Configuration for provisioning and uploading files
build {
  sources = ["source.amazon-ebs.my-ami", "source.googlecompute.gcp-image"]


  # provisioner "file" {
  #   source      = "./.env"
  #   destination = "/tmp/.env"
  # }

  provisioner "file" {
    source      = "./webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "file" {
    source      = "./webapp.service"
    destination = "/tmp/webapp.service"
  }
  # Execute the setup script to install Node.js, extract the app, and configure it
  provisioner "shell" {
    script = "webapp_setup.sh"
  }
  # Cleanup provisioner to remove unnecessary dependencies
  provisioner "shell" {
    inline = [
      "sudo apt-get remove -y git",
      "sudo apt-get autoremove -y",
      "sudo apt-get clean",
      "sudo rm -rf /usr/bin/git*",
      "sudo rm -rf /usr/lib/git-core"
    ]
  }
}


