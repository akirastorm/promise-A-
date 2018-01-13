/**
 * Promise由以下三部分组成:
 * 1、Constructor(构造器):
 *    从构造函数 Promise 来创建一个新建新 promise 对象,可以使用 new 来调用 Promise 的构造器来进行实例化, 接受一个函数作为参数
 *    其中一个promise对象具有以下三种状态：
 *         1、pending:转化成fulfilled或rejected
 *         2、fulfilled:不能转变，必须有一个值且不能改变
 *         3、rejected:不能转变，必须有一个原因且不能改变
 * 2、Instance Method(内置方法):
 *     以下两个是定义在原型上可以调用的公有方法
 *     1) promise.then(onFulfilled, onRejected) 
 *          resolve(成功)时 onFulfilled 会被调用   
 *          reject(失败)时 onRejected 会被调用
 *     2) promise.catch(onRejected)
 *          reject(失败)时 onRejected 会被调用,其相当于promise.then(undefined, onRejected)
 *     以下一个是内部的私有方法
 *     1) resolvePromise() 以一个promise和一个值做为参数的抽象过程，可表示为[[Resolve]](promise, x)
 * 3、Static Method(静态方法)
 *     1) Promise.all()
 *     2) Promise.race() 
 *     3) Promise.resolve()
 *     4) Promise.reject()
 */

 //利用Symbol值的唯一性，将私有方法的名字命名为一个Symbol值
const _resolvePromise = Symbol('resolvePromise')

class ES6Promise{
    constructor(executor) {
        if (typeof executor !== 'function') {
            throw new TypeError('Promise resolver ' + executor + ' is not a function');
        }

        let self = this
        this.status = 'pending'
        this.value = undefined
        this.reason = undefined
        this.onFulfilledCallbacks = []
        this.onRejectedCallbacks = []

        function resolve (value) {
            if (value instanceof ES6Promise) {
                return value.then(resolve, reject);
            }
            if (self.status === 'pending') {
                self.value = value;
                self.status = 'fulfilled';
                self.onFulfilledCallbacks.forEach(item => item(value));
            }
        }

        function reject(reason) {
            if (self.status === 'pending') {
                self.reason = reason;
                self.status = 'rejected';
                self.onRejectedCallbacks.forEach(item => item(reason));
            }
        }

        try {
            executor(resolve, reject)
        } catch (e) {
            reject(e)
        }
    }  
    
    [_resolvePromise](promise2, x, resolve, reject) {
        let self = this
        if (promise2 === x) {
          return reject(new TypeError('循环引用'))
        }
        let then, called
      
        if (x != null && ((typeof x == 'object' || typeof x == 'function'))) {
          try {
            then = x.then
            if (typeof then == 'function') {
              then.call(x, function (y) {
                if (called)return
                called = true
                self[_resolvePromise](promise2, y, resolve, reject)
              }, function (r) {
                if (called)return
                called = true
                reject(r)
              });
            } else {
              resolve(x)
            }
          } catch (e) {
            if (called)return
            called = true
            reject(e)
          }
        } else {
          resolve(x)
        }
    }

    then(onFulfilled, onRejected) {
        let self = this
        typeof onFulfilled !== 'function' && (onFulfilled = function (value) {
            return value
        })
        typeof onRejected !== 'function' && (onRejected = function (reason) {
            throw reason
        })
        let newPromise

        if (self.status === 'fulfilled') {
            newPromise = new ES6Promise(function (resolve, reject) {
                setTimeout(function () {
                    try {
                        let x = onFulfilled(self.value)
                        self[_resolvePromise](newPromise, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        }
        if (self.status === 'rejected') {
            newPromise = new ES6Promise(function (resolve, reject) {
                setTimeout(function () {
                    try {
                        let x = onRejected(self.reason)
                        self[_resolvePromise](newPromise, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        }
        if (self.status === 'pending') {
            newPromise = new ES6Promise(function (resolve, reject) {
                self.onFulfilledCallbacks.push(function (value) {
                    setTimeout(function () {
                        try {
                            let x = onFulfilled(value)
                            self[_resolvePromise](newPromise, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    })
                })
                self.onRejectedCallbacks.push(function (reason) {
                    setTimeout(function () {
                        try {
                            let x = onRejected(reason)
                            self[_resolvePromise](newPromise, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    })
                })
            })
        }
        return newPromise
    }

    catch(onRejected) {
        return this.then(undefined, onRejected)
    }

    static all(promises) {
        return new ES6Promise(function (resolve, reject) {
            let result = []
            let count = 0
            promises.map((item, i) => {
                item.then(data => {
                    result[i] = data
                    if (++count == promises.length) {
                      resolve(result)
                    }
                }).catch(err => reject(err))
            })
        })
    }

    static race(promises) {
        return new ES6Promise(function (resolve, reject) {
            let result = []
            let count = 0
            promises.map((item, i) => {
                if (!(item instanceof ES6Promise)) {
                    item = ES6Promise.resolve(item);
                }
                item.then(data => {
                    resolve(data)
                }).catch(err => reject(err))
            })
        })
    }

    static resolve(value) {
        if (value instanceof ES6Promise) {
            return value
        }
        return new ES6Promise((resolve, reject)=> {
            if (typeof value !== null && typeof value === 'object' && typeof value.then === 'function') {
                value.then()
            } else {
                resolve(value)
            }
        })
    }

    static reject(e) {
        return new ES6Promise((resolve,reject) => reject(e))
    }
}

module.exports = ES6Promise
