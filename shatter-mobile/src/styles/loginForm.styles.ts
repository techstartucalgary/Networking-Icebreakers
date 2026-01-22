import { StyleSheet, Dimensions} from "react-native";
import { Colors } from "@/src/styles/colors";

const{width, height} = Dimensions.get("window");

export const loginFormStyles = StyleSheet.create({
  safe:{
    flex:1,
    backgroundColor:Colors.royalBlue,
  },
  scrollContent:{
    flexGrow:1,
    paddingHorizontal:24,
    paddingBottom:24,
  },


  header: {
    paddingTop:24,
    paddingBottom:32,
    position:"relative",
  },

  headerLogoBg: {
    position: "absolute",
    left: -10,
    top: -20,
    width: width*0.45,
    height: height *0.45,
    resizeMode: "contain",
    opacity: 0.2,         
},

    headerLogoTopRight: {
    position: "absolute",
    right: -width*0.1,
    top: -width*0.2,
    width: width*0.45,
    height: height*0.45,
    resizeMode: "contain",
    opacity: 1,
},


  brandTitle: {
    fontSize: Math.min(56, width * 0.14),
    fontWeight: "900",
    color: Colors.lightBlue,
  },

  brandSubtitle: {
    fontSize: Math.min(16, width * 0.045),
    color: Colors.lightBlue,
    opacity: 0.85,
    marginTop: 4,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: Colors.darkText,
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    backgroundColor: Colors.white,
  },

  button: {
    backgroundColor: Colors.royalBlue,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },

  buttonDisabled: {
    backgroundColor: Colors.lightGray,
  },

  buttonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 16,
  },

  linkText: {
    textAlign: "center",
    color: Colors.royalBlue,
    fontWeight: "500",
  },

  guestText: {
    textAlign: "center",
    color: Colors.royalBlue,
    opacity: 0.8,
  },
});

