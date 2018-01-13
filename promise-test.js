let Promise1 = require('./promise');
let p1 = new Promise1(function(resolve,reject){
  setTimeout(function(){
    resolve(100);
  },1000);
})

let p2 = p1.then(function(data){
  return new Promise(function(resolve,reject){
    setTimeout(function(){
      resolve(new Promise(function(resolve,reject){
        setTimeout(function(){
          resolve(data+100);
        },1000);
      }));
    },1000);
  });
});
p2.then(function(data){
  console.log('p2成功',data);
},function(err){
  console.log('p2失败',err);
});

