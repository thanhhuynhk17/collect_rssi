import { useState, useEffect } from 'react';

import { TouchableOpacity, Text, View, LogBox, Dimensions } from 'react-native';
LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message

import { BleManager } from 'react-native-ble-plx';
import { LineChart } from 'react-native-chart-kit';

import useBLE from './components/useBLE';
import useKalmanFilter from './components/useKalmanFilter';

const bleManager = new BleManager();
let previousCorrected = null;

const BEACONS = ['Beacon00002'];
// const BEACONS = ['Beacon00001', 'Beacon00002', 'Beacon00003', 'Beacon00004', 'Beacon00005', 'Beacon00006'];
const chartConfig = {
	backgroundGradientFrom: "#1E2923",
	backgroundGradientFromOpacity: 0,
	backgroundGradientTo: "#08130D",
	backgroundGradientToOpacity: 0,
	color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
	labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
	strokeWidth: 2, // optional, default 3
	barPercentage: 1,
	useShadowColorFromDataset: false // optional
};
export default function App() {
	const {requestPermissions} = useBLE();
	const {KalmanFilter1D, KalmanFilter2D} = useKalmanFilter();

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
			if (BEACONS.includes(device.name)) {
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
		return ()=>{
			clearScan();
		}
	},[])

	useEffect(()=>{
		if (rssi.length===0) {
			return;
		}
		if (rssi.length===1) {
			// new kfilter
			const params={
				R:8,
				P:30,
				X0: rssi[0],
				deltaT: 0.2, // time (s)
				aSquare: 0.5**2 // accelerator^2
			}
			setKFilter(KalmanFilter2D(params));
			return;
		}
		if (rssi.length===40) {
			stopScan();
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
		<View className="flex-1 p-4 bg-slate-800 w-screen">
			<View className="flex-1 mt-2">
				<Text className="text-white">{`Raw RSSI\t\t\t\t: ${rssi.length}`}</Text>
				<Text className="text-white">{`Filtered RSSI\t\t: ${rssiFiltered.length}`}</Text>
				{/* Chart */}
				{
					rssiFiltered.length!==0 &&(
						<LineChart
						className={`
						w-full mt-4
						bg-red-400 rounded rounded-xl shadow-lg items-start
						`}
						data={{
						// labels: [...Array(rssiFiltered.length).keys()],
							datasets: [
								{
									data: rssi,
									legend: ["Raw RSSI"] // optional
								},
								{
									data: rssiFiltered,
									color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
									legend: ["Filtered RSSI"] // optional

								},
							]
						}}
						width={Dimensions.get("window").width-50} // from react-native
						height={240}
						// yAxisLabel="$"
						// yAxisSuffix="k"
						formatYLabel={(yVal)=>parseInt(yVal).toString()}
						yAxisInterval={1} // optional, defaults to 1
						chartConfig={chartConfig}
						bezier
						hideLegend={false}
					/>
					)
				}


			</View>
			<View className="flex-row items-center justify-between 
			w-full h-1/5">
				<TouchableOpacity 
					className={"bg-blue-500 px-4 py-2 rounded rounded-full shadow-xl"}
					onPress={scanBLE}>
					<Text className="text-white text-md">Start scan</Text>
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