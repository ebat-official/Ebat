# Authentication Hooks

## useAuthAction

A reusable hook that provides authentication wrapper for any action. Automatically shows login modal if user is not authenticated and executes the action once they sign in.

### Features

- **Automatic Authentication Check**: Checks if user is authenticated before executing actions
- **Seamless UX**: Shows login modal and executes pending action after successful login
- **Flexible Configuration**: Customizable messages, success/error handlers
- **Type Safe**: Full TypeScript support
- **Reusable**: Can be used with any action that requires authentication
- **Self-Contained**: Includes the LoginModal component automatically

### Basic Usage

```tsx
import { useAuthAction } from "@/hooks/useAuthAction";

function MyComponent() {
  const { executeAction, renderLoginModal } = useAuthAction({
    requireAuth: true,
    authMessage: "Please sign in to save your progress",
    onSuccess: () => toast.success("Saved successfully!"),
    onError: (error) => toast.error("Failed to save"),
  });

  const handleSave = () => {
    executeAction(async () => {
      await saveToDatabase();
    });
  };

  return (
    <>
      <button onClick={handleSave}>Save Progress</button>
      {renderLoginModal()}
    </>
  );
}
```

### Advanced Usage

#### Conditional Authentication

```tsx
const { executeAction, renderLoginModal } = useAuthAction({
  requireAuth: userHasPremiumFeature, // Only require auth for premium features
  authMessage: "Premium feature requires authentication",
});
```

#### Different Actions with Different Auth Requirements

```tsx
// Action that doesn't require authentication
const { executeAction: executePublicAction } = useAuthAction({
  requireAuth: false,
});

// Action that requires authentication
const { executeAction: executePrivateAction, renderLoginModal } = useAuthAction({
  requireAuth: true,
  authMessage: "Please sign in to access this feature",
});

const handlePublicAction = () => {
  executePublicAction(async () => {
    await publicApiCall();
  });
};

const handlePrivateAction = () => {
  executePrivateAction(async () => {
    await privateApiCall();
  });
};

return (
  <>
    <button onClick={handlePublicAction}>Public Action</button>
    <button onClick={handlePrivateAction}>Private Action</button>
    {renderLoginModal()}
  </>
);
```

#### With Error Handling

```tsx
const { executeAction, renderLoginModal } = useAuthAction({
  requireAuth: true,
  onSuccess: () => {
    toast.success("Action completed successfully!");
    // Additional success logic
  },
  onError: (error) => {
    console.error("Action failed:", error);
    toast.error("Action failed. Please try again.");
    // Additional error handling
  },
});
```

### API Reference

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `requireAuth` | `boolean` | `false` | Whether the action requires authentication |
| `authMessage` | `string` | `"Please sign in to continue"` | Message shown in login modal |
| `onSuccess` | `() => void` | `undefined` | Callback when action completes successfully |
| `onError` | `(error: unknown) => void` | `undefined` | Callback when action fails |

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `executeAction` | `(action: () => Promise<void> \| void) => Promise<void>` | Function to execute actions with auth check |
| `isAuthenticated` | `boolean` | Whether user is currently authenticated |
| `showLoginModal` | `boolean` | Whether login modal should be shown |
| `closeLoginModal` | `() => void` | Function to close login modal |
| `loginMessage` | `string` | Message to show in login modal |
| `renderLoginModal` | `() => React.ReactNode` | Function that renders the LoginModal component |

### How It Works

1. **Action Execution**: When `executeAction` is called, it first checks if authentication is required
2. **Auth Check**: If auth is required and user is not authenticated, it stores the action and shows login modal
3. **Login Flow**: User completes login process through the modal
4. **Auto Execution**: Once authenticated, the pending action is automatically executed
5. **Success/Error**: Appropriate callbacks are called based on the result

### Best Practices

1. **Use Descriptive Messages**: Provide clear, context-specific messages for better UX
2. **Handle Errors**: Always provide error handlers for better debugging
3. **Conditional Auth**: Use `requireAuth: false` for actions that don't need authentication
4. **Reuse**: Create reusable action functions that can be passed to `executeAction`
5. **Loading States**: Handle loading states within your action functions
6. **Always Render Modal**: Always call `{renderLoginModal()}` in your component's return statement

### Migration from Manual Auth

**Before (Manual):**
```tsx
const [loginModalMessage, setLoginModalMessage] = useState("");

const handleAction = async () => {
  if (!session) {
    setLoginModalMessage("Please sign in to continue");
    return;
  }
  
  try {
    await performAction();
  } catch (error) {
    console.error(error);
  }
};

return (
  <>
    <button onClick={handleAction}>Action</button>
    {loginModalMessage && (
      <LoginModal
        closeHandler={() => setLoginModalMessage("")}
        message={loginModalMessage}
      />
    )}
  </>
);
```

**After (with useAuthAction):**
```tsx
const { executeAction, renderLoginModal } = useAuthAction({
  requireAuth: true,
  authMessage: "Please sign in to continue",
});

const handleAction = () => {
  executeAction(async () => {
    await performAction();
  });
};

return (
  <>
    <button onClick={handleAction}>Action</button>
    {renderLoginModal()}
  </>
);
``` 