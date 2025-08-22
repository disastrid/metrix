# Tooltip and UI Text Configuration

## Overview
All tooltip text and user-facing messages in the dashboard application are now abstracted to a JSON configuration file, making them easily editable without digging through JavaScript code.

## Configuration File
**Location**: `/public/data/tooltips.json`

## Structure

### Tooltips
These are the informational tooltips that appear when hovering over info icons in the settings modal:

```json
{
  "numberOfGroups": "Participants will be randomly divided into this many groups",
  "randomUsernames": "Automatically assign random usernames to participants for anonymity",
  "displayUsernames": "Show participant usernames during breaks between study segments",
  "numberOfSegments": "How many segments will this study be divided into"
}
```

### UI Messages
These are various user-facing messages throughout the application:

```json
{
  "messages": {
    "createStudyPrompt": "Enter study name:",
    "failedToLoadStudies": "Failed to load studies",
    "failedToLoadStudiesSubtext": "Please try refreshing the page",
    "failedToDeleteStudy": "Failed to delete study",
    "failedToCreateStudy": "Failed to create study",
    "noCurrentStudies": "No current studies",
    "noCurrentStudiesSubtext": "Create your first study to get started",
    "noCompletedStudies": "No completed studies",
    "noCompletedStudiesSubtext": "No completed studies yet"
  }
}
```

### Delete Actions
Special messages for delete operations:

```json
{
  "deleteWarning": "This will permanently delete this study and all settings and associated data. You will not be able to undo this action",
  "deleteConfirmation": "Are you sure you want to delete this study? This action cannot be undone."
}
```

## How to Edit

1. **Edit the JSON file**: Open `/public/data/tooltips.json` in any text editor
2. **Modify text**: Change any message text as needed
3. **Save the file**: Changes take effect immediately - just refresh the page

## Example Edits

### Changing a tooltip:
```json
// Before
"numberOfGroups": "Participants will be randomly divided into this many groups"

// After
"numberOfGroups": "Set how many groups participants will be randomly assigned to"
```

### Changing an error message:
```json
// Before
"failedToCreateStudy": "Failed to create study"

// After  
"failedToCreateStudy": "Unable to create study - please try again"
```

## Benefits

✅ **No code changes needed** - Edit text without touching JavaScript files  
✅ **Centralized management** - All text in one place  
✅ **Easy maintenance** - Quick to find and update any user-facing text  
✅ **Consistent messaging** - Ensures uniform language across the application  
✅ **Translation ready** - Structure supports future internationalization

## Technical Implementation

The system works by:
1. Loading the JSON file when the page loads (`loadTooltips()` function)
2. Storing all text in a global `tooltips` object
3. Referencing text via `tooltips.propertyName` or `tooltips.messages.propertyName`
4. Dynamic insertion into HTML when modals are created

This ensures all text is loaded before any UI elements that reference it are created.

## Default Study Settings

When creating a new study, the following default values are applied:

- **Number of groups**: 1
- **Generate random usernames**: ✅ Checked (enabled)
- **Display usernames between segments**: ✅ Checked (enabled)  
- **Number of segments**: 3

These defaults can be modified by updating the `createStudy()` function in `/public/js/dashboard.js`.
