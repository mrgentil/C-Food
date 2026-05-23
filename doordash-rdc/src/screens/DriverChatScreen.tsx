import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { useOrderChat } from '../hooks/useOrderChat';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { uploadChatMedia } from '../services/chatUpload';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';

type Driver = {
  id: string;
  name: string;
  photo: string;
  rating: number;
  vehicle: string;
  plate: string;
};

const DriverChatScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const orderId: string | undefined = route.params?.orderId;
  const driver: Driver = route.params?.driver || {
    id: '1',
    name: 'Livreur',
    photo: '',
    rating: 4.8,
    vehicle: 'Moto',
    plate: '—',
  };

  const { messages, loading, error, live, send, setError } = useOrderChat(orderId);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const scrollToEnd = () => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const sendText = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setInputText('');
    setSending(true);
    try {
      await send({ message: text, type: 'text' });
      scrollToEnd();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Envoi impossible');
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const sendMedia = useCallback(
    async (uri: string, kind: 'image' | 'video' | 'audio', caption?: string) => {
      setUploading(true);
      try {
        const { url, meta } = await uploadChatMedia(uri, kind);
        await send({
          type: kind,
          media_url: url,
          media_meta: meta,
          message: caption?.trim() || undefined,
        });
        scrollToEnd();
      } catch (err: any) {
        Alert.alert('Erreur', err.message || 'Impossible d\'envoyer le média');
      } finally {
        setUploading(false);
      }
    },
    [send]
  );

  const {
    recording,
    preparing,
    durationLabel,
    toggleRecording,
    cancelRecording,
  } = useVoiceRecorder((uri) => sendMedia(uri, 'audio'));

  const voiceActive = recording || preparing;

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission', 'Accès aux photos requis.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await sendMedia(result.assets[0].uri, 'image');
    }
  };

  const pickVideo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission', 'Accès à la galerie requis.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 60,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await sendMedia(result.assets[0].uri, 'video');
    }
  };

  const showAttachMenu = () => {
    const options = ['Photo', 'Vidéo', 'Annuler'];
    const handlers = [pickImage, pickVideo];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 2 },
        (index) => {
          if (index === 0 || index === 1) handlers[index]?.();
        }
      );
    } else {
      Alert.alert('Pièce jointe', 'Choisir un type', [
        { text: 'Photo', onPress: pickImage },
        { text: 'Vidéo', onPress: pickVideo },
        { text: 'Annuler', style: 'cancel' },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.driverInfo}>
          <View style={styles.driverPhoto}>
            <Text style={styles.driverPhotoText}>{driver.name[0]}</Text>
          </View>
          <View>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.driverStatus}>
              {live ? '● En direct' : 'Synchronisation…'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={scrollToEnd}
      >
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            message={message}
            isMine={message.sender === 'user'}
            formatTime={formatTime}
          />
        ))}
      </ScrollView>

      <View style={styles.quickReplies}>
        {['Je suis en route', 'Arrivé', 'Merci!'].map((reply) => (
          <TouchableOpacity
            key={reply}
            style={styles.quickReplyButton}
            onPress={() => setInputText(reply)}
          >
            <Text style={styles.quickReplyText}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {voiceActive ? (
        <View style={styles.voiceBanner}>
          <View style={styles.voiceBannerLeft}>
            {preparing ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <View style={styles.voiceDot} />
            )}
            <Text style={styles.voiceBannerText}>
              {preparing ? 'Démarrage du micro…' : `Enregistrement ${durationLabel}`}
            </Text>
          </View>
          <TouchableOpacity onPress={cancelRecording} style={styles.attachBtn}>
            <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.voiceSendBtn}
            onPress={toggleRecording}
            disabled={preparing || uploading}
          >
            <Text style={styles.voiceSendText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={showAttachMenu}
          disabled={uploading || voiceActive}
        >
          <Ionicons name="add-circle-outline" size={28} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.micBtn, recording && styles.micBtnActive]}
          onPress={toggleRecording}
          disabled={uploading || preparing}
        >
          <Ionicons
            name={recording ? 'stop' : 'mic'}
            size={24}
            color={recording ? COLORS.background : COLORS.primary}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message, lien https://…"
          placeholderTextColor={COLORS.textLight}
          multiline
          editable={!voiceActive}
        />

        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={sendText}
          disabled={!inputText.trim() || sending || uploading || voiceActive}
        >
          {sending || uploading ? (
            <ActivityIndicator color={COLORS.background} size="small" />
          ) : (
            <Ionicons name="send" size={20} color={COLORS.background} />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { alignItems: 'center', paddingVertical: SPACING.md },
  errorText: { color: COLORS.error, textAlign: 'center', padding: SPACING.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: SPACING.xs, marginRight: SPACING.sm },
  driverInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  driverPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  driverPhotoText: { color: COLORS.background, fontWeight: '700', fontSize: FONT_SIZES.lg },
  driverName: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text },
  driverStatus: { fontSize: FONT_SIZES.sm, color: COLORS.success },
  messagesContainer: { flex: 1, paddingHorizontal: SPACING.md },
  messagesContent: { paddingVertical: SPACING.md },
  quickReplies: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  quickReplyButton: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickReplyText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  attachBtn: { padding: 6, marginBottom: 4 },
  voiceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
  },
  voiceBannerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  voiceDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.error },
  voiceBannerText: { color: '#991B1B', fontWeight: '700', fontSize: FONT_SIZES.sm },
  voiceSendBtn: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
  },
  voiceSendText: { color: COLORS.background, fontWeight: '700', fontSize: FONT_SIZES.sm },
  micBtn: {
    padding: 10,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundSecondary,
    marginRight: SPACING.xs,
  },
  micBtnActive: { backgroundColor: COLORS.error },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
    marginHorizontal: 4,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: { backgroundColor: COLORS.border },
});

export default DriverChatScreen;
