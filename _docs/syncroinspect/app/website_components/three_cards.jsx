/** React & Expo */
import { useContext } from "react"
import { StyleSheet, useWindowDimensions, Text, View, Image } from "react-native"
/** Configs */
import LocaleContext from "../../configs/locales"
import ThemeContext from "../../configs/themes"
/** Media */
import a_card from "../../assets/media/a_card.png"
import b_card from "../../assets/media/b_card.png"
import c_card from "../../assets/media/c_card.png"

const ThreeCards = () => {
  const { theme } = useContext(ThemeContext)
  const { locale } = useContext(LocaleContext)
  const windowDimensions = useWindowDimensions()

  const accessories = [a_card, b_card, c_card]

  const styles = StyleSheet.create({
    containerThreeCards: {
      backgroundColor: theme.clear,
      alignItems: "center",
    },
    titleThreeCards: {
      color: theme.invert,
      fontSize: 26,
      marginTop: 40
    },
    subtitleThreeCards: {
      color: theme.primary,
      fontSize: 22,
      margin: 20,
      textAlign: "center",
    },
    rowThreeCards: {
      height: "auto",
      width: "100%",
      justifyContent: "center",
      padding: 20,
    },
    cardContainerHorizontal: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      margin: 10,
      height: 500,
      borderWidth: 0,
      backgroundColor: theme.ternary,
      borderRadius: 20,
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.44,
      shadowRadius: 10.32,
      maxWidth: 390
    },
    cardContainerVertical: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      margin: 10,
    },
    cardImage: {
      width: "100%",
      marginBottom: 20,
    },
    cardTitle: {
      color: theme.primary,
      fontSize: 22,
      marginBottom: 20,
    },
    cardSubtitle: {
      color: theme.secondary,
      fontSize: 18,
    },
  })

  return <View style={styles.containerThreeCards}>
    <Text style={styles.titleThreeCards}>{locale.three_card_title}</Text>
    <Text style={styles.subtitleThreeCards}>{locale.three_card_subtitle}</Text>
    <View style={[styles.rowThreeCards, { flexDirection: windowDimensions.width < 1100 ? "column" : "row" }]}>
      {locale.cards.map((card, index) => <View key={`card_${index}`}
        style={windowDimensions.width < 1100 ? styles.cardContainerVertical : styles.cardContainerHorizontal}>
        <Image source={accessories[index % 3]} resizeMode="contain"
          style={[styles.cardImage, { height: windowDimensions.width < 1100 ? 100 : 150 }]} />
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
      </View>)}
    </View>
  </View>
}

export default ThreeCards

