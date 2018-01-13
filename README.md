# ES6Promise
>实现一个符合 Promise/A+ 规范的ES6写法的Promise，并实现 resolve、reject、all、race等静态方法。

### Constructor(构造器)
1. 作用：从构造函数 `Promise` 来创建一个新建新 `promise` 对象,可以使用 `new` 来调用 `Promise `的构造器来进行实例化
2. 接收一个回调函数 `executor`
3. 状态
    * 如果是`pending`状态,则`promise`：
         * 可以转换到`fulfilled`或`rejected`状态。
    * 如果是`fulfilled`状态,则`promise`：
        * 不能转换成任何其它状态。
        * 必须有一个值，且这个值不能被改变。
    * 如果是`rejected`状态,则`promise`可以：
        * 不能转换成任何其它状态。
4. resolve
    * `promise`的状态是`fulfilled`异常是的处理函数
    * 接收 `value` 参数
        * 如果是`promise`，执行`then`。
        * 如果不是`promise`，把`value`做为参数传给`onFulfilledCallbacks`里的每个函数。
5. reject
    * `promise`的状态是`rejected`异常是的处理函数
    * 接收 `reason` 参数，把`reason`做为参数传给`onRejectedCallbacks`里的每个函数。
6. 执行 `executor`，如果有异常，抛给`reject`

```javascript
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
```
### Instance Method(内置方法)

* #### resolvePromise(私有方法)
    1. `Promise`解析过程 是以一个`promise`和一个值做为参数的抽象过程，可表示为`[[Resolve]](promise, x)`

    2. 如果`promise` 和 `x` 指向相同的值, 使用 `TypeError`做为原因将`promise`拒绝。

    3. 如果 `x` 是一个`promise`, 采用其状态:
        * 如果`x`是`pending`状态，`promise`必须保持`pending`走到`x` `fulfilled`或`rejected`.
        * 如果`x`是`fulfilled`状态，将`x`的值用于`fulfill` `promise`.
        * 如果`x`是`rejected`状态, 将x的原因用于`reject promise`.

    4. 如果`x`是一个对象或一个函数：
        * 将 `then` 赋为 `x.then`.
        * 如果在取`x.then`值时抛出了异常，则以这个异常做为原因将`promise`拒绝。
        * 如果 `then` 是一个函数， 以`x`为`this`调用`then`函数， 且第一个参数是`resolvePromise`，第二个参数是`rejectPromise`，且：
            * 当 `resolvePromise` 被以 `y`为参数调用, 执行 `[[Resolve]](promise, y)`.
            * 当 `rejectPromise` 被以 `r `为参数调用, 则以r为原因将promise拒绝。
            * 如果 `resolvePromise` 和 `rejectPromise` 都被调用了，或者被调用了多次，则只第一次有效，后面的忽略。
            * 如果在调用`then`时抛出了异常，则：
                    * 如果 `resolvePromise` 或 `rejectPromise` 已经被调用了，则忽略它。
                    * 否则, 以`e`为`reason`将 `promise `拒绝。
        * 如果 `then` 不是一个函数，则 以`x` 为值`fulfill promise`。
    5. 如果 `x` 不是对象也不是函数，则以`x`为值 `fulfill promise`。


```javascript
    //利用Symbol值的唯一性，将私有方法的名字命名为一个Symbol值
    const _resolvePromise = Symbol('resolvePromise')

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
```

==以下未完待填坑== 

* #### then

* #### catch


### Static Method(静态方法)
* #### all

* #### race

* #### resolve

* #### reject


###### 参考资料
* https://segmentfault.com/a/1190000002452115
* http://liubin.org/promises-book/