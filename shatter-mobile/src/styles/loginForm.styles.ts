import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/src/styles/colors";

const { width, height } = Dimensions.get("window");

export const loginFormStyles = StyleSheet.create({
  // Screen wrappers
  safe: {
    flex: 1,
    backgroundColor: Colors.royalBlue,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  // Card stack 
  authStack: {
    paddingHorizontal: 16,
    marginTop: -32,
    paddingBottom: 28,
  },

  // quick join
  quickJoinCard: {
    backgroundColor: Colors.cream,
    borderRadius: 26,
    padding: 18,
    width: "100%",
    marginBottom: 12,
  },

  // sign in
  signInCard: {
    backgroundColor: Colors.white,
    borderRadius: 26,
    padding: 18,
    width: "100%",
  },


  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardBody: {
    marginTop: 16,
  },

  //card titlle and subtitle
  cardTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: Colors.royalBlue,
  },

  cardSubtitle: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.royalBlue,
    opacity: 0.9,
  },

  // scan icon box (Quick Join)
  scanIconBox: {
    width: 74,
    height: 56,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  scanIconText: {
    fontSize: 18,
    fontWeight: "900",
  },

  // Auth form inputs/buttons
  authinput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },

  //input style 
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },

  primaryButton: {
    backgroundColor: Colors.royalBlue,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 2,
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
  },

  authbuttonDisabled: {
    opacity: 0.6,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 14,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
  },

  dividerText: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(0,0,0,0.55)",
  },

  oauthButton: {
    backgroundColor: Colors.royalBlue,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  oauthButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "800",
  },

  termsText: {
    fontSize: 11,
    textAlign: "center",
    color: "rgba(0,0,0,0.55)",
    marginTop: 8,
  },

  authlinkText: {
    color: Colors.royalBlue,
    textAlign: "center",
    fontWeight: "800",
  },
  eventJoinedBox: {
    backgroundColor: "#CFF9DD",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  eventJoinedTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.royalBlue,
  },

  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
  },

  fieldLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.royalBlue,
  },

  fieldHint: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.royalBlue,
    opacity: 0.9,
  },

  scanButton: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.royalBlue,
    paddingVertical: 12,
    alignItems: "center",
  },

  scanButtonText: {
    color: Colors.royalBlue,
    fontWeight: "900",
  },

});



