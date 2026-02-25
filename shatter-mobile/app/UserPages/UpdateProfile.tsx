import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../../src/components/context/AuthContext";
import { userUpdate } from "@/src/services/user.service";
import { getStoredAuth } from "@/src/components/general/AsyncStorage";

export default function UpdateProfile() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || "");
  const [socialLinks, setSocialLinks] = useState<{ label: string; url: string }[]>(user?.socialLinks || []);

  useEffect(() => {
    if (!user) router.replace("/UserPages/Login");
  }, [user]);

  const handleLinkChange = (index: number, field: "label" | "url", value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const addNewLink = () => setSocialLinks([...socialLinks, { label: "", url: "" }]);

  const removeLink = (index: number) => setSocialLinks(socialLinks.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!user) return;

    const stored = await getStoredAuth();
    const updatedUser = await updateUser({ name, email, bio, profilePhoto, socialLinks }); //local update
    const res = await userUpdate(user?.user_id, { name, email, bio, profilePhoto, socialLinks }, stored.accessToken) //remote update

    if (updatedUser && res) {
      router.back();
    } else {
      alert("Failed to update profile");
    }
  };

  const handleCancel = () => {
    router.push("/(tabs)/Profile");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>Update Profile</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your Name" placeholderTextColor="#666" />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Your Email" placeholderTextColor="#666" keyboardType="email-address" />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={bio}
        onChangeText={setBio}
        placeholder="Short bio"
        placeholderTextColor="#666"
        multiline
      />

      <Text style={styles.label}>Profile Photo URL</Text>
      <TextInput style={styles.input} value={profilePhoto} onChangeText={setProfilePhoto} placeholder="Profile Photo URL" placeholderTextColor="#666" />

      {/* Social Links Section */}
      <Text style={[styles.label, { marginTop: 20 }]}>Social Links</Text>
      {socialLinks.map((link, index) => (
        <View key={index} style={styles.linkContainer}>
          <TextInput
            style={styles.input}
            placeholder="Label (e.g. LinkedIn)"
            placeholderTextColor="#666"
            value={link.label}
            onChangeText={(text) => handleLinkChange(index, "label", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="URL"
            placeholderTextColor="#666"
            value={link.url}
            onChangeText={(text) => handleLinkChange(index, "url", text)}
          />
          <TouchableOpacity style={styles.removeButton} onPress={() => removeLink(index)}>
            <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addNewLink}>
        <Text style={styles.buttonText}>+ Add Social Link</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#A1C9F6", padding: 24 },
  title: { fontSize: 28, fontWeight: "600", textAlign: "center", color: "#1B253A", marginBottom: 16 },
  label: { fontWeight: "600", marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#1B253A", color: "#000", backgroundColor: "#fff", borderRadius: 8, padding: 10, marginTop: 5 },
  saveButton: { backgroundColor: "#4CAF50", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 15 },
  cancelButton: { backgroundColor: "#727272", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 15 },
  addButton: { backgroundColor: "#1eb4f0", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  removeButton: { backgroundColor: "#F44336", padding: 10, borderRadius: 6, alignItems: "center", marginTop: 5 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  linkContainer: { marginBottom: 10, backgroundColor: "#E6F0FF", padding: 10, borderRadius: 8 },
});