from textwrap import dedent
import pypandoc

content = dedent(r"""
# AWS Account Creation Homework (Day 12 Preparation)

## Objective

Before the next class, every student must create an AWS account successfully. We will use it for learning AWS deployment concepts.

> **Note:** AWS may require a valid credit/debit card for identity verification. Charges are avoided by staying within the Free Tier and deleting resources after use.

---

# Step 1 - Open AWS

Visit:

https://aws.amazon.com/free/

Click **Create an AWS Account**.

---

# Step 2 - Enter Details

Provide:

- Full Name
- Email Address
- AWS Account Name
- Password

Verify your email using the OTP sent by AWS.

---

# Step 3 - Contact Information

Choose:

- Personal Account

Enter:

- Name
- Address
- Phone Number

Accept the AWS Customer Agreement.

---

# Step 4 - Payment Verification

AWS may ask for a valid credit/debit card to verify your identity.

Complete the verification process.

---

# Step 5 - Phone Verification

Enter your mobile number.

Complete the OTP verification.

---

# Step 6 - Choose Support Plan

Select:

**Basic Support (Free)**

Do **not** select paid support plans.

---

# Step 7 - Login

Open:

https://console.aws.amazon.com/

Login successfully.

---

# Step 8 - Verify Console Access

You should be able to see the AWS Management Console.

Take a screenshot showing:

- Your AWS Console Home Page
- Your Account Name (top-right)

---

# Homework Submission

Submit:

- Screenshot of AWS Console Home Page
- AWS Account Email ID (no password)

---

# Do NOT Create Any Resources Yet

Please do NOT launch:

- EC2
- RDS
- Elastic Beanstalk
- Load Balancers

We will create and remove these together during class.

---

# Next Class Topics

We will cover:

1. AWS Overview
2. EC2
3. Security Groups
4. Docker Deployment
5. Environment Variables
6. S3 File Storage
7. Deploying the FastAPI Application
8. Accessing the Live Application

Come to class with your AWS account ready.
""")

outfile="/mnt/data/AWS_Account_Creation_Homework.md"
pypandoc.convert_text(content, "md", format="md", outputfile=outfile, extra_args=["--standalone"])
print(outfile)