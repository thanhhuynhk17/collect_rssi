import {PermissionsAndroid, Platform} from 'react-native'

function useBLE() {

	const requestPermissions = async (callback)=>{
		if (Platform.OS ==='android') {
			const grantedStatus = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
				{
					title:"Location Permission",
					message:"BLE needs location permission!",
					buttonNegative:"Cancel",
					buttonPositive:"OK",
					buttonNeutral:"Later"
				}
			)
			callback(grantedStatus===PermissionsAndroid.RESULTS.GRANTED)
		}else{
			callback(true);
		}
	}

	return{
		requestPermissions,
	}
}

export default useBLE