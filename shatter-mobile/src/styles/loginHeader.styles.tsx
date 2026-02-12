import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/src/styles/colors";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    height: 260, 
    backgroundColor: Colors.royalBlue,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },

  backgroundLogo: {
    position: "absolute",
    left: -width * 0.2,
    top: 20,
    width: width * 0.95,
    height: width * 0.95,
    opacity: 0.12,
  },

  cornerLogo: {
    position: "absolute",
    right: 20,
    top: 20,
    width: 56,
    height: 56,
  },

  textWrapper: {
    position: "absolute",
    left: 24,
    bottom: 40, 
  },

  title: {
    fontSize: 56,
    fontWeight: "900",
    color: Colors.lightBlue,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 18,
    color: Colors.lightBlue,
    opacity: 0.9,
  },
});

