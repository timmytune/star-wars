
export interface feet_inches {
    feet: number
    inches: number
}

//convert cm to feet and inches
export let cm_to_feet = (req: number): feet_inches  => {
    let inches_string: string = (req * 0.393700787).toFixed(0);
    let inches: number = parseFloat(inches_string)
    let  feet: number = Math.floor(inches / 12);
    inches %= 12;
    return {feet: feet, inches: inches}
}