import { KalmanFilter } from 'kalman-filter';

function useKalmanFilter() {
	const KalmanFilter1D = (params)=>{
		const kFilter = new KalmanFilter({
			observation: {
			  	// dimension: 1,
				sensorCovariance: [[params.R**2]], // R
				name: "sensor",
				observedProjection: [[1, 0]] // H [x,x']
			},
			dynamic: {
				dimension: 2,
				init: {
					mean: [[-60], [0]], // x
					covariance: [
					// P
					[params.P**2, 0],
					[0, params.P**2]
					]
				},
				name: "constant-speed",
				covariance: [
					// Q
					[0.0025, 0.005],
					[0.005, 0.01]
				],
				transition: [
					// F
					[1, 1],
					[0, 1]
				]
			}
		});
		return kFilter;
	}

	return {
		KalmanFilter1D,
	};
}

export default useKalmanFilter