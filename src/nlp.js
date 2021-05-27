import brainjs from 'brain.js/src';
import { stemmer } from 'stemmer';

export default class TextClassifier {
    #brain;
    #dictionary;
    #blacklist;
    #history;
    /**
     * Creates a new NLP - TextClassifier
     * @constructor
     * @param {Object} brain - An object generated from the BrainJS export method
     * @param {Array} dictionary - An array of objects including stemmed words and their count generated from a trained model.
     * @param {Array} blacklist - An array of stemmed words to not include in the dictionary.
     * @param {Array} history - An array of objects including inputs and outputs that the Neural Network has already trained on.
     */
    constructor(brain, dictionary, blacklist, history) {
        this.#brain = new brainjs.NeuralNetwork();
        if(brain){
            this.#brain.fromJSON(brain);
        }
        this.#dictionary = dictionary;
        this.#blacklist = blacklist;
        this.#history = history;
    }

    /**
     * Get the current dictionary of the NLP - TextClassifier
     * @method
     * @returns The current dictionary
     */
    get modelDictionary(){
        return this.#dictionary;
    }
    /**
     * Sets the current dictionary of the NLP - TextClassifier
     * @method
     */
    set #modelDictionary(dictionary){
        this.#dictionary = dictionary;
    }
    /**
     * Get the current blacklist of the NLP - TextClassifier
     * @method
     * @returns The current blacklist
     */
    get dictionaryBlacklist(){
        return this.#blacklist;
    }
    /**
     * Sets the current blacklist of the NLP - TextClassifier
     * @method
     */
    set #dictionaryBlacklist(blacklist){
        this.#blacklist = blacklist;
    }
    /**
     * Get the historical training data of the NLP - TextClassifier
     * @method
     * @returns The historical training data
     */
    get trainingHistory(){
        return this.#history;
    }
    /**
     * Sets the historical training data of the NLP - TextClassifier
     * @method
     */
    set #trainingHistory(history){
        this.#history = history;
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
        console.log(trainingData, options);
        // add new training data to history (overwrite any duplicate inputs with new outputs)
        this.#addHistory(trainingData);
        // create dictionary from history
        this.#createDictionary();
        // train
        this.#brain.train(this.#prepareTrainingData(trainingData), this.#cleanOptions(options));
    }

    export() {
        const json = {
            "brain": this.#brain.toJSON(),
            "dictionary": this.modelDictionary,
            "blacklist": this.dictionaryBlacklist,
            "history": this.trainingHistory
        }
        return json;
    }

    /**
     * Add new history to the current history by updating any pre-existing inputs with their new output and removing duplicates
     * @method
     * @param {Array} newData - An array of objects containing input strings and output category
     */
    #addHistory(newData) {
        const index = {};
        this.trainingHistory.concat(newData).forEach(item => index[item.input] = item);
        this.#trainingHistory = Object.values(index);
    }

    /**
     * Creates a new dictionary from the current stored training data.
     * This will stem, remove blacklisted words and sort the dictionary
     * @method
     * @todo add dictionary trimming (limit length to 500 words ect)
     */
    #createDictionary(){
        // const words = [].concat.apply([], this.trainingHistory.map(history => history.input.split(' ')));
        const words = this.trainingHistory.map(history => history.input.split(' ')).flat();
        console.log("Words", words);
        const stems = words.map(word => stemmer(word));
        console.log("Stems", stems);
        const blacklistArr = this.dictionaryBlacklist
        const filteredStems = stems.filter(stem => {
            if(blacklistArr.indexOf(stem) == -1){return true;}
            return false;
        });
        console.log("Filtered", filteredStems);
        //convert to an array of objects eg. [{stem: "am", count: 3}, {stem: "test", count: 2}, ...]
        const countedStems = filteredStems.reduce((arr, item) => {
            const index = arr.findIndex((element) => {
                if(item == element.stem){return true}
                return false;
            });
            if(index == -1){//new
                arr.push({stem: item, count: 1});
            }else{//increment
                arr[index].count++;
            }
            return arr;
        }, []);
        countedStems.sort((a,b) => {
            if(a.count < b.count){return 1}
            if(a.count > b.count){return -1}
            return 0;
        })
        console.log("Counted", countedStems);

        // const trimmedStems;

        this.#modelDictionary =  countedStems;
    }

    /**
     * 
     * @param {Array} raw An array of objects containing input strings and output category
     * @returns {Array} An array of objects that have been prepared to be consumed by the Neural Network
     * @example {input: [0,0,1,1,0,1,0], output: {Category: 1}}
     */
    #prepareTrainingData(raw){
        const preparedData = raw.map(data => {
            const obj = {};
            obj[data.output] = 1;
            return {input: this.#encodeInput(data.input), output: obj}
        })
        return preparedData;
    }

    /**
     * 
     * @param {String} input A string to be encoded with the current dictionary
     * @returns an encoded string
     * @example
     * dictionary = ["this", "test", "training", "object", "a", "technique", "is"]
     * encodeInput("this is a test") //returns [1, 1, 0, 0, 1, 0, 1]
     */
    #encodeInput(input){
        const phraseTokens = input.split(' ').map(word => stemmer(word))
        const encodedPhrase = this.modelDictionary.map(word => phraseTokens.includes(word.stem) ? 1 : 0)
        return encodedPhrase
    }

    /**
     * This function will clean all inputs
     * @param {Object} options Options to be passed to the brainJS train method.
     * @returns an object with clamped and cleaned inputs
     */
    #cleanOptions(options){
        const cleaned = {
            iterations: this.#clamp(options.iterations, 1, Infinity),
            errorThresh: this.#clamp(options.errorThresh, 0, 1),
            log: options.log,
            logPeriod: this.#clamp(options.logPeriod, 1, Infinity),
            learningRate: this.#clamp(options.learningRate, 0, 1),
            momentum: this.#clamp(options.momentum, 0, 1),
            timeout: this.#clamp(options.timeout, 0, Infinity) == 0 ? Infinity : this.#clamp(options.timeout, 0, Infinity),
        };
        return cleaned;
    }

    /**
     * 
     * @param {float} val the value to be clamped
     * @param {float} min the maximum the value can be
     * @param {float} max the minimum the value can be
     * @returns the clamped value
     */
    #clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }
}