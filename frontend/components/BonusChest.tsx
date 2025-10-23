import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../constants';

interface BonusChestProps {
  chestId: string;
  points: number;
  requiredMissions: string[];
  onChestOpened?: (points: number) => void;
  isLocked?: boolean;
  style?: any;
}

interface ChestState {
  id: string;
  type: 'chest';
  points: number;
  opened: boolean;
}

const BonusChest: React.FC<BonusChestProps> = ({
  chestId,
  points,
  requiredMissions,
  onChestOpened,
  isLocked = false,
  style
}) => {
  const { user, refreshUser } = useAuth();
  const [chestState, setChestState] = useState<ChestState>({
    id: chestId,
    type: 'chest',
    points,
    opened: false
  });

  // Verificar se o baú já foi aberto anteriormente
  useEffect(() => {
    if (user?.chestsOpened?.includes(chestId)) {
      setChestState(prev => ({ ...prev, opened: true }));
    }
  }, [user, chestId]);

  const isMissionCompleted = (missionId: string) => {
    if (missionId === 'profile') {
      return user?.missionsCompleted?.includes('profile') === true || user?.profileMissionCompleted === true;
    }
    if (missionId === 'quiz2') {
      return user?.missionsCompleted?.includes('quiz2') === true;
    }
    return false;
  };

  const isChestLocked = () => {
    return requiredMissions.some(missionId => !isMissionCompleted(missionId));
  };

  const handleOpenChest = async () => {
    if (isChestLocked()) {
      Alert.alert('Baú Bloqueado', 'Conclua as missões anteriores para abrir este baú!');
      return;
    }

    if (chestState.opened || user?.chestsOpened?.includes(chestId)) {
      console.log("Baú já foi resgatado. Ação ignorada.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('@AppBeneficios:token');
      if (!token) {
        Alert.alert('Erro', 'Token de autenticação não encontrado');
        return;
      }

      const response = await fetch(`${API_URL}/missions/open-chest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chestId,
          points
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao abrir baú');
      }

      const data = await response.json();
      
      // Atualizar estado local
      setChestState(prev => ({ ...prev, opened: true }));
      
      // Atualizar dados do usuário
      await refreshUser();
      
      // Callback opcional
      if (onChestOpened) {
        onChestOpened(points);
      }
      
      Alert.alert(
        'Parabéns!', 
        `Você ganhou ${points} pontos de bônus!`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Erro ao abrir baú:', error);
      Alert.alert('Erro', 'Não foi possível abrir o baú. Tente novamente.');
    }
  };

  const isOpened = chestState.opened;
  const chestIsLocked = isLocked || isChestLocked();
  
  let color = '#FF9800'; 
  let icon; 
  let opacity = 1;

  if (isOpened) {
    color = '#4a7f37'; 
    opacity = 1;
    icon = <Ionicons name="checkmark-circle" size={36} color="#fff" />;
  } else if (chestIsLocked) {
    color = '#B0B0B0'; 
    opacity = 0.6;
    icon = <MaterialCommunityIcons name="lock-outline" size={36} color="#fff" />;
  } else {
    icon = <MaterialCommunityIcons name="treasure-chest" size={36} color="#fff" />;
  }
  
  return (
    <View style={[styles.chestWrapper, style]}>
      <TouchableOpacity
        style={[styles.chestButton, { backgroundColor: color, opacity: opacity }]}
        onPress={handleOpenChest}
        disabled={isOpened || chestIsLocked}
      >
        {icon} 
        <Text style={styles.chestText}>
          {isOpened ? 'Resgatado!' : (chestIsLocked ? 'Baú Bloqueado' : `BÔNUS +${points} XP`)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  chestWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 150, 
    zIndex: 10, 
  },
  chestButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#fff',
    minWidth: 200,
  },
  chestText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default BonusChest;
