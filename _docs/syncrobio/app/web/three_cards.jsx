import { light } from "../../configs/themes"
import { StyleSheet, useWindowDimensions, Text, View, Image } from "react-native"

const ThreeCards = ({ data }) => {
  const windowDimensions = useWindowDimensions()

  return <View style={styles.containerThreeCards}>
    <Text style={styles.titleThreeCards}>{data?.three_card_title}</Text>
    <Text style={styles.subtitleThreeCards}>{data?.three_card_subtitle}</Text>
    <View style={[styles.rowThreeCards, { flexDirection: windowDimensions.width < 1100 ? "column" : "row" }]}>
      {data?.cards.map((card, index) => <View key={`card_${index}`}
        style={windowDimensions.width < 1100 ? styles.cardContainerVertical : styles.cardContainerHorizontal}>
        <Image source={card.accessory} resizeMode="contain"
          style={[styles.cardImage, { height: windowDimensions.width < 1100 ? 100 : 150 }]} />
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
      </View>)}
    </View>
  </View>
}

export default ThreeCards

const styles = StyleSheet.create({
  containerThreeCards: {
    backgroundColor: light.ternary,
    alignItems: "center",
  },
  titleThreeCards: {
    color: light.primary,
    fontSize: 26,
    marginTop: 40
  },
  subtitleThreeCards: {
    color: light.secondary,
    fontSize: 22,
    margin: 20
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
    backgroundColor: light.ternary,
    borderRadius: 20,
    shadowColor: light.primary,
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
    color: light.primary,
    fontSize: 22,
    marginBottom: 20,
  },
  cardSubtitle: {
    color: light.secondary,
    fontSize: 18,
  },
})