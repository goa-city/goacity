# Login & Auth Modernization

This document outlines the authentication changes supporting dual login modes (Email and WhatsApp/Phone) and automated OTP delivery.

## 1. Login Options & UI Modernization
*   **Dual Mode Inputs**: The frontend login form allows users to enter either their registered Email address or their WhatsApp phone number.
*   **Dynamic Instructions**: The help text adjusts based on the input type (e.g. directing users on how to enter their phone number with the country code).
*   **Verification Interface**: Standardized OTP validation fields with automatic focus shift and numeric input enforcement.

## 2. Backend OTP Delivery Workflow
*   **Input Resolution**: The backend resolves the user's input to determine if it is an email address (contains `@`) or a phone number.
*   **Membership Check**: Verifies if the member exists in the database.
*   **Approval Check**: Ensures the member has been approved by checking stream association.
*   **OTP Delivery Channel**:
    - **Email**: OTP is sent via standard email SMTP templates.
    - **WhatsApp**: OTP is sent as a secure WhatsApp message using the registered WhatsApp-Web client.
