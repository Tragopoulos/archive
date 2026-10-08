/** Expo & React */
import { useState, useContext } from "react"
import { StyleSheet, Pressable, View, Text, Image } from "react-native"
import Collapsible from "react-native-collapsible"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
/** Configs */
import ThemeContext from "../../configs/themes"

const AccordionProfile = ({ settings, account }) => {
  const { theme } = useContext(ThemeContext)
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
      resizeMode: "contain",
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
          {account?.data.avatar !== "" ?
            <Image style={styles.avatar} source={{ uri: account?.data.avatar }} /> :
            <Ionicons name="image-outline" style={styles.avatarPlaceholder} />
          }
        </View>
        <View>
          <Text style={styles.profileName}>{account?.data.name ? account?.data.name + account?.data.surname : account?.data.email}</Text>
          <Text style={styles.profileDetails}>{settings.name}</Text>
        </View>
        <Ionicons name={isOpen ? "chevron-down-sharp" : "chevron-forward-sharp"} style={styles.chevron} />
      </View>
    </Pressable >
    <Collapsible collapsed={!isOpen} duration={150} easing="easeOutCubic" align="top" style={{ backgroundColor: theme.ternary }}>
      {settings.categories && settings.categories.map(category =>
        <Pressable key={category.name} style={styles.category} onPress={() => handlePress(category.action)}>
          <Ionicons name={category.icon} style={styles.icon} />
          <Text style={styles.categoryName}>{category.name}</Text>
        </Pressable>
      )}
    </Collapsible>
  </View >
}



export default AccordionProfile