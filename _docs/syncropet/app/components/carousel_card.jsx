import { StyleSheet, Dimensions, Text } from "react-native"
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated"
import aImage from "../../assets/media/prod_image_a.png"
import bImage from "../../assets/media/prod_image_b.png"
import cImage from "../../assets/media/prod_image_c.png"

const Card = ({ index, animationValue, data }) => {
  const window = Dimensions.get("window")
  const accessories = [aImage, bImage, cImage]

  const cardStyle = useAnimatedStyle(() => {
    const scale = interpolate(animationValue.value, [-0.1, 0, 1], [0.95, 1, 1], Extrapolation.CLAMP)
    const translateX = interpolate(animationValue.value, [-1, -0.2, 0, 1], [0, window.width / 1.5 * 0.3, 0, 0])
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
    width: Dimensions.get("window").width / 1.05,
    height: "80%",
    backgroundColor: "#5F6B7C66",
  },
  animatedImage: {
    height: "70%",
    width: "55%",
    position: "absolute",
    zIndex: 100,
    right: 60,
    top: 170,
  },
  animatedText: {
    height: "70%",
    width: "55%",
    left: 20,
    top: 50,
    position: "absolute",
    zIndex: 100,
    color: "#F2F2F2",
  },
})