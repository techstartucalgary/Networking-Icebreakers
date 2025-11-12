import { StyleSheet, Text, View } from "react-native";

const NewEvents = () => {
  
    return (
    <View style={styles.container}>
      <Text>See your Events Here (Current or Past)</Text>
    </View>
  );
};

export default NewEvents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
});