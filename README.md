# Program Configuration

This project demonstrates how to use configurations in Solana programs. It provides example code for the Program Configuration lesson from the Solana Program Optimization course.

## Prerequisites

- Rust and Cargo
- Solana CLI tools
- Anchor CLI
- Node.js and Yarn

## Setup

1. Clone the repository

```bash
   git clone <repository-url>
   cd <project-directory>
```

2. Install dependencies:

```bash
   yarn install
```

3. Build the Anchor project

```bash
   anchor build
```

4. Sync the program ID:

```bash
  anchor keys sync
```

## Running Tests

```bash
anchor test --skip-deploy -- --features "local-testing"
```

## Notes

- Ensure your Solana validator is running locally before running tests.
- The test uses the `@solana-developers/helpers` package for airdropping SOL to test accounts.
- If you encounter any issues, make sure your Anchor.toml and Cargo.toml files are correctly configured for your project.
