import React, { Component } from 'react';
import Exhibit from './Exhibit';

// exporting the constructor function (dumb component).
// what is the parameter coming in here?
export default function AnimalSelect (props) {

	const animals = props.animals;
	const onChange = props.submitAnimal;

	return (

			<form >
				<label>Select an Animal: </label>
				<div>
					<select onSubmit={onChange}>
					{
						animals && animals.map(animal => {
							<option key={animal.id}>{animal}</option>
						})
					}
					</select>
				</div>
			</form>

	);
};

