import { ObjectLoader, JSONLoader, TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export function LoadAsset(LoaderClass, url, onProgress, index = 1) {
  const loader = new LoaderClass();
  return new Promise((resolve, reject) => {
    loader.load(url, (item) => {
      item.url = url;
      resolve(item);
    }, (xhr) => {
      const { total, loaded } = xhr;
      let deci = loaded / total;
      if (deci === Infinity) {
        deci = 1;
      }
      onProgress && onProgress(deci, index);
    }, (error) => {
      reject(error);
    });
  });
}

export const LoadAssetArray = (loader, array, onProgress = () => { }) => {
  const length = array.length;
  const totals = new Array(length);
  const aggregateOnProgress = (deci, index) => {
    totals[index] = deci;
    const total = totals.reduce((m, i) => (m + i), 0);
    const totalAsDecimal = total / length;
    const totalAsPercent = Math.floor(totalAsDecimal * 100);
    onProgress(totalAsPercent);
  };
  const promises = array.map((url, index) => {
    return LoadAsset(loader, url, aggregateOnProgress, index);
  });

  // load one, report to action
  return Promise.all(promises);
}

export const GetAsset = (url, array = []) => (array.find((i) => (i.url === url)));

export const loadTexture = (url, onProgress, index) => {
  const loader = TextureLoader;
  return LoadAsset(loader, url, onProgress, index);
}

export const loadTextureSet = (array, onProgress) => {
  const loader = TextureLoader;
  return LoadAssetArray(loader, array, onProgress);
}

export const loadModel = (url, loadingCallback, index) => {
  const loader = JSONLoader;
  return LoadAsset(loader, url, loadingCallback, index);
}

export const loadModelSet = (array, loadingCallback) => {
  const loader = JSONLoader;
  return LoadAssetArray(loader, array, loadingCallback);
}

export const loadScene = (url, loadingCallback, index) => {
  const loader = ObjectLoader;
  return LoadAsset(loader, url, loadingCallback, index);
}

export const loadSceneSet = (array, loadingCallback) => {
  const loader = ObjectLoader;
  return LoadAssetArray(loader, array, loadingCallback);
}

export const loadGLTF = (url, onProgress) => {
  const loader = GLTFLoader;
  return LoadAsset(loader, url, onProgress);
}

export const loadGLTFSet = (array, onProgress) => {
  const loader = GLTFLoader;
  return LoadAssetArray(loader, array, onProgress);
}
