# Configuration Setup

This directory contains configuration files for default data that should not be versioned in Git.

## Setup Instructions

1. Copy `defaultData.example.js` to `defaultData.js`:
   ```bash
   cp defaultData.example.js defaultData.js
   ```

2. Edit `defaultData.js` with your personal information:
   - Employee data (name, ABN, BSB, account details)
   - Company data (business name, address)
   - Default cleaning selections

## Security Note

The `defaultData.js` file is excluded from Git versioning to keep your personal and business information private. Never commit this file to the repository.

## File Structure

- `defaultData.example.js` - Template file with example data (versioned)
- `defaultData.js` - Your personal configuration (NOT versioned)
- `README.md` - This documentation file