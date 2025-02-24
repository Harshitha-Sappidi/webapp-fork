# AWS Configuration Variables
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_profile" {
  default = "dev"
}

variable "source_ami" {
  type    = string
  default = "ami-04b4f1a9cf54c11d0"
}
variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "ssh_username" {
  type    = string
  default = "ubuntu"
}

variable "subnet_id" {
  type    = string
  default = "subnet-0bb9ff8cf8269833b"
}

variable "ami_description" {
  type    = string
  default = "Assignment 4 image creation"
}

# AWS-specific volume configuration
variable "device_name" {
  type    = string
  default = "/dev/sda1"
}

variable "volume_size" {
  type    = number
  default = 25
}

variable "volume_type" {
  type    = string
  default = "gp2"
}


# GCP Configuration Variables
variable "gcp_project" {
  type    = string
  default = "webapp-project-451720"
}

variable "gcp_region" {
  type    = string
  default = "us-east1"
}

variable "gcp_zone" {
  type    = string
  default = "us-east1-b"
}

variable "gcp_image_family" {
  type    = string
  default = "ubuntu-2204-lts"
}

variable "gcp_machine_type" {
  type    = string
  default = "e2-standard-2"
}

variable "gcp_disk_size" {
  type    = number
  default = 25
}

variable "gcp_disk_type" {
  type    = string
  default = "pd-standard"
}
