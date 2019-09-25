import {
  TextureLoader,
  RepeatWrapping
} from 'three'
import TYPES from '../types'
const CONFIGS = [];
export default class TextureManager {
  constructor() {
    this.textureObjs = new Map();
    this.configs = CONFIGS || [];
  }
  getTexture(url) {
    var textureObj = this.textureObjs.get(url);
    if (textureObj) {
      textureObj.count++;
      return textureObj.texture;
    } else {
      var texture = new TextureLoader().load(url);
      textureObj = {
        url,
        texture,
        count: 0
      };
      textureObj.count++;
      texture['refObj'] = textureObj;
      this.textureObjs.set(url, textureObj);
      this.setTexture(url);
      texture.addEventListener(TYPES['texture-remove'], this.remove.bind(this));
      return texture;
    }
  }
  setTexture(url) {
    var textureObj = this.textureObjs.get(url);
    if (textureObj) {
      var { texture } = textureObj;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping
      return textureObj;
    }
    return null;
  }
  remove({ target: texture }) {
    var refObj = texture.refObj;
    var textureObj = this.textureObjs.get(refObj.url);
    if (textureObj) {
      textureObj.count--;
      if (textureObj.count <= 0) {
        this.textureObjs.delete(refObj.url);
      }
    }
  }
}
