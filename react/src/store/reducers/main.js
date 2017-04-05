import { SET_MAMMAL, SET_BIRD, SET_FISH } from '../constants';

// const initialState = {
// 	selectedMammal: 'Tiger',
// 	selectedBird: 'Eagle',
// 	selectedFish: 'Seahorse'
// };

// make sure you understand the parameters here!
	// with any reducer we expect 2 arguments
	// we are able to give a default value to a parameter in the way seen below
export default (state = initialState, action) => {

	const newState = Object.assign({}, state);

	switch (action.type) {

		case SET_MAMMAL: 
			newState.selectedMammal = action.animal;
			break;

		case SET_BIRD: 
			newState.selectedBird = action.animal;
			break;

		case SET_FISH: 
			newState.selectedFish = action.animal;
			break;

		default:
			return state
	}

	return newState

};
