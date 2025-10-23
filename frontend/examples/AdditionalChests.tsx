import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BonusChest from '../components/BonusChest';

// Exemplo de como adicionar baús adicionais na trilha de missões

const AdditionalChestsExample = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exemplos de Baús Adicionais</Text>
      
      {/* Baú após missão 3 */}
      <BonusChest 
        chestId="chest_mission3"
        points={15}
        requiredMissions={['profile', 'quiz2', 'mission3']}
        onChestOpened={(points) => {
          console.log(`Baú da missão 3 aberto! +${points} pontos`);
        }}
      />
      
      {/* Baú especial de streak */}
      <BonusChest 
        chestId="chest_streak"
        points={25}
        requiredMissions={['profile', 'quiz2', 'mission3', 'mission4']}
        onChestOpened={(points) => {
          console.log(`Baú de streak aberto! +${points} pontos`);
        }}
      />
      
      {/* Baú de final de semana */}
      <BonusChest 
        chestId="chest_weekend"
        points={30}
        requiredMissions={['profile', 'quiz2', 'mission3', 'mission4', 'mission5']}
        onChestOpened={(points) => {
          console.log(`Baú de final de semana aberto! +${points} pontos`);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default AdditionalChestsExample;
