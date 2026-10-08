import React, { useCallback, useRef, useState, useContext } from "react"
import { View, Text, Pressable, StyleSheet, FlatList, Modal, TouchableWithoutFeedback, Platform, } from "react-native"
import { AntDesign } from "@expo/vector-icons"
import ThemeContext, { alpha } from "../../configs/themes"
import LocaleContext from "../../configs/locales"

const Dropdown = ({ data, onChange, placeholder, value, setValue }) => {
  const { theme } = useContext(ThemeContext)
  const { locale } = useContext(LocaleContext)
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => setExpanded(!expanded), [expanded])

  const buttonRef = useRef(null)
  const [top, setTop] = useState(0)

  const styles = StyleSheet.create({
    backdrop: {
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
      backgroundColor: theme.clear + alpha[60],
    },
    optionItem: {
      height: 40,
      justifyContent: "center",
    },
    separator: {
      height: 2,
    },
    options: {
      position: "absolute",
      backgroundColor: theme.ternary,
      width: "100%",
      padding: 15,
      borderRadius: 10,
      maxHeight: 250,
    },
    text: {
      fontSize: 15,
      opacity: 0.8,
      color: theme.invert,
    },
    placeholder: {
      color: theme.invert,
      opacity: 0.5,
    },
    button: {
      justifyContent: "space-between",
      flexDirection: "row",
      backgroundColor: theme.ternary,
      color: theme.invert,
      padding: 15,
      borderRadius: 10,
      margin: 10,
    },
  })

  const handleLayout = (event) => {
    const layout = event.nativeEvent.layout
    const topOffset = layout.y
    const heightOfComponent = layout.height
    const finalValue =
      topOffset + heightOfComponent + (Platform.OS === "android" ? -32 : 3)
    setTop(finalValue)
  }

  const onSelect = useCallback((item) => {
    onChange(item)
    setValue(item.label)
    setExpanded(false)
  }, [])

  return (
    <View ref={buttonRef} onLayout={handleLayout}>
      <Pressable style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1.0 },]} onPress={toggleExpanded}>
        {value ? <Text style={styles.text}>{value}</Text> : <Text style={styles.placeholder}>{placeholder}</Text>}
      </Pressable>
      {expanded ? <Modal visible={expanded} transparent>
        <TouchableWithoutFeedback onPress={() => setExpanded(false)}>
          <View style={styles.backdrop}>
            <View style={[styles.options, { top }]}>
              <FlatList keyExtractor={(item) => item.value} data={data} renderItem={({ item }) => (
                <Pressable style={({ pressed }) => [styles.optionItem, { opacity: pressed ? 0.5 : 1.0 },]} onPress={() => onSelect(item)}>
                  <Text style={styles.text}>{item.label}</Text>
                </Pressable>
              )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal> : null}
    </View>
  )
}



export default Dropdown
