import { router } from 'expo-router';
import { StyleSheet, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const handleLogin = () => {
    router.push('/routes/scan');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Gym Equipment Tracker</ThemedText>
      <Button title="Login" onPress={handleLogin} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
