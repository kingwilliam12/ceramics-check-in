# Toast Component

A flexible and customizable toast notification system for React Native applications.

## Features

- Multiple toast types: success, error, info, warning, and default
- Customizable position: top, bottom, or center
- Auto-dismissal with progress indicator
- Swipe to dismiss
- Custom icons and styling
- Support for actions and callbacks
- Smooth animations
- TypeScript support

## Installation

The Toast component is included in the main components package. No additional installation is required.

## Usage

### 1. Wrap your app with ToastProvider

```jsx
import { ToastProvider } from '@components';

function App() {
  return (
    <ToastProvider>
      {/* Your app content */}
    </ToastProvider>
  );
}
```

### 2. Use the useToast hook to show toasts

```jsx
import { useToast } from '@components';

function MyComponent() {
  const { showToast } = useToast();

  const handleButtonPress = () => {
    showToast('Operation completed successfully!', {
      type: 'success',
      duration: 3000,
      position: 'top',
    });
  };

  return (
    <Button onPress={handleButtonPress}>
      Show Toast
    </Button>
  );
}
```

## API

### ToastProvider

A context provider that manages toast notifications.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | ReactNode | Yes | - | Your application content |

### useToast()

A hook that provides methods to show and hide toasts.

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| showToast | `(message: string, options?: ToastOptions) => string` | Shows a toast with the given message and options. Returns the toast ID. |
| hideToast | `(id: string) => void` | Hides the toast with the given ID. |
| hideAllToasts | `() => void` | Hides all visible toasts. |

### ToastOptions

Options for customizing the toast appearance and behavior.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| type | 'success' \| 'error' \| 'info' \| 'warning' \| 'default' | 'default' | The type of toast |
| position | 'top' \| 'bottom' \| 'center' | 'top' | The position of the toast |
| duration | number | 3000 | Duration in milliseconds before the toast is automatically closed (0 to disable) |
| swipeToClose | boolean | true | Whether the toast can be dismissed by swiping |
| offset | number | 16 | The offset from the top/bottom of the screen (in pixels) |
| style | StyleProp<ViewStyle> | {} | Custom styles for the toast container |
| textStyle | StyleProp<TextStyle> | {} | Custom styles for the text |
| icon | string | '' | Custom icon name (overrides the default icon for the type) |
| iconLibrary | string | 'material-community' | Custom icon library |
| iconSize | number | 24 | Custom icon size |
| onPress | () => void | - | Callback when the toast is pressed |
| onClose | () => void | - | Callback when the toast is closed |
| showStatusBar | boolean | false | Whether to show the status bar when the toast is visible (Android only) |
| animationDuration | number | 300 | The animation duration in milliseconds |
| numberOfLines | number | 2 | The number of lines to allow for the text |
| showProgress | boolean | false | Whether to show a progress bar that indicates the remaining time |
| progressColor | string | 'rgba(255, 255, 255, 0.7)' | The color of the progress bar |
| testID | string | 'toast' | Test ID for testing purposes |

## Examples

### Basic Usage

```jsx
const { showToast } = useToast();

// Show a success toast
showToast('Operation completed successfully!', { type: 'success' });

// Show an error toast with custom duration
showToast('An error occurred!', { 
  type: 'error',
  duration: 5000 
});

// Show a toast with a custom icon
showToast('Custom icon', { 
  icon: 'star',
  iconLibrary: 'material-community'
});
```

### With Action

```jsx
const { showToast } = useToast();

const handleUndo = () => {
  // Handle undo action
};

showToast('Item deleted', {
  type: 'info',
  onPress: handleUndo,
  duration: 5000,
});
```

### Custom Position

```jsx
const { showToast } = useToast();

// Show toast at the bottom
showToast('This is a bottom toast', {
  position: 'bottom',
  offset: 32, // 32px from bottom
});
```

### With Progress Bar

```jsx
const { showToast } = useToast();

// Show toast with progress bar
showToast('Uploading file...', {
  type: 'info',
  showProgress: true,
  duration: 5000,
  progressColor: '#4CAF50',
});
```

## Styling

You can customize the appearance of toasts by providing custom styles:

```jsx
showToast('Custom styled toast', {
  style: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    padding: 16,
  },
  textStyle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
```

## Best Practices

1. **Keep it brief**: Toast messages should be short and to the point.
2. **Use appropriate types**: Use the appropriate toast type to indicate the nature of the message.
3. **Don't overuse**: Avoid showing too many toasts in a short period.
4. **Provide actions when needed**: For important actions, consider adding an action button.
5. **Test on different devices**: Ensure the toast is visible and properly positioned on different screen sizes.
