/** React & Expo */
import { useRef, useState, useContext } from "react"
import { StyleSheet, Platform, Animated, View, Pressable } from "react-native"
import { Image } from "expo-image"
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as ImageManipulator from "expo-image-manipulator"
/** Configs */
import ThemeContext from "../../configs/themes"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ImageSelector = ({ photo, setPhoto, setPhotoName, setPhotoType, setBlob }) => {
  const { theme } = useContext(ThemeContext)
  const profileOpacity = useRef(new Animated.Value(1)).current

  const base64ToBlob = (base64, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  const manipulateImage = async (uri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 256 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      )
      return manipulatedImage.uri
    } catch (error) {
      //TODO
      console.error("Error manipulating image:", error);
    }
  }

  const handleAction = action => {
    Animated.sequence([
      Animated.timing(profileOpacity, {
        toValue: 0.6,
        duration: 100,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(profileOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start(() => selectImage(action))
  }

  const selectImage = async (action) => {
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    }
    let result
    switch (action) {
      case "pick":
        result = await ImagePicker.launchImageLibraryAsync(options)
        !result.canceled && await saveImage(result)
        break;
      case "take":
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== "granted") {
          Alert.alert("Permissions required", "Sorry, we need camera permissions to make this work!")
          return
        }
        result = await ImagePicker.launchCameraAsync(options)
        !result.canceled && await saveImage(result)
        break;
      default:
        break;
    }
  }

  const saveImage = async result => {
    setPhotoName(result.assets[0].fileName)
    setPhotoType(result.assets[0].mimeType)

    let file = await manipulateImage(result.assets[0].uri)
    setPhoto(file)

    if (Platform.OS === "web") {
      const base64Image = file
      const contentType = result.assets[0].mimeType
      const base64Data = base64Image.split(',')[1]
      const blob = base64ToBlob(base64Data, contentType)
      file = blob
    }

    setBlob(file)
  }

  const styles = StyleSheet.create({
    horizontalView: {
      backgroundColor: theme.clear,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "center",
    },
    imageContainer: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: theme.ternary,
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 10,
      borderWidth: 2,
      borderColor: theme.secondary,
      borderStyle: "dashed",
    },
    imageIcon: {
      fontSize: 80,
      color: theme.secondary,
    },
    image: {
      width: 200,
      height: 200,
      borderRadius: 100,
    },
    buttonContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.secondaryBlue,
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 10,
      marginHorizontal: -30,
      zIndex: 1,
    },
    buttonIcon: {
      fontSize: 40,
      color: theme.white,
    },
  })

  return <View style={styles.horizontalView}>
    <AnimatedPressable style={styles.buttonContainer} onPress={() => handleAction("pick")}>
      <Ionicons name="images-outline" style={styles.buttonIcon} />
    </AnimatedPressable>
    <View style={styles.imageContainer}>
      {!photo && <SimpleLineIcons name="picture" style={styles.imageIcon} />}
      {photo !== "" && <Image source={{ uri: photo }} cachePolicy="none" style={styles.image} />}
    </View>
    <AnimatedPressable style={styles.buttonContainer} onPress={() => handleAction("take")}>
      <Ionicons name="camera-outline" style={styles.buttonIcon} />
    </AnimatedPressable>
  </View>
}

export default ImageSelector