/** React & Expo */
import { useState, useContext, useEffect } from "react"
import { StyleSheet, Pressable, View, Text, Image } from "react-native"
// import { Image } from "expo-image"
import Collapsible from "react-native-collapsible"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
/** Configs */
import ThemeContext from "../../configs/themes"
import LocaleContext from "../../configs/locales"

const AccordionAccount = ({ settings, account }) => {
  const { theme } = useContext(ThemeContext)
  const { locale } = useContext(LocaleContext)
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [photo, setPhoto] = useState()

  useEffect(() => {
    /** Sets the photo */
    account && account.data && setPhoto(account.data.avatar)
  }, [account])

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
    },
    avatarPlaceholder: {
      fontSize: 24,
      color: theme.invert,
    },
    icon: {
      color: theme.invert,
      fontSize: 24,
      marginLeft: 10,
      marginRight: 15,
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
    category: {
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 40,
      paddingVertical: 15,
      backgroundColor: theme.ternary,
    },
    categoryName: {
      color: theme.invert,
    }
  })

  const handlePress = action => router.push(action)

  return <View>
    <Pressable style={styles.header} onPress={() => setIsOpen(!isOpen)}>
      <View style={styles.headerContainer}>
        <View style={styles.avatarContainer}>
          {!photo ? <Ionicons name="image-outline" style={styles.avatarPlaceholder} /> :
            <Image style={styles.avatar} source={{ uri: photo }} cachePolicy="none" />
          }
        </View>
        <View>
          <Text style={styles.profileName}>{account?.data.name ? account?.data.name : account?.data.email}</Text>
          <Text style={styles.profileDetails}>{locale.personal_information}</Text>
        </View>
        <Ionicons name={isOpen ? "chevron-down-sharp" : "chevron-forward-sharp"} style={styles.chevron} />
      </View>
    </Pressable >
    <Collapsible collapsed={!isOpen} duration={150} easing="easeOutCubic" align="top" style={{ backgroundColor: theme.ternary }}>
      {settings?.categories.map(category =>
        <Pressable key={category.name} style={styles.category} onPress={() => handlePress(category.route)}>
          <Ionicons name={category.icon} style={styles.icon} />
          <Text style={styles.categoryName}>{locale[category.name]}</Text>
        </Pressable>
      )}
    </Collapsible>
  </View >
}



export default AccordionAccount