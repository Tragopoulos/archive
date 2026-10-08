import { StyleSheet, View } from "react-native"
import ButtonHeader from "../mobile_components/button_header"

const HeaderReports = () => {
  return <View style={styles.header}>
    <ButtonHeader icon="add" />
    <ButtonHeader icon="scan" />
  </View>
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    padding: 15,
    marginRight: 1,
    marginLeft: "auto"
  }
})

export default HeaderReports