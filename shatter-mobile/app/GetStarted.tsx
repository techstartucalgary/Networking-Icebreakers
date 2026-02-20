import { View, Text, TouchableOpacity, ImageBackground,Image } from "react-native";
import { useRouter } from "expo-router";
import { getStartedStyle as styles } from "@/src/styling/getStarted.styles";

// put a background image and inside is going to be all the routing 
// Shatter logo and all of the other stuff in the middle of the device 
// put shatter logo 
// add gradiant to shatter logo 
//change styling for buttons 
// add a bit of animation  

export default function GetStarted() {
  const router = useRouter();

  return (
    
      <ImageBackground
      source={require("../src/images/getStartedImage.png")}
      style = {styles.background}
      resizeMode="cover"
      >
        <View style = {styles.center}>
          <Image source = {require("../src/images/Shatter-white-logo.png")} style = {styles.logoImage}/>

          <Text style={styles.logo}>SHATTER</Text>

          <Text style={styles.tagline}>
            Turn events into games
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/UserPages/Signup")}
          >
            <Text style={styles.primaryText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/UserPages/Login")}
          >
            <Text style={styles.link}>
              Already have an account? Log in
            </Text>
          </TouchableOpacity>


        </View>

        
      </ImageBackground>
 
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 24,
//     backgroundColor: "#fff",
//   },
//   logo: {
//     fontSize: 40,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   tagline: {
//     fontSize: 18,
//     color: "#666",
//     marginBottom: 40,
//   },
//   primaryButton: {
//     backgroundColor: "#000",
//     paddingVertical: 14,
//     paddingHorizontal: 32,
//     borderRadius: 10,
//     marginBottom: 20,
//   },
//   primaryText: {
//     color: "#fff",
//     fontSize: 16,
//   },
//   link: {
//     color: "#000",
//     textDecorationLine: "underline",
//   },
// });