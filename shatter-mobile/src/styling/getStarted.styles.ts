import { StyleSheet } from "react-native";
import {colors} from "./colors"
// added logoImage and Background Image 
export const getStartedStyle = StyleSheet.create({
    background:{
        flex:1,
        height:"100%",
        width:"100%",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        backgroundColor: colors.overlayDark, 
    },
    logoImage:{
        width:90,
        height:90,
        marginBottom:16,
        resizeMode:"contain"
        
    },

//     container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 24,
//     backgroundColor: "#fff",
//   },

  logo: {
    fontSize: 44,
    fontWeight: "900",
    marginBottom: 10,
    letterSpacing:2,
    color:colors.softBlue,
  },
  tagline: {
    fontSize: 18,
    color: colors.white,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: colors.softBlue,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 20,
  },
  primaryText: {
    color: colors.black,
    fontSize: 16,
    fontWeight:"bold",
  },
  link: {
    color: colors.white,
    textDecorationLine: "underline",
  },
});