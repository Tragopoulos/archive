/** Expo & React */
import { useState, useContext } from "react"
import { StyleSheet, Pressable, View, Text, Image } from "react-native"
import Collapsible from "react-native-collapsible"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
/** Configs */
import ThemeContext from "../../configs/themes"

const AccordionSettings = ({ setting }) => {
  const { theme } = useContext(ThemeContext)
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const styles = StyleSheet.create({
    header: {
      height: "auto",
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    icon: {
      color: theme.invert,
      fontSize: 24,
      marginLeft: 10,
      marginRight: 15,
    },
    chevron: {
      color: theme.invert,
      fontSize: 24,
      marginLeft: "auto"
    },
    name: {
      fontSize: 16,
      color: theme.invert,
    },
    category: {
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 40,
      paddingVertical: 15,
      backgroundColor: theme.ternary,
    }
  })

  const handlePress = action => router.push(action)

  return <View>
    <Pressable style={styles.header} onPress={() => setIsOpen(!isOpen)}>
      <View style={styles.headerContainer}>
        <Ionicons name={setting.icon} style={styles.icon} />
        <Text style={styles.name}>{setting.name}</Text>
        {setting.chevron && <Ionicons name={isOpen ? "chevron-down-sharp" : "chevron-forward-sharp"} style={styles.chevron} />}
      </View>
    </Pressable >
    <Collapsible collapsed={!isOpen} duration={150} easing="easeOutCubic" align="top" style={{ backgroundColor: theme.ternary }}>
      {setting.categories && setting.categories.map(category =>
        <Pressable key={category.name} style={styles.category} onPress={() => handlePress(category.action)}>
          <Ionicons name={category.icon} style={styles.icon} />
          <Text style={styles.name}>{category.name}</Text>
        </Pressable>
      )}
    </Collapsible>
  </View >
}



export default AccordionSettings