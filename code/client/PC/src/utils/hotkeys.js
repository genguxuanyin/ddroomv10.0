import hotkeys from 'hotkeys-js'
import designer from '../components/three/Designer'

hotkeys('a', (event, handler) => {
  event.preventDefault();
  /* designer.solutionManager.buildProduct({
    t: 'cabinet',
    n: '主卧衣柜',
    i: 'daf4678a', // 产品的ID
    p: '100,100,100',
    r: '90,45,180',
    c: [
      {
        t: 'board',
        p: '100,100,200', // position 板件定位左后下点
        r: '100,200,200'
      }, {
        t: 'door',
        i: 'dljflajf', // 门板编辑器 生成的产品ID
        p: '100,100,200', // position 板件定位左后下点
        r: '100,200,200'
      }
    ]
  }); */
  var activeSolution = designer.solutionManager.getActiveSolution();
  var p = activeSolution.getProduct('qjd2856d');
  p.buildProduct({
    t: 'cabinet',
    n: '主卧衣柜',
    i: 'daf4678a', // 产品的ID
    p: '100,100,100',
    r: '90,45,180',
    c: [
      {
        t: 'board',
        p: '100,100,200', // position 板件定位左后下点
        r: '100,200,200'
      }, {
        t: 'door',
        i: 'dljflajf', // 门板编辑器 生成的产品ID
        p: '100,100,200', // position 板件定位左后下点
        r: '100,200,200'
      }
    ]
  });
  console.log(designer);
});

hotkeys('r', (event, handler) => {
  event.preventDefault();
  var activeSolution = designer.solutionManager.getActiveSolution();
  var p = activeSolution.getProduct('5a6d21ad');
  console.log(p);
  p.remove();
  console.log(designer);
});

/* hotkeys('r', (event, handler) => {
  event.preventDefault();
  var activeSolution = designer.solutionManager.getActiveSolution();
  activeSolution.remove();
  console.log(designer);
}); */

hotkeys('ctrl+z', (event, handler) => {
  event.preventDefault();
  designer.solutionManager.undo();
  console.log(designer.solutionManager);
});

hotkeys('ctrl+y', (event, handler) => {
  event.preventDefault();
  designer.solutionManager.redo();
  console.log(designer.solutionManager);
});

hotkeys('c', (event, handler) => {
  event.preventDefault();
  designer.solutionManager.reset();
  console.log(designer.solutionManager);
});

hotkeys('t', (event, handler) => {
  event.preventDefault();
  var activeSolution = designer.solutionManager.getActiveSolution();
  var pp = activeSolution.getProduct('92z5d56d');
  var p = activeSolution.getProduct('qjd2856d');
  p.moveTo(pp)
  console.log(designer);
});

hotkeys('e', (event, handler) => {
  event.preventDefault();
  var activeSolution = designer.solutionManager.getActiveSolution();
  var p = activeSolution.getProduct('qjd2856d');
  p.setAtt('p', '66,77,88')
  /* var pp = activeSolution.getProduct('92z5d56d');
  pp.setAtt('n', '121'); */
  console.log(designer);
});
