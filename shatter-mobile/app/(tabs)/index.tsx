import { Image } from "expo-image";
import { Platform, StyleSheet, View, Text } from "react-native";

import { Link } from "expo-router";

export default function HomeScreen() {
  return <View>
    <Text style={styles.title}>Hello</Text>
  </View>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
});
