# Project Rules - Inventia

## General Architecture

### Technology Stack

-   **Backend**: Laravel (PHP)
-   **Frontend**: Inertia.js with React
-   **UI Components**: shadcn/ui
-   **Routing**: Laravel Wayfinder (Controller.method convention)

### Development Principles

-   **SOLID**: Apply single responsibility, open/closed, Liskov substitution, interface segregation, and dependency inversion principles
-   **DRY**: Don't repeat code, create reusable components and functions
-   **Actions**: Use Actions for specific business logic
-   **Pipelines**: For complex flows that require multiple steps

## Backend Structure (Laravel)

### Controllers

-   Controllers should be thin and delegate logic to Actions
-   Follow the `Controller.method` convention for routes
-   Use Laravel Wayfinder for handling routes from the frontend

### Actions

-   Each Action should be specific to a single task
-   Must be reusable in different contexts
-   Required structure:
    ```php
    abstract class BaseAction
    {
        abstract public static function execute(array $params): mixed;
    }
    ```
-   Location: `app/Http/Actions/`

### Pipelines

-   Use when the flow is very complex or requires many steps
-   Each pipeline step should be an independent class
-   Location: `app/Pipelines/`

### Models

-   Use Eloquent ORM
-   Define relationships clearly
-   Use Enums for states and types
-   Location: `app/Models/`

### Enums

-   Use for constant values and states
-   Location: `app/Enums/`

## Frontend Structure (React + Inertia.js)

### Page Organization

-   Each page should reside in its own folder according to its domain
-   Required structure:
    ```
    pages/
    ├── domain/
    │   ├── components/
    │   ├── hooks/
    │   ├── utils/
    │   └── index.tsx
    ```

### Components

-   Use shadcn/ui as base
-   Designs should be made with shadcn almost entirely
-   Create reusable components in `components/`
-   Domain-specific components in `pages/domain/components/`
-   Do not import `card.tsx` within `PageSection.tsx` as it already includes it

### Routing

-   All routes from frontend to backend must use Laravel Wayfinder
-   Follow the `Controller.method` convention for routes (this applies to frontend with Wayfinder)
-   Example: `route('subscription.create')` → `SubscriptionController@create`

### Hooks

-   Create custom hooks for reusable logic
-   Location: `hooks/` (global) or `pages/domain/hooks/` (specific)

### Utils

-   Reusable utility functions
-   Location: `lib/` (global) or `pages/domain/utils/` (specific)

## Code Conventions

### Languages

-   **Code**: Everything in English (variables, functions, classes, comments)
-   **UI/UX**: Spanish for texts shown to the user
-   **Documentation**: Spanish
-   **Text Style**: All texts must be friendly, persuasive, and professional

### Naming

-   **PHP**: PascalCase for classes, camelCase for methods and variables
-   **JavaScript/TypeScript**: PascalCase for components, camelCase for functions and variables
-   **Files**: kebab-case for component files, PascalCase for React components

### File Structure

```
app/
├── Http/
│   ├── Actions/
│   │   ├── Auth/
│   │   ├── Subscription/
│   │   └── ...
│   ├── Controllers/
│   └── Requests/
├── Models/
├── Enums/
├── Pipelines/
└── Services/

resources/js/
├── components/
├── pages/
│   ├── auth/
│   ├── subscription/
│   └── ...
├── hooks/
├── lib/
└── types/
```

## Best Practices

### Backend

-   Use Form Requests for validation
-   Implement Policies for authorization
-   Use Resources to transform API data
-   Handle errors consistently
-   Do not use Log::info, only log when there is an exception or error in catch blocks

### Frontend

-   Use TypeScript for type safety
-   Implement loading states
-   Handle errors gracefully
-   Implement lazy loading when appropriate

### Database

-   Use migrations for schema changes
-   Create seeders for test data
-   Use factories for testing
-   Implement appropriate indexes

### Testing

-   Write unit tests for Actions
-   Integration tests for Pipelines
-   Component tests for React
-   Use Pest for PHP testing

## Security

-   Never expose or log secrets and keys
-   Never commit secrets to the repository
-   Use appropriate authentication middleware
-   Validate and sanitize all inputs
-   Implement CSRF protection

## Performance

-   Use eager loading to avoid N+1 queries
-   Implement cache where appropriate
-   Optimize database queries
-   Use lazy loading in the frontend
-   Minimize bundle size

## Documentation

-   Document APIs using PHPDoc comments
-   Keep README updated
-   Document complex components
-   Use JSDoc for complex TypeScript functions

## Git

-   Use conventional commits
-   Create branches per feature
-   Do code review before merge
-   Keep commits atomic and descriptive

---

**Note**: These rules should be followed consistently throughout the project to maintain code quality and facilitate maintenance.
