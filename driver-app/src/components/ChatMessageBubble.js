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

import { LinkedText } from '../utils/chatLinks';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';

export function ChatMessageBubble({ message, isMine, formatTime }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const openMedia = () => {
    if (message.mediaUrl) Linking.openURL(message.mediaUrl).catch(() => undefined);
  };

  let body = null;
  const textStyle = isMine ? styles.textMine : styles.textOther;
  const linkStyle = isMine ? styles.linkMine : styles.linkOther;

  if (message.type === 'image' && message.mediaUrl) {
    body = (
      <TouchableOpacity onPress={() => setPreviewOpen(true)} activeOpacity={0.9}>
        <Image source={{ uri: message.mediaUrl }} style={styles.image} resizeMode="cover" />
        {message.text ? <LinkedText text={message.text} style={textStyle} linkStyle={linkStyle} /> : null}
      </TouchableOpacity>
    );
  } else if (message.type === 'video' && message.mediaUrl) {
    body = (
      <TouchableOpacity style={styles.videoCard} onPress={openMedia}>
        <Ionicons name="play-circle" size={44} color={isMine ? '#fff' : '#3FC060'} />
        <Text style={textStyle}>Vidéo · Appuyer pour lire</Text>
      </TouchableOpacity>
    );
  } else if (message.type === 'audio' && message.mediaUrl) {
    body = (
      <VoiceMessagePlayer
        uri={message.mediaUrl}
        mediaMeta={message.mediaMeta}
        isMine={isMine}
      />
    );
  } else if (message.type === 'link') {
    const url = message.mediaUrl || message.text || '';
    body = (
      <TouchableOpacity onPress={() => Linking.openURL(url).catch(() => undefined)}>
        <Text style={[textStyle, styles.linkPreview]} numberOfLines={2}>
          🔗 {url}
        </Text>
      </TouchableOpacity>
    );
  } else {
    body = <LinkedText text={message.text || ''} style={textStyle} linkStyle={linkStyle} />;
  }

  return (
    <View style={[styles.wrap, isMine ? styles.wrapMine : styles.wrapOther]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>{body}</View>
      <Text style={styles.time}>{formatTime(message.createdAt)}</Text>

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
  wrap: { maxWidth: '82%', marginBottom: 12 },
  wrapMine: { alignSelf: 'flex-end' },
  wrapOther: { alignSelf: 'flex-start' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMine: { backgroundColor: '#3FC060', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: 'white', borderBottomLeftRadius: 4 },
  textMine: { color: 'white', fontSize: 15 },
  textOther: { color: '#1F2937', fontSize: 15 },
  linkMine: { color: '#DCFCE7' },
  linkOther: { color: '#16A34A' },
  time: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  image: { width: 210, height: 210, borderRadius: 12 },
  videoCard: { alignItems: 'center', gap: 6, minWidth: 160 },
  linkPreview: { textDecorationLine: 'underline' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: { width: '92%', height: '80%' },
});
