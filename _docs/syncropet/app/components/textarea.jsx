import { useState, useContext } from "react"
import { Platform, StyleSheet, TextInput } from "react-native"
import ThemeContext, { alpha } from "../../configs/themes"

const TextArea = ({ placeholder, maxLength, value, onChangeText }) => {
  const { theme } = useContext(ThemeContext)
  const [inputHeight, setInputHeight] = useState(60)

  const styles = StyleSheet.create({
    input: {
      backgroundColor: theme.ternary,
      color: theme.invert,
      padding: 15,
      borderRadius: 10,
      margin: 10,
      overflow: Platform.OS === "web" ? "hidden" : "visible",
      minHeight: 60,
    }
  })

  const handleHeight = height => setInputHeight(Math.max(60, height))

  return <TextInput
    placeholder={placeholder}
    placeholderTextColor={theme.invert + alpha[40]}
    multiline
    maxLength={maxLength}
    onContentSizeChange={event => handleHeight(event.nativeEvent.contentSize.height)}
    style={[styles.input, { height: inputHeight }]}
    value={value}
    onChangeText={text => onChangeText(text)}
  />
}

export default TextArea
