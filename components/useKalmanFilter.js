import { KalmanFilter } from 'kalman-filter';

function useKalmanFilter() {
	const KalmanFilter2D = (params)=>{
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
					mean: [[params.X0], [0]], // x
					covariance: [
					// P
					[params.P**2, 0],
					[0, params.P**2]
					]
				},
				name: "constant-speed",
				covariance: [
					// Q
					[0.25*params.deltaT**4*params.aSquare, 0.5*params.deltaT**3*params.aSquare],
					[0.5*params.deltaT**3*params.aSquare, params.deltaT**2*params.aSquare]
				],
				transition: [
					// F
					[1, params.deltaT],
					[0, 1]
				]
			}
		});
		return kFilter;
	}
	const KalmanFilter1D = (params)=>{
		const kFilter = new KalmanFilter({
			observation: {
				// dimension: 1,
				sensorCovariance: [[params.R**2]], // R
				name: "sensor",
				observedProjection: [[1]] // H
			},
			dynamic: {
				dimension: 1,
				init: {
				mean: [[params.X0]], // x
				covariance: [
					// P
					[params.P**2]
				]
				},
				name: "constant-position",
				covariance: [
				// Q
				[0.0025]
				],
				transition: [
				// F
				[1]
				]
			}
			// dynamic: 'constant-speed',
			// dynamic: 'constant-acceleration',
			});;
		return kFilter;
	}

	return {
		KalmanFilter1D,
		KalmanFilter2D
	};
}

export default useKalmanFilter