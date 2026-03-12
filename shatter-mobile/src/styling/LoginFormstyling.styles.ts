import { StyleSheet, Dimensions, Platform } from "react-native";
import { colors, fonts } from "./constants";

const { width, height } = Dimensions.get("window");

const vw = (percent: number) => (width * percent) / 100;
const vh = (percent: number) => (height * percent) / 100;

export const LoginFormStyling = StyleSheet.create({

  background: {
    flex: 1,
    width: "100%",
    height:"50%"
  },
  safe: {
    flex: 1,
    flexDirection: "column",
  },
  header: {
    height: vh(23),
    justifyContent: "center",
    paddingHorizontal: vw(7),
  },
  logoTitle: {
    fontSize: vw(11),
    fontWeight: "900",
    letterSpacing: 3,
    color: "#A8C8E8",           
  },
  brandSubtitle: {
    marginTop: 6,
    fontSize: vw(4),
    color: "#ffffff",
    opacity: 0.9,
    letterSpacing: 1,
  },
  formWrap: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: vw(7),
    paddingTop: vh(4),
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: -4 },
    // shadowOpacity: 0.08,
    // shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: vw(7),
    fontWeight: "700",
    color: "#1B2A4A",
    marginBottom: vw(1),
  },
  subtitle: {
    fontSize: vw(3.5),
    color: "#888",
    marginBottom: vh(3),
  },
  label: {
    fontSize: vw(3.5),
    fontWeight: "600",
    color: "#1B2A4A",
    marginBottom: vh(0.8),
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 50,
    paddingHorizontal: vw(4),
    marginBottom: vh(2),
    backgroundColor: "#F7F7F7",
  },
  inputIcon: {
    marginRight: vw(2),
    opacity: 0.4,
  },
  input: {
    flex: 1,
    paddingVertical: vh(1.6),
    fontSize: vw(3.8),
    color: "#1B253A",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: vh(2.5),
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: vw(2),
  },
  rememberText: {
    fontSize: vw(3.2),
    color: "#888",
  },
  forgotText: {
    fontSize: vw(3.2),
    color: "#1B2A4A",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#1B2A4A",
    paddingVertical: vh(1.8),
    borderRadius: 50,
    alignItems: "center",
    marginBottom: vh(1.5),
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: vw(4),
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: vh(1.5),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: vw(3),
    fontSize: vw(3.2),
    color: "#aaa",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 50,
    paddingVertical: vh(1.6),
    marginBottom: vh(1.5),
    backgroundColor: "#fff",
    gap: vw(3),
  },
  socialButtonText: {
    fontSize: vw(3.8),
    fontWeight: "600",
    color: "#1B253A",
  },
  signupLinkText: {
    textAlign: "center",
    fontSize: vw(3.5),
    color: "#888",
    marginTop: vh(1),
  },
  signupLinkBold: {
    fontWeight: "700",
    color: "#1B2A4A",
  },
  err: {
    fontSize: 12,
    fontFamily: fonts.body,
    fontWeight: "bold",
    color: colors.error,
  },
});