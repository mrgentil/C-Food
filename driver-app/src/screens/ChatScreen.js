import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { useOrderChat } from '../hooks/useOrderChat';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { uploadChatMedia } from '../services/chatUpload';

const ChatScreen = ({ navigation, route }) => {
  const { orderId, clientName } = route.params;
  const { messages, loading, error, live, send, setError } = useOrderChat(orderId);

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const flatListRef = useRef(null);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const scrollToEnd = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const sendText = async () => {
    const text = newMessage.trim();
    if (!text || sending) return;
    setNewMessage('');
    setSending(true);
    try {
      await send({ message: text, type: 'text' });
      scrollToEnd();
    } catch (e) {
      setError(e?.response?.data?.message || 'Envoi impossible');
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  };

  const sendMedia = useCallback(
    async (uri, kind) => {
      setUploading(true);
      try {
        const { url, meta } = await uploadChatMedia(uri, kind);
        await send({ type: kind, media_url: url, media_meta: meta });
        scrollToEnd();
      } catch (e) {
        Alert.alert('Erreur', e?.message || 'Impossible d\'envoyer le média');
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
  } = useVoiceRecorder({
    onRecorded: (uri) => sendMedia(uri, 'audio'),
  });

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
      Alert.alert('Permission', 'Accès galerie requis.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 60,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await sendMedia(result.assets[0].uri, 'video');
    }
  };

  const showAttachMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Photo', 'Vidéo', 'Annuler'], cancelButtonIndex: 2 },
        (index) => {
          if (index === 0) pickImage();
          if (index === 1) pickVideo();
        }
      );
    } else {
      Alert.alert('Pièce jointe', '', [
        { text: 'Photo', onPress: pickImage },
        { text: 'Vidéo', onPress: pickVideo },
        { text: 'Annuler', style: 'cancel' },
      ]);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={{ marginBottom: 4 }}>
      {item.sender === 'client' && (
        <Text style={{ color: '#6B7280', fontSize: 12, marginBottom: 4, marginLeft: 4 }}>
          {clientName}
        </Text>
      )}
      <ChatMessageBubble
        message={item}
        isMine={item.sender === 'driver'}
        formatTime={formatTime}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F7FE' }}>
      <StatusBar style="dark" />

      <View style={{
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: '#F4F7FE', padding: 10, borderRadius: 12, marginRight: 16 }}
        >
          <Ionicons name="arrow-back" size={22} color="#111C44" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111C44' }}>{clientName}</Text>
          <Text style={{ color: live ? '#3FC060' : '#9CA3AF', fontSize: 12, marginTop: 2 }}>
            {live ? '● Chat en direct' : 'Synchronisation…'}
          </Text>
        </View>
      </View>

      {error ? (
        <Text style={{ color: '#DC2626', textAlign: 'center', padding: 8, fontSize: 13 }}>{error}</Text>
      ) : null}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color="#3FC060" />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            onContentSizeChange={scrollToEnd}
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>💬</Text>
                <Text style={{ color: '#6B7280', textAlign: 'center', fontSize: 16 }}>
                  Envoyez votre premier message
                </Text>
              </View>
            }
          />
        )}

        {voiceActive ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FEE2E2',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderTopWidth: 1,
              borderTopColor: '#FECACA',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              {preparing ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#DC2626',
                  }}
                />
              )}
              <Text style={{ color: '#991B1B', fontWeight: '700', fontSize: 14 }}>
                {preparing ? 'Démarrage du micro…' : `Enregistrement ${durationLabel}`}
              </Text>
            </View>
            <TouchableOpacity onPress={cancelRecording} style={{ padding: 6, marginRight: 8 }}>
              <Ionicons name="close-circle" size={28} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleRecording}
              disabled={preparing || uploading}
              style={{
                backgroundColor: '#DC2626',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>Envoyer</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={{
          backgroundColor: 'white',
          paddingHorizontal: 12,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'flex-end',
          borderTopWidth: voiceActive ? 0 : 1,
          borderTopColor: '#F3F4F6',
        }}>
          <TouchableOpacity onPress={showAttachMenu} disabled={uploading || voiceActive} style={{ padding: 8 }}>
            <Ionicons name="add-circle-outline" size={28} color="#3FC060" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleRecording}
            disabled={uploading || preparing}
            style={{
              padding: 10,
              backgroundColor: recording ? '#DC2626' : '#E8F8EE',
              borderRadius: 24,
            }}
          >
            <Ionicons
              name={recording ? 'stop' : 'mic'}
              size={24}
              color={recording ? '#FFFFFF' : '#3FC060'}
            />
          </TouchableOpacity>

          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            editable={!voiceActive}
            placeholder={voiceActive ? 'Enregistrement vocal…' : 'Message ou lien https://…'}
            placeholderTextColor="#9CA3AF"
            style={{
              flex: 1,
              backgroundColor: '#F4F7FE',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 24,
              marginHorizontal: 6,
              fontSize: 15,
              color: '#1F2937',
              maxHeight: 100,
            }}
            multiline
          />

          <TouchableOpacity
            onPress={sendText}
            disabled={sending || uploading || voiceActive || !newMessage.trim()}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: newMessage.trim() ? '#3FC060' : '#E5E7EB',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {sending || uploading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="send" size={20} color={newMessage.trim() ? 'white' : '#9CA3AF'} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
