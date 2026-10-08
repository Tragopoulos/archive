/** React & Expo */
import { useState, useContext } from "react"
import { StyleSheet, View, TextInput, Modal, Pressable } from "react-native"
/** Configs */
import ThemeContext, { alpha } from "../../configs/themes"
import LocaleContext from "../../configs/locales"
/** Calendar */
import { CalendarList, LocaleConfig } from "react-native-calendars"

const ModalCalendar = ({ future, date, setDate }) => {
  const { theme } = useContext(ThemeContext)
  const { locale } = useContext(LocaleContext)
  const [modalVisible, setModalVisible] = useState(false)

  LocaleConfig.defaultLocale = locale.language

  const styles = StyleSheet.create({
    input: {
      backgroundColor: theme.ternary,
      color: theme.invert,
      padding: 15,
      borderRadius: 10,
      margin: 10,
    }
  })

  const calendarTheme = {
    backgroundColor: theme.clear,
    calendarBackground: theme.clear,
    textSectionTitleColor: theme.secondaryBlue,
    dayTextColor: theme.invert,
    todayTextColor: theme.secondaryRed,
    monthTextColor: theme.secondaryBlue,
  }

  return <>
    <Pressable onPress={() => setModalVisible(!modalVisible)}>
      <View pointerEvents="none">
        <TextInput placeholder={locale.dateOfBirth} style={styles.input}
          placeholderTextColor={theme.invert + alpha[40]} value={date?.dateString || ""} editable={false} />
      </View>
    </Pressable>
    <Modal animationType="slide" transparent={false} visible={modalVisible}
      onRequestClose={() => setModalVisible(!modalVisible)}>
      <CalendarList
        theme={calendarTheme}
        onDayPress={day => setDate(day) & setModalVisible(!modalVisible)}
        pastScrollRange={600}
        futureScrollRange={future}
        maxDate={future ? "" : new Date().toISOString().split("T")[0]} />
    </Modal>
  </>
}

export default ModalCalendar