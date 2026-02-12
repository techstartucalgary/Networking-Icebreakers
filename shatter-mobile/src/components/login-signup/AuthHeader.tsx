import { View, Text, Image } from "react-native";
import { styles} from "../../styles/loginHeader.styles";

type Props = {
  title: string;
  subtitle?: string;
  backgroundLogo?: any;
  cornerLogo?: any;
};

export default function AuthHeader({
  title,
  subtitle,
  backgroundLogo,
  cornerLogo,
}: Props) {
  return (
    <View style={styles.container}>
      {backgroundLogo && (
        <Image
          source={backgroundLogo}
          style={styles.backgroundLogo}
          // resizeMode="contain"
        />
      )}

      {cornerLogo && (
        <Image
          source={cornerLogo}
          style={styles.cornerLogo}
          // resizeMode="contain"
        />
      )}

      <View style={styles.textWrapper}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}
