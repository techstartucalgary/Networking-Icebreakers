import { Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { Button } from "react-native";
import {useRouter} from "expo-router";

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();


  if (user) {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Welcome, {user.name}!</Text>
        <Text>Join an Event Here</Text>
        <Button
          title ="Scan Qr Code"
          onPress = {()=>{
            router.push("../../src/components/QrcodeScan")
          }}

        />
        </View>
    );
  } else {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Welcome!</Text>
        <Text>Join an Event Here</Text>
        {/* <Button>Scan Qr Code</Button> */}
        <Button
          title ="Scan Qr Code"
          onPress = {()=>{
            router.push("../../src/components/QrcodeScan")
          }}

        />
        </View>
    );
  }
}