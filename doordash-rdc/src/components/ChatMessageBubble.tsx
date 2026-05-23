import React, { useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../theme';
import { LinkedText } from '../utils/chatLinks';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import type { ChatMessage } from '../hooks/useOrderChat';

type Props = {
  message: ChatMessage;
  isMine: boolean;
  formatTime: (date: Date) => string;
};

export function ChatMessageBubble({ message, isMine, formatTime }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const bubbleStyle = [
    styles.bubble,
    isMine ? styles.bubbleMine : styles.bubbleOther,
  ];

  const textStyle = isMine ? styles.textMine : styles.textOther;
  const linkStyle = isMine ? styles.linkMine : styles.linkOther;

  const openMedia = () => {
    if (message.mediaUrl) {
      Linking.openURL(message.mediaUrl).catch(() => undefined);
    }
  };

  let body: React.ReactNode = null;

  if (message.type === 'image' && message.mediaUrl) {
    body = (
      <TouchableOpacity onPress={() => setPreviewOpen(true)} activeOpacity={0.9}>
        <Image source={{ uri: message.mediaUrl }} style={styles.image} resizeMode="cover" />
        {message.text ? (
          <LinkedText text={message.text} style={[textStyle, styles.caption]} linkStyle={linkStyle} />
        ) : null}
      </TouchableOpacity>
    );
  } else if (message.type === 'video' && message.mediaUrl) {
    body = (
      <TouchableOpacity style={styles.videoCard} onPress={openMedia} activeOpacity={0.85}>
        <Ionicons name="play-circle" size={48} color={isMine ? '#fff' : COLORS.primary} />
        <Text style={textStyle}>Vidéo · Appuyer pour lire</Text>
        {message.text ? (
          <LinkedText text={message.text} style={[textStyle, styles.caption]} linkStyle={linkStyle} />
        ) : null}
      </TouchableOpacity>
    );
  } else if (message.type === 'audio' && message.mediaUrl) {
    body = (
      <VoiceMessagePlayer
        uri={message.mediaUrl}
        mediaMeta={message.mediaMeta as Record<string, unknown> | null}
        isMine={isMine}
      />
    );
  } else if (message.type === 'link' && (message.text || message.mediaUrl)) {
    const url = message.mediaUrl || message.text || '';
    body = (
      <TouchableOpacity onPress={() => Linking.openURL(url).catch(() => undefined)}>
        <Text style={[textStyle, styles.linkPreview]} numberOfLines={2}>
          🔗 {url}
        </Text>
        {message.text && message.text !== url ? (
          <LinkedText text={message.text} style={[textStyle, styles.caption]} linkStyle={linkStyle} />
        ) : null}
      </TouchableOpacity>
    );
  } else {
    body = (
      <LinkedText
        text={message.text || ''}
        style={textStyle}
        linkStyle={linkStyle}
      />
    );
  }

  return (
    <View style={[styles.wrap, isMine ? styles.wrapMine : styles.wrapOther]}>
      <View style={bubbleStyle}>{body}</View>
      <Text style={[styles.time, isMine ? styles.timeMine : styles.timeOther]}>
        {formatTime(message.createdAt)}
      </Text>

      <Modal visible={previewOpen} transparent animationType="fade" onRequestClose={() => setPreviewOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPreviewOpen(false)}>
          {message.mediaUrl ? (
            <Image source={{ uri: message.mediaUrl }} style={styles.modalImage} resizeMode="contain" />
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: '82%', marginBottom: SPACING.sm },
  wrapMine: { alignSelf: 'flex-end' },
  wrapOther: { alignSelf: 'flex-start' },
  bubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  bubbleMine: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: BORDER_RADIUS.xs,
  },
  bubbleOther: {
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomLeftRadius: BORDER_RADIUS.xs,
  },
  textMine: { color: COLORS.background, fontSize: FONT_SIZES.md },
  textOther: { color: COLORS.text, fontSize: FONT_SIZES.md },
  linkMine: { color: '#E0F2FE' },
  linkOther: { color: COLORS.primary },
  caption: { marginTop: SPACING.xs, fontSize: FONT_SIZES.sm },
  time: { fontSize: FONT_SIZES.xs, marginTop: 4 },
  timeMine: { color: COLORS.textLight, textAlign: 'right' },
  timeOther: { color: COLORS.textLight },
  image: { width: 220, height: 220, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.xs },
  videoCard: { alignItems: 'center', gap: SPACING.xs, minWidth: 180 },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  linkPreview: { textDecorationLine: 'underline' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: { width: '92%', height: '80%' },
});
