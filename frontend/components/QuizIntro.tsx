import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import Header from './Header';

interface QuizIntroProps {
  title: string;
  description: string;
  videoUrl?: string;
  onStart: () => void;
  onBack: () => void;
}

const QuizIntro: React.FC<QuizIntroProps> = ({
  title,
  description,
  videoUrl,
  onStart,
  onBack
}) => {
  const player = useVideoPlayer(videoUrl || '', (player) => {
    player.loop = false;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Header />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1a5d2b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Desafio</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="brain" size={60} color="#4a7f37" />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {videoUrl && (
          <View style={styles.videoContainer}>
            <Text style={styles.videoTitle}>📹 Assista ao vídeo antes de começar:</Text>
            <View style={styles.videoWrapper}>
              <VideoView
                player={player}
                allowsFullscreen
                allowsPictureInPicture
                style={styles.video}
              />
            </View>
          </View>
        )}

        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>📋 Como funciona:</Text>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Responda as perguntas corretamente</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>
              • Quanto mais rápido você responder, mais pontos ganha
            </Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>
              • O timer começará quando você clicar em "Iniciar"
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <MaterialCommunityIcons name="play" size={24} color="#fff" />
          <Text style={styles.startButtonText}>Iniciar Desafio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ececec',
  },
  contentContainer: {
    flexGrow: 1,
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a5d2b',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a5d2b',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  videoContainer: {
    width: '100%',
    marginBottom: 30,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  videoWrapper: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 8,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  rulesContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ruleItem: {
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#4a7f37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default QuizIntro;
