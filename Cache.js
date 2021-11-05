class Cache {
    #data;

    constructor() {
        this.#data = [];
    }

    get(key) {
        try {
            return this.#data[key];
        } catch (error) {
            throw new Error(error);
        }
    }
    
    set(key, value) {
        try {
            this.#data[key] = value;
        } catch (error) {
            throw new Error(error);
        }
    }
    has(key) {
        try {
            return this.#data[key] !== undefined;
        } catch (error) {
            throw new Error(error);
        }
    }
    delete(key) {
        try {
            delete this.#data[key];
        } catch (error) {
            throw new Error(error);
        }
    }
    clear() {
        try {
            this.#data = [];
        } catch (error) {
            throw new Error(error);
        }
    }
    size() {
        try {
            return this.#data.length;
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = { Cache }