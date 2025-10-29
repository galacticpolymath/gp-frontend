import type {
  DrivePickerElement,
  DrivePickerDocsViewElement,
  DrivePickerElementProps,
  DrivePickerDocsViewElementProps,
} from '@googleworkspace/drive-picker-element';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'drive-picker': React.DetailedHTMLProps<
        React.HTMLAttributes<DrivePickerElement> & DrivePickerElementProps,
        DrivePickerElement
      >;
      'drive-picker-docs-view': React.DetailedHTMLProps<
        React.HTMLAttributes<DrivePickerDocsViewElement> &
          DrivePickerDocsViewElementProps,
        DrivePickerDocsViewElement
      >;
    }
  }

  interface Window {
    Outseta?: {
      logout: () => Promise<void>;
      setMagicLinkIdToken: (idToken: string) => void;
      getUser: () => Promise<Record<string, unknown>>;
      setAccessToken: (token: string | null) => void;
      auth: {
        close: () => Promise<void>;
      };
      on: (
        event: 'logout' | 'redirect' | 'signup',
        callback: (...args: unknown[]) => void | boolean | Promise<void | boolean>
      ) => void;
    };
  }
}