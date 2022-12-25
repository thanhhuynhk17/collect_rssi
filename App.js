import { useState, useEffect } from 'react';

import { TouchableOpacity, Text, View, LogBox } from 'react-native';
LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message

import { BleManager } from 'react-native-ble-plx';

import useBLE from './components/useBLE';
import useKalmanFilter from './components/useKalmanFilter';

const bleManager = new BleManager();
let previousCorrected = null;
export default function App() {
	const {requestPermissions} = useBLE();
	const {KalmanFilter1D} = useKalmanFilter();

	const [rssi, setRssi] = useState([]);
	const [rssiFiltered, setRssiFiltered] = useState([]);
	const [kFilter, setKFilter] = useState(undefined);

	const scanBLE = async ()=>{
		console.log("clicked");
		requestPermissions((isGranted)=>{
			console.log("Granted: "+isGranted);
		})
		bleManager.startDeviceScan(null, null, (error, device) => {
			if (error) {
				// Handle error (scanning will be stopped automatically)
				return;
			}
			if (device.name ==="ThanhDepTraiQua") {
				console.log(JSON.stringify({
					id: device.id,
					rssi: device.rssi,
					name: device.name
				}));
				setRssi(prev=>[...prev, device.rssi]);
			}			
			// bleManager.stopDeviceScan();
		});
	}
	const stopScan = async ()=>{
		bleManager.stopDeviceScan();
		// setRssi([]);
		// setRssiFiltered([]);
	}
	const clearScan = async ()=>{
		bleManager.stopDeviceScan();
		setRssi([]);
		setRssiFiltered([]);
	}

	useEffect(()=>{
		if (rssi.length===0) {
			// new kfilter
			const params={
				R:5,
				P:15
			}
			setKFilter(KalmanFilter1D(params));
			return;
		}
		// apply filter
		const rssi_val = rssi.slice(-1)[0];
		
		const filterParams={
			previousCorrected: previousCorrected,
			observation: rssi_val
		}
		previousCorrected = kFilter.filter(filterParams);
		setRssiFiltered(prev=>[...prev, Math.round(previousCorrected.mean[0][0])]);
	},[rssi])

	return (
		<View className="flex-1 p-8 bg-slate-800 w-screen">
			<View className="flex-1 mt-2">
				<Text className="text-white">{`Raw ${rssi.length}:\t\t\t\t${rssi}`}</Text>
				<Text className="text-white">{`Filtered ${rssiFiltered.length}:\t\t${rssiFiltered}`}</Text>
				{/* Chart */}
			</View>
			<View className="flex-row items-center justify-between 
			w-full h-1/5">
				<TouchableOpacity 
					className={"bg-blue-500 px-4 py-2 rounded rounded-full shadow-xl"}
					onPress={scanBLE}>
					<Text className="text-white text-md">BLE rssi</Text>
				</TouchableOpacity>
				<TouchableOpacity 
					className={"bg-yellow-600 px-4 py-2 rounded rounded-full shadow-xl"}
					onPress={stopScan}>
					<Text className="text-white text-md">Stop scan</Text>
				</TouchableOpacity>
				<TouchableOpacity 
					className={"bg-red-600 px-4 py-2 rounded rounded-full shadow-xl"}
					onPress={clearScan}>
					<Text className="text-white text-md">Clear rssi</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}