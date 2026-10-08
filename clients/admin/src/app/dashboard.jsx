/** React & Expo */
import { Redirect } from "expo-router"
import * as Device from "expo-device"

/** Thin pivot route. The Go service redirects post-login to /dashboard;
 *  this component picks the desktop or mobile variant declaratively so we
 *  never render a real screen on the wrong path. */
const Dashboard = () => {
    const target = (Device.deviceType === 3 || Device.deviceType === 2)
        ? "/(desktop)/dashboard"
        : "/(mobile)/dashboard"
    return <Redirect href={target} />
}

export default Dashboard
