// Workaround for React 19 + React Native types incompatibility
// This is a known issue with Expo SDK 54 and React 19
// See: https://github.com/facebook/react-native/issues/44990
import '@react-native/js-polyfills';

declare module 'react-native' {
  // Fix JSX element type errors
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
}
