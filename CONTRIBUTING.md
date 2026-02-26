# Contributing to rn-tailwind-tokens

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/react-native-tailwind-design-tokens.git
   cd react-native-tailwind-design-tokens
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development

### Building

```bash
# Build the package
npm run build

# Watch mode for development
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Run tests once
npm run test:run
```

### Linting

```bash
# Run ESLint
npm run lint

# Type checking
npm run typecheck
```

## Project Structure

```
src/
├── cli/           # CLI commands
├── core/          # Core functionality (TokenManager, defaults)
├── generators/    # Style generation
├── parsers/       # Token parsing (JSON, Tailwind, Figma)
├── watch/         # File watching
├── types/         # TypeScript types
├── index.ts       # Main entry point
└── react-native.ts # React Native specific exports

examples/          # Example files
```

## Making Changes

### Code Style

- Use TypeScript for all source files
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Keep functions focused and modular

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add support for custom token transformers
fix: handle nested color tokens correctly
docs: update README with Figma sync examples
```

### Pull Requests

1. Ensure all tests pass
2. Update documentation if needed
3. Add tests for new features
4. Keep PRs focused on a single change
5. Fill out the PR template

## Adding New Features

### Adding a New Token Type

1. Add the type definition in `src/types/index.ts`
2. Add parsing logic in `src/parsers/tokenParser.ts`
3. Add generation logic in `src/generators/styleGenerator.ts`
4. Add default values in `src/core/defaults.ts`
5. Update tests and documentation

### Adding a New Parser

1. Create a new file in `src/parsers/`
2. Export from `src/parsers/index.ts`
3. Integrate with TokenManager if needed
4. Add CLI support if appropriate

## Testing

- Write unit tests for new functionality
- Test edge cases
- Ensure backward compatibility

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new APIs
- Include code examples where helpful

## Questions?

Open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
