import { View, Text, StyleSheet } from 'react-native';

export default function ConvertScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Convert</Text>
      <Text style={styles.subtitle}>Convert USDC to/from local currency</Text>
      {/* TODO: Implement conversion UI in Phase 3 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
