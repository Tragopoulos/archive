import { StyleSheet, Dimensions, Text } from "react-native"
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated"
import aImage from "../../assets/media/a_card.png"
import bImage from "../../assets/media/b_card.png"
import cImage from "../../assets/media/c_card.png"

const Card = ({ index, animationValue, data }) => {
  const { width } = Dimensions.get("window")
  const accessories = [aImage, bImage, cImage]

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    animatedView: {
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 20,
      width: width / 1.05,
      height: "80%",
      backgroundColor: "#316965",
    },
    animatedImage: {
      height: "50%",
      width: "45%",
      position: "absolute",
      zIndex: 100,
      right: 75,
      top: 220,
    },
    animatedText: {
      height: "80%",
      width: "40%",
      left: 20,
      top: 50,
      position: "absolute",
      zIndex: 100,
      color: "#dcd5c4",
    },
  })

  const cardStyle = useAnimatedStyle(() => {
    const scale = interpolate(animationValue.value, [-0.1, 0, 1], [0.95, 1, 1], Extrapolation.CLAMP)
    const translateX = interpolate(animationValue.value, [-1, -0.2, 0, 1], [0, width / 1.5 * 0.3, 0, 0])
    const transform = {
      transform: [{ scale }, { translateX }, { perspective: 200 },
      { rotateY: `${interpolate(animationValue.value, [-1, 0, 0.4, 1], [30, 0, -25, -25], Extrapolation.CLAMP)}deg` }
      ]
    }
    return transform
  }, [index])

  const blockStyle = useAnimatedStyle(() => {
    const translateX = interpolate(animationValue.value, [-1, 0, 1], [0, 60, 60])
    const translateY = interpolate(animationValue.value, [-1, 0, 1], [0, -70, -40])
    const rotateZ = interpolate(animationValue.value, [-1, 0, 1], [0, 0, -25])
    return { transform: [{ translateX }, { translateY }, { rotateZ: `${rotateZ}deg` }] }
  }, [index])

  return <Animated.View style={styles.container}>
    <Animated.View style={[styles.animatedView, cardStyle]}>
      <Text resizeMode="contain" style={styles.animatedText}>{data[index % 3].subtitle}</Text>
    </Animated.View>
    <Animated.Image source={accessories[index % 3]} resizeMode="contain" style={[styles.animatedImage, blockStyle]} />
  </Animated.View>
}

export default Card