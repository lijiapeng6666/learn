function kuohao(s) {
    const arr = [];
    for (let i = 0; i < s.length; i++) {

        if (s[i] === '(') {
            arr.push(')');
        } else if(s[i] === '[') {
            arr.push(']');
        } else if(s[i] === '{') {
            arr.push('}')
        }
        else {
            if(arr.length && s[i] === arr[arr.length - 1]) {
                arr.pop();
            }
        }
    }
    return arr.length === 0
}