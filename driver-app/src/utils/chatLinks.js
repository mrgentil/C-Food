import React from 'react';
import { Linking, StyleSheet, Text } from 'react-native';

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

export function splitTextWithUrls(text) {
  const parts = [];
  let lastIndex = 0;
  let match;
  const re = new RegExp(URL_REGEX.source, 'gi');

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'url', value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: 'text', value: text }];
}

export function LinkedText({ text, style, linkStyle }) {
  const parts = splitTextWithUrls(text || '');

  return (
    <Text style={style}>
      {parts.map((part, index) =>
        part.type === 'url' ? (
          <Text
            key={`${index}-${part.value}`}
            style={[styles.link, linkStyle]}
            onPress={() => Linking.openURL(part.value).catch(() => undefined)}
          >
            {part.value}
          </Text>
        ) : (
          <Text key={`${index}-t`}>{part.value}</Text>
        )
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: { textDecorationLine: 'underline', fontWeight: '600' },
});
