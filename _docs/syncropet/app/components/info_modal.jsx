import { light, alpha } from "../../configs/themes"
import { StyleSheet, Dimensions, Platform, useWindowDimensions, View, Text } from "react-native"
import ButtonModal from "./button_modal"

const InfoModal = ({ modalData }) => {
  const windowDimensions = useWindowDimensions()

  return <View style={[styles.modalShell, windowDimensions.width > 750 ? { width: 350 } : { width: "auto", left: 0 }]}>
    <Text style={styles.modalTitle}>{modalData?.title}</Text>
    <Text style={styles.modalText}>{modalData?.message}</Text>
    <View style={styles.modalButtonContainer}>
      {modalData?.leftButtonText ? <ButtonModal text={modalData?.leftButtonText} action={modalData?.leftButtonAction} /> : null}
      {modalData?.rightButtonText ? <ButtonModal text={modalData?.rightButtonText} action={modalData?.rightButtonAction} /> : null}
    </View>
  </View>
}

export default InfoModal

const styles = StyleSheet.create({

  modalShell: {
    position: "absolute",
    right: 0,
    top: 0,
    margin: 20,
    paddingHorizontal: 10,
    backgroundColor: light.primary + alpha[90],
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    color: light.ternary,
    fontSize: 18,
    marginVertical: 20
  },
  modalText: {
    color: light.ternary,
    marginBottom: 20
  },
  modalButtonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
})