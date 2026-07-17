# Resource Categories Management

This document details the configuration and architecture for resource categories management introduced to dynamically organize shared materials, templates, and libraries.

## 1. Directory & Category Organization
*   **Database Management**: An admin dashboard table lists, creates, modifies, and deletes resource categories.
*   **API Layer**: Category CRUD endpoints are configured in `resource-category.controller.ts` and registered under `/api/admin/resources/categories`.
*   **Category Field Migration**: Modified the resources table to allow categories up to 500 characters, supporting dynamic assignments and multiple custom tags.

## 2. Resource Editor Integration
*   **Dynamic Dropdown**: Both the Admin Resource Editor and the Member-facing Resource Submission forms read the active category catalog from the database, replacing hardcoded dropdown options.
*   **Fallback Resolution**: If a category is deleted, related resources fallback to a default category or prompt reallocation to prevent broken references.
