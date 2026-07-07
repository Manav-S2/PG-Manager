import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Linking, Platform, Text } from 'react-native';

type Props = Omit<ComponentProps<typeof Text>, 'onPress'> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Text
      {...rest}
      onPress={async () => {
        if (Platform.OS !== 'web') {
          // Open the link in an in-app browser on native.
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        } else {
          // Open in a new tab / default browser on web.
          Linking.openURL(href);
        }
      }}
    />
  );
}
