import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const NewEvents = () => {
    const [text, setText] = React.useState('Join An Event');
    
    return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setText}
        value={text}
        placeholder="Enter event name..."
        placeholderTextColor="#aaa"
      />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && { backgroundColor: "#005" },
        ]}
        onPress={() => console.log("Event Joined!")}
      >
        <Text style={styles.buttonText}>Join Event</Text>
      </Pressable>
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
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#3366ff",
    padding: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});