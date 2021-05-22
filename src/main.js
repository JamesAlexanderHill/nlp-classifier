import brainjs from 'brain.js/src';
import data from './data.json';

const data = data;
const options = {
    iterations: 300, // the maximum times to iterate the training data --> number greater than 0
    log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
    logPeriod: 10, // iterations between logging out --> number greater than 0
};

const net = new brain.recurrent.LSTM();

net.train(
    [
        {"input": "I am a teacher", "output": "Education"},
        {"input": "teaching the classroom maths", "output": "Education"},
        {"input": "I give knowledge to younger children in a classroom", "output": "Education"},
        {"input": "I am a builder that creates tall structures", "output": "Construction"},
        {"input": "A carpenter makes furnature out of wood", "output": "Construction"},
        {"input": "All electrical works must be done by an electrician on the construction site", "output": "Construction"},
        {"input": "I am a manager of a Subway in Eastwood", "output": "Management"},
        {"input": "The management team would like to invite you to the Christmans lunch", "output": "Management"},
        {"input": "To manage is to lead by example and demonstrate to your workers how to do their job", "output": "Management"}
    ],
    {
        iterations: 300, // the maximum times to iterate the training data --> number greater than 0
        log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
        logPeriod: 10, // iterations between logging out --> number greater than 0
    }
);

// const output = net.run('I provide knowledge to students');
// console.log(output);

// const testString = string => {
//     return net.run(string);
// };

// const loadModel = (json) => {
//     net.fromJSON(json);
// };