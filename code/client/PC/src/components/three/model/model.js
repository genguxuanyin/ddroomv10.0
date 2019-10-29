export default {
  n: '南亚未来城7-1904', // name
  i: '56dfs56d', // id 有id 代表编辑 没有 代表添加
  k: "i0NZDvhj",
  im: [ // image
    'i/1.jpg',
    'i/2.jpg'
  ],
  p: '100,200,300', // position
  r: '0,0,0',
  c: [ // children
    {
      t: 'Create', // type
      mt: 'Extrude', // mesh-type
      n: 'wall', // name
      k: '92z5d56d', // key
      h: 2800, // height
      w: 240, // width
      pa: [ // path
        '0,0,0',
        '50,0,1000'
      ],
      m: [{
        k: 'adf546ad', // key
        t: 'map', // type
        u: 't/a.jpg' // url
      }],
      c: [{
        t: 'Wall1', // type
        n: 'wall', // name
        k: 'ab15daec', // key
        h: 2800, // height
        p: [ // path
          '100,200,300',
          '100,200,300',
          '100,200,300',
          '100,200,300'
        ],
        m: [{
          k: 'adf546ad', // key
          t: 'map', // type
          u: 't/a.jpg' // url
        }],
        c: [], // children
        di: false // disabled 是否不可用
      }, {
        t: 'Wall1', // type
        n: 'wall', // name
        k: 'adfade15', // key
        h: 2800, // height
        p: [ // path
          '100,200,300',
          '100,200,300',
          '100,200,300',
          '100,200,300'
        ],
        m: [{
          k: 'adf546ad', // key
          t: 'map', // type
          u: 't/a.jpg' // url
        }],
        c: [], // children
        di: false // disabled 是否不可用
      }], // children
      di: false // disabled 是否不可用
    },
    {
      t: 'Create', // type
      mt: 'Shapes', // mesh-type
      n: 'cf', // name
      k: '5a6d21ad', // key
      h: '0,-2800',
      r: '0.5,0,0', // rotation
      pa: [ // path
        '0,0,1000',
        '2000,0,1000',
        '2000,0,4000',
        '0,0,4000'
      ],
      m: [{
        name: 'def',
        side: 1,
        map: 'http://f3d.ddroom.cn/upload/images/7723af81-49f7-4a75-b4dd-a3afe4e06fb3/2017-11-01112913/manguchuntian.jpg'
      }, {
        name: 'def',
        map: 'http://f3d.ddroom.cn/upload/images/7723af81-49f7-4a75-b4dd-a3afe4e06fb3/2017-11-01112913/manguchuntian.jpg'
      }]
    },
    /* {
      t: 'Create', // type
      mt: 'Shape', // mesh-type
      n: 'roof', // name
      k: 'a6d56ad1', // key
      pa: [ // path
        '1000,0,1000',
        '1000,0,2000',
        '0,0,20000'
      ],
      m: []
    }, */
    /* {
      t: 'Wall',
      n: '主卧衣柜',
      k: '78z5d56d',
      i: 'daf4678a', // 产品的ID
      p: '100,100,100',
      r: '90,45,180',
      c: [
        {
          t: 'Wall',
          k: 'pjd5d56d',
          p: '100,100,200', // position 板件定位左后下点
          r: '0.5,0,0'
        }, {
          t: 'Wall',
          k: 'qjd2856d',
          i: 'dljflajf', // 门板编辑器 生成的产品ID
          p: '100,100,200', // position 板件定位左后下点
          r: '0.5,0,0',
          c: [
            {
              t: 'Wall',
              k: '124582a',
              i: 'dljflajf', // 门板编辑器 生成的产品ID
              p: '100,100,200', // position 板件定位左后下点
              r: '0.5,0,0'
            }
          ]
        }
      ]
    }, */
    {
      t: 'Loader1', // type
      mt: 'GLTF', // mesh-type
      n: '主卧衣柜',
      k: '78z5d56d',
      i: 'daf4678a', // 产品的ID
      p: '100,100,100',
      r: '90,45,180',
      u: 'https://threejsfundamentals.org/threejs/resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf',
      c: [{
        t: 'board',
        k: 'pjd5d56d',
        p: '100,100,200', // position 板件定位左后下点
        r: '100,200,200'
      }, {
        t: 'door',
        k: 'qjd2856d',
        i: 'dljflajf', // 门板编辑器 生成的产品ID
        p: '100,100,200', // position 板件定位左后下点
        r: '100,200,200',
        c: [{
          t: 'door',
          k: '124582a',
          i: 'dljflajf', // 门板编辑器 生成的产品ID
          p: '100,100,200', // position 板件定位左后下点
          r: '100,200,200'
        }]
      }]
    }
  ]
}
