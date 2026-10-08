/** React & Expo */
import { useContext, useState } from "react"
import { StyleSheet, View, Text, FlatList } from "react-native"
/** Configs */
import ThemeContext from "../../configs/themes"
/** Components */
import CollapsibleView from "../desktop_components/collapsible_view"

const Page = () => {
    const { theme } = useContext(ThemeContext)
    const [data, setData] = useState([
        {
            timestamp: 1710518400000, // March 15, 2026
            lab_name: "Central Medical Laboratory",
            lab_address: "123 Healthcare Ave, Medical District, NY 10001",
            lab_phone: "+1 (555) 123-4567",
            lab_email: "results@centralmedlab.com",
            lab_reports: [
                {
                    report_name: "Complete Blood Count (CBC)",
                    report_results: [
                        { result_name: "White Blood Cells", result_current: 7.5, result_min: 4.0, result_max: 11.0, result_unit: "10³/µL" },
                        { result_name: "Red Blood Cells", result_current: 4.8, result_min: 4.5, result_max: 5.9, result_unit: "10⁶/µL" },
                        { result_name: "Hemoglobin", result_current: 14.2, result_min: 13.5, result_max: 17.5, result_unit: "g/dL" },
                        { result_name: "Hematocrit", result_current: 42.5, result_min: 38.8, result_max: 50.0, result_unit: "%" },
                        { result_name: "Platelets", result_current: 250, result_min: 150, result_max: 400, result_unit: "10³/µL" },
                        { result_name: "Neutrophils", result_current: 62, result_min: 40, result_max: 70, result_unit: "%" },
                    ]
                },
                {
                    report_name: "Metabolic Panel",
                    report_results: [
                        { result_name: "Glucose", result_current: 92, result_min: 70, result_max: 100, result_unit: "mg/dL" },
                        { result_name: "Calcium", result_current: 9.5, result_min: 8.5, result_max: 10.5, result_unit: "mg/dL" },
                        { result_name: "Sodium", result_current: 140, result_min: 136, result_max: 145, result_unit: "mmol/L" },
                        { result_name: "Potassium", result_current: 4.2, result_min: 3.5, result_max: 5.0, result_unit: "mmol/L" },
                        { result_name: "Creatinine", result_current: 1.0, result_min: 0.7, result_max: 1.3, result_unit: "mg/dL" },
                        { result_name: "BUN", result_current: 15, result_min: 7, result_max: 20, result_unit: "mg/dL" },
                    ]
                }
            ]
        },
        {
            timestamp: 1709913600000, // March 8, 2026
            lab_name: "City Diagnostic Center",
            lab_address: "456 Lab Street, Downtown, NY 10002",
            lab_phone: "+1 (555) 987-6543",
            lab_email: "info@citydiagnostic.com",
            lab_reports: [
                {
                    report_name: "Lipid Profile",
                    report_results: [
                        { result_name: "Total Cholesterol", result_current: 185, result_min: 0, result_max: 200, result_unit: "mg/dL" },
                        { result_name: "LDL Cholesterol", result_current: 110, result_min: 0, result_max: 130, result_unit: "mg/dL" },
                        { result_name: "HDL Cholesterol", result_current: 55, result_min: 40, result_max: 100, result_unit: "mg/dL" },
                        { result_name: "Triglycerides", result_current: 120, result_min: 0, result_max: 150, result_unit: "mg/dL" },
                        { result_name: "VLDL", result_current: 24, result_min: 5, result_max: 40, result_unit: "mg/dL" },
                        { result_name: "Cholesterol/HDL Ratio", result_current: 3.4, result_min: 0, result_max: 5.0, result_unit: "ratio" },
                    ]
                },
                {
                    report_name: "Thyroid Function",
                    report_results: [
                        { result_name: "TSH", result_current: 2.5, result_min: 0.4, result_max: 4.0, result_unit: "mIU/L" },
                        { result_name: "Free T4", result_current: 1.2, result_min: 0.8, result_max: 1.8, result_unit: "ng/dL" },
                        { result_name: "Free T3", result_current: 3.1, result_min: 2.3, result_max: 4.2, result_unit: "pg/mL" },
                    ]
                }
            ]
        },
        {
            timestamp: 1708704000000, // February 23, 2026
            lab_name: "Advanced Health Labs",
            lab_address: "789 Wellness Blvd, Health Plaza, NY 10003",
            lab_phone: "+1 (555) 456-7890",
            lab_email: "reports@advancedhealthlabs.com",
            lab_reports: [
                {
                    report_name: "Liver Function Tests",
                    report_results: [
                        { result_name: "ALT", result_current: 28, result_min: 7, result_max: 56, result_unit: "U/L" },
                        { result_name: "AST", result_current: 32, result_min: 10, result_max: 40, result_unit: "U/L" },
                        { result_name: "Alkaline Phosphatase", result_current: 78, result_min: 44, result_max: 147, result_unit: "U/L" },
                        { result_name: "Total Bilirubin", result_current: 0.8, result_min: 0.1, result_max: 1.2, result_unit: "mg/dL" },
                        { result_name: "Albumin", result_current: 4.2, result_min: 3.5, result_max: 5.5, result_unit: "g/dL" },
                        { result_name: "Total Protein", result_current: 7.0, result_min: 6.0, result_max: 8.3, result_unit: "g/dL" },
                    ]
                },
                {
                    report_name: "Vitamin Levels",
                    report_results: [
                        { result_name: "Vitamin D", result_current: 42, result_min: 30, result_max: 100, result_unit: "ng/mL" },
                        { result_name: "Vitamin B12", result_current: 450, result_min: 200, result_max: 900, result_unit: "pg/mL" },
                        { result_name: "Folate", result_current: 12, result_min: 3, result_max: 20, result_unit: "ng/mL" },
                    ]
                }
            ]
        }
    ])

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.clear,
        },
        reportList: {
            marginTop: 30,
            maxWidth: 1200,
            width: "80%",
        },
    })

    return <View style={styles.container}>
        <FlatList data={data} keyExtractor={data => data.timestamp} showsVerticalScrollIndicator={false}
            style={styles.reportList} renderItem={
                collapsibleData => <CollapsibleView key={collapsibleData?.timestamp} data={collapsibleData} />
            } />
    </View>
}

export default Page