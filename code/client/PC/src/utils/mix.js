/* Mixin 指的是多个对象合成一个新的对象，新对象具有各个组成成员的接口，它的最简单实现如下
class DistributedEdit extends mix(Loggable, Serializable) {
  // ...
} */
export default function mix(...Mixins) {
  class Mix {
    constructor() {
      for (const Mixin of Mixins) {
        copyProperties(this, new Mixin()); // 拷贝实例属性
      }
    }
  }

  for (const Mixin of Mixins) {
    copyProperties(Mix, Mixin); // 拷贝静态属性
    copyProperties(Mix.prototype, Mixin.prototype); // 拷贝原型属性
  }

  return Mix;
}

function copyProperties(target, source) {
  for (const key of Reflect.ownKeys(source)) {
    if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
      const desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}
