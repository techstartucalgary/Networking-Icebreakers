import { Dimensions, Platform, StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

const { width, height } = Dimensions.get("window");

// vertical widtha dn height helpers
const vw = (percent: number) => (width * percent) / 100;
const vh = (percent: number) => (height * percent) / 100;

export const SignUpFormStyling = StyleSheet.create({
	background: {
		flex: 1,
		width: "100%",
		height: "50%",
	},
	safe: {
		flex: 1,
	},
	header: {
		// position: "absolute",
		top: vh(8), // 8 percent for scaling purposes
		left: 0,
		justifyContent: "center",
		paddingHorizontal: vw(7),
	},
	logoTitle: {
		fontSize: vw(11),
		fontWeight: "900",
		letterSpacing: 3,
		color: colors.softBlue,
	},
	brandSubtitle: {
		marginTop: 6,
		fontSize: vw(4),
		color: colors.white,
		opacity: 0.9,
		letterSpacing: 1,
	},
	formWrap: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		minHeight: vh(67),
		backgroundColor: "#fff",
		borderTopLeftRadius: 32,
		borderTopRightRadius: 32,
		paddingHorizontal: vw(7),
		paddingTop: vh(4),
		paddingBottom: Platform.OS === "ios" ? vh(4) : vh(3),
		// Subtle shadow for depth
		// shadowColor: "#000",
		// shadowOffset: { width: 0, height: -4 },
		// shadowOpacity: 0.08,
		// shadowRadius: 12,
		elevation: 10,
	},
	title: {
		fontSize: vw(7),
		fontWeight: "700",
		marginBottom: vh(2.5),
		color: "#1B2A4A",
	},
	input: {
		borderWidth: 1,
		borderColor: "#E0E0E0",
		borderRadius: 50,
		paddingVertical: vh(1.6),
		paddingHorizontal: vw(5),
		marginBottom: vh(1.8),
		backgroundColor: "#F7F7F7",
		fontSize: vw(3.8),
		color: "#1B253A",
	},
	button: {
		backgroundColor: "#1B2A4A",
		paddingVertical: vh(1.8),
		borderRadius: 50,
		alignItems: "center",
		marginTop: vh(1),
		marginBottom: vh(1),
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
	err: {
		fontSize: 12,
		fontFamily: fonts.body,
		fontWeight: "bold",
		color: colors.error,
	},

	// need to implement linkedin user
	//   dividerRow: {
	//     flexDirection: "row",
	//     alignItems: "center",
	//     marginVertical: vh(1.5),
	//   },
	//   dividerLine: {
	//     flex: 1,
	//     height: 1,
	//     backgroundColor: "#E0E0E0",
	//   },
	//   dividerText: {
	//     marginHorizontal: vw(3),
	//     fontSize: vw(3.2),
	//     color: "#aaa",
	//   },
	//   socialRow: {
	//     flexDirection: "row",
	//     justifyContent: "center",
	//     gap: vw(5),
	//     marginBottom: vh(2),
	//   },
	//   socialButton: {
	//     width: vw(12),
	//     height: vw(12),
	//     borderRadius: vw(6),
	//     borderWidth: 1,
	//     borderColor: "#E0E0E0",
	//     alignItems: "center",
	//     justifyContent: "center",
	//     backgroundColor: "#fff",
	//   },
	//   loginLinkWrap: {
	//     marginTop: vh(1),
	//   },
	//   loginLinkText: {
	//     textAlign: "center",
	//     color: "#1B253A",
	//     fontSize: vw(3.5),
	//   },
	//   loginLinkBold: {
	//     fontWeight: "700",
	//     color: "#1B253A",
	//   },
	//   helperText: {
	//     textAlign: "center",
	//     color: "#afafaf",
	//     marginTop: vh(0.8),
	//     fontSize: vw(3.2),
	//   },
	//   errorText: {
	//     textAlign: "center",
	//     color: "#e63232",
	//     marginTop: vh(0.8),
	//     fontSize: vw(3.4),
	//   },
});
