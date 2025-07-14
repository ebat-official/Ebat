# Copilot Instructions for ebat

## Project Overview

This is a Next.js 15 TypeScript application called "ebat" that provides a platform for coding challenges, tutorials, questions and community interaction. The project uses modern web technologies and follows specific coding standards.

## Technology Stack

- **Framework**: Next.js 15 with App Router (React 19)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 with custom CSS variables
- **UI Components**: shadcn/ui components with Radix UI primitives
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with admin capabilities
- **State Management**: Zustand for client state, React Query for server state
- **Package Manager**: pnpm
- **Code Formatting**: Biome (not Prettier)
- **Deployment**: Vercel

## Coding Standards

### Code Formatting

- Use **tabs for indentation** (not spaces)
- Use double quotes for strings in JavaScript/TypeScript
- Use Biome for code formatting, not Prettier
- Run `pnpm format` to format code

### Import Organization

- Always use absolute imports with `@/` prefix for internal modules
- Group imports: external libraries first, then internal modules
- Use the automatic import organization provided by Biome

### Component Structure

- Use TypeScript interfaces for all component props
- Prefer functional components with hooks
- Use `"use client"` directive only when necessary (client components)
- Export default for page components, named exports for utility components

### File Naming

- Use kebab-case for file names (e.g., `user-profile.tsx`)
- Use PascalCase for component files (e.g., `UserProfile.tsx`)
- Use camelCase for utility files (e.g., `authClient.ts`)

## UI Components & Design System

### shadcn/ui Components

- Always use shadcn/ui components from `@/components/ui/*`
- Common components: Button, Dialog, AlertDialog, Table, Card, Input, Label, Badge, Avatar
- Import paths: `import { Button } from "@/components/ui/button"`

### Dialog and Modal Patterns

- Use `Dialog` for regular modals
- Use `AlertDialog` for confirmations (delete, ban, etc.)
- Always include proper accessibility attributes
- Use consistent dialog structure with DialogHeader, DialogContent, DialogFooter

### Table Implementation

- Use shadcn `Table` components for data tables
- Implement sorting with visual indicators (ArrowUpDown icon)
- Use proper table structure: TableHeader, TableBody, TableRow, TableCell
- Include loading states and empty states

### Form Patterns

- Use react-hook-form with zod validation
- Leverage shadcn Form components for consistent styling
- Always include proper error handling and validation feedback

## Authentication & Authorization

### Better Auth Integration

- Use `authClient` from `@/lib/auth-client`
- Session management with `useSession()` hook
- Admin functions available through `authClient.admin.*`
- Role-based access control with `UserRole` enum

### User Roles

- `USER`: Standard user role
- `ADMIN`: Administrator with full access

## Database & API

### Drizzle ORM

- Schema definitions in `@/db/schema/*`
- Use proper TypeScript types from schema
- Leverage Drizzle's type safety

### Server Actions

- Define server actions in `@/actions/*`
- Use proper error handling with try-catch
- Return consistent response formats

## State Management

### React Query

- Use for server state management
- Custom hooks in `@/hooks/query/*`
- Proper cache invalidation and optimistic updates

### Zustand

- Use for client-side state
- Store definitions in `@/store/*`

## Error Handling

### Toast Notifications

- Use `sonner` for toast notifications
- Import: `import { toast } from "sonner"`
- Consistent success/error messaging

### Error Patterns

- Use custom error utilities from `@/utils/errors`
- Implement proper error boundaries
- Always handle async errors with try-catch

## Performance & Best Practices

### Code Splitting

- Use dynamic imports for heavy components
- Implement proper loading states

### Image Optimization

- Use Next.js Image component for all images
- Proper alt texts for accessibility

### Accessibility

- Include proper ARIA labels
- Implement keyboard navigation
- Use semantic HTML elements

## Development Workflow

### Environment Setup

- Use Node.js with pnpm package manager
- Environment variables in `.env` files
- Database migrations with Drizzle

### Git Workflow

- Use conventional commit messages
- Pre-commit hooks with Husky
- Code formatting with Biome

## Common Patterns

### Loading States

```tsx
{loading ? (
  <Loader2 className="h-4 w-4 animate-spin" />
) : (
  // Content
)}
```

### Confirmation Dialogs

```tsx
<AlertDialog open={showDialog} onOpenChange={setShowDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleAction}>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Table Sorting

```tsx
const [sortField, setSortField] = useState("createdAt");
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

<TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
  <div className="flex items-center">
    Email
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </div>
</TableHead>;
```

## Project-Specific Guidelines

### Admin Features

- Use Better Auth admin client for user management
- Implement proper confirmation dialogs for destructive actions
- Include session management and user impersonation features

### Lexical Editor

- Rich text editor implementation with custom plugins
- Table editing with resize and action menus
- Code highlighting and syntax support

### WebContainer Integration

- Online IDE functionality with file system
- Test execution and submission handling
- Real-time code compilation and preview

## File Structure Patterns

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable components
│   ├── ui/             # shadcn/ui components
│   ├── auth/           # Authentication components
│   ├── shared/         # Shared utility components
│   └── [feature]/      # Feature-specific components
├── lib/                # Utility functions and configurations
├── hooks/              # Custom React hooks
├── actions/            # Server actions
├── db/                 # Database schema and configuration
├── utils/              # Utility functions and constants
└── types/              # TypeScript type definitions
```

When implementing new features, always follow these established patterns and maintain consistency with the existing codebase.
