import { SET_MAMMAL, SET_BIRD, SET_FISH } from '../constants';

export const setMammal = mammal => ({
	type: 'SET_MAMMAL',
	animal: mammal
});

export const setBird = bird => ({
	type: 'SET_BIRD',
	animal: bird
});

export const setFish = fish => ({
	type: 'SET_FISH',
	animal: fish
});

