class Publish {
    constructor() {
        this.events = {}
    }
    saveSub(name, callback) {
        if (!this.events[name]) {
            this.events[name] = [callback];
        } else {
            this.events[name].push(callback)
        }
    }
    emit(name) {
        if (this.events[name]) {
            this.events[name].forEach(element => {
                element()
            });
        }
    }
    deleteSub(name) {
        if (this.events[name]) {
            this.events[name] = []
        }
    }
    deleteSubCallback(name, callback) {
        if (this.events[name] && this.events[name].length) {
            const index = this.events[name].indexOf(callback)
            if (index !== -1) {
                this.events.splice(index, 1);
            }
        }
    }
}