import brainjs from 'brain.js/src';

export default class TextClassifier {
    /**
     * Creates a new NLP - TextClassifier
     * @constructor
     * @param {Object} brain - An object generated from the BrainJS export method
     * @param {Array} dictionary - An array of objects including stemmed words and their count generated from a trained model.
     * @param {Array} blacklist - An array of stemmed words to not include in the dictionary.
     * @param {Array} history - An array of objects including inputs and outputs that the Neural Network has already trained on.
     */
    constructor(brain, dictionary, blacklist, history) {
        this.NeuralNetwork = new brain.NeuralNetwork();
        this.dictionary = dictionary;
        this.blacklist = blacklist;
        this.history = history;
    }

    /**
     * Get the current dictionary of the NLP - TextClassifier
     * @method
     * @returns The current dictionary
     */
    get getDictionary(){
        return this.dictionary;
    }
    /**
     * Get the current blacklist of the NLP - TextClassifier
     * @method
     * @returns The current blacklist
     */
    get getBlacklist(){
        return this.blacklist;
    }
    /**
     * Get the historical training data of the NLP - TextClassifier
     * @method
     * @returns The historical training data
     */
    get getHistory(){
        return this.history;
    }

    /**
     * Train the NLP - TextClassifier
     * @method
     * @param {Array} trainingData - An array of objects containing input strings and output category
     * @example
     * {input: "This is a string", output: "Category"}
     * 
     * @param {Object} options - A JSON object containing the options for the current round of training
     * @example
     * {
     *      iterations: 300, // A number greater than 0
     *      errorThresh: 0.005, // A number between 0 and 1
     *      log: false, // True to log to console
     *      logPeriod: 10, // A number greater than 0
     *      learningRate: 0.3, // A number between 0 and 1
     *      momentum: 0.1, // A number between 0 and 1
     *      timeout: 0, // A number greater or equal to 0 (0 = no timeout)
     * }
     */
    train(trainingData, options){
        //add new training data to history (overwrite any duplicate inputs with new outputs)
    }

}