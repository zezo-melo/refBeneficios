import React from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

// Import local images.
const logos = [
  require('../assets/images/itau-logo.png'),
  require('../assets/images/brb-logo.png'),
  require('../assets/images/btg-logo.png'),
  require('../assets/images/fgv-logo.png'),
];

const { width } = Dimensions.get('window');
const LOGO_WIDTH = 120;
const SPACING = 20;
const ITEM_SIZE = LOGO_WIDTH + SPACING;

export default function App() {
  const xOffset = useSharedValue(0);

  React.useEffect(() => {
    // Animate the carousel.
    xOffset.value = withRepeat(
      withSequence(
        withTiming(-(logos.length * ITEM_SIZE), { duration: logos.length * 2000 }),
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: xOffset.value }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.carouselContainer}>
          <Animated.View style={[styles.carousel, animatedStyle]}>
            {[...logos, ...logos].map((logo, index) => (
              <View key={index} style={styles.logoWrapper}>
                <Image source={logo} style={styles.logo} resizeMode="contain" />
              </View>
            ))}
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4a7f37',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 384,
    backgroundColor: '#4a7f37',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  carouselContainer: {
    height: 80,
    overflow: 'hidden',
  },
  carousel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrapper: {
    width: LOGO_WIDTH,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING / 2,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
