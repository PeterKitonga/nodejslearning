// Arrow functions
console.log('======== ARROW FUNCTIONS ========');
const name = 'Peter';
let age = new Date(Date.now()).getFullYear() - new Date(1993, 10, 09).getFullYear();
const has_hobbies = ['cycling', 'gaming', 'swimming', 'hiking'];

const summarizeUser = (user_name, user_age, user_has_hobbies) => {
    return `${user_name} is ${user_age} year old whose hobbies are: ${user_has_hobbies}`;
};

console.log(summarizeUser(name, age, has_hobbies));

// Objects, properties and methods
console.log('======== OBJECTS ========');
const gender = 'Male';
const person = {
    gender, // By convention variables as properties are defined first in the object
    name: 'Peter',
    age: 29,
    greeting() {
        // The lexical 'this' is used to access this object and it's properties
        return `Hi, I am ${this.name}`;
    }
}

console.log(person.greeting());

// Arrays
console.log('======== ARRAYS ========');
const hobbies = ['cycling', 'gaming', 'swimming', 'hiking'];

for(let [index, hobby] of hobbies.entries()) {
    console.log(`Hobby ${index + 1}: ${hobby}`);
}

// Reference Types
console.log('======== REFERENCE TYPES(ARRAYS, OBJECTS) ========');
/**
 * Arrays and objects are refered to as 'reference' types. In the case below
 * we get to see that we can modify the hobbies variable even though it is
 * a constant. The reason for this is that reference types only store an 
 * address pointing to the place in memory where an array or object is stored.
 * Which means we have not changed the address but rather it's content.
 * More info: https://itnext.io/javascript-interview-prep-primitive-vs-reference-types-62eef165bec8
*/
hobbies.push('pencil drawing');
console.log(`Hobbies are: ${JSON.stringify(hobbies)}`);

// Rest|Spread Operator
console.log('======== REST|SPREAD OPERATOR ========');
const fruits = ['oranges', 'grapes', 'mangoes', 'apples'];
const vegetables = ['cucumber', 'kales'];
const shopping = [...vegetables, ...fruits]; // spread operator
console.log(`Shopping list is: ${JSON.stringify(shopping)}`);
// rest operator
const checkVegetables = (...vegetables) => {
    return `Arguments passed are: ${vegetables}`;
};
console.log(checkVegetables('carrots', 'tomatoes', 'peppers', 'onions'));

// Destructuring
console.log('======== DESTRUCTURING ========');
const furniture = {
    name: 'Waterfall Table',
    type: 'table',
    price: 'KES 2000'
};
const furniture_types = ['table', 'chair', 'bed'];

const { price } = furniture; // object destructuring
const [table, chair] = furniture_types; // array destructuring

const printName = ({ name }) => {
    return name;
};
console.log(`The furniture name is: ${printName(furniture)}`);

// Promises
console.log('======== PROMISES ========');
const fetchText = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Some text!');
        }, 1500);
    });
}

fetchText()
    .then(text => {
        console.log(`First instance of fetchText() result: ${text}`);

        return fetchText(); // we can chain the fetch text promise to be ran again
    })
    .then(text => {
        console.log(`Second instance of fetchText() result: ${text}`);
    });
