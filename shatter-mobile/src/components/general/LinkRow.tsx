import { colors, fonts } from "@/src/styling/constants";
import Feather from "@expo/vector-icons/build/Feather";
import { StyleSheet, Linking, Pressable, View, Text } from "react-native";

type LinkRowProps = {
    label: string;
    url: string;
};

export const LinkRow = ({ label, url }: LinkRowProps) => {
    return (
        <Pressable
            onPress={() => {
                Linking.openURL(url).catch((err) =>
                    console.log("Failed to open URL:", err),
                );
            }}
            style={styles.linkRow}
        >
            <Text style={styles.linkLabel}>{label}</Text>

            <View style={styles.linkRight}>
                <Text style={styles.link} numberOfLines={1}>
                    {url}
                </Text>

                <Feather name="external-link" size={16} color="#888" />
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    linkRow: {
        marginBottom: 12,
        paddingVertical: 8,
    },

    linkRight: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    
    linkLabel: {
        fontFamily: fonts.title,
        fontSize: 14,
        color: colors.darkNavy,
        fontWeight: "bold",
        marginTop: 6,
    },

    link: {
        flex: 1,
        marginRight: 8,
        color: "#666",
    }
});