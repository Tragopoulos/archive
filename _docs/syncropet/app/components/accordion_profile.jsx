/** React & Expo */
import { useState, useContext } from "react"
import { StyleSheet, Pressable, View, Text } from "react-native"
import { Image } from "expo-image"
import Collapsible from "react-native-collapsible"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
/** Configs */
import ThemeContext from "../../configs/themes"
import LocaleContext from "../../configs/locales"

const AccordionProfile = ({ data }) => {
  const { theme } = useContext(ThemeContext)
  const { locale } = useContext(LocaleContext)
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const styles = StyleSheet.create({
    header: {
      height: "auto",
      padding: 20,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 10,
    },
    avatarContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.ternary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
    },
    avatarPlaceholder: {
      fontSize: 24,
      color: theme.invert,
    },
    chevron: {
      fontSize: 24,
      color: theme.invert,
      marginLeft: "auto"
    },
    profileName: {
      fontSize: 16,
      color: theme.invert,
    },
    profileDetails: {
      fontSize: 12,
      color: theme.primary,
    },
    collapsibleDetails: {
      padding: 20,
      color: theme.invert,
    },
    editButton: {
      padding: 20,
      backgroundColor: theme.ternaryBlue,
      paddingVertical: 10,
      alignItems: 'center',
    },
    editText: {
      fontSize: 16,
      color: theme.white,
    }
  })

  const handlePress = id => router.push(`dashboard_profile_edit/${id}`)

  return <View>
    <Pressable style={styles.header} onPress={() => setIsOpen(!isOpen)}>
      <View style={styles.headerContainer}>
        <View style={styles.avatarContainer}>
          {data?.profile.AVATAR == "" ?
            <Ionicons name="image-outline" style={styles.avatarPlaceholder} /> :
            <Image style={[styles.avatar, { borderColor: data?.profile.GENDER == "none" ? theme.primary : data?.profile.GENDER == "male" ? theme.primaryBlue : theme.primaryRed }]} source={{ uri: data?.profile.AVATAR }} />
          }
        </View>
        <View>
          <Text style={styles.profileName}>{data?.profile.NAME}</Text>
          <Text style={styles.profileDetails}>{new Date(data?.profile.DOB * 1000).toLocaleDateString()}</Text>
        </View>
        <Ionicons name={isOpen ? "chevron-down-sharp" : "chevron-forward-sharp"} style={styles.chevron} />
      </View>
    </Pressable >
    <Collapsible collapsed={!isOpen} duration={150} easing="easeOutCubic" align="top" style={{ backgroundColor: theme.ternary }}>
      <Text style={styles.collapsibleDetails}>{data?.profile.BIO}</Text>
      <Pressable style={styles.editButton} onPress={() => handlePress(data.id)}>
        <Text style={styles.editText}>{locale.edit}</Text>
      </Pressable>
    </Collapsible>
  </View >
}

export default AccordionProfile