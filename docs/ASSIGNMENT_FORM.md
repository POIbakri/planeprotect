# Assignment Form Feature

This document outlines the implementation of the Assignment Form feature for Plane Protect Limited's flight compensation claim system.

## Overview

The Assignment Form serves as a legal document where clients formally assign their compensation rights to Plane Protect Limited. This is a critical legal requirement that:

1. Establishes Plane Protect's legal authority to represent clients
2. Enables direct communication with airlines on clients' behalf
3. Ensures clear documentation of the client-agent relationship
4. Provides evidence of authorization for legal proceedings if needed

## Database Schema

The feature adds two columns to the `claims` table:

- `assignment_form_signed` (boolean): Indicates whether a client has signed an assignment form
- `assignment_form_url` (text): URL path to the signed assignment form PDF

## User Experience Flow

1. After submitting a claim, users are automatically redirected to the Assignment Form page
2. User information (name, booking reference) is pre-filled from the claim data
3. Users complete their address and digitally sign the form
4. Upon submission:
   - The form is generated as a PDF document
   - The user receives a download of the signed document
   - The document is stored in the `claim-documents` storage bucket
   - The claim record is updated with the form's signed status and URL

## Component/File Overview

- `AssignmentForm.tsx`: The main component for displaying and handling the assignment form
- `SignaturePad`: Sub-component that handles the digital signature functionality
- `api/claims.ts`: API functions for uploading and handling assignment forms
- `UserDashboard.tsx`: Updated to show assignment form status with "Signed" badge
- `AdminDashboard.tsx`: Updated to show and filter claims by assignment form status

## Database Migration

Run the migration script to add the required columns:

```bash
npx supabase db push
```

This applies the migration in `supabase/migrations/20230812000000_add_assignment_form_fields.sql`.

## Permissions

The feature respects the existing permission model:
- Users can only view and interact with their own assignment forms
- Admins can view all assignment forms submitted by any user
- Assignment forms are stored in the same `claim-documents` bucket as other claim files

## Future Improvements

Potential enhancements to consider:
- Email notification when an assignment form is signed
- Ability for admins to request a new signature if there are issues with the original
- Integration with legal CRM systems for case management
- Automated assignment form verification against provided ID documents

## Technical Requirements

The feature requires the following npm packages:
- html2canvas (for converting the form to an image)
- jsPDF (for PDF generation)
- date-fns (for date formatting)

Install with:
```bash
npm install html2canvas jspdf date-fns --save
``` 